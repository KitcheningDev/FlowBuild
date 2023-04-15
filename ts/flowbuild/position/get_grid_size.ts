import { Vec2 } from "../../utils/vec2.js";
import { FlowGrid } from "../grid/flow_grid.js";
import { get_tile_size } from "./get_tile_size.js";

export function get_tile_max_x(grid: FlowGrid): Vec2 {
    let max_coords = null as Vec2;
    let max_x = -Infinity;
    for (let y = 0; y < grid.get_size().y; ++y) {
        for (let x = 0; x < grid.get_size().x; ++x) {
            const width = get_tile_size(grid.get(new Vec2(x, y))).x;
            if (max_x < width) {
                max_coords = new Vec2(x, y);
                max_x = width;
            }
        }
    }
    return max_coords;
}
export function get_tile_max_y(grid: FlowGrid): Vec2 {
    let max_coords = null as Vec2;
    let max_y = -Infinity;
    for (let y = 0; y < grid.get_size().y; ++y) {
        for (let x = 0; x < grid.get_size().x; ++x) {
            const height = get_tile_size(grid.get(new Vec2(x, y))).y;
            if (max_y < height) {
                max_coords = new Vec2(x, y);
                max_y = height;
            }
        }
    }
    return max_coords;
}
export function get_size(coords: Vec2, grid: FlowGrid): Vec2 {
    let max_x = 0;
    for (let y = 0; y < grid.get_size().y; ++y) {
        const tile = grid.get(new Vec2(coords.x, y));
        max_x = Math.max(get_tile_size(tile).x, max_x);
    }
    let max_y = 0;
    for (let x = 0; x < grid.get_size().x; ++x) {
        const tile = grid.get(new Vec2(x, coords.y));
        max_y = Math.max(get_tile_size(tile).y, max_y);
    }
    return new Vec2(max_x, max_y);
}