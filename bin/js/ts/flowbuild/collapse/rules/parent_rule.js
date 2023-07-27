import { depth } from "../../graph/depth_map.js";
import { Vec2 } from "../../../utils/vec2.js";
export class ParentRule {
    constructor(node) {
        this.node = node;
    }
    // rule
    affects(node) {
        return this.node == node;
    }
    possibleX(node, possible_x, grid) {
        return possible_x.filter((x) => {
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
}
//# sourceMappingURL=parent_rule.js.map