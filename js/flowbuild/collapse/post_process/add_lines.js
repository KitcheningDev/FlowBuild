import { Vec2 } from "../../../utils/vec2.js";
import { log_grid } from "../../log.js";
export function add_hor_line(from, x_off, grid) {
    if (0 < x_off) {
        for (let x = 0; x < x_off; ++x) {
            const left_entry = grid.get_entry(new Vec2(from.x + x, from.y));
            left_entry.tile.lines.right = 'out';
            grid.set_entry(left_entry);
            const right_entry = grid.get_entry(new Vec2(from.x + (x + 1), from.y));
            right_entry.tile.lines.left = 'in';
            grid.set_entry(right_entry);
        }
    }
    else {
        for (let x = 0; x < -x_off; ++x) {
            const right_entry = grid.get_entry(new Vec2(from.x - x, from.y));
            right_entry.tile.lines.left = 'out';
            grid.set_entry(right_entry);
            const left_entry = grid.get_entry(new Vec2(from.x - (x + 1), from.y));
            left_entry.tile.lines.right = 'in';
            grid.set_entry(left_entry);
        }
    }
}
export function add_ver_line(from, y_off, grid) {
    if (0 < y_off) {
        for (let y = 0; y < y_off; ++y) {
            const top_entry = grid.get_entry(new Vec2(from.x, from.y + y));
            top_entry.tile.lines.bottom = 'out';
            grid.set_entry(top_entry);
            const bottom_entry = grid.get_entry(new Vec2(from.x, from.y + (y + 1)));
            bottom_entry.tile.lines.top = 'in';
            grid.set_entry(bottom_entry);
        }
    }
    else {
        for (let y = 0; y < -y_off; ++y) {
            const bottom_entry = grid.get_entry(new Vec2(from.x, from.y - y));
            bottom_entry.tile.lines.top = 'out';
            grid.set_entry(bottom_entry);
            const top_entry = grid.get_entry(new Vec2(from.x, from.y - (y + 1)));
            top_entry.tile.lines.bottom = 'in';
            grid.set_entry(top_entry);
        }
    }
}
function add_normal_line(from, to, grid) {
    if (to.y - from.y == 1) {
        if (from.x == to.x) {
            add_ver_line(from, 1, grid);
        }
        else {
            grid.insert_row(to.y);
            return add_normal_line(from, to.down(), grid);
        }
    }
    else {
        if (!grid.hor_path_every(from.x, to.x, to.y - 1, (entry) => !entry.tile.is_solid())) {
            grid.insert_row(to.y);
            return add_normal_line(from, to.down(), grid);
        }
        add_ver_line(from, (to.y - 1) - from.y, grid);
        add_hor_line(new Vec2(from.x, to.y - 1), to.x - from.x, grid);
        add_ver_line(to.up(), 1, grid);
    }
}
function add_backwards_line(from, to, grid) {
    console.log("bw");
    log_grid(grid);
    if (from.y - to.y == 1) {
        if (from.x == to.x) {
            add_ver_line(from, -1, grid);
        }
        else {
            grid.insert_row(from.y);
            return add_backwards_line(from.down(), to, grid);
        }
    }
    else {
        if (!grid.hor_path_every(from.x, to.x, to.y + 1, (entry) => !entry.tile.is_solid())) {
            grid.insert_row(from.y);
            return add_backwards_line(from.down(), to, grid);
        }
        add_ver_line(from, (to.y + 1) - from.y, grid);
        add_hor_line(new Vec2(from.x, to.y + 1), to.x - from.x, grid);
        add_ver_line(to.down(), -1, grid);
    }
}
function add_loop_top_line(from, to, grid) {
    if (grid.get(from).sync_lines.top !== null || from.y == to.y) {
        grid.insert_row(from.y);
        add_ver_line(from.down(), -1, grid);
        return add_loop_top_line(from, to.down(), grid);
    }
    add_hor_line(from, to.x - from.x, grid);
    add_ver_line(new Vec2(to.x, from.y), to.y - from.y, grid);
}
function add_loop_bottom_line(from, to, grid) {
    if (grid.get(to).sync_lines.bottom !== null && from.y - to.y == 1) {
        grid.insert_row(from.y + 1);
        add_ver_line(from, 1, grid);
        return add_loop_bottom_line(from.down(), to, grid);
    }
    add_hor_line(from, to.x - from.x, grid);
    add_ver_line(new Vec2(to.x, from.y), to.y - from.y, grid);
}
export function add_lines(grid, graph) {
    // sync_line lines
    for (const sync_line of graph.sync_lines) {
        const bounds = grid.get_sync_line_bounds(sync_line);
        for (const member of sync_line.members) {
            if (grid.has_node(member)) {
                const member_pos = grid.get_node_coords(member);
                if (graph.is_backwards(member)) {
                    if (sync_line.where == 'top') {
                        add_ver_line(member_pos, bounds.top - member_pos.y, grid);
                    }
                    else {
                        add_ver_line(new Vec2(member_pos.x, bounds.top), member_pos.y - bounds.top, grid);
                    }
                }
                else {
                    if (sync_line.where == 'top') {
                        add_ver_line(new Vec2(member_pos.x, bounds.top), member_pos.y - bounds.top, grid);
                    }
                    else {
                        add_ver_line(member_pos, bounds.top - member_pos.y, grid);
                    }
                }
            }
        }
    }
    // normal lines
    for (const loop of graph.loops) {
        for (const parent of loop.backwards_heads) {
            add_loop_top_line(grid.get_node_in(parent, graph), grid.get_node_in(loop.loop_top, graph), grid);
            break;
        }
    }
    for (const loop of graph.loops) {
        for (const child of loop.backwards_tails) {
            add_loop_bottom_line(grid.get_node_out(loop.loop_bottom, graph), grid.get_node_out(child, graph), grid);
            break;
        }
    }
    const line_map = new Map();
    for (const [node, coords] of grid.get_node_entries()) {
        line_map.set(node, new Set());
    }
    for (const sync_line of graph.sync_lines) {
        line_map.set(sync_line, new Set());
    }
    for (const [parent, coords] of grid.get_node_entries()) {
        for (const child of parent.childs) {
            if (grid.has_node(child) && !child.is_last_step()) {
                if (graph.is_backwards(parent) && graph.is_backwards(child)) {
                    if (!line_map.get(graph.get_node_in_obj(parent)).has(graph.get_node_out_obj(child))) {
                        add_backwards_line(grid.get_node_in(parent, graph), grid.get_node_out(child, graph), grid);
                        line_map.get(graph.get_node_in_obj(parent)).add(graph.get_node_out_obj(child));
                    }
                }
                else if (!graph.is_backwards(parent) && !graph.is_backwards(child)) {
                    if (graph.is_loop_top(child)) {
                        if (!line_map.get(graph.get_node_out_obj(parent)).has(graph.get_node_in_obj(child))) {
                            if (graph.get_loop(child).backwards_heads.size > 1) {
                                add_normal_line(grid.get_node_out(parent, graph), grid.get_node_in(child, graph).up(2), grid);
                            }
                            else {
                                add_normal_line(grid.get_node_out(parent, graph), grid.get_node_in(child, graph).up(), grid);
                            }
                            line_map.get(graph.get_node_out_obj(parent)).add(graph.get_node_in_obj(child));
                        }
                    }
                    else {
                        if (!line_map.get(graph.get_node_out_obj(parent)).has(graph.get_node_in_obj(child))) {
                            add_normal_line(grid.get_node_out(parent, graph), grid.get_node_in(child, graph), grid);
                            line_map.get(graph.get_node_out_obj(parent)).add(graph.get_node_in_obj(child));
                        }
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=add_lines.js.map