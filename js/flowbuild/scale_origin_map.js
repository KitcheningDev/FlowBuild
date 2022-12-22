import { global_config } from "./config.js";
export function scale_origin_map(paths, origin_map) {
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
    const scale_factor_y = (global_config.chart_size.y - 2 * global_config.chart_ver_margin) / (2 * (max_y - min_y));
    if (scale_factor_y < 1) {
        return;
    }
    for (const path of paths) {
        origin_map.get(path.id).y *= scale_factor_y;
    }
}
//# sourceMappingURL=scale_origin_map.js.map