export class Vec2 {
    x: number;
    y: number;

    constructor(...any: number[]) {
        if (any.length == 0) {
            this.x = 0;
            this.y = 0;
        }
        else if (any.length == 1) {
            this.x = any[0];
            this.y = any[0];
        }
        else {
            this.x = any[0];
            this.y = any[1];
        }
    }

    Add(other: Vec2): Vec2 {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    Sub(other: Vec2): Vec2 {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    Mul(scalar: number): Vec2 {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    Div(scalar: number): Vec2 {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    Copy(): Vec2 {
        return new Vec2(this.x, this.y);
    }
}
export function Add(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
}
export function Sub(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
}
export function Mul(v1: Vec2, scalar: number): Vec2 {
    return new Vec2(v1.x * scalar, v1.y * scalar);
}
export function Div(v1: Vec2, scalar: number): Vec2 {
    return new Vec2(v1.x / scalar, v1.y / scalar);
}
export function Abs(v1: Vec2): Vec2 {
    return new Vec2(Math.abs(v1.x), Math.abs(v1.y));
}
export function Equals(v1: Vec2, v2: Vec2): boolean {
    return v1.x == v2.x && v1.y == v2.y;
}