import { Vec2 } from "../Utils/Vec2.js"

export class FlowchartConfig {
    size: Vec2;

    flowchart_html: HTMLElement;
    box_html: HTMLElement;
    arrow_html: HTMLElement;

    box_margin: number;
    depth_margin: number;
    flowchart_ver_margin: number;
    flowchart_hor_margin: number;

    GetBoxSize(text: string): Vec2 {
        this.box_html.innerHTML = text;
        const rect = this.box_html.getBoundingClientRect();
        return new Vec2(rect.width + this.box_margin * 2, rect.height + this.box_margin * 2);
    }
}
export function CreateDefaultConfig(): FlowchartConfig {
    const config = new FlowchartConfig();
    config.flowchart_html = document.getElementById("flowchart");

    config.size = new Vec2();
    config.size.x = config.flowchart_html.getBoundingClientRect().width;
    config.size.y = config.flowchart_html.getBoundingClientRect().height;

    config.box_html = document.createElement("span");
    config.box_html.classList.add("box");

    config.arrow_html = document.createElement("span");
    config.arrow_html.classList.add("arrow");

    config.flowchart_html.appendChild(config.box_html);

    config.box_margin = 5;
    config.depth_margin = 10;
    config.flowchart_ver_margin = 100;
    config.flowchart_hor_margin = 100;
    return config;
}
