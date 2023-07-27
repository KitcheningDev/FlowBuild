import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";
import { HorBounds } from "../../grid/bounds.js";
import { Cook1, Cook2 } from "../../recipe/task.js";

export class CookRule implements Rule {
    constructor() {}
    // rule
    affects(node: Node): boolean {
        return node.task.cook != null;
    }
    possibleX(node: Node, possible_x: number[], grid: FlowGrid): number[] {
        const bounds = grid.horBounds((other_node: Node) => other_node.task.cook == node.task.cook);
        for (const [other, coords] of grid.nodeEntries) {
            if (other.task.cook && other.task.cook != node.task.cook) {
                possible_x = possible_x.filter((x: number) => {
                    const newbounds = new HorBounds(Math.min(bounds ? bounds.left : x, x), Math.max(bounds ? bounds.right : x, x));
                    return !newbounds.inBounds(coords.x);
                });
            }
        }
        // restrict order
        for (const [node1, coords1] of grid.nodeEntries) {
            for (const [node2, coords2] of grid.nodeEntries) {
                if (node1.task.cook == Cook1 && node2.task.cook == Cook2) {
                    if (coords2.x < coords1.x) {
                        return [];
                    }
                }
            }    
        }
        return possible_x;
    }
}