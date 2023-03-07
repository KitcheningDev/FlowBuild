import { vec2_t } from "../utils/vec2.js";
import { rect_t } from "../utils/rect.js";
export function pathset_bounds(paths, origin_map) {
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    let left = Infinity;
    for (const path of paths) {
        const origin = origin_map.get(path);
        top = Math.min(origin.y, top);
        right = Math.max(origin.x + path.bounds.size.x / 2, right);
        bottom = Math.max(origin.y + path.bounds.size.y, bottom);
        left = Math.min(origin.x - path.bounds.size.x / 2, left);
    }
    return new rect_t(new vec2_t((left + right) / 2, (top + bottom) / 2), new vec2_t(right - left, bottom - top));
}
//# sourceMappingURL=pathset.js.map