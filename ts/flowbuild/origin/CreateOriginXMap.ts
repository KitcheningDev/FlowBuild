import { PathBounds } from "../PathBounds.js";
import { Arrangement } from "./Arrangement.js";
import { Recipe } from "./../Recipe.js";
import { Path } from "./../Graph.js";
import { Vec2, Add, Div, Sub } from "../../Utils/Vec2.js";
import { CreateDefaultConfig } from "./../Config.js";
import { LastElem, Includes, PrimitiveEqualsFunc } from "../../Utils/Funcs.js";
import { config } from "./../Config.js";

export function CreateOriginXMap(recipe: Recipe, path_bounds_map: Map<Path, PathBounds>): Map<Path, number> {
    const graph = recipe.graph;

    // create arrangement
    function CreateDepthArrangement(depth: number): Arrangement {
        const members = [] as Arrangement[];
        for (const path of graph.depth_map[depth]) {
            if (path.adv.depth_diff_max <= 1)
                members.push(new Arrangement([], "none", [path, path_bounds_map.get(path).size.x]));
        }
        if (members.length == 0)
            return null;
        else if (members.length == 1)
            return members[0];
        return new Arrangement(members, "hor");
    }
    function CreateArrangement(depth: number): Arrangement {
        if (depth == 0)
            return new Arrangement([], "none", [graph.start, path_bounds_map.get(graph.start).size.x]);
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
                members.push(new Arrangement([], "none", [path, path_bounds_map.get(path).size.x]));
            }
        }
        if (members.length == 1)
            return members[0];
        return new Arrangement(members, "hor");
    }
    let arr = CreateArrangement(graph.depth);

    // set origins
    const x_map = new Map<Path, number>();
    function SetOrigins(): void {
        (function RecursiveSetPathBounds(arr: Arrangement, off_x: number): void {
            if (arr.path != null)
                x_map.set(arr.path, off_x);
            
            for (let i = 0; i < arr.members.length; ++i)
                RecursiveSetPathBounds(arr.members[i], off_x + arr.GetMemberOffX(i));
        })(arr, 0);
    }
    SetOrigins();

    // eval path bounds
    function EvalPathBounds(): number {
        let x_eval = 0;
        for (const path of graph.path_map.values()) {
            for (const child of path.childs)
                x_eval += Math.abs(x_map.get(path) + path_bounds_map.get(path).out.x - (x_map.get(child) + path_bounds_map.get(child).in.x));
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
        if (arr.path == graph.start) {
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
                if (!Includes(new_permutation_queue, PrimitiveEqualsFunc(member)))
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

    return x_map;
}