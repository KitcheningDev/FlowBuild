import { vec2_sub, vec2_length, vec2_linear_factor, vec2_add, vec2_equals } from "./vec2.js";
export class Line {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get length() {
        return vec2_length(this.dir);
    }
    get dir() {
        return vec2_sub(this.to, this.from);
    }
    is_point() {
        return this.dir.x == 0 && this.dir.y == 0;
    }
}
export function point_intersects(line, point, include_edges = true) {
    if (vec2_equals(line.from, point)) {
        return include_edges;
    }
    const a = vec2_linear_factor(vec2_sub(point, line.from), line.dir);
    if (!Number.isNaN(a)) {
        if (include_edges) {
            return 0 <= a && a <= 1;
        }
        else {
            return 0 < a && a < 1;
        }
    }
    else {
        return false;
    }
}
export function line_intersects(l1, l2, include_edges = true) {
    if (l1.is_point() && l2.is_point()) {
        return vec2_equals(l1.from, l2.from);
    }
    else if (l1.is_point()) {
        return point_intersects(l2, l1.from);
    }
    else if (l2.is_point()) {
        return point_intersects(l1, l2.from);
    }
    const a = vec2_linear_factor(l2.dir, l1.dir);
    if (!Number.isNaN(a)) {
        const b = vec2_linear_factor(vec2_add(l1.from, l2.from), l1.dir);
        if (!Number.isNaN(b)) {
            if (include_edges) {
                return Math.min(0, a) <= b && b <= Math.max(a + 1, 1);
            }
            else {
                return Math.min(0, a) < b && b < Math.max(a + 1, 1);
            }
        }
        else {
            return false;
        }
    }
    else {
        const t = ((l2.from.y - l1.from.y) * l1.dir.x - (l2.from.x - l1.from.x) * l1.dir.y) / (l1.dir.y * l2.dir.x - l1.dir.x * l2.dir.y);
        const s = (l2.from.x + t * l2.dir.x - l1.from.x) / l1.dir.x;
        if (include_edges) {
            return 0 <= t && t <= 1 && 0 <= s && s <= 1;
        }
        else {
            return 0 < t && t < 1 && 0 < s && s < 1;
        }
    }
}
//# sourceMappingURL=line.js.map