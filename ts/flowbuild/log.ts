import { Vec2 } from "../utils/vec2.js";
import { Graph } from "./graph/graph.js";
import { FlowGrid } from "./grid/flow_grid.js";
import { MetricGrid } from "./position/metric_grid.js";

export function log_graph(graph: Graph): void {
    console.log("GRAPH:");
    for (const node of graph.nodes) {
        const childs = [];
        for (const child of node.childs) {
            if (child.task) {
                childs.push(child.task.description);
            }
        }
        const parents = [];
        for (const parent of node.parents) {
            if (parent.task) {
                parents.push(parent.task.description);
            }
        }
        console.log('\t', node.task.description);
        console.log('\t\tPARENTS:', ...parents);
        console.log('\t\tCHILDS:', ...childs);
    }
}
export function log_grid(grid: FlowGrid, msg: string = ""): void {
    let description_data = [] as string[][];
    for (let y = 0; y < grid.size.y; ++y) {
        const row = [];
        for (let x = 0; x < grid.size.x; ++x) {
            const tile = grid.get(new Vec2(x, y));

            let text = ' ';
            if (tile.node !== null) {
                if (tile.node.task.description.length > 0) {
                    text = tile.node.task.description;
                }
                else {
                    text = "<DUMMY>";
                }
            }
            if (tile.cook_title) {
                text += tile.cook_title;
            }
            // arrows
            if (tile.lines.left == 'in') {
                text = '▶' + text;
            }
            else if (tile.lines.left == 'out') {
                text = '◀' + text;
            }

            if (tile.lines.right == 'in') {
                text = text + '◀';
            }
            else if (tile.lines.right == 'out') {
                text = text + '▶';
            }

            let spaces = '';
            for (let i = 0; i <= Math.floor(text.length / 2); ++i) {
                spaces += ' ';
            }
            if (tile.lines.top == 'in') {
                text = spaces + '▼' + spaces + '\n' + text;
            }
            else if (tile.lines.top == 'out') {
                text = spaces + '▲' + spaces + '\n' + text;
            }

            if (tile.lines.bottom == 'in') {
                text = text + '\n' + spaces + '▲' + spaces;
            }
            else if (tile.lines.bottom == 'out') {
                text = text + '\n' + spaces + '▼' + spaces;
            }

            if (tile.sync_lines.top) {
                text += ';top ' + tile.sync_lines.top +  ';';
            }
            if (tile.sync_lines.bottom) {
                text += ';bottom ' + tile.sync_lines.bottom +  ';';
            }

            if (tile.cook_line) {
                text += ';cook_line;';
            }
            row.push(text);
        }
        description_data.push(row);
    }
    console.log("GRID " + msg);
    console.table(description_data);
}
export function log_metric_grid(grid: MetricGrid): void {
    let data = [] as string[][];
    for (let y = 0; y < grid.size.y; ++y) {
        const row = [];
        for (let x = 0; x < grid.size.x; ++x) {
            const tile = grid.get(new Vec2(x, y));
            
            row.push("POS " + Math.floor(tile.pos.x).toString() + " " + Math.floor(tile.pos.y).toString() + " DIM " + Math.floor(tile.dim.x).toString() + " " + Math.floor(tile.dim.y).toString());
        }
        data.push(row);
    }
    console.table(data);
}