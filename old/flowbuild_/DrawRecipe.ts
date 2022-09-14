import { Flowbuild } from "./Flowbuild.js";
import { FlowchartPos, FlowchartConfig } from "./FlowchartPos.js";
import { Recipe } from "./Recipe.js";
import { Vec2 } from "./Grid.js";

function CreateDefaultConfig(): FlowchartConfig {
    const config = new FlowchartConfig();
    config.flowchart_html = document.getElementById("flowchart");

    config.size = new Vec2();
    config.size.x = config.flowchart_html.getBoundingClientRect().width;
    config.size.y = config.flowchart_html.getBoundingClientRect().height;

    config.box_html = document.createElement("span");
    config.box_html.classList.add("box");
    config.flowchart_html.appendChild(config.box_html);

    config.arrow_html = document.createElement("arrow");
    config.arrow_html.classList.add("arrow");
    config.flowchart_html.appendChild(config.arrow_html);

    config.sync_line_html = document.createElement("span");
    config.sync_line_html.classList.add("sync_line");
    config.flowchart_html.appendChild(config.sync_line_html);

    config.sync_line_margin = 20;
    return config;
}

export function DrawRecipe(recipe: Recipe, config: FlowchartConfig = CreateDefaultConfig()): void {
    const flowchart_pos = new FlowchartPos(new Flowbuild(recipe).grid, config);
    config.flowchart_html.innerHTML = "";
    for (const box_rect of flowchart_pos.box_rects) {
        config.box_html.innerHTML = box_rect.text;
        config.box_html.style.left = box_rect.rect.pos.x.toString() + "px";
        config.box_html.style.top = box_rect.rect.pos.y.toString() + "px";
        config.flowchart_html.appendChild(config.box_html.cloneNode(true));
    }
    for (const arrow_rect of flowchart_pos.arrow_rects) {
        config.arrow_html.style.left = arrow_rect.rect.pos.x.toString() + "px";
        config.arrow_html.style.top = arrow_rect.rect.pos.y.toString() + "px";
        config.arrow_html.style.width = arrow_rect.rect.bounds.x.toString() + "px";
        config.arrow_html.style.height = arrow_rect.rect.bounds.y.toString() + "px";
        config.flowchart_html.appendChild(config.arrow_html.cloneNode(true));
    }
    for (const sync_line_rect of flowchart_pos.sync_line_rects) {
        config.sync_line_html.style.left = sync_line_rect.rect.pos.x.toString() + "px";
        config.sync_line_html.style.top = sync_line_rect.rect.pos.y.toString() + "px";
        config.sync_line_html.style.width = sync_line_rect.rect.bounds.x.toString() + "px";
        config.sync_line_html.style.height = "5px";
        config.flowchart_html.appendChild(config.sync_line_html.cloneNode(true));
    }
}