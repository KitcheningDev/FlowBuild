function add_parents(node, order) {
    for (const parent of node.parents) {
        if (!order.includes(parent)) {
            add_parents(parent, order);
        }
    }
    order.push(node);
}
function create_parent_first_collapse_order(graph) {
    const order = [];
    add_parents(graph.end, order);
    // remove start, last, end
    order.shift();
    order.pop();
    order.pop();
    return order;
}
export function create_collapse_order(graph) {
    return create_parent_first_collapse_order(graph);
}
//# sourceMappingURL=collapse_order.js.map