import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";

export class NeighbourRule implements Rule {
    constructor(nodes: Set<Node>) {
        this.nodes = nodes;
    }
    // all set
    allSet(grid: FlowGrid): boolean {
        for (const node of this.nodes) {
            if (!grid.hasNode(node)) {
                return false;
            }
        }
        return true;
    }
    // rule
    affects(node: Node): boolean {
        return this.nodes.has(node);
    }
    possibleX(node: Node, possible_x: number[], grid: FlowGrid): number[] {
        if (this.allSet(grid)) {
            const bounds = grid.horBounds((node: Node) => this.nodes.has(node));
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
    // member
    nodes: Set<Node>;
}