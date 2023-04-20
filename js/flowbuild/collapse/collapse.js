import { Vec2 } from "../../utils/vec2.js";
import { FlowGrid } from "../grid/flow_grid.js";
export function get_possible_x(node, grid, graph, rules) {
    let possible_x = [];
    const y = graph.get_depth(node);
    for (let x = 0; x < grid.get_size().x; ++x) {
        if (grid.get(new Vec2(x, y)).is_empty()) {
            possible_x.push(x);
        }
    }
    for (const rule of rules) {
        if (rule.restricts(node) && possible_x.length > 0) {
            rule.reduce_possible_x(node, possible_x, grid, graph);
        }
    }
    return possible_x;
}
function collapse_node(index, order, grid, rules, graph) {
    if (index == order.length) {
        return true;
    }
    const node = order[index];
    for (const x of get_possible_x(node, grid, graph, rules)) {
        grid.set_node(node, new Vec2(x, graph.get_depth(node)));
        if (collapse_node(index + 1, order, grid, rules, graph)) {
            return true;
        }
        grid.remove_node(node);
    }
    return false;
}
export function collapse(graph, rules) {
    const grid = new FlowGrid(graph);
    const collapse_order = [...graph.nodes].filter((node) => !node.is_start() && !node.is_last_step() && !node.is_end());
    collapse_order.push(graph.last_step);
    while (!collapse_node(0, collapse_order, grid, rules, graph)) {
        console.warn("collapse failed with width =", grid.get_size().x);
        grid.set_size(grid.get_size().right());
    }
    return grid;
}
//# sourceMappingURL=collapse.js.map