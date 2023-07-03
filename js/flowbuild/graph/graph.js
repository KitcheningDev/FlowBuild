import { ObjID } from "../../utils/obj_id.js";
import { Loop } from "./loop.js";
import { Node } from "./node.js";
import { calcDepth, depth } from "./depth_map.js";
export class Graph extends ObjID {
    constructor(connections) {
        super();
        // create node map
        // console.log(connections);
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
    get start() {
        for (const node of this.nodes) {
            if (node.isStart()) {
                return node;
            }
        }
        return null;
    }
    get end() {
        for (const node of this.nodes) {
            if (node.isEnd()) {
                return node;
            }
        }
        return null;
    }
    byTask(task) {
        for (const node of this.nodes) {
            if (node.task == task) {
                return node;
            }
        }
        return null;
    }
    get cookCount() {
        const cooks = new Set();
        for (const node of this.nodes) {
            if (node.task.cook) {
                cooks.add(node.task.cook);
            }
        }
        return cooks.size;
    }
    // loop
    isFlat() {
        for (const loop of this.loops) {
            if (!loop.isFlat()) {
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
    // depth
    get maxDepth() {
        return depth(this.end);
    }
    // loop properties
    getLoop(node) {
        for (const loop of this.loops) {
            if (loop.nodes.has(node)) {
                return loop;
            }
        }
        return null;
    }
    isLoopTop(node) {
        for (const loop of this.loops) {
            if (loop.loop_top == node) {
                return true;
            }
        }
        return false;
    }
    isLoopBottom(node) {
        for (const loop of this.loops) {
            if (loop.loop_bottom == node) {
                return true;
            }
        }
        return false;
    }
    isLoopEntry(node) {
        return this.hasLoopProperty(node, 'loop_entries');
    }
    isLoopExit(node) {
        return this.hasLoopProperty(node, 'loop_exits');
    }
    isBackwardsHead(node) {
        return this.hasLoopProperty(node, 'backwards_heads');
    }
    isBackwardsTail(node) {
        return this.hasLoopProperty(node, 'backwards_tails');
    }
    isBackwards(node) {
        return this.hasLoopProperty(node, 'backwards');
    }
    hasLoopProperty(node, property) {
        for (const loop of this.loops) {
            if (loop[property].has(node)) {
                return true;
            }
        }
        return false;
    }
    // private
    dummyfy() {
        for (const loop of this.loops) {
            for (const added of loop.dummyfy()) {
                this.nodes.add(added);
            }
        }
    }
    calcLoops() {
        this.loops = new Set();
        for (const node of this.nodes) {
            if (node.inLoop() && this.getLoop(node) === null) {
                this.loops.add(new Loop(this.start, node));
            }
        }
    }
}
//# sourceMappingURL=graph.js.map