import { Vec2 } from "../../utils/vec2.js";
import { create_collapse_order } from "./collapse_order.js";
import { Grid } from "./grid.js";
function collapse_node(index, order, grid, rules, graph) {
    if (index == order.length) {
        return true;
    }
    const node = order[index];
    const y = graph.get_depth(node);
    let possible_x = new Set();
    for (let x = 0; x < grid.get_size().x; ++x) {
        if (grid.get(new Vec2(x, y)).is_empty()) {
            possible_x.add(x);
        }
    }
    for (const rule of rules) {
        if (rule.restricts(node)) {
            rule.reduce_possible_x(node, possible_x, grid, graph);
        }
    }
    for (const x of possible_x) {
        grid.set_node(new Vec2(x, y), node);
        if (collapse_node(index + 1, order, grid, rules, graph)) {
            return true;
        }
        grid.remove_node(node);
    }
    return false;
}
function collapse(grid, graph, rules) {
    const collapse_order = create_collapse_order(graph);
    if (collapse_node(0, collapse_order, grid, rules, graph)) {
        return grid;
    }
    else {
        console.warn("collapse failed!");
        return null;
    }
}
export function create_grid(graph, rules) {
    const grid = new Grid(new Vec2(6, graph.max_depth() + 1));
    return collapse(grid, graph, rules);
}
//# sourceMappingURL=collapse.js.map