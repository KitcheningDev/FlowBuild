export class PathRule {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    // rule
    affects(node) {
        return this.from == node || this.to == node;
    }
    possibleX(node, possible_x, grid) {
        if (grid.hasNode(this.from) || grid.hasNode(this.to)) {
            const x = grid.nodeCoords(grid.hasNode(this.from) ? this.from : this.to).x;
            if (possible_x.includes(x)) {
                return [x];
            }
            else {
                return [];
            }
        }
    }
}
//# sourceMappingURL=path_rule.js.map