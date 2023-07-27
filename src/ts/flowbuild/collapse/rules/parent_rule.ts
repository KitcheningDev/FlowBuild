import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";
import { depth } from "../../graph/depth_map.js";
import { Vec2 } from "../../../utils/vec2.js";

export class ParentRule implements Rule {
    constructor(node: Node) {
        this.node = node;
    }
    // rule
    affects(node: Node): boolean {
        return this.node == node;
    }
    possibleX(node: Node, possible_x: number[], grid: FlowGrid): number[] {
        return possible_x.filter((x: number) => {
            for (let y = depth(node); y >= 0; --y) {
                const tile = grid.get(new Vec2(x, y));
                if (tile.isEmpty()) {
                    continue;
                }
                if (this.node.parents.has(tile.node)) {
                    return true;
                }
                break;
            }
            return false;
        });
    }
    // member
    node: Node;
}