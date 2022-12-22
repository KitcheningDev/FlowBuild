import { vec2 } from "../utils/vec2.js";
export class line_t {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get center() {
        return vec2.div_scal(vec2.add(this.from, this.to), 2);
    }
    get dir() {
        return vec2.sub(this.to, this.from);
    }
}
export function line_intersect(l1, l2, include_edges = false) {
    if (vec2.equals(l1.dir, l2.dir)) {
        return null;
    }
    const t = ((l2.from.y - l1.from.y) * l1.dir.x - (l2.from.x - l1.from.x) * l1.dir.y) / (l1.dir.y * l2.dir.x - l1.dir.x * l2.dir.y);
    const s = (l2.from.x + t * l2.dir.x - l1.from.x) / l1.dir.x;
    if ((0 < t && t < 1 && 0 < s && s < 1) || (include_edges && 0 < t && t <= 1 && 0 < s && s <= 1)) {
        return vec2.add(l1.from, vec2.mult_scal(l1.dir, s));
    }
    else {
        return null;
    }
}
//# sourceMappingURL=line.js.map