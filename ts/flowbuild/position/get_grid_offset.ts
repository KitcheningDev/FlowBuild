import { Vec2, vec2_add } from "../../utils/vec2.js";
import { FlowGrid } from "../grid/flow_grid.js";
import { Tile } from "../grid/tile.js";
import { get_tile_size } from "./get_tile_size.js";

export function get_grid_offset(grid: FlowGrid): Set<[Tile, Vec2, Vec2]> {
    // sizes
    const x_sizes = [] as number[];
    const y_sizes = [] as number[];
    for (let x = 0; x < grid.get_size().x; ++x) {
        x_sizes.push(0);
    }
    for (let y = 0; y < grid.get_size().y; ++y) {
        y_sizes.push(0);
    }
    for (let y = 0; y < grid.get_size().y; ++y) {
        for (let x = 0; x < grid.get_size().x; ++x) {
            const tile = grid.get(new Vec2(x, y));
            const size = get_tile_size(tile);
            x_sizes[x] = Math.max(size.x, x_sizes[x]);
            y_sizes[y] = Math.max(size.y, y_sizes[y]);
        }
    }

    // offsets
    const x_offsets = [0] as number[];
    const y_offsets = [0] as number[];
    for (let x = 0; x < grid.get_size().x; ++x) {
        x_offsets.push(x_offsets[x] + x_sizes[x]);
    }
    for (let y = 0; y < grid.get_size().y; ++y) {
        y_offsets.push(y_offsets[y] + y_sizes[y]);
    }

    // offset map
    const offset_map = new Set<[Tile, Vec2, Vec2]>();
    for (let y = 0; y < grid.get_size().y; ++y) {
        for (let x = 0; x < grid.get_size().x; ++x) {
            offset_map.add([grid.get(new Vec2(x, y)), vec2_add(new Vec2(x_offsets[x] + x_sizes[x] / 2, y_offsets[y] + y_sizes[y] / 2), new Vec2(0, 0)), new Vec2(x_sizes[x], y_sizes[y])]);
        }
    }
    return offset_map;
}
export function get_tile_set_offset(tile_set: Set<[Tile, Vec2, Vec2]>): Vec2 {
    let min_x = Infinity;
    let max_x = -Infinity;
    let min_y = Infinity;
    let max_y = -Infinity;
    for (const [tile, offset, size] of tile_set) {
        min_x = Math.min(offset.x - size.x / 2, min_x);
        max_x = Math.max(offset.x + size.x / 2, max_x);
        min_y = Math.min(offset.y - size.y / 2, min_y);
        max_y = Math.max(offset.y + size.y / 2, max_y);
    }

    return new Vec2(-(min_x + max_x) / 2, -(min_y + max_y) / 2);
}