import { PathBounds } from "../PathBounds.js";
import { LastElem } from "../../Utils/Funcs.js";
import { Graph, Path } from "./../Graph.js";
import { Recipe } from "./../Recipe.js";
import { config } from "./../Config.js";

function CreateDepthY(graph: Graph, path_bounds_map: Map<Path, PathBounds>): number[] {
    const depth_heights = [];

    // set naive depth heights
    function CreateDepthHeight(depth: number): number {
        let max_y = 0;
        for (const path of graph.depth_map[depth]) {
            if (path.adv.depth_diff_max <= 1)
                max_y = Math.max(path_bounds_map.get(path).size.y, max_y);
        }
        return max_y;
    }
    for (let depth = 0; depth <= graph.depth; ++depth)
        depth_heights.push(CreateDepthHeight(depth));

    // adjust depth heights for paths that traverse multiple depths
    for (const path of graph.path_map.values()) {
        if (path.adv.depth_diff_max <= 1)
            continue;
        const to_depth_min = path.adv.depth + path.adv.depth_diff_min;

        let total_height = 0;
        for (let depth = path.adv.depth; depth < to_depth_min; ++depth)
            total_height += depth_heights[depth];
        
        const to_inc = (path_bounds_map.get(path).size.y - total_height) / path.adv.depth_diff_min;
        if (to_inc <= 0)
            continue;
        for (let depth = path.adv.depth + 1; depth <= to_depth_min; ++depth)
            depth_heights[depth] += to_inc;
    }
    
    // add half the height of the largest first node on depth height
    for (let depth = 1; depth <= graph.depth; ++depth) {
        let max_y = 0;
        for (const path of graph.depth_map[depth]) {
            const path_bounds = path_bounds_map.get(path);
            if (path.nodes.length >= 4)
                max_y = Math.max(path_bounds.node_rects[0].size.y, path_bounds.node_rects[1].size.y, max_y);
            else 
                max_y = Math.max(path_bounds.node_rects[0].size.y, max_y);
        }
        depth_heights[depth - 1] += max_y / 2;
    }

    const depth_y = [0];
    for (let depth = 1; depth <= graph.depth; ++depth)
        depth_y.push(LastElem(depth_y) + depth_heights[depth - 1] + config.depth_margin);
    return depth_y;
};

export function CreateOriginYMap(recipe: Recipe, path_bounds_map: Map<Path, PathBounds>): Map<Path, number> {
    const depth_heights = CreateDepthY(recipe.graph, path_bounds_map);
    const y_map = new Map<Path, number>();
    for (const path of recipe.graph.paths)
        y_map.set(path, depth_heights[path.adv.depth]);
    return y_map;
}
