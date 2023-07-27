import { Vec2 } from "../../utils/vec2.js";
import { Node } from "../graph/node.js";

export class HorBounds {
    constructor(left: number, right: number, left_node: Node = null, right_node: Node = null) {
        this.left = left;
        this.right = right;
        this.left_node = left_node;
        this.right_node = right_node;
    }
    // access
    inBounds(x: number): boolean {
        return this.left <= x && x <= this.right;
    }
    get length(): number {
        return this.right - this.left;
    }
    get center(): number {
        return Math.floor((this.left + this.right) / 2);
    }
    // member
    left: number;
    right: number;
    left_node: Node;
    right_node: Node;
}
export class VerBounds {
    constructor(top: number, bottom: number, top_node: Node = null, bottom_node: Node = null) {
        this.top = top;
        this.bottom = bottom;
        this.top_node = top_node;
        this.bottom_node = bottom_node;
    }
    // access
    inBounds(y: number): boolean {
        return this.top <= y && y <= this.bottom;
    }
    get length(): number {
        return this.bottom - this.top;
    }
    get center(): number {
        return Math.floor((this.top + this.bottom) / 2);
    }
    // member
    top: number;
    bottom: number;
    top_node: Node;
    bottom_node: Node;
}
export class Bounds {
    constructor(hor_bounds: HorBounds, ver_bounds: VerBounds) {
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
    inBounds(coords: Vec2): boolean {
        return this.left <= coords.x && coords.x <= this.right && this.top <= coords.y && coords.y <= this.bottom;
    }
    get width(): number {
        return this.right - this.left;
    }
    get height(): number {
        return this.bottom - this.top;
    }
    get dim(): Vec2 {
        return new Vec2(this.width, this.height);
    }
    get center(): Vec2 {
        return new Vec2(Math.floor((this.left + this.right) / 2), Math.floor((this.top + this.bottom) / 2));
    }
    includes(other: Bounds): boolean {
        if (this.left <= other.left && other.right <= this.right) {
            return this.top <= other.top && other.bottom <= this.bottom;
        }
        else {
            return false;
        }
    }
    // member
    top: number;
    right: number;
    bottom: number;
    left: number;
    top_node: Node;
    right_node: Node;
    bottom_node: Node;
    left_node: Node;
}