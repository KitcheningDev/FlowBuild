export class Vec2 {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    // directions
    up(amount: number = 1): Vec2 {
        return new Vec2(this.x, this.y - amount);
    }
    right(amount: number = 1): Vec2 {
        return new Vec2(this.x + amount, this.y);
    }
    down(amount: number = 1): Vec2 {
        return new Vec2(this.x, this.y + amount);
    }
    left(amount: number = 1): Vec2 {
        return new Vec2(this.x - amount, this.y);
    }
    // clone
    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }
    // member
    x: number;
    y: number;
}
// funcs
export function vec2Equals(v1: Vec2, v2: Vec2): boolean {
    return v1.x == v2.x && v1.y == v2.y;
}
export function vec2Abs(v: Vec2): Vec2 {
    return new Vec2(Math.abs(v.x), Math.abs(v.y));
}
export function vec2Add(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
}
export function vec2Sub(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
}
export function vec2Mult(v: Vec2, t: number): Vec2 {
    return new Vec2(v.x * t, v.y * t);
}
export function vec2Div(v: Vec2, t: number): Vec2 {
    return new Vec2(v.x / t, v.y / t);
}