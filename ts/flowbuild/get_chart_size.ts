import { vec2_t } from "../utils/vec2.js";
import { ID } from "./hash_str.js";
import { path_t } from "./path.js";

export function get_chart_left_right(paths: path_t[], origin_map: Map<ID, vec2_t>): number[] {
    let min_x = 99999;
    let max_x = -99999;
    for (const path of paths) {
        min_x = Math.min(origin_map.get(path.id).x - path.bounds.size.x / 2, min_x);
        max_x = Math.max(origin_map.get(path.id).x + path.bounds.size.x / 2, max_x);
    }
    return [min_x, max_x];
}
export function get_chart_top_bottom(paths: path_t[], origin_map: Map<ID, vec2_t>): number[] {
    let min_y = 99999;
    let max_y = -99999;
    for (const path of paths) {
        min_y = Math.min(origin_map.get(path.id).y, min_y);
        max_y = Math.max(origin_map.get(path.id).y + path.bounds.size.y, max_y);
    }
    return [min_y, max_y];
}
export function get_chart_size(paths: path_t[], origin_map: Map<ID, vec2_t>): vec2_t {
    const [left, right] = get_chart_left_right(paths, origin_map);
    const [top, bottom] = get_chart_top_bottom(paths, origin_map);
    return new vec2_t(right - left, bottom - top);
}