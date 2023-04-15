import { Grid, Vec2 } from "./grid.js";
function collapse_node(index, order, grid, rules, graph) {
    if (index == order.length) {
        return true;
    }
    const node = order[index];
    const y = graph.get_depth(node);
    let possible_x = new Set();
    for (let x = 0; x < grid.get_size().x; ++x) {
        if (grid.get(new Vec2(x, y)) === null) {
            possible_x.add(x);
        }
    }
    for (const rule of rules) {
        if (rule.restricts(node)) {
            rule.reduce_possible_x(node, possible_x, grid, graph);
        }
    }
    for (const x of possible_x) {
        grid.set(new Vec2(x, y), node);
        if (collapse_node(index + 1, order, grid, rules, graph)) {
            return true;
        }
        grid.remove(node);
    }
    return false;
}
function add_to_order(node, order) {
    if (order.includes(node)) {
        return;
    }
    for (const parent of node.parents) {
        if (!order.includes(parent)) {
            add_to_order(parent, order);
        }
    }
    order.push(node);
}
function create_collapse_order(graph) {
    const order = [];
    add_to_order(graph.end, order);
    return order;
}
export function collapse(graph, rules) {
    const grid = new Grid(new Vec2(5, 5));
    const collapse_order = create_collapse_order(graph);
    if (collapse_node(0, collapse_order, grid, rules, graph)) {
        return grid;
    }
    else {
        return null;
    }
}
//# sourceMappingURL=collapse.js.map