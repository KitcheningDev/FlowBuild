export class EndRule {
    constructor(graph) {
        this.nodes = graph.last_step.parents;
    }
    restricts() {
        return true;
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        const y = graph.get_depth(node);
        for (const end_node of this.nodes) {
            if (grid.has_node(end_node)) {
                const coords = grid.get_node_coords(end_node);
                if (coords.y < y) {
                    possible_x.delete(coords.x);
                }
            }
        }
    }
}
//# sourceMappingURL=end_rule.js.map