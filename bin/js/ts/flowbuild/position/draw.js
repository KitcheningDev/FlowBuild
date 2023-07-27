import { Vec2 } from "../../utils/vec2.js";
import { MetricTile } from "./metric_tile.js";
import { html } from "../../editor/html.js";
import { button_tile, cookline_tile, syncline_tile } from "./html_size.js";
import { Cook1, Cook2 } from "../recipe/task.js";
// draw html
const container = document.getElementById("flowchart-container");
const canvasSize = new Vec2(container.getBoundingClientRect().width, container.getBoundingClientRect().height);
function drawElement(el, metric_tile, size) {
    el.style.left = (canvasSize.x / 2 + metric_tile.pos.x - metric_tile.margin.x / 2 - offset.x).toString() + 'px';
    el.style.top = (canvasSize.y / 2 + metric_tile.pos.y - metric_tile.margin.y / 2 - offset.y).toString() + 'px';
    if (size) {
        if (size.x !== null) {
            el.style.width = size.x.toString() + 'px';
        }
        if (size.y !== null) {
            el.style.height = size.y.toString() + 'px';
        }
    }
    container.appendChild(el);
}
// create html elements
// task
function createTask(node) {
    if (node.isStart()) {
        const el = html.createDiv('flow-start');
        el.id = node.task.id.toString();
        return el;
    }
    else {
        const el = html.createDiv('flow-task');
        el.innerText = node.task.description;
        el.id = node.task.id.toString();
        return el;
    }
}
// editor
function createConnect(node) {
    const el = html.appendChilds(html.createDiv('editor', 'connect'), html.create('i', 'fa-solid', 'fa-circle-nodes'));
    el.id = 'connector-' + node.task.id;
    return el;
}
function createNew(cook) {
    const el = html.appendChilds(html.createDiv('editor', 'cook-new', 'selected'), html.create('i', 'fa-solid', 'fa-plus'));
    el.id = 'new-' + cook.name;
    return el;
}
function createTrash(node) {
    const el = html.appendChilds(html.createDiv('editor', 'trash'), html.create('i', 'fa-solid', 'fa-trash'));
    el.id = 'trash-' + node.task.id;
    return el;
}
function createAdd(node) {
    const el = html.appendChilds(html.createDiv('editor', 'add'), html.create('i', 'fa-solid', 'fa-link'));
    el.id = 'add-' + node.task.id;
    return el;
}
function createRemove(node) {
    const el = html.appendChilds(html.createDiv('editor', 'remove'), html.create('i', 'fa-solid', 'fa-link-slash'));
    el.id = 'remove-' + node.task.id;
    return el;
}
// line
function createLine(dir) {
    const el = html.createDiv('line', dir);
    return el;
}
function createSyncLine(type) {
    const el = html.createDiv('sync-line', type);
    return el;
}
function createCookLine() {
    return html.createDiv('cook-line');
}
function createCookTitle(title) {
    const el = html.createDiv('cook-title');
    el.textContent = title;
    return el;
}
function createConnector() {
    const el = html.appendChilds(html.createDiv('connector'), html.create('i', 'fa-solid', 'fa-diamond', 'fa-2xs'));
    return el;
}
function createCaret(dir) {
    if (dir == 'top') {
        return html.createDiv('caret-up', 'fa-solid', 'fa-angle-up', 'fa-2xs');
    }
    else if (dir == 'right') {
        return html.createDiv('caret-right', 'fa-solid', 'fa-angle-right', 'fa-2xs');
    }
    else if (dir == 'bottom') {
        return html.createDiv('caret-down', 'fa-solid', 'fa-angle-down', 'fa-2xs');
    }
    else {
        return html.createDiv('caret-left', 'fa-solid', 'fa-angle-left', 'fa-2xs');
    }
}
let offset = null;
export function draw_grid(flow_grid, metric_grid, graph) {
    container.innerHTML = "";
    offset = metric_grid.center;
    for (const [tile, coords] of flow_grid.entries) {
        const metric = metric_grid.get(coords);
        // node
        if (tile.node && tile.node.task && tile.node.task.description != '') {
            if (tile.node.isStart() && graph.cookCount == 1) {
                drawElement(createNew(Cook1), new MetricTile(new Vec2(metric.pos.x, metric.pos.y - metric.withMargin.y / 2 - 10)));
            }
            // task
            drawElement(createTask(tile.node), metric);
            // connect
            if (!tile.node.isEnd()) {
                drawElement(createConnect(tile.node), new MetricTile(new Vec2(metric.pos.x + metric.dim.x / 2, metric.pos.y)));
            }
            // trash
            if (!tile.node.isStart() && !tile.node.isEnd()) {
                drawElement(createTrash(tile.node), new MetricTile(new Vec2(metric.pos.x - metric.dim.x / 2 - button_tile.width, metric.pos.y)));
            }
            // add 
            drawElement(createAdd(tile.node), new MetricTile(new Vec2(metric.pos.x + metric.dim.x / 2, metric.pos.y)));
            // remove
            drawElement(createRemove(tile.node), new MetricTile(new Vec2(metric.pos.x + metric.dim.x / 2, metric.pos.y)));
        }
        // connector
        if (tile.lines.hasConnector()) {
            drawElement(createConnector(), metric);
        }
        // sync-lines
        // if (tile.sync_lines.top) {
        //     if (tile.sync_lines.top == 'middle') {
        //         drawElement(createSyncLine(tile.sync_lines.top), metric, new Vec2(metric_grid.maxX(coords), null));
        //     }
        //     else {
        //         drawElement(createSyncLine(tile.sync_lines.top), metric);
        //     }
        // }
        // if (tile.sync_lines.bottom) {
        //     if (tile.sync_lines.bottom == 'middle') {
        //         drawElement(createSyncLine(tile.sync_lines.bottom), metric, new Vec2(metric_grid.maxX(coords), null));
        //     }
        //     else {
        //         drawElement(createSyncLine(tile.sync_lines.bottom), metric);
        //     }
        // }
        // lines
        for (const dir of ['top', 'right', 'bottom', 'left']) {
            if (tile.lines[dir] == 'out') {
                if (dir == 'top') {
                    drawElement(createLine('top'), new MetricTile(metric.pos), new Vec2(1, metric_grid.maxTop(coords, true)));
                }
                else if (dir == 'right') {
                    drawElement(createLine('right'), new MetricTile(metric.pos), new Vec2(metric_grid.maxRight(coords, true), 1));
                }
                else if (dir == 'bottom') {
                    drawElement(createLine('bottom'), new MetricTile(metric.pos), new Vec2(1, metric_grid.maxBottom(coords, true)));
                    if (flow_grid.get(coords.down()).isSolid()) {
                        drawElement(createCaret('bottom'), new MetricTile(new Vec2(metric.pos.x, metric.pos.y + metric_grid.maxBottom(coords, true))));
                    }
                }
                else if (dir == 'left') {
                    drawElement(createLine('left'), new MetricTile(metric.pos), new Vec2(metric_grid.maxLeft(coords, true), 1));
                }
            }
        }
        // cook title
        if (tile.cook_title) {
            drawElement(createCookTitle(tile.cook_title), metric);
            if (tile.cook_title.includes('lehrling')) {
                drawElement(createNew(Cook1), new MetricTile(new Vec2(metric.pos.x - metric.withMargin.x / 2 - 20, metric.pos.y)));
            }
            else if (tile.cook_title.includes('meister')) {
                drawElement(createNew(Cook2), new MetricTile(new Vec2(metric.pos.x + metric.withMargin.x / 2 + 20, metric.pos.y)));
            }
        }
        // // carets
        // if (tile.isSolid() && tile.lines.top == 'in') {
        //     drawElement(createCaret('bottom'), new MetricTile(new Vec2(metric.pos.x, metric.pos.y - metric.dim.y / 2)));
        // }
        // cook lines
        // if (tile.cook_line) {
        //     drawElement(createCookLine(), metric, new Vec2(null, metric_grid.maxY(coords)));
        // }
    }
    // sync lines
    for (const [node, _] of flow_grid.nodeEntries) {
        if (node.hasTopSyncline) {
            const bounds = flow_grid.bounds((other) => node.topSyncline.has(other));
            let incoords = flow_grid.nodeIn(node);
            while (flow_grid.get(incoords).sync_lines.isEmpty()) {
                incoords = incoords.up();
            }
            const y = metric_grid.get(incoords).pos.y;
            const lefttile = metric_grid.get(flow_grid.nodeCoords(bounds.left_node));
            const righttile = metric_grid.get(flow_grid.nodeCoords(bounds.right_node));
            const left = lefttile.left + lefttile.margin.x / 4;
            const right = righttile.right - righttile.margin.x / 4;
            drawElement(createSyncLine('middle'), new MetricTile(new Vec2((left + right) / 2, y), syncline_tile.dim, syncline_tile.margin), new Vec2(Math.max(right - left, 100) - 10, null));
        }
        if (node.hasBottomSyncline) {
            const bounds = flow_grid.bounds((other) => node.bottomSyncline.has(other));
            let outcoords = flow_grid.nodeOut(node);
            while (flow_grid.get(outcoords).sync_lines.isEmpty()) {
                outcoords = outcoords.down();
            }
            const y = metric_grid.get(outcoords).pos.y;
            const lefttile = metric_grid.get(flow_grid.nodeCoords(bounds.left_node));
            const righttile = metric_grid.get(flow_grid.nodeCoords(bounds.right_node));
            const left = lefttile.left + lefttile.margin.x / 4;
            const right = righttile.right - righttile.margin.x / 4;
            drawElement(createSyncLine('middle'), new MetricTile(new Vec2((left + right) / 2, y), syncline_tile.dim, syncline_tile.margin), new Vec2(Math.max(right - left, 100) - 10, null));
        }
    }
    // cook lines
    const y = Math.floor(flow_grid.size.y / 2);
    const centery = (metric_grid.get(new Vec2(0, flow_grid.size.y - 2)).pos.y + metric_grid.get(new Vec2(0, 1)).pos.y) / 2;
    const dim = metric_grid.get(new Vec2(0, flow_grid.size.y - 2)).pos.y - metric_grid.get(new Vec2(0, 1)).pos.y;
    for (let x = 0; x < flow_grid.size.x; ++x) {
        if (flow_grid.get(new Vec2(x, y)).cook_line) {
            drawElement(createCookLine(), new MetricTile(new Vec2(metric_grid.get(new Vec2(x, y)).pos.x, centery), cookline_tile.dim, cookline_tile.margin), new Vec2(null, dim));
        }
    }
}
//# sourceMappingURL=draw.js.map