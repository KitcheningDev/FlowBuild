import { Vec2 } from "../utils/vec2.js";

class Config {
    task_margin: Vec2;
    sync_line_margin: Vec2;
    connector_margin: Vec2;
    cook_line_margin: Vec2;
    font_size: number;
    max_width: number;

    constructor() {
        this.task_margin = new Vec2(15, 15);
        this.sync_line_margin = new Vec2(0, 20);
        this.connector_margin = new Vec2(15, 15);
        this.cook_line_margin = new Vec2(10, 0);
        this.font_size = 10;
        this.max_width = 130;
    }

    apply(task: HTMLElement): void {
        task.style.fontSize = this.font_size.toString() + "px";
        task.style.maxWidth = this.max_width.toString() + "px";
    }
};
export const config = new Config();