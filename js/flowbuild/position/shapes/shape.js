import { Vec2 } from "../../../utils/vec2.js";
export class Rect {
    constructor(origin, size) {
        this.origin = origin;
        this.size = size;
    }
    get top() {
        return new Vec2(this.origin.x, this.origin.y - this.size.y / 2);
    }
    get right() {
        return new Vec2(this.origin.x + this.size.x / 2, this.origin.y);
    }
    get bottom() {
        return new Vec2(this.origin.x, this.origin.y + this.size.y / 2);
    }
    get left() {
        return new Vec2(this.origin.x - this.size.x / 2, this.origin.y);
    }
    get top_left() {
        return new Vec2(this.origin.x - this.size.x / 2, this.origin.y - this.size.y / 2);
    }
    get top_right() {
        return new Vec2(this.origin.x + this.size.x / 2, this.origin.y - this.size.y / 2);
    }
    get bottom_right() {
        return new Vec2(this.origin.x + this.size.x / 2, this.origin.y + this.size.y / 2);
    }
    get bottom_left() {
        return new Vec2(this.origin.x - this.size.x / 2, this.origin.y + this.size.y / 2);
    }
}
export class Shape {
    constructor(pos, bounds) {
        this.pos = pos;
        this.bounds = bounds;
    }
}
//# sourceMappingURL=shape.js.map