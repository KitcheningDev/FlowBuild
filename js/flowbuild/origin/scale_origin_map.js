// import { Vec2, vec2 } from "../../utils/vec2.js";
// import { config } from "./../config.js";
// import { ID } from "./../hash_str.js";
// import { Path } from "./../path.js";
// export function scale_origin_map(paths: Set<Path>, origin_map: Map<ID, Vec2>): void {
//     let min_x = Infinity;
//     let max_x = -Infinity;
//     let min_y = Infinity;
//     let max_y = -Infinity;
//     for (const path of paths) {
//         min_x = Math.min(origin_map.get(path.id).x - path.bounds.size.x / 2, min_x);
//         max_x = Math.max(origin_map.get(path.id).x + path.bounds.size.x / 2, max_x);
//         min_y = Math.min(origin_map.get(path.id).y, min_y);
//         max_y = Math.max(origin_map.get(path.id).y + path.bounds.size.y, max_y);
//     }
//     const scale_factor_y = config.chart_size.y / (2 * (max_y - min_y));
//     if (scale_factor_y < 1) {
//         return;
//     }
//     for (const path of paths) {
//         origin_map.get(path.id).y *= scale_factor_y;
//     }
// }
//# sourceMappingURL=scale_origin_map.js.map