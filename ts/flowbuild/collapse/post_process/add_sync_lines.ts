import { Graph } from "../../graph/graph.js";
import { FlowGrid } from "../../grid/flow_grid.js";

export function reserve_sync_lines(grid: FlowGrid, graph: Graph): void {
    for (const sync_line of graph.sync_lines) {
        const bounds = grid.get_sync_line_bounds(sync_line);
        if (bounds.width() % 2 == 1) {
            grid.insert_column(bounds.center().x + 1);
        }
    }
}
export function add_sync_lines(grid: FlowGrid, graph: Graph): void {
    for (const sync_line of graph.sync_lines) {
        const bounds = grid.get_sync_line_bounds(sync_line);
        grid.set_sync_line(sync_line); 
    }
}