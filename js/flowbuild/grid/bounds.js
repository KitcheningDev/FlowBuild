import { Vec2 } from "../../utils/vec2.js";
export class HorBounds {
    constructor(left, right, left_node = null, right_node = null) {
        this.left = left;
        this.right = right;
        this.left_node = left_node;
        this.right_node = right_node;
    }
    // access
    inBounds(x) {
        return this.left <= x && x <= this.right;
    }
    get length() {
        return this.right - this.left;
    }
    get center() {
        return Math.floor((this.left + this.right) / 2);
    }
}
export class VerBounds {
    constructor(top, bottom, top_node = null, bottom_node = null) {
        this.top = top;
        this.bottom = bottom;
        this.top_node = top_node;
        this.bottom_node = bottom_node;
    }
    // access
    inBounds(y) {
        return this.top <= y && y <= this.bottom;
    }
    get length() {
        return this.bottom - this.top;
    }
    get center() {
        return Math.floor((this.top + this.bottom) / 2);
    }
}
export class Bounds {
    constructor(hor_bounds, ver_bounds) {
        this.top = ver_bounds.top;
        this.right = hor_bounds.right;
        this.bottom = ver_bounds.bottom;
        this.left = hor_bounds.left;
        this.top_node = ver_bounds.top_node;
        this.right_node = hor_bounds.right_node;
        this.bottom_node = ver_bounds.bottom_node;
        this.left_node = hor_bounds.left_node;
    }
    // access
    inBounds(coords) {
        return this.left <= coords.x && coords.x <= this.right && this.top <= coords.y && coords.y <= this.bottom;
    }
    get width() {
        return this.right - this.left;
    }
    get height() {
        return this.bottom - this.top;
    }
    get dim() {
        return new Vec2(this.width, this.height);
    }
    get center() {
        return new Vec2(Math.floor((this.left + this.right) / 2), Math.floor((this.top + this.bottom) / 2));
    }
    includes(other) {
        if (this.left <= other.left && other.right <= this.right) {
            return this.top <= other.top && other.bottom <= this.bottom;
        }
        else {
            return false;
        }
    }
}
//# sourceMappingURL=bounds.js.map