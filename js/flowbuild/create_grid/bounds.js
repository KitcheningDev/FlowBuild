import { Vec2 } from "../../utils/vec2.js";
class HorBounds {
    constructor(left, right, left_node = null, right_node = null) {
        this.left = left;
        this.right = right;
        this.left_node = left_node;
        this.right_node = right_node;
    }
    center() {
        return (this.left + this.right) / 2;
    }
}
class VerBounds {
    constructor(top, bottom, top_node = null, bottom_node = null) {
        this.top = top;
        this.bottom = bottom;
        this.top_node = top_node;
        this.bottom_node = bottom_node;
    }
    center() {
        return (this.top + this.bottom) / 2;
    }
}
class Bounds {
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
    center() {
        return new Vec2((this.left + this.right) / 2, (this.top + this.bottom) / 2);
    }
}
export function get_hor_bounds(cond, grid) {
    const bounds = new HorBounds(Infinity, -Infinity);
    for (const [node, coords] of grid.get_node_map()) {
        if (cond(node)) {
            if (coords.x < bounds.left) {
                bounds.left = coords.x;
                bounds.left_node = node;
            }
            if (bounds.right < coords.x) {
                bounds.right = coords.x;
                bounds.right_node = node;
            }
        }
    }
    return bounds;
}
export function get_ver_bounds(cond, grid) {
    const bounds = new VerBounds(Infinity, -Infinity);
    for (const [node, coords] of grid.get_node_map()) {
        if (cond(node)) {
            if (coords.y < bounds.top) {
                bounds.top = coords.y;
                bounds.top_node = node;
            }
            if (bounds.bottom < coords.y) {
                bounds.bottom = coords.y;
                bounds.bottom_node = node;
            }
        }
    }
    return bounds;
}
export function get_bounds(cond, grid) {
    return new Bounds(this.get_hor_bounds(cond, grid), this.get_ver_bounds(cond, grid));
}
//# sourceMappingURL=bounds.js.map