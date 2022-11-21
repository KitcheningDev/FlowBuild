import { vec2_t } from "./vec2.js";

export class rect_t {
    origin: vec2_t;
    size: vec2_t;

    constructor(origin?: vec2_t, size?: vec2_t) {
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
    get top(): number {
        return this.origin.y - this.size.y / 2;
    }
    get right(): number {
        return this.origin.x + this.size.x / 2;
    }
    get bottom(): number {
        return this.origin.y + this.size.y / 2;
    }
    get left(): number {
        return this.origin.x - this.size.x / 2;
    }
}