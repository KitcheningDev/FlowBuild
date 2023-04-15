import { Vec2 } from "../utils/vec2.js";
class Config {
    constructor() {
        this.task_margin = new Vec2(15, 15);
        this.sync_line_margin = new Vec2(0, 20);
        this.connector_margin = new Vec2(15, 15);
        this.cook_line_margin = new Vec2(10, 0);
        this.font_size = 10;
        this.max_width = 130;
    }
    apply(task) {
        task.style.fontSize = this.font_size.toString() + "px";
        task.style.maxWidth = this.max_width.toString() + "px";
    }
}
;
export const config = new Config();
//# sourceMappingURL=config.js.map