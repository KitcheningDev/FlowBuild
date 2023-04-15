import { Vec2, vec2_add } from "../../../utils/vec2.js";
export function add_hor_line(from, x_off, grid) {
    if (0 < x_off) {
        for (let x = 0; x < x_off; ++x) {
            grid.get(new Vec2(from.x + x, from.y)).lines.right = 'out';
            grid.get(new Vec2(from.x + (x + 1), from.y)).lines.left = 'in';
        }
    }
    else {
        for (let x = 0; x < -x_off; ++x) {
            grid.get(new Vec2(from.x - x, from.y)).lines.left = 'out';
            grid.get(new Vec2(from.x - (x + 1), from.y)).lines.right = 'in';
        }
    }
}
export function add_ver_line(from, y_off, grid) {
    if (0 < y_off) {
        for (let y = 0; y < y_off; ++y) {
            grid.get(new Vec2(from.x, from.y + y)).lines.bottom = 'out';
            grid.get(new Vec2(from.x, from.y + (y + 1))).lines.top = 'in';
        }
    }
    else {
        for (let y = 0; y < -y_off; ++y) {
            grid.get(new Vec2(from.x, from.y - y)).lines.top = 'out';
            grid.get(new Vec2(from.x, from.y - (y + 1))).lines.bottom = 'in';
        }
    }
}
function add_normal_line(from, to, grid) {
    if (from.y == to.y) {
        grid.insert_row(to.y + 1);
        grid.insert_row(to.y + 1);
        return add_normal_line(from, new Vec2(to.x, to.y + 2), grid);
    }
    else if (from.x != to.x && to.y - from.y == 1) {
        grid.insert_row(to.y);
        return add_normal_line(from, to.down(), grid);
    }
    else if (from.x == to.x && to.y - from.y == 1) {
        add_ver_line(from, 1, grid);
    }
    else {
        if (!grid.is_hor_path_empty(from.x, to.x, to.y - 1, 'solid')) {
            grid.insert_row(to.y);
            return add_normal_line(from, to.down(), grid);
        }
        add_ver_line(from, (to.y - 1) - from.y, grid);
        add_hor_line(new Vec2(from.x, to.y - 1), to.x - from.x, grid);
        add_ver_line(to.up(), 1, grid);
    }
}
function add_backwards_line(from, to, grid) {
    if (from.x != to.x && from.y - to.y == 1) {
        grid.insert_row(from.y);
        return add_backwards_line(from.down(), to, grid);
    }
    else if (from.x == to.x && from.y - to.y == 1) {
        add_ver_line(from, -1, grid);
    }
    else {
        if (!grid.is_hor_path_empty(from.x, to.x, to.y + 1, 'solid')) {
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
    for (const sync_line of grid.get_sync_lines()) {
        const [sync_line_pos, length] = grid.get_sync_line_bounds(sync_line);
        for (const member of sync_line.members) {
            const member_pos = grid.get_node_coords(member);
            if (graph.is_backwards(member)) {
                if (sync_line.where == 'top') {
                    add_ver_line(member_pos, sync_line_pos.y - member_pos.y, grid);
                }
                else {
                    add_ver_line(new Vec2(member_pos.x, sync_line_pos.y), member_pos.y - sync_line_pos.y, grid);
                }
            }
            else {
                if (sync_line.where == 'top') {
                    add_ver_line(new Vec2(member_pos.x, sync_line_pos.y), member_pos.y - sync_line_pos.y, grid);
                }
                else {
                    add_ver_line(member_pos, sync_line_pos.y - member_pos.y, grid);
                }
            }
        }
    }
    // normal lines
    for (const loop of graph.loops) {
        for (const parent of loop.loop_top.parents) {
            if (loop.nodes.has(parent)) {
                add_loop_top_line(grid.get_node_in(parent), grid.get_node_in(loop.loop_top), grid);
                break;
            }
        }
    }
    for (const loop of graph.loops) {
        for (const child of loop.loop_bottom.childs) {
            if (loop.nodes.has(child)) {
                add_loop_bottom_line(grid.get_node_out(loop.loop_bottom), grid.get_node_out(child), grid);
                break;
            }
        }
    }
    const line_map = new Map();
    for (const node of grid.get_nodes()) {
        line_map.set(node, new Set());
    }
    for (const sync_line of grid.get_sync_lines()) {
        line_map.set(sync_line, new Set());
    }
    for (const parent of grid.get_nodes()) {
        for (const child of parent.childs) {
            if (grid.has_node(child)) {
                if (graph.is_backwards(parent) && graph.is_backwards(child)) {
                    if (!line_map.get(grid.get_node_in_obj(parent)).has(grid.get_node_out_obj(child))) {
                        add_backwards_line(grid.get_node_in(parent), grid.get_node_out(child), grid);
                        line_map.get(grid.get_node_in_obj(parent)).add(grid.get_node_out_obj(child));
                    }
                }
                else if (!graph.is_backwards(parent) && !graph.is_backwards(child)) {
                    if (graph.is_loop_top(child)) {
                        if (!line_map.get(grid.get_node_out_obj(parent)).has(grid.get_node_in_obj(child))) {
                            if (graph.get_loop(child).backwards_heads.size > 1) {
                                add_normal_line(grid.get_node_out(parent), vec2_add(grid.get_node_in(child), new Vec2(0, -2)), grid);
                            }
                            else {
                                add_normal_line(grid.get_node_out(parent), grid.get_node_in(child).up(), grid);
                            }
                            line_map.get(grid.get_node_out_obj(parent)).add(grid.get_node_in_obj(child));
                        }
                    }
                    else {
                        if (!line_map.get(grid.get_node_out_obj(parent)).has(grid.get_node_in_obj(child))) {
                            add_normal_line(grid.get_node_out(parent), grid.get_node_in(child), grid);
                            line_map.get(grid.get_node_out_obj(parent)).add(grid.get_node_in_obj(child));
                        }
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=add_lines.js.map