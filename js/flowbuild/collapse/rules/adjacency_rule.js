export class AdjacencyRule {
    constructor(nodes) {
        this.nodes = nodes;
    }
    restricts(node) {
        return this.nodes.has(node);
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        const member_bounds = grid.get_hor_bounds((node) => { return this.nodes.has(node); });
        if (member_bounds === null) {
            return;
        }
        const max_bounds_off = (this.nodes.size - (member_bounds.right - member_bounds.left)) - 1;
        for (const x of possible_x) {
            if (x < member_bounds.left - max_bounds_off || member_bounds.right + max_bounds_off < x) {
                possible_x.delete(x);
            }
        }
    }
}
//# sourceMappingURL=adjacency_rule.js.map