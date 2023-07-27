import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";

export class PathRule implements Rule {
    constructor(from: Node, to: Node) {
        this.from = from;
        this.to = to;
    }
    // rule
    affects(node: Node): boolean {
        return this.from == node || this.to == node;
    }
    possibleX(node: Node, possible_x: number[], grid: FlowGrid): number[] {
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
    // member
    from: Node;
    to: Node;
}