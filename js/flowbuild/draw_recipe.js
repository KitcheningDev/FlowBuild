import { collapse } from "./collapse/collapse.js";
import { create_rules } from "./collapse/create_rules.js";
import { add_cook_lines } from "./collapse/post_process/add_cook_lines.js";
import { add_lines } from "./collapse/post_process/add_lines.js";
import { add_start_end } from "./collapse/post_process/add_start_end.js";
import { add_sync_lines } from "./collapse/post_process/add_sync_lines.js";
import { log_graph, log_grid, log_metric_grid } from "./log.js";
import { draw_grid } from "./position/draw.js";
import { MetricGrid } from "./position/metric_grid.js";
const container = document.getElementById('flowchart');
export function draw_recipe(recipe) {
    const graph = recipe.create_graph();
    // graph.flatten();
    // log_graph(graph);
    // container.innerHTML = "";
    // console.log(align(graph));
    // container.appendChild(align(graph).to_html());
    log_graph(graph);
    const rules = create_rules(graph);
    const flow_grid = collapse(graph, rules);
    graph.flatten();
    flow_grid.shrink_to_fit();
    graph.unflatten();
    // log_grid(flow_grid);
    add_sync_lines(flow_grid, graph);
    // log_grid(flow_grid);
    add_lines(flow_grid, graph);
    add_cook_lines(flow_grid);
    add_start_end(flow_grid, graph);
    log_grid(flow_grid);
    const metric_grid = new MetricGrid(flow_grid);
    log_metric_grid(metric_grid);
    draw_grid(flow_grid, metric_grid, graph);
}
//# sourceMappingURL=draw_recipe.js.map