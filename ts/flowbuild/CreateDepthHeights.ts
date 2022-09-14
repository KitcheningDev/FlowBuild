import { LastElem } from "../Utils/Funcs.js";
import { Graph, Path } from "./Graph.js";
import { config, PathBounds } from "./PathBounds.js";

export function CreateDepthHeights(graph: Graph, path_bounds_map: Map<Path, PathBounds>): number[] {
    const depth_heights = [0];

    // set naive depth heights
    function GetDepthHeight(depth: number): number {
        let max_y = 0;
        for (const path of graph.depth_map[depth]) {
            if (path.adv.depth_diff_max <= 1)
                max_y = Math.max(path_bounds_map.get(path).size.y, max_y);
        }
        return max_y;
    }
    for (let depth = 0; depth < graph.depth; ++depth)
        depth_heights.push(LastElem(depth_heights) + GetDepthHeight(depth));

    // adjust depth heights for paths that traverse multiple depths
    for (const path of graph.path_map.values()) {
        if (path.adv.depth_diff_max <= 1)
            continue;
        let total_height = depth_heights[path.adv.depth + path.adv.depth_diff_min] - depth_heights[path.adv.depth];
        let to_inc = (path_bounds_map.get(path).size.y - total_height) / path.adv.depth_diff_min;
        if (to_inc > 0) {
            for (let i = 0; i < path.adv.depth_diff_min; ++i)
                depth_heights[path.adv.depth + 1 + i] += i * to_inc;
        }
    }

    // add depth margin
    for (let depth = 1; depth <= graph.depth; ++depth)
        depth_heights[depth] += depth * config.depth_margin;
    
    // add half the height of the largest first node on each depth level
    for (let depth = 1; depth <= graph.depth; ++depth) {
        let max_y = 0;
        for (const path of graph.depth_map[depth]) {
            const path_bounds = path_bounds_map.get(path);
            if (path.nodes.length >= 4)
                max_y = Math.max(path_bounds.node_rects[0].size.y / 2, path_bounds.node_rects[1].size.y / 2, max_y);
            else 
                max_y = Math.max(path_bounds.node_rects[0].size.y / 2, max_y);
        }
        for (let i = depth; i <= graph.depth; ++i)
            depth_heights[i] += max_y;
    }
    return depth_heights;
};