import { Vec2 } from "../utils/vec2.js";
import { Rect } from "../utils/rect.js";
export function pathset_bounds(paths, origin_map) {
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    let left = Infinity;
    for (const path of paths) {
        const origin = origin_map.get(path);
        const bounds = path.bounds();
        top = Math.min(origin.y, top);
        right = Math.max(origin.x + bounds.size.x / 2, right);
        bottom = Math.max(origin.y + bounds.size.y, bottom);
        left = Math.min(origin.x - bounds.size.x / 2, left);
    }
    return new Rect(new Vec2((left + right) / 2, (top + bottom) / 2), new Vec2(right - left, bottom - top));
}
//# sourceMappingURL=pathset.js.map