import { vec2_t } from "../utils/vec2.js";
export function get_chart_left_right(paths, origin_map) {
    let min_x = Infinity;
    let max_x = -Infinity;
    for (const path of paths) {
        min_x = Math.min(origin_map.get(path.id).x - path.bounds.size.x / 2, min_x);
        max_x = Math.max(origin_map.get(path.id).x + path.bounds.size.x / 2, max_x);
    }
    return [min_x, max_x];
}
export function get_chart_top_bottom(paths, origin_map) {
    let min_y = Infinity;
    let max_y = -Infinity;
    for (const path of paths) {
        min_y = Math.min(origin_map.get(path.id).y, min_y);
        max_y = Math.max(origin_map.get(path.id).y + path.bounds.size.y, max_y);
    }
    return [min_y, max_y];
}
export function get_chart_size(paths, origin_map) {
    const [left, right] = get_chart_left_right(paths, origin_map);
    const [top, bottom] = get_chart_top_bottom(paths, origin_map);
    return new vec2_t(right - left, bottom - top);
}
//# sourceMappingURL=get_chart_size.js.map