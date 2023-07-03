import { Vec2 } from "../../utils/vec2.js";
import { Node } from "../graph/node.js";
import { Tile } from "../grid/tile.js";
import { MetricTile } from "./metric_tile.js";

// html
const container = document.getElementById("flowchart-container") as HTMLElement;
function getTile(cls: string, text: string = ""): MetricTile {
    const el = document.createElement('div');
    el.classList.add(cls);
    el.textContent = text;
    container.appendChild(el);
    const rect = el.getBoundingClientRect();
    const computed_style = window.getComputedStyle(el);
    const horMargin = parseFloat(computed_style.marginRight.slice(0, -2)) + parseFloat(computed_style.marginLeft.slice(0, -2));
    const verMargin = parseFloat(computed_style.marginTop.slice(0, -2)) + parseFloat(computed_style.marginBottom.slice(0, -2));
    container.removeChild(el);
    return new MetricTile(
        new Vec2(0, 0),
        new Vec2(Math.ceil(rect.width), Math.ceil(rect.height)),
        new Vec2(horMargin, verMargin));
}
// tiles
export const start_tile = getTile('flow-start');
export const syncline_tile = getTile('sync-line');
export const cookline_tile = getTile('cook-line');
export const connector_tile = getTile('connector');
export const button_tile = getTile('editor-trash');
function nodeTile(node: Node): MetricTile {
    return getTile('flow-task', node.task.description);
}
function cookTitleTile(title: string): MetricTile {
    return getTile('cook-title', title);
}
// create
export function createMetricTile(tile: Tile): MetricTile {
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