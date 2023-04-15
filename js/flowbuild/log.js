import { Vec2 } from "../utils/vec2.js";
export function log_graph(graph) {
    console.log("GRAPH:");
    for (const node of graph.nodes) {
        const childs = [];
        for (const child of node.childs) {
            childs.push(child.task.description);
        }
        const parents = [];
        for (const parent of node.parents) {
            parents.push(parent.task.description);
        }
        console.log('\t', node.task.description);
        console.log('\t\tPARENTS:', ...parents);
        console.log('\t\tCHILDS:', ...childs);
    }
}
export function log_grid(grid) {
    let description_data = [];
    for (let y = 0; y < grid.get_size().y; ++y) {
        const row = [];
        for (let x = 0; x < grid.get_size().x; ++x) {
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
                text += ';top ' + tile.sync_lines.top + ';';
            }
            if (tile.sync_lines.bottom) {
                text += ';bottom ' + tile.sync_lines.bottom + ';';
            }
            if (tile.cook_line) {
                text += ';cook_line;';
            }
            row.push(text);
        }
        description_data.push(row);
    }
    console.table(description_data);
}
export function log_metric_grid(grid) {
    let data = [];
    for (let y = 0; y < grid.get_size().y; ++y) {
        const row = [];
        for (let x = 0; x < grid.get_size().x; ++x) {
            const tile = grid.get(new Vec2(x, y));
            row.push("POS " + Math.floor(tile.pos.x).toString() + " " + Math.floor(tile.pos.y).toString() + " DIM " + Math.floor(tile.dim.x).toString() + " " + Math.floor(tile.dim.y).toString());
        }
        data.push(row);
    }
    console.table(data);
}
//# sourceMappingURL=log.js.map