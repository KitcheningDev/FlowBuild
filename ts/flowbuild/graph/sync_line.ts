import { set_equal, set_element } from "../../utils/set.js";
import { Graph } from "./graph.js";
import { Node } from "./node.js";

export class SyncLine {
    members: Set<Node>;
    shared: Set<Node>;
    where: 'top' | 'bottom';

    constructor(members: Set<Node>, shared: Set<Node>, where: 'top' | 'bottom') {
        this.members = members;
        this.shared = shared;
        this.where = where;
    }
}
export function get_sync_lines(graph: Graph): Set<SyncLine> {
    const sync_lines = new Set<SyncLine>();

    const nodes_top = new Set<Node>();
    const nodes_bottom = new Set<Node>();
    for (const node of graph.nodes) {
        if (!nodes_top.has(node) && !node.is_start() && !(node.parents.size == 1 && set_element(node.parents).is_start())) {
            const members = new Set<Node>();
            for (const sibling of set_element(node.parents).childs) {
                if (share_sync_line(node, sibling, 'top', graph)) {
                    members.add(sibling);
                }
            }
            if (members.size > 1) {
                sync_lines.add(new SyncLine(members, node.parents, 'top'));
                for (const member of members) {
                    nodes_top.add(member);
                }
            }
        }
        if (!nodes_bottom.has(node) && !node.is_end() && !(node.childs.size == 1 && set_element(node.childs).is_last_step())) {
            const members = new Set<Node>();
            for (const sibling of set_element(node.childs).parents) {
                if (share_sync_line(node, sibling, 'bottom', graph)) {
                    members.add(sibling);
                }
            }
            if (members.size > 1) {
                sync_lines.add(new SyncLine(members, node.childs, 'bottom'));
                for (const member of members) {
                    nodes_bottom.add(member);
                }
            }
        }
    }
    return sync_lines;
}
export function share_sync_line(node1: Node, node2: Node, where: 'top' | 'bottom', graph: Graph): boolean {
    if (where == 'top') {
        return node1.task.cook.name == node2.task.cook.name 
            && graph.is_backwards(node1) == graph.is_backwards(node2)
            && set_equal(node1.parents, node2.parents);
    }
    else {
        return node1.task.cook.name == node2.task.cook.name
            && graph.is_backwards(node1) == graph.is_backwards(node2)
            && set_equal(node1.childs, node2.childs);
    }
}