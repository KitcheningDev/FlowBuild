import { collapse } from "./collapse/collapse.js";
import { log_graph, log_grid, log_metric_grid } from "./log.js";
import { draw_grid } from "./position/draw.js";
import { MetricGrid } from "./position/metric_grid.js";
import { createRules } from "./collapse/create_rules.js";
import { addSyncLines } from "./collapse/post_process/add_sync_lines.js";
import { addLines } from "./collapse/post_process/add_lines.js";
import { center } from "./collapse/post_process/center.js";
import { addCookLines } from "./collapse/post_process/add_cook_lines.js";
export function drawRecipe(recipe) {
    for (const [from, to] of recipe.conns) {
        // console.log(from.description, ...to);
    }
    const graph = recipe.createGraph();
    log_graph(graph);
    graph.flatten();
    log_graph(graph);
    const flow_grid = collapse(graph, createRules(graph));
    // createGrid(graph);
    flow_grid.shrinkToFit();
    graph.unflatten();
    log_grid(flow_grid, "PLAIN");
    center(flow_grid, graph);
    addCookLines(flow_grid, graph);
    // graph.flatten();
    // graph.unflatten();
    addSyncLines(flow_grid, graph);
    log_grid(flow_grid, "AFTER CENTER, SYNCLINES");
    addLines(flow_grid, graph);
    // add_sync_lines(flow_grid, graph);
    // // log_grid(flow_grid);
    // add_lines(flow_grid, graph);
    // add_cook_lines(flow_grid);
    // add_start_end(flow_grid, graph);
    log_grid(flow_grid, "AFTER CENTER, SYNCLINES, LINES");
    flow_grid.shrinkToFit();
    log_grid(flow_grid, "AFTER CENTER, SYNCLINES, LINES, SHRINK");
    const metric_grid = new MetricGrid(flow_grid, graph);
    log_metric_grid(metric_grid);
    // graph.flatten();
    draw_grid(flow_grid, metric_grid, graph);
}
//# sourceMappingURL=draw_recipe.js.map