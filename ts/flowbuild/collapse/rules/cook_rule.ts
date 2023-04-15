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
        for (const cook of graph.get_cooks()) {
            if (cook != node.task.cook) {
                const bounds = grid.get_hor_bounds((other_node: Node) => other_node.task.cook == cook);
                if (bounds) {
                    filter_in_place(possible_x, (x: number) => bounds.left <= x && x <= bounds.right);
                }
            }
        }
    }
}