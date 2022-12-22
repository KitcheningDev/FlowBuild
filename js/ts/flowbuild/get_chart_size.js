import { vec2_t } from "../utils/vec2.js";
export function get_chart_size(paths, origin_map) {
    let min_x = 99999;
    let max_x = -99999;
    let min_y = 99999;
    let max_y = -99999;
    for (const path of paths) {
        min_x = Math.min(origin_map.get(path.id).x - path.bounds.size.x / 2, min_x);
        max_x = Math.max(origin_map.get(path.id).x + path.bounds.size.x / 2, max_x);
        min_y = Math.min(origin_map.get(path.id).y, min_y);
        max_y = Math.max(origin_map.get(path.id).y + path.bounds.size.y, max_y);
    }
    return new vec2_t(max_x - min_x, max_y - min_y);
}
export function get_chart_min_max_x(paths, origin_map) {
    let min_x = 99999;
    let max_x = -99999;
    for (const path of paths) {
        min_x = Math.min(origin_map.get(path.id).x - path.bounds.size.x / 2, min_x);
        max_x = Math.max(origin_map.get(path.id).x + path.bounds.size.x / 2, max_x);
    }
    return new vec2_t(min_x, max_x);
}
//# sourceMappingURL=get_chart_size.js.map