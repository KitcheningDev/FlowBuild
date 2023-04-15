import { ObjID } from "../../utils/obj_id.js";
import { Loop } from "./loop.js";
import { Node } from "./node.js";
import { get_sync_lines } from "./sync_line.js";
export class Graph extends ObjID {
    constructor(connections) {
        super();
        // create node map
        const node_map = new Map();
        for (const [parent, childs] of connections) {
            if (!node_map.has(parent)) {
                node_map.set(parent, new Node(parent));
            }
            const parent_node = node_map.get(parent);
            for (const child of childs) {
                if (!node_map.has(child)) {
                    node_map.set(child, new Node(child));
                }
                const child_node = node_map.get(child);
                parent_node.childs.add(child_node);
                child_node.parents.add(parent_node);
            }
        }
        // assign nodes, start, end, last_step
        this.nodes = new Set();
        for (const node of node_map.values()) {
            if (node.is_start()) {
                this.start = node;
            }
            if (node.is_end()) {
                this.end = node;
            }
            if (node.is_last_step()) {
                this.last_step = node;
            }
            this.nodes.add(node);
        }
        // debug
        if (connections.size > 0) {
            this.start.task.description = "START";
            this.end.task.description = "END";
        }
        // loops
        this.calc_loops();
        this.thicken_loops();
        // sync_lines
        this.sync_lines = get_sync_lines(this);
        // depth
        this.flatten();
        this.calc_depth();
        this.unflatten();
    }
    is_flat() {
        for (const loop of this.loops) {
            if (!loop.is_flat()) {
                return false;
            }
        }
        return true;
    }
    flatten() {
        for (const loop of this.loops) {
            loop.flatten();
        }
    }
    unflatten() {
        for (const loop of this.loops) {
            loop.unflatten();
        }
    }
    get_depth(node) {
        return this.depth_map.get(node);
    }
    get_node_by_task(task) {
        for (const node of this.nodes) {
            if (node.task == task) {
                return node;
            }
        }
        return null;
    }
    max_depth() {
        return this.depth_map.get(this.end);
    }
    // sync line
    get_sync_line(node, where) {
        for (const sync_line of this.sync_lines) {
            if (sync_line.where == where && sync_line.members.has(node)) {
                return sync_line;
            }
        }
        return null;
    }
    share_sync_line(node1, node2, where) {
        const sync_line = this.get_sync_line(node1, where);
        if (sync_line) {
            return sync_line.members.has(node2);
        }
    }
    get_parents(node) {
        const parents = new Set([...node.parents]);
        for (const parent of node.parents) {
            const sync_line = this.get_sync_line(parent, 'bottom');
            if (sync_line) {
                for (const member of sync_line.members) {
                    parents.delete(member);
                }
                parents.add(sync_line);
            }
        }
        return parents;
    }
    get_childs(node) {
        const childs = new Set([...node.childs]);
        for (const child of node.childs) {
            const sync_line = this.get_sync_line(child, 'top');
            if (sync_line) {
                for (const member of sync_line.members) {
                    childs.delete(member);
                }
                childs.add(sync_line);
            }
        }
        return childs;
    }
    get_node_in_obj(node) {
        for (const sync_line of this.sync_lines) {
            if (sync_line.where == 'top' && sync_line.members.has(node)) {
                return sync_line;
            }
        }
        return node;
    }
    get_node_out_obj(node) {
        for (const sync_line of this.sync_lines) {
            if (sync_line.where == 'bottom' && sync_line.members.has(node)) {
                return sync_line;
            }
        }
        return node;
    }
    get_cooks() {
        const cooks = new Set();
        for (const node of this.nodes) {
            if (!node.task.cook.is_empty()) {
                cooks.add(node.task.cook);
            }
        }
        return cooks;
    }
    // loop properties
    get_loop(node) {
        for (const loop of this.loops) {
            if (loop.nodes.has(node)) {
                return loop;
            }
        }
        return null;
    }
    is_loop_top(node) {
        for (const loop of this.loops) {
            if (loop.loop_top == node) {
                return true;
            }
        }
        return false;
    }
    is_loop_bottom(node) {
        for (const loop of this.loops) {
            if (loop.loop_bottom == node) {
                return true;
            }
        }
        return false;
    }
    is_loop_entry(node) {
        return this.has_loop_property(node, 'loop_entries');
    }
    is_loop_exit(node) {
        return this.has_loop_property(node, 'loop_exits');
    }
    is_backwards_head(node) {
        return this.has_loop_property(node, 'backwards_heads');
    }
    is_backwards_tail(node) {
        return this.has_loop_property(node, 'backwards_tails');
    }
    is_backwards(node) {
        return this.has_loop_property(node, 'backwards');
    }
    has_loop_property(node, property) {
        for (const loop of this.loops) {
            if (loop[property].has(node)) {
                return true;
            }
        }
        return false;
    }
    copy() {
        const node_map = new Map();
        for (const node of this.nodes) {
            node_map.set(node, new Node(node.task));
        }
        const graph = new Graph(new Map());
        graph.start = node_map.get(this.start);
        graph.last_step = node_map.get(this.last_step);
        graph.end = node_map.get(this.end);
        for (const [og_node, copy_node] of node_map) {
            graph.nodes.add(copy_node);
            if (this.depth_map.has(og_node)) {
                graph.depth_map.set(copy_node, this.depth_map.get(og_node));
            }
            for (const parent of og_node.parents) {
                copy_node.parents.add(node_map.get(parent));
            }
            for (const child of og_node.childs) {
                copy_node.childs.add(node_map.get(child));
            }
        }
        for (const loop of this.loops) {
            graph.loops.add(new Loop(graph.start, node_map.get(loop.loop_top)));
        }
        return graph;
    }
    thicken_loops() {
        for (const loop of this.loops) {
            for (const added of loop.thicken()) {
                this.nodes.add(added);
            }
        }
    }
    calc_depth() {
        this.depth_map = new Map();
        for (const node of this.nodes) {
            this.depth_map.set(node, this.start.longest_distance(node));
        }
    }
    calc_loops() {
        this.loops = new Set();
        for (const node of this.nodes) {
            if (node.in_loop() && this.get_loop(node) === null) {
                this.loops.add(new Loop(this.start, node));
            }
        }
    }
}
//# sourceMappingURL=graph.js.map