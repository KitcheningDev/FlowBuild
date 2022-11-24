import { vec2, vec2_t } from "../utils/vec2.js";
import { ID } from "./hash_str.js";
import { path_t } from "./path.js";

export function pathset_top_bottom(paths: Set<path_t>, origin_map: Map<ID, vec2_t>): number[] {
    let top = Infinity;
    let bottom = -Infinity;
    for (const path of paths) {
        const origin_y = origin_map.get(path.id).y;
        top = Math.min(origin_y, top);
        bottom = Math.max(origin_y + path.bounds.size.y, bottom);
    }
    return [top, bottom];
}
export function pathset_left_right(paths: Set<path_t>, origin_map: Map<ID, vec2_t>): number[] {
    let left = Infinity;
    let right = -Infinity;
    for (const path of paths) {
        const origin_x = origin_map.get(path.id).x;
        left = Math.min(origin_x - path.bounds.size.x / 2, left);
        right = Math.max(origin_x + path.bounds.size.x / 2, right);
    }
    return [left, right];
}
export function pathset_center(paths: Set<path_t>, origin_map: Map<ID, vec2_t>): vec2_t {
    const [left, right] = pathset_left_right(paths, origin_map);
    const [top, bottom] = pathset_top_bottom(paths, origin_map);
    return vec2.div_scal(new vec2_t(left + right, top + bottom), 2);
}
export function pathset_size(paths: Set<path_t>, origin_map: Map<ID, vec2_t>): vec2_t {
    const [left, right] = pathset_left_right(paths, origin_map);
    const [top, bottom] = pathset_top_bottom(paths, origin_map);
    return new vec2_t(right - left, bottom - top);
}