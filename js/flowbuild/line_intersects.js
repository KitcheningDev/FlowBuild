import { vec2 } from "../utils/vec2.js";
export function line_intersection(l1, l2) {
    const t = ((l2.origin.y - l1.origin.y) * l1.dir.x - (l2.origin.x - l1.origin.x) * l1.dir.y) / (l1.dir.y * l2.dir.x - l1.dir.x * l2.dir.y);
    const s = (l2.origin.x + t * l2.dir.x - l1.origin.x) / l1.dir.x;
    if (0 < t && t < 1 && 0 < s && s < 1) {
        console.log(vec2.add(l1.origin, vec2.mult_scal(l1.dir, s)));
        return vec2.add(l1.origin, vec2.mult_scal(l1.dir, s));
    }
    else {
        return null;
    }
}
//# sourceMappingURL=line_intersects.js.map