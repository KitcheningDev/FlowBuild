export class NeighbourRule {
    constructor(nodes) {
        this.nodes = nodes;
    }
    // all set
    allSet(grid) {
        for (const node of this.nodes) {
            if (!grid.hasNode(node)) {
                return false;
            }
        }
        return true;
    }
    // rule
    affects(node) {
        return this.nodes.has(node);
    }
    possibleX(node, possible_x, grid) {
        if (this.allSet(grid)) {
            const bounds = grid.horBounds((node) => this.nodes.has(node));
            if (bounds.length == this.nodes.size) {
                return possible_x;
            }
            else {
                return [];
            }
        }
        else {
            return possible_x;
        }
    }
}
//# sourceMappingURL=neighbour_rule.js.map