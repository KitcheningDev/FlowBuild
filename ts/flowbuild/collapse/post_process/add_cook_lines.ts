import { Vec2 } from "../../../utils/vec2.js";
import { Graph } from "../../graph/graph.js";
import { Node } from "../../graph/node.js";
import { FlowGrid } from "../../grid/flow_grid.js";
import { Cook } from "../../recipe/task.js";

export function addCookLines(grid: FlowGrid, graph: Graph): void {
    if (graph.cookCount == 1) {
        return;
    }
    const added = new Set<Cook>();
    for (const node of graph.nodes) {
        const cook = node.task.cook;
        if (cook && !added.has(cook)) {
            const bounds = grid.bounds((node: Node) => node.task.cook == cook);
            if (bounds.left == 0) {
                const entry = grid.getEntry(new Vec2(0, 0));
                entry.tile.cook_title = cook.title;
                grid.setEntry(entry);
            }
            if (bounds.right == grid.size.x - 1) {
                const entry = grid.getEntry(new Vec2(grid.size.x - 1, 0));
                entry.tile.cook_title = cook.title;
                grid.setEntry(entry);
            }
            if (bounds.right + 1 != grid.size.x) {
                grid.insertColumn(bounds.right + 1);
                for (let y = 1; y < grid.size.y - 1; ++y) {
                    grid.addCookLine(new Vec2(bounds.right + 1, y));
                }
            }
            added.add(cook);
        }
    }
}