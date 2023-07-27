import { html } from "../../editor/html.js";
import { Vec2 } from "../../utils/vec2.js";
import { createConnector } from "./draw.js";
import { MetricTile } from "./metric_tile.js";
// html
const container = document.getElementById("flowchart-container");
function getTile(cls, text = "") {
    const el = document.createElement('div');
    el.classList.add(cls);
    el.textContent = text;
    return getMetricTile(el);
}
function getMetricTile(element) {
    container.appendChild(element);
    const rect = element.getBoundingClientRect();
    const computed_style = window.getComputedStyle(element);
    const horMargin = parseFloat(computed_style.marginRight.slice(0, -2)) + parseFloat(computed_style.marginLeft.slice(0, -2));
    const verMargin = parseFloat(computed_style.marginTop.slice(0, -2)) + parseFloat(computed_style.marginBottom.slice(0, -2));
    const out = new MetricTile(new Vec2(0, 0), new Vec2(Math.ceil(rect.width), Math.ceil(rect.height)), new Vec2(horMargin, verMargin));
    container.removeChild(element);
    return out;
}
// tiles
export const start_tile = getTile('flow-start');
export const syncline_tile = getTile('sync-line');
export const cookline_tile = getTile('cook-line');
export const connector_tile = getMetricTile(createConnector());
export const button_tile = getTile('editor-trash');
function nodeTile(node) {
    return getTile('flow-task', node.task.description);
}
export function makeCookTitle(title) {
    const [first, last] = title.split(' ');
    const firstel = html.create('span');
    const lastel = html.create('span');
    firstel.innerHTML = first;
    lastel.innerHTML = last;
    return html.appendChilds(html.createDiv('cook-title'), firstel, html.create('br'), lastel);
}
function cookTitleTile(title) {
    return getMetricTile(makeCookTitle(title));
}
// create
export function createMetricTile(tile) {
    if (tile.node != null && tile.node.task != null && tile.node.task.description != '') {
        if (tile.node.task.description == '') {
            // return new MetricTile();
            return new MetricTile(new Vec2(0, 0), new Vec2(0, 0), nodeTile(tile.node).margin);
        }
        if (tile.node.isStart()) {
            return start_tile.clone();
        }
        else {
            return nodeTile(tile.node);
        }
    }
    else if (tile.sync_lines.top || tile.sync_lines.bottom) {
        return syncline_tile.clone();
    }
    else if (tile.cook_line) {
        return cookline_tile.clone();
    }
    else if (tile.lines.hasConnector()) {
        return connector_tile.clone();
    }
    else if (tile.cook_title != '') {
        return cookTitleTile(tile.cook_title);
    }
    return new MetricTile();
}
//# sourceMappingURL=html_size.js.map