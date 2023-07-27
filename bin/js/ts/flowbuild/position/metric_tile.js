import { Vec2, vec2Add } from "../../utils/vec2.js";
export class MetricTile {
    constructor(pos = new Vec2(0, 0), dim = new Vec2(0, 0), margin = new Vec2(0, 0)) {
        this.pos = pos;
        this.dim = dim;
        this.margin = margin;
    }
    // access
    isEmpty() {
        return this.dim.x == 0 && this.dim.y == 0;
    }
    clone() {
        return new MetricTile(this.pos.clone(), this.dim.clone(), this.margin.clone());
    }
    get withMargin() {
        return vec2Add(this.dim, this.margin);
    }
    // directions
    get top() {
        return this.pos.y - this.withMargin.y / 2;
    }
    get right() {
        return this.pos.x + this.withMargin.x / 2;
    }
    get bottom() {
        return this.pos.y + this.withMargin.y / 2;
    }
    get left() {
        return this.pos.x - this.withMargin.x / 2;
    }
    get width() {
        return this.withMargin.x;
    }
    get height() {
        return this.withMargin.y;
    }
}
;
//# sourceMappingURL=metric_tile.js.map