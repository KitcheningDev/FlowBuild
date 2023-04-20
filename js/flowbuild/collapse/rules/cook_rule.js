import { filter_in_place } from "../../../utils/array.js";
export class CookRule {
    constructor() { }
    restricts(node) {
        return !node.task.cook.is_empty();
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        const bounds = grid.get_hor_bounds((other_node) => other_node.task.cook == node.task.cook);
        for (const cook of graph.get_cooks()) {
            if (cook != node.task.cook) {
                const other_bounds = grid.get_hor_bounds((other_node) => other_node.task.cook == cook);
                if (other_bounds) {
                    filter_in_place(possible_x, (x) => {
                        if (other_bounds.left <= x && x <= other_bounds.right) {
                            return true;
                        }
                        else if (bounds) {
                            if (bounds.center() < other_bounds.center() && other_bounds.center() < x) {
                                return true;
                            }
                            else if (other_bounds.center() < bounds.center() && x < other_bounds.center()) {
                                return true;
                            }
                        }
                        return false;
                    });
                }
            }
        }
    }
}
//# sourceMappingURL=cook_rule.js.map