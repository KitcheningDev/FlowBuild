import { vec2_t } from "./vec2.js";
export class rect_t {
    constructor(origin, size) {
        if (origin === undefined) {
            this.origin = new vec2_t();
        }
        else {
            this.origin = origin.copy();
        }
        if (size === undefined) {
            this.size = new vec2_t();
        }
        else {
            this.size = size.copy();
        }
    }
    get top() {
        return this.origin.y - this.size.y / 2;
    }
    get right() {
        return this.origin.x + this.size.x / 2;
    }
    get bottom() {
        return this.origin.y + this.size.y / 2;
    }
    get left() {
        return this.origin.x - this.size.x / 2;
    }
}
//# sourceMappingURL=rect.js.map