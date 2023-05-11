import { Vec2 } from "../utils/vec2.js";

class Config {
    start_margin: Vec2;
    task_margin: Vec2;
    sync_line_margin: Vec2;
    connector_margin: Vec2;
    cook_line_margin: Vec2;
    font_size: number;
    max_width: number;

    constructor() {
        this.start_margin = new Vec2(0, 0);
        this.task_margin = new Vec2(15, 15);
        this.sync_line_margin = new Vec2(0, 20);
        this.connector_margin = new Vec2(15, 15);
        this.cook_line_margin = new Vec2(10, 0);
        this.font_size = 16;
        this.max_width = 130;
    }

    apply(task: HTMLElement): void {
        return;
        task.style.fontSize = this.font_size.toString() + "px";
        task.style.maxWidth = this.max_width.toString() + "px";
    }
};
export const config = new Config();