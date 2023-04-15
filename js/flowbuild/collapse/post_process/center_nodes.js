import { Vec2 } from "../../../utils/vec2.js";
import { get_possible_x } from "../collapse.js";
import { log_grid } from "../../log.js";
function local_eval(node, grid, metric_grid, graph) {
    let length = 0;
    if (graph.get_sync_line(node, 'top') === null) {
        for (const parent of node.parents) {
            if (graph.is_backwards(node) == graph.is_backwards(parent)) {
                if (!parent.is_start()) {
                    length += metric_grid.get_tile_dist_x(grid.get_node_in(node, graph).x, grid.get_node_out(parent, graph).x);
                }
            }
        }
    }
    if (graph.get_sync_line(node, 'bottom') === null) {
        for (const child of node.childs) {
            if (graph.is_backwards(node) == graph.is_backwards(child)) {
                if (!child.is_last_step()) {
                    length += metric_grid.get_tile_dist_x(grid.get_node_in(child, graph).x, grid.get_node_out(node, graph).x);
                }
            }
        }
    }
    return length;
}
function set_best_x(node, grid, metric_grid, graph, rules) {
    log_grid(grid);
    const old_coords = grid.get_node_coords(node);
    grid.remove_node(node);
    let best_eval = Infinity;
    let best_x = null;
    console.log(node.task.description, ...get_possible_x(node, grid, graph, rules));
    for (const x of get_possible_x(node, grid, graph, rules)) {
        grid.set_node(node, new Vec2(x, old_coords.y));
        metric_grid.update_flow_grid(grid);
        metric_grid.reduce_x();
        const curr_eval = local_eval(node, grid, metric_grid, graph);
        console.log(node.task.description, x, curr_eval);
        if (curr_eval < best_eval || (curr_eval == best_eval && x == old_coords.x)) {
            best_eval = curr_eval;
            best_x = x;
        }
    }
    if (best_x === null) {
        grid.set_node(node, old_coords);
        console.log(node.task.description, best_x, best_eval, old_coords.x != best_x);
        return false;
    }
    else {
        grid.set_node(node, new Vec2(best_x, old_coords.y));
        console.log(node.task.description, best_x, best_eval, old_coords.x != best_x);
        return old_coords.x != best_x;
    }
}
export function local_center(flow_grid, metric_grid, graph, rules) {
    log_grid(flow_grid);
    for (const [node, coords] of [...flow_grid.get_node_entries()]) {
        // if (graph.is_backwards_head(node) || graph.is_backwards_tail(node)) {
        //     continue;
        // }
        if (set_best_x(node, flow_grid, metric_grid, graph, rules)) {
            return local_center(flow_grid, metric_grid, graph, rules);
        }
    }
}
//# sourceMappingURL=center_nodes.js.map