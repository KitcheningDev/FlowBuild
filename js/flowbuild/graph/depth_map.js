const depth_map = new Map();
export function depth(node) {
    return depth_map.get(node);
}
export function calcDepth(start, node) {
    depth_map.set(node, start.maxDistance(node));
    return depth(node);
}
//# sourceMappingURL=depth_map.js.map