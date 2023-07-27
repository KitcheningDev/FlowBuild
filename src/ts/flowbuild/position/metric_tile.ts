import { Vec2, vec2Add } from "../../utils/vec2.js";
import { ITile } from "../grid/grid.js";

export class MetricTile implements ITile {
    constructor(pos: Vec2 = new Vec2(0, 0), dim: Vec2 = new Vec2(0, 0), margin: Vec2 = new Vec2(0, 0)) {
        this.pos = pos;
        this.dim = dim;
        this.margin = margin;
    }
    // access
    isEmpty(): boolean {
        return this.dim.x == 0 && this.dim.y == 0;
    }
    clone(): any {
        return new MetricTile(this.pos.clone(), this.dim.clone(), this.margin.clone());
    }
    get withMargin(): Vec2 {
        return vec2Add(this.dim, this.margin);
    }
    // directions
    get top(): number {
        return this.pos.y - this.withMargin.y / 2;
    }
    get right(): number {
        return this.pos.x + this.withMargin.x / 2;
    }
    get bottom(): number {
        return this.pos.y + this.withMargin.y / 2;
    }
    get left(): number {
        return this.pos.x - this.withMargin.x / 2;
    }
    get width(): number {
        return this.withMargin.x;
    }
    get height(): number {
        return this.withMargin.y;
    }

    // member
    pos: Vec2;
    dim: Vec2;
    margin: Vec2;
};
