import { vec2_t, vec2 } from "../../utils/vec2.js";
import { global_config } from "../config.js";
import { ID } from "../hash_str.js";
import { path_t } from "../path.js";


export function center_origin_map(paths: Set<path_t>, origin_map: Map<ID, vec2_t>): void {
    let min_x = Infinity;
    let max_x = -Infinity;
    let min_y = Infinity;
    let max_y = -Infinity;
    for (const path of paths) {
        min_x = Math.min(origin_map.get(path.id).x - path.bounds.size.x / 2, min_x);
        max_x = Math.max(origin_map.get(path.id).x + path.bounds.size.x / 2, max_x);
        min_y = Math.min(origin_map.get(path.id).y, min_y);
        max_y = Math.max(origin_map.get(path.id).y + path.bounds.size.y, max_y);
    }

    const diff_x = (global_config.chart_size.x - (max_x - min_x)) / 2 - min_x;
    const diff_y = (global_config.chart_size.y - (max_y - min_y)) / 2 - min_y;
    for (const path of paths) {
        origin_map.set(path.id, vec2.add(origin_map.get(path.id), new vec2_t(diff_x + global_config.chart_hor_margin, diff_y + global_config.chart_ver_margin)));
    }
}