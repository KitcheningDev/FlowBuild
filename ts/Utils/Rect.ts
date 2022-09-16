import { Vec2 } from "./Vec2.js";

export class Rect {
    origin: Vec2;
    size: Vec2;

    constructor(origin: Vec2 = new Vec2(), size: Vec2 = new Vec2()) {
        this.origin = origin;
        this.size = size;
    }

    Top(): Vec2 {
        return new Vec2(this.origin.x, this.origin.y - this.size.y / 2);
    }
    Right(): Vec2 {
        return new Vec2(this.origin.x + this.size.x / 2, this.origin.y);
    }
    Bottom(): Vec2 {
        return new Vec2(this.origin.x, this.origin.y + this.size.y / 2);
    }
    Left(): Vec2 {
        return new Vec2(this.origin.x - this.size.x / 2, this.origin.y);
    }

    TopLeft(): Vec2 {
        return new Vec2(this.origin.x - this.size.x / 2, this.origin.y - this.size.y / 2);
    }
    TopRight(): Vec2 {
        return new Vec2(this.origin.x + this.size.x / 2, this.origin.y - this.size.y / 2);
    }
    BottomRight(): Vec2 {
        return new Vec2(this.origin.x + this.size.x / 2, this.origin.y + this.size.y / 2);
    }
    BottomLeft(): Vec2 {
        return new Vec2(this.origin.x - this.size.x / 2, this.origin.y + this.size.y / 2);
    }
}