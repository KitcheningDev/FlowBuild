export class PathRule {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    restricts(node) {
        return this.from == node || this.to == node;
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        if (grid.has_node(this.from) || grid.has_node(this.to)) {
            const setted = grid.has_node(this.from) ? this.from : this.to;
            if (possible_x.includes(grid.get_node_coords(setted).x)) {
                possible_x.length = 0;
                possible_x.push(grid.get_node_coords(setted).x);
            }
            else {
                possible_x.length = 0;
            }
        }
    }
}
//# sourceMappingURL=path_rule.js.map