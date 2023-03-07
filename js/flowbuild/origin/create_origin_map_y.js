import { create_arr_with_func, create_arr } from "../../utils/funcs.js";
import { config } from "../config.js";
function create_depth_heights(graph) {
    const depth_heights = create_arr_with_func(graph.depth_levels.length, () => { return []; });
    for (let depth = 0; depth < graph.depth; ++depth) {
        for (const path of graph.depth_levels[depth]) {
            if (graph.get_diff_min(path) <= 1) {
                depth_heights[depth] = Math.max(depth_heights[depth], path.bounds.size.y);
            }
        }
    }
    for (const path of graph.paths) {
        if (graph.get_diff_min(path) > 1) {
            const path_depth = graph.get_depth(path);
            const path_diff_min = graph.get_diff_min(path);
            let og_size_y = 0;
            for (let depth = path_depth; depth < path_depth + path_diff_min; ++depth) {
                og_size_y += depth_heights[depth];
            }
            const diff = (path.bounds.size.y - og_size_y) / path_diff_min;
            if (diff < 0) {
                continue;
            }
            for (let depth = path_depth; depth < path_depth + path_diff_min; ++depth) {
                depth_heights[depth] += diff;
            }
        }
    }
    for (let depth = 0; depth < graph.depth; ++depth) {
        depth_heights[depth] += config.depth_margin;
    }
    return depth_heights;
}
export function create_origin_map_y(graph) {
    const depth_heights = create_depth_heights(graph);
    const depth_y = create_arr(depth_heights.length, 0);
    for (let depth = 0; depth <= graph.depth; ++depth) {
        for (let i = depth + 1; i < depth_heights.length; ++i) {
            depth_y[i] += depth_heights[depth];
        }
    }
    const out = new Map();
    for (const path of graph.paths) {
        out.set(path.id, depth_y[graph.get_depth(path)]);
    }
    return out;
}
//# sourceMappingURL=create_origin_map_y.js.map