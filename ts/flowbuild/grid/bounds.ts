import { Vec2 } from "../../utils/vec2.js";
import { Node } from "../graph/node.js";

export class HorBounds {
    left: number;
    right: number;
    left_node: Node;
    right_node: Node;

    constructor(left: number, right: number = left, left_node: Node = null, right_node: Node = null) {
        this.left = left;
        this.right = right;
        this.left_node = left_node;
        this.right_node = right_node;
    }

    length(): number {
        return this.right - this.left;
    }
    center(): number {
        return Math.floor((this.left + this.right) / 2);
    }
}
export class VerBounds {
    top: number;
    bottom: number;
    top_node: Node;
    bottom_node: Node;

    constructor(top: number, bottom: number = top, top_node: Node = null, bottom_node: Node = null) {
        this.top = top;
        this.bottom = bottom;
        this.top_node = top_node;
        this.bottom_node = bottom_node;
    }

    length(): number {
        return this.bottom - this.top;
    }
    center(): number {
        return Math.floor((this.top + this.bottom) / 2);
    }
}
export class Bounds {
    top: number;
    right: number;
    bottom: number;
    left: number;
    top_node: Node;
    right_node: Node;
    bottom_node: Node;
    left_node: Node;

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

    width(): number {
        return this.right - this.left;
    }
    height(): number {
        return this.bottom - this.top;
    }
    center(): Vec2 {
        return new Vec2(Math.floor((this.left + this.right) / 2), Math.floor((this.top + this.bottom) / 2));
    }
}