import { Vec2, vec2_sub } from "../../../utils/vec2.js";
import { Graph } from "../../graph/graph.js";
import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";
import { set_element, set_equal } from "../../../utils/set.js";

export class SyncLineRule implements Rule {
    nodes: Set<Node>;
    siblings: Set<Node>;

    constructor(nodes: Set<Node>, siblings: Set<Node>) {
        this.nodes = nodes;
        this.siblings = siblings;
    }

    all_set(grid: FlowGrid): boolean {
        for (const node of this.nodes) {
            if (!grid.has_node(node)) {
                return false;
            }
        }
        return true;
    }

    restricts(node: Node): boolean {
        return true;
    }
    reduce_possible_x(node: Node, possible_x: number[], grid: FlowGrid, graph: Graph): void {
        if (this.all_set(grid)) {
            const bounds = grid.get_hor_bounds((node: Node) => this.nodes.has(node));
            if ((bounds.length() % 2) == (this.siblings.size % 2)) {
                possible_x.length = 0;
            }
            else if (this.nodes.size <= bounds.length() && grid.get(new Vec2(Math.floor(bounds.center()), graph.get_depth(set_element(this.nodes)))).is_solid()) {
                possible_x.length = 0;
            }

            for (const sibling of this.siblings) {
                if (grid.has_node(sibling) && sibling.task.cook == set_element(this.nodes).task.cook) {
                    const coords = grid.get_node_coords(sibling);
                    const off = (this.siblings.size - 1) / 2;
                    if (coords.x < bounds.center() - off || bounds.center() + off < coords.x) {
                        possible_x.length = 0;
                    }
                }
            }
        }
    }
}