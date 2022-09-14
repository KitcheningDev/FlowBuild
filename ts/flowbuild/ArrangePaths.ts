import { Recipe } from "./Recipe.js";
import { Path } from "./Graph.js";
import { Vec2, Add, Div, Sub } from "../Utils/Vec2.js";
import { CreateDefaultConfig } from "./Config.js";
import { LastElem, Includes, PtrEqualsFunc } from "../Utils/Funcs.js";
import { PathBounds, config } from "./PathBounds.js";
import { CreateDepthHeights } from "./CreateDepthHeights.js";
import { Arrangement } from "./Arrangement.js";

export function ArrangePaths(recipe: Recipe, path_bounds_map: Map<Path, PathBounds>): Map<Path, Vec2> {
    const graph = recipe.graph;

    // create depth heights
    const depth_heights = CreateDepthHeights(graph, path_bounds_map);

    // create arrangement
    function CreateDepthArrangement(depth: number): Arrangement {
        const members = [] as Arrangement[];
        for (const path of graph.depth_map[depth]) {
            if (path.adv.depth_diff_max <= 1)
                members.push(new Arrangement([], "none", [path, path_bounds_map.get(path)]));
        }
        if (members.length == 0)
            return null;
        else if (members.length == 1)
            return members[0];
        return new Arrangement(members, "hor");
    }
    function CreateArrangement(depth: number): Arrangement {
        if (depth == 0)
            return new Arrangement([], "none", [graph.start, path_bounds_map.get(graph.start)]);
        const last_arr = CreateArrangement(depth - 1);
        const depth_arr = CreateDepthArrangement(depth);
        let ver_arr: Arrangement;
        if (depth_arr != null) {
            if (last_arr.dir == "ver") {
                last_arr.members.push(depth_arr);
                ver_arr = last_arr;
            }
            else
                ver_arr = new Arrangement([last_arr, depth_arr], "ver");
        }
        else 
            ver_arr = last_arr;

        const members = [ver_arr];
        for (const path of graph.path_map.values()) {
            if ( path.adv.depth_diff_max > 1 && path.adv.depth + path.adv.depth_diff_max == depth + 1) {
                members.push(new Arrangement([], "none", [path, path_bounds_map.get(path)]));
            }
        }
        if (members.length == 1)
            return members[0];
        return new Arrangement(members, "hor");
    }
    let arr = CreateArrangement(graph.depth);

    // set origins
    const origin_map = new Map<Path, Vec2>();
    function SetOrigins(): void {
        (function RecursiveSetPathBounds(arr: Arrangement, off_x: number): void {
            if (arr.path_bounds_pair != null)
                origin_map.set(arr.path_bounds_pair[0], new Vec2(off_x, depth_heights[arr.path_bounds_pair[0].adv.depth]));
            
            for (let i = 0; i < arr.members.length; ++i)
                RecursiveSetPathBounds(arr.members[i], off_x + arr.GetMemberOffset(i).x);
        })(arr, 0);
    }
    SetOrigins();

    // eval path bounds
    function EvalPathBounds(): number {
        let x_eval = 0;
        for (const path of graph.path_map.values()) {
            for (const child of path.childs)
                x_eval += Math.abs(origin_map.get(path).x + path_bounds_map.get(path).out.x - (origin_map.get(child).x + path_bounds_map.get(child).in.x));
        }
        return x_eval;
    }
    EvalPathBounds();

    // permutate arrangement and pick permutation with best eval
    let best_arr = arr.Copy();
    let best_eval = 0;

    let permutation_queue = [arr];
    let new_permutation_queue = [] as Arrangement[];
    function Permutate(arr: Arrangement, index: number): void {
        if (arr.path_bounds_pair != null && arr.path_bounds_pair[0] == graph.start) {
            SetOrigins();
            const new_eval = EvalPathBounds();
            if (new_eval < best_eval) {
                best_arr = arr.Copy();
                best_eval = new_eval;
            }
            return;
        }
        if (index == arr.members.length - 1 || arr.dir == "ver") {
            for (const member of arr.members) {
                if (!Includes(new_permutation_queue, PtrEqualsFunc(member)))
                    new_permutation_queue.push(member);
            }
        }
        for (let i = index; i < arr.members.length; ++i) {
            arr.SwapMembers(index, i);
            Permutate(arr, index + 1);
            arr.SwapMembers(index, i);
        }
    };
    // process permutation queue
    (function (): void {
        while (permutation_queue.length > 0) {
            for (const arr of permutation_queue)
                Permutate(arr, 0);
            permutation_queue = [...new_permutation_queue];
            new_permutation_queue = [] as Arrangement[];
        }
    })();
    arr = best_arr.Copy();
    SetOrigins();

    // scale path bounds map to flowchart size and offset
    let min_y = 0;
    let max_y = 0;
    for (const path of graph.paths) {
        min_y = Math.min(origin_map.get(path).y - path_bounds_map.get(path).size.y / 2, min_y);
        max_y = Math.max(origin_map.get(path).y + path_bounds_map.get(path).size.y / 2, max_y);
    }
    for (const origin of origin_map.values()) {
        origin.x *= (config.size.x - 2 * config.flowchart_hor_margin) / arr.size.x;
        origin.y *= (config.size.y - 2 * config.flowchart_ver_margin) / (max_y - min_y);
    }
    let min_x = 0;
    let max_x = 0;
    for (const path of graph.paths) {
        min_x = Math.min(origin_map.get(path).x - path_bounds_map.get(path).size.x / 2, min_x);
        max_x = Math.max(origin_map.get(path).x + path_bounds_map.get(path).size.x / 2, max_x);
    }
    const diff = (config.size.x - 2 * config.flowchart_hor_margin - (max_x - min_x)) / 2;
    for (const origin of origin_map.values())
    {
        origin.x += diff - min_x + config.flowchart_hor_margin;
        origin.y += config.flowchart_ver_margin;
    }

    console.log(recipe.graph);
    console.log(arr);
    console.log(origin_map);
    return origin_map;
}