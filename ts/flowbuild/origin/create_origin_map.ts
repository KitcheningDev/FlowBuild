import { create_arr, last_elem } from "../../utils/funcs.js";
import { vec2, vec2_t } from "../../utils/vec2.js";
import { config } from "../config.js";
import { graph_t } from "../graph.js";
import { path_t } from "../path.js";
import { create_eq_group_map } from "./eq_group.js";
import { grid_t } from "./path_group.js";

export function create_origin_map(graph: graph_t): Map<path_t, vec2_t> {
    const child_group_map = create_eq_group_map(graph.paths, 'childs');
    const parent_group_map = create_eq_group_map(graph.paths, 'parents');

    // create grid
    const grid = new grid_t(graph);
    grid.collapse();
    
    // set tile sizes
    const tile_widths = create_arr(grid.size.x, 0);
    const tile_heights = create_arr(grid.size.y, 0);
    for (let y = 0; y < grid.size.y; ++y) {
        for (let x = 0; x < grid.size.x; ++x) {
            const path = grid.at(new vec2_t(x, y));
            if (path !== null) {
                tile_widths[x] = Math.max(path.bounds.size.x, tile_widths[x]);
                let height = path.bounds.size.y;
                if (child_group_map.get(path).members.length > 1) {
                    height += config.sync_line_margin;
                }
                if (parent_group_map.get(path).members.length > 1) {
                    height += config.sync_line_margin;
                }
                tile_heights[y] = Math.max(height, tile_heights[y]);
            }
        }
    }

    // set tile origins
    const tile_x = create_arr(grid.size.x, 0);
    for (let x = 1; x < grid.size.x; ++x) {
        tile_x[x] = tile_x[x - 1] + tile_widths[x - 1];
    }
    const tile_y = create_arr(grid.size.y, 0);
    for (let y = 1; y < grid.size.y; ++y) {
        tile_y[y] = tile_y[y - 1] + tile_heights[y - 1] + config.depth_margin;
    }

    // calc offset
    const chart_size = new vec2_t(last_elem(tile_x) + last_elem(tile_widths), last_elem(tile_y) + last_elem(tile_heights));
    const offset = vec2.div_scal(chart_size, 2);
    
    // fill origin map
    const origin_map = new Map<path_t, vec2_t>();
    for (let y = 0; y < grid.size.y; ++y) {
        for (let x = 0; x < grid.size.x; ++x) {
            const path = grid.at(new vec2_t(x, y));
            if (path !== null) {
                const y_off = parent_group_map.get(path).members.length > 1 ? config.sync_line_margin : 0;
                origin_map.set(path, vec2.sub(new vec2_t(tile_x[x] + tile_widths[x] / 2, tile_y[y] + y_off), offset));
            }
        }
    }
    if (origin_map.size == 2) {
        origin_map.set(graph.start, new vec2_t(0, -50));
        origin_map.set(graph.end, new vec2_t(0, 50));
    }
    return origin_map;
}