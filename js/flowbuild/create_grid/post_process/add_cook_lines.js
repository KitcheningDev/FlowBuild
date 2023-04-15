import { Vec2 } from "../../../utils/vec2.js";
import { get_hor_bounds } from "../bounds.js";
export function add_cook_lines(grid) {
    const cooks_used = new Set();
    for (const node of grid.get_nodes()) {
        if (!node.task.cook.is_empty() && !cooks_used.has(node.task.cook.name)) {
            const bounds = get_hor_bounds((val) => { return val.task.cook.name == node.task.cook.name; }, grid);
            if (grid.in_bounds(new Vec2(bounds.right + 1, 0)) && !grid.get(new Vec2(bounds.right + 1, 0)).cook_line) {
                grid.insert_column(bounds.right + 1);
                for (let y = 1; y < grid.get_size().y; ++y) {
                    grid.get(new Vec2(bounds.right + 1, y)).cook_line = true;
                }
            }
            cooks_used.add(node.task.cook.name);
        }
    }
}
//# sourceMappingURL=add_cook_lines.js.map