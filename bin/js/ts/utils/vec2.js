export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // directions
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
    // clone
    clone() {
        return new Vec2(this.x, this.y);
    }
}
// funcs
export function vec2Equals(v1, v2) {
    return v1.x == v2.x && v1.y == v2.y;
}
export function vec2Abs(v) {
    return new Vec2(Math.abs(v.x), Math.abs(v.y));
}
export function vec2Add(v1, v2) {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
}
export function vec2Sub(v1, v2) {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
}
export function vec2Mult(v, t) {
    return new Vec2(v.x * t, v.y * t);
}
export function vec2Div(v, t) {
    return new Vec2(v.x / t, v.y / t);
}
//# sourceMappingURL=vec2.js.map