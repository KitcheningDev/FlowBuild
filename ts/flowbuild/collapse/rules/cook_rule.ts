import { Graph } from "../../graph/graph.js";
import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";
import { filter_in_place, remove_val } from "../../../utils/array.js";

export class CookRule implements Rule {
    constructor() {}

    restricts(node: Node): boolean {
        return !node.task.cook.is_empty();
    }
    reduce_possible_x(node: Node, possible_x: number[], grid: FlowGrid, graph: Graph): void {
        const bounds = grid.get_hor_bounds((other_node: Node) => other_node.task.cook == node.task.cook);
        for (const cook of graph.get_cooks()) {
            if (cook != node.task.cook) {
                const other_bounds = grid.get_hor_bounds((other_node: Node) => other_node.task.cook == cook);
                if (other_bounds) {
                    filter_in_place(possible_x, (x: number) => {
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