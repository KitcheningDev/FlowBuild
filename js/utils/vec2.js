export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    up(amount = 1) {
        return new Vec2(this.x, this.y - amount);
    }
    right(amount = 1) {
        return new Vec2(this.x + amount, this.y);
    }
    down(amount = 1) {
        return new Vec2(this.x, this.y + amount);
    }
    left(amount = 1) {
        return new Vec2(this.x - amount, this.y);
    }
    copy() {
        return new Vec2(this.x, this.y);
    }
}
export function vec2_equals(v1, v2) {
    return v1.x == v2.x && v1.y == v2.y;
}
export function vec2_abs(v) {
    return new Vec2(Math.abs(v.x), Math.abs(v.y));
}
export function vec2_add(v1, v2) {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
}
export function vec2_sub(v1, v2) {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
}
export function vec2_mult(v, t) {
    return new Vec2(v.x * t, v.y * t);
}
export function vec2_div(v, t) {
    return new Vec2(v.x / t, v.y / t);
}
//# sourceMappingURL=vec2.js.map