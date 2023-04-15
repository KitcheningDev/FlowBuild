export class CookRule {
    constructor() { }
    restricts(node) {
        return !node.task.cook.is_empty();
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        let same_left = Infinity;
        let same_right = -Infinity;
        for (const other_node of grid.get_nodes()) {
            if (other_node.task.cook.name == node.task.cook.name) {
                const coords = grid.get_node_coords(other_node);
                same_left = Math.min(coords.x, same_left);
                same_right = Math.max(coords.x, same_right);
            }
        }
        if (same_left == Infinity) {
            for (const other_node of grid.get_nodes()) {
                if (!other_node.task.cook.is_empty()) {
                    possible_x.delete(grid.get_node_coords(other_node).x);
                }
            }
        }
        else {
            let other_left = -Infinity;
            let other_right = Infinity;
            for (const other_node of grid.get_nodes()) {
                if (!other_node.task.cook.is_empty()) {
                    const coords = grid.get_node_coords(other_node);
                    if (coords.x < same_left) {
                        other_left = Math.max(coords.x, other_left);
                    }
                    if (same_right < coords.x) {
                        other_right = Math.min(coords.x, other_right);
                    }
                }
            }
            for (const x of possible_x) {
                if (x <= other_left || other_right <= x) {
                    possible_x.delete(x);
                }
            }
        }
    }
}
//# sourceMappingURL=cook_rule.js.map