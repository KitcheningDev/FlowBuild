import { vec2, vec2_t } from "../utils/vec2.js";

export class line_segment_t {
    from: vec2_t;
    to: vec2_t;

    constructor(from: vec2_t, to: vec2_t) {
        this.from = from;
        this.to = to;
    }

    get center(): vec2_t {
        return vec2.div_scal(vec2.add(this.from, this.to), 2);
    }
    get dir(): vec2_t {
        return vec2.sub(this.to, this.from);
    }
}
export function line_intersection(l1: line_segment_t, l2: line_segment_t, include_edges: boolean = false): vec2_t {
    if (vec2.equals(l1.dir, l2.dir)) {
        return null;
    }
    const t = ((l2.from.y - l1.from.y) * l1.dir.x - (l2.from.x - l1.from.x) * l1.dir.y) / (l1.dir.y * l2.dir.x - l1.dir.x * l2.dir.y);
    const s = (l2.from.x + t * l2.dir.x - l1.from.x) / l1.dir.x;
    if ((0 < t && t < 1 && 0 < s && s < 1) || (include_edges && 0 <= t && t <= 1 && 0 <= s && s <= 1)) {
        return vec2.add(l1.from, vec2.mult_scal(l1.dir, s));
    }
    else {
        return null;
    }
}