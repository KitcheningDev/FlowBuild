import { Path } from "./Graph.js";
import { PathBounds } from "./PathBounds.js";
import { Vec2 } from "../Utils/Vec2.js";
import { config } from "./Config.js";

export function ScaleOriginMap(origin_map: Map<Path, Vec2>, path_bounds_map: Map<Path, PathBounds>): void {
    let min_x = 0;
    let max_x = 0;
    let min_y = 0;
    let max_y = 0;
    for (const path of origin_map.keys()) {
        min_x = Math.min(origin_map.get(path).x - path_bounds_map.get(path).size.x / 2, min_x);
        max_x = Math.max(origin_map.get(path).x + path_bounds_map.get(path).size.x / 2, max_x);
        min_y = Math.min(origin_map.get(path).y - path_bounds_map.get(path).size.y / 2, min_y);
        max_y = Math.max(origin_map.get(path).y + path_bounds_map.get(path).size.y / 2, max_y);
    }
    const x_factor = (config.size.x - 2 * config.flowchart_hor_margin) / (max_x - min_x);
    const y_factor = (config.size.y - 2 * config.flowchart_ver_margin) / (max_y - min_y);
    for (const path of origin_map.keys())
        origin_map.set(path, new Vec2(origin_map.get(path).x * x_factor, origin_map.get(path).y * y_factor));
}
export function CenterOriginMap(origin_map: Map<Path, Vec2>, path_bounds_map: Map<Path, PathBounds>): void {
    let min_x = 0;
    let max_x = 0;
    let min_y = 0;
    let max_y = 0;
    for (const path of origin_map.keys()) {
        min_x = Math.min(origin_map.get(path).x - path_bounds_map.get(path).size.x / 2, min_x);
        max_x = Math.max(origin_map.get(path).x + path_bounds_map.get(path).size.x / 2, max_x);
        min_y = Math.min(origin_map.get(path).y - path_bounds_map.get(path).size.y / 2, min_y);
        max_y = Math.max(origin_map.get(path).y + path_bounds_map.get(path).size.y / 2, max_y);
    }
    const diff_x = (config.size.x - 2 * config.flowchart_hor_margin - (max_x - min_x)) / 2;
    const diff_y = (config.size.y - 2 * config.flowchart_ver_margin - (max_y - min_y)) / 2;
    for (const path of origin_map.keys())
        origin_map.set(path, new Vec2(
            origin_map.get(path).x + diff_x - min_x + config.flowchart_hor_margin,
            origin_map.get(path).y + diff_y - min_y + config.flowchart_ver_margin));
}