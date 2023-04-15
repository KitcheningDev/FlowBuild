export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

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

    copy(): Vec2 {
        return new Vec2(this.x, this.y);
    }
}

export function vec2_equals(v1: Vec2, v2: Vec2): boolean {
    return v1.x == v2.x && v1.y == v2.y;
}
export function vec2_abs(v: Vec2): Vec2 {
    return new Vec2(Math.abs(v.x), Math.abs(v.y));
}
export function vec2_add(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
}
export function vec2_sub(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
}
export function vec2_mult(v: Vec2, t: number): Vec2 {
    return new Vec2(v.x * t, v.y * t);
}
export function vec2_div(v: Vec2, t: number): Vec2 {
    return new Vec2(v.x / t, v.y / t);
}