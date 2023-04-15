import { Vec2 } from "../../../utils/vec2.js";
import { add_hor_line, add_ver_line } from "./add_lines.js";
export function add_start_end(grid, graph) {
    if (grid.get_size().x == 1) {
        grid.insert_column(1);
    }
    // start
    const start_coords = new Vec2(Math.floor(grid.get_size().x / 2) - 1, 0);
    grid.set_node(start_coords, graph.start);
    grid.get(start_coords).account_x = false;
    // sync-line
    grid.insert_row(1);
    grid.get(new Vec2(0, 1)).sync_lines.top = 'left';
    for (let x = 1; x < grid.get_size().x - 1; ++x) {
        grid.get(new Vec2(x, 1)).sync_lines.top = 'middle';
    }
    grid.get(new Vec2(grid.get_size().x - 1, 1)).sync_lines.top = 'right';
    // lines
    add_ver_line(start_coords, 1, grid);
    for (const child of graph.start.childs) {
        const coords = grid.get_node_in(child);
        add_ver_line(new Vec2(coords.x, 1), coords.y - 1, grid);
    }
    // end
    grid.insert_row(grid.get_size().y);
    const last_step_coords = new Vec2(Math.floor(grid.get_size().x / 2) - 1, grid.get_size().y - 1);
    const end_coords = new Vec2(last_step_coords.x + 1, last_step_coords.y);
    grid.set_node(last_step_coords, graph.last_step);
    grid.set_node(end_coords, graph.end);
    // grid.get(last_step_coords).account_x = false;
    // grid.get(end_coords).account_x = false;
    // sync-line
    grid.insert_row(grid.get_size().y - 1);
    grid.get(new Vec2(0, grid.get_size().y - 2)).sync_lines.top = 'left';
    for (let x = 1; x < grid.get_size().x - 1; ++x) {
        grid.get(new Vec2(x, grid.get_size().y - 2)).sync_lines.top = 'middle';
    }
    grid.get(new Vec2(grid.get_size().x - 1, grid.get_size().y - 2)).sync_lines.top = 'right';
    // lines
    add_ver_line(new Vec2(last_step_coords.x, last_step_coords.y - 1), 1, grid);
    add_hor_line(last_step_coords, 1, grid);
    console.log("BE");
    for (const parent of graph.last_step.parents) {
        const coords = grid.get_node_out(parent);
        add_ver_line(coords, (grid.get_size().y - 2) - coords.y, grid);
    }
    console.log("AF");
}
//# sourceMappingURL=add_start_end.js.map