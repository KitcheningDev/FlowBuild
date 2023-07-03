import { ObjID } from "../../utils/obj_id.js";
import { Loop } from "./loop.js";
import { Cook, Task } from "../recipe/task.js";
import { Node } from "./node.js";
import { calcDepth, depth } from "./depth_map.js";
import { log_graph } from "../log.js";

export class Graph extends ObjID {
    constructor(connections: Map<Task, Set<Task>>) {
        super();
        // create node map
        // console.log(connections);
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
        // assign nodes
        this.nodes = new Set();
        for (const node of node_map.values()) {
            this.nodes.add(node);
        }
        // debug
        if (connections.size > 0) {
            // this.start.task.description = "START";
            // this.end.task.description = "END";
        }
        // log_graph(this);
        // loops
        this.calcLoops();
        this.dummyfy();
        // console.log(...this.loops);
        // depth
        this.flatten();
        for (const node of this.nodes) {
            calcDepth(this.start, node);
        }
        this.unflatten();
        // console.log(...this.loops);
    }

    // access
    get start(): Node | null {
        for (const node of this.nodes) {
            if (node.isStart()) {
                return node;
            }
        }
        return null;
    }
    get end(): Node | null {
        for (const node of this.nodes) {
            if (node.isEnd()) {
                return node;
            }
        }
        return null;
    }
    byTask(task: Task): Node | null {
        for (const node of this.nodes) {
            if (node.task == task) {
                return node;
            }
        }
        return null;
    }
    get cookCount(): number {
        const cooks = new Set<Cook>();
        for (const node of this.nodes) {
            if (node.task.cook) {
                cooks.add(node.task.cook);
            }
        }
        return cooks.size;
    }
    // loop
    isFlat(): boolean {
        for (const loop of this.loops) {
            if (!loop.isFlat()) {
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
    // depth
    get maxDepth(): number {
        return depth(this.end);
    }

    // loop properties
    getLoop(node: Node): Loop | null {
        for (const loop of this.loops) {
            if (loop.nodes.has(node)) {
                return loop;
            }
        }
        return null;
    }
    isLoopTop(node: Node): boolean {
        for (const loop of this.loops) {
            if (loop.loop_top == node) {
                return true;
            }
        }
        return false;
    }
    isLoopBottom(node: Node): boolean {
        for (const loop of this.loops) {
            if (loop.loop_bottom == node) {
                return true;
            }
        }
        return false;
    }
    isLoopEntry(node: Node): boolean {
        return this.hasLoopProperty(node, 'loop_entries');
    }
    isLoopExit(node: Node): boolean {
        return this.hasLoopProperty(node, 'loop_exits');
    }
    isBackwardsHead(node: Node): boolean {
        return this.hasLoopProperty(node, 'backwards_heads');
    }
    isBackwardsTail(node: Node): boolean {
        return this.hasLoopProperty(node, 'backwards_tails');
    }
    isBackwards(node: Node): boolean {
        return this.hasLoopProperty(node, 'backwards');
    }
    private hasLoopProperty(node: Node, property: string): boolean {
        for (const loop of this.loops) {
            if (loop[property].has(node)) {
                return true;
            }
        }
        return false;
    }

    // private
    private dummyfy(): void {
        for (const loop of this.loops) {
            for (const added of loop.dummyfy()) {
                this.nodes.add(added);
            }
        }
    }
    private calcLoops(): void {
        this.loops = new Set<Loop>();
        for (const node of this.nodes) {
            if (node.inLoop() && this.getLoop(node) === null) {
                this.loops.add(new Loop(this.start, node));
            }
        }
    }

    // member
    nodes: Set<Node>;
    loops: Set<Loop>;
}