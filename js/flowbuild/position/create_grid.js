import { Vec2 } from "../create_grid/grid.js";
import { create_grid } from "../create_grid/collapse.js";
import { get_node_bounds } from "./node_bounds.js";
export function get_node_positions(graph) {
    const positions = new Map();
    const grid = create_grid(graph);
    if (grid === null) {
        return null;
    }
    const grid_size_map = [];
    for (let y = 0; y < grid.get_size().y; ++y) {
        const list = [];
        for (let x = 0; x < grid.get_size().x; ++x) {
            list.push(get_node_bounds(grid.get(new Vec2(x, y))));
        }
        grid_size_map.push(list);
    }
    const x_bounds = [];
    for (let x = 0; x < grid.get_size().x; ++x) {
        let max_bounds_x = 0;
        for (let y = 0; y < grid.get_size().y; ++y) {
            max_bounds_x = Math.max(grid_size_map[y][x].x, max_bounds_x);
        }
        x_bounds.push(max_bounds_x);
    }
    const x_offsets = [0];
    for (let x = 1; x < grid.get_size().x; ++x) {
        x_offsets.push(x_offsets[x_offsets.length - 1] + x_bounds[x - 1]);
    }
    const y_bounds = [];
    for (let y = 0; y < grid.get_size().y; ++y) {
        let max_bounds_y = 0;
        for (let x = 0; x < grid.get_size().x; ++x) {
            max_bounds_y = Math.max(grid_size_map[y][x].x, max_bounds_y);
        }
        y_bounds.push(max_bounds_y);
    }
    const y_offsets = [0];
    for (let y = 1; y < grid.get_size().y; ++y) {
        y_offsets.push(y_offsets[y_offsets.length - 1] + y_bounds[y - 1]);
    }
    for (const node of graph.nodes) {
        const coords = grid.get_coords(node);
        positions.set(node, new Vec2(x_offsets[coords.x] + x_bounds[coords.x] / 2, y_offsets[coords.y] + y_bounds[coords.y] / 2));
    }
    return positions;
}
//# sourceMappingURL=create_grid.js.map