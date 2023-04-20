import { Vec2 } from "../../../utils/vec2.js";
import { add_ver_line } from "./add_lines.js";
function add_sync_line(x1, x2, y, where, grid) {
    const left_entry = grid.get_entry(new Vec2(x1, y));
    left_entry.tile.sync_lines[where] = 'left';
    grid.set_entry(left_entry);
    for (let x = x1 + 1; x < x2; ++x) {
        const middle_entry = grid.get_entry(new Vec2(x, y));
        middle_entry.tile.sync_lines[where] = 'middle';
        grid.set_entry(middle_entry);
    }
    const right_entry = grid.get_entry(new Vec2(x2, y));
    right_entry.tile.sync_lines[where] = 'right';
    grid.set_entry(right_entry);
}
export function add_start_end(grid, graph) {
    // if (grid.get_size().x == 1) {
    //     grid.insert_column(1);
    // }
    // start
    const start_coords = new Vec2(0, 0);
    grid.set_node(graph.start, start_coords);
    // sync-line
    grid.insert_row(1);
    add_sync_line(0, grid.get_size().x - 1, 1, 'top', grid);
    // lines
    // add_ver_line(start_coords, 1, grid);
    for (const child of graph.start.childs) {
        const coords = grid.get_node_in(child, graph);
        add_ver_line(new Vec2(coords.x, 1), coords.y - 1, grid);
    }
    grid.insert_row(grid.get_size().y - 1);
    add_sync_line(0, grid.get_size().x - 1, grid.get_size().y - 2, 'bottom', grid);
    // end
    const last_step_coords = new Vec2(0, grid.get_size().y - 1);
    // const end_coords = last_step_coords.right();
    grid.set_node(graph.last_step, last_step_coords);
    // grid.set_node(graph.end, end_coords);
    // lines
    // add_ver_line(new Vec2(last_step_coords.x, last_step_coords.y - 1), 1, grid);
    // add_hor_line(last_step_coords, 1, grid);
    for (const parent of graph.last_step.parents) {
        const coords = grid.get_node_out(parent, graph);
        add_ver_line(coords, (grid.get_size().y - 2) - coords.y, grid);
    }
}
//# sourceMappingURL=add_start_end.js.map