import { Vec2 } from "../../../utils/vec2.js";
export function add_cook_lines(grid) {
    const cooks_used = new Set();
    for (const [node, coords] of grid.get_node_entries()) {
        if (!node.task.cook.is_empty() && !cooks_used.has(node.task.cook.name)) {
            const bounds = grid.get_hor_bounds((val) => { return val.task.cook.name == node.task.cook.name; });
            if (grid.in_bounds(new Vec2(bounds.right + 1, 0)) && !grid.get(new Vec2(bounds.right + 1, 0)).cook_line) {
                grid.insert_column(bounds.right + 1);
                for (let y = 1; y < grid.get_size().y - 1; ++y) {
                    const entry = grid.get_entry(new Vec2(bounds.right + 1, y));
                    entry.tile.cook_line = true;
                    const left = grid.get(new Vec2(bounds.right, y));
                    if (left.lines.right !== null) {
                        entry.tile.lines.right = left.lines.right;
                        entry.tile.lines.left = left.lines.right == 'in' ? 'out' : 'in';
                    }
                    grid.set_entry(entry);
                }
            }
            cooks_used.add(node.task.cook.name);
        }
    }
}
//# sourceMappingURL=add_cook_lines.js.map