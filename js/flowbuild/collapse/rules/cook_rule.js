import { filter_in_place } from "../../../utils/array.js";
export class CookRule {
    constructor() { }
    restricts(node) {
        return !node.task.cook.is_empty();
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        for (const cook of graph.get_cooks()) {
            if (cook != node.task.cook) {
                const bounds = grid.get_hor_bounds((other_node) => other_node.task.cook == cook);
                if (bounds) {
                    filter_in_place(possible_x, (x) => bounds.left <= x && x <= bounds.right);
                }
            }
        }
    }
}
//# sourceMappingURL=cook_rule.js.map