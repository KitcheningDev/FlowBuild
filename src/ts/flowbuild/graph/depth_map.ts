import { Node } from "./node.js";

const depth_map = new Map<Node, number>();
export function depth(node: Node): number {
    return depth_map.get(node);
}
export function calcDepth(start: Node, node: Node): number {
    depth_map.set(node, start.maxDistance(node));
    return depth(node);
}