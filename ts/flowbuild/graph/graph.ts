import { ObjID } from "../../utils/obj_id.js";
import { Loop } from "./loop.js";
import { Task } from "../recipe/task.js";
import { Node } from "./node.js";
import { get_sync_lines, SyncLine } from "./sync_line.js";
import { Cook } from "../recipe/cook.js";

export class Graph extends ObjID {
    nodes: Set<Node>;

    start: Node;
    end: Node;
    last_step: Node;
    
    loops: Set<Loop>;
    depth_map: Map<Node, number>;
    sync_lines: Set<SyncLine>;

    constructor(connections: Map<Task, Set<Task>>) {
        super();

        // create node map
        const node_map = new Map<Task, Node>();
        for (const [parent, childs] of connections) {
            if (!node_map.has(parent)) {
                node_map.set(parent, new Node(parent));
            }
            const parent_node = node_map.get(parent) as Node;
            for (const child of childs) {
                if (!node_map.has(child)) {
                    node_map.set(child, new Node(child));
                }
                const child_node = node_map.get(child) as Node;
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
    is_flat(): boolean {
        for (const loop of this.loops) {
            if (!loop.is_flat()) {
                return false;
            }
        }
        return true;
    }
    flatten(): void {
        for (const loop of this.loops) {
            loop.flatten();
        }
    }
    unflatten(): void {
        for (const loop of this.loops) {
            loop.unflatten();
    }
    }
    get_depth(node: Node): number {
        return this.depth_map.get(node);
    }
    get_node_by_task(task: Task): Node | null {
        for (const node of this.nodes) {
            if (node.task == task) {
                return node;
            }
        }
        return null;
    }
    max_depth(): number {
        return this.depth_map.get(this.end);
    }

    // sync line
    get_sync_line(node: Node, where: 'top' | 'bottom'): SyncLine | null {
        for (const sync_line of this.sync_lines) {
            if (sync_line.where == where && sync_line.members.has(node)) {
                return sync_line;
            }
        }
        return null;
    }
    share_sync_line(node1: Node, node2: Node, where: 'top' | 'bottom'): boolean {
        const sync_line = this.get_sync_line(node1, where);
        if (sync_line) {
            return sync_line.members.has(node2);
        }
    }
    get_parents(node: Node): Set<Node | SyncLine> {
        const parents = new Set<Node | SyncLine>([...node.parents]);
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
    get_childs(node: Node): Set<Node | SyncLine> {
        const childs = new Set<Node | SyncLine>([...node.childs]);
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
    get_node_in_obj(node: Node): Node | SyncLine {
        for (const sync_line of this.sync_lines) {
            if (sync_line.where == 'top' && sync_line.members.has(node)) {
                return sync_line;
            }
        }
        return node;
    }
    get_node_out_obj(node: Node): Node | SyncLine {
        for (const sync_line of this.sync_lines) {
            if (sync_line.where == 'bottom' && sync_line.members.has(node)) {
                return sync_line;
            }
        }
        return node;
    }

    get_cooks(): Set<Cook> {
        const cooks = new Set<Cook>();
        for (const node of this.nodes) {
            if (!node.task.cook.is_empty()) {
                cooks.add(node.task.cook);
            }
        }
        return cooks;
    }

    // loop properties
    get_loop(node: Node): Loop | null {
        for (const loop of this.loops) {
            if (loop.nodes.has(node)) {
                return loop;
            }
        }
        return null;
    }
    is_loop_top(node: Node): boolean {
        for (const loop of this.loops) {
            if (loop.loop_top == node) {
                return true;
            }
        }
        return false;
    }
    is_loop_bottom(node: Node): boolean {
        for (const loop of this.loops) {
            if (loop.loop_bottom == node) {
                return true;
            }
        }
        return false;
    }
    is_loop_entry(node: Node): boolean {
        return this.has_loop_property(node, 'loop_entries');
    }
    is_loop_exit(node: Node): boolean {
        return this.has_loop_property(node, 'loop_exits');
    }
    is_backwards_head(node: Node): boolean {
        return this.has_loop_property(node, 'backwards_heads');
    }
    is_backwards_tail(node: Node): boolean {
        return this.has_loop_property(node, 'backwards_tails');
    }
    is_backwards(node: Node): boolean {
        return this.has_loop_property(node, 'backwards');
    }
    private has_loop_property(node: Node, property: string): boolean {
        for (const loop of this.loops) {
            if (loop[property].has(node)) {
                return true;
            }
        }
        return false;
    }

    copy(): Graph {
        const node_map = new Map<Node, Node>();
        for (const node of this.nodes) {
            node_map.set(node, new Node(node.task));
        }

        const graph = new Graph(new Map<Task, Set<Task>>());
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
            graph.loops.add(new Loop(graph.start, node_map.get(loop.loop_top)))
        }
        return graph;
    }

    private thicken_loops(): void {
        for (const loop of this.loops) {
            for (const added of loop.thicken()) {
                this.nodes.add(added);
            }
        }
    }
    private calc_depth(): void {
        this.depth_map = new Map<Node, number>();
        for (const node of this.nodes) {
            this.depth_map.set(node, this.start.longest_distance(node));
        }
    }
    private calc_loops(): void {
        this.loops = new Set<Loop>();
        for (const node of this.nodes) {
            if (node.in_loop() && this.get_loop(node) === null) {
                this.loops.add(new Loop(this.start, node));
            }
        }
    }
}