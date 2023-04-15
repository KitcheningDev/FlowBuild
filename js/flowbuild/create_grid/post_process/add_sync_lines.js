import { get_sync_lines } from "../sync_line.js";
export function add_sync_lines(grid, graph) {
    const sync_lines = get_sync_lines(graph);
    for (const sync_line of sync_lines) {
        console.log(...sync_line.members, ...sync_line.shared);
        grid.set_sync_line(sync_line);
        const [coords, length] = grid.get_sync_line_bounds(sync_line);
        if (length % 2 == 0) {
            grid.insert_column(coords.x + length / 2, true);
        }
    }
}
//# sourceMappingURL=add_sync_lines.js.map