import { ObjID } from "../utils/obj_id.js";
import { set_element } from "../utils/set.js";
import { Loop } from "./create_grid/loop.js";
export class Node extends ObjID {
    constructor(task, parents = new Set(), childs = new Set()) {
        super();
        this.task = task;
        this.parents = parents;
        this.childs = childs;
    }
    is_start() {
        return this.parents.size == 0;
    }
    is_end() {
        return this.childs.size == 0;
    }
    is_last_step() {
        return this.childs.size == 1 && set_element(this.childs).is_end();
    }
    // graph traversal
    can_reach(to, visited = new Set()) {
        if (visited.has(this)) {
            return false;
        }
        visited.add(this);
        for (const child of this.childs) {
            if (child == to || child.can_reach(to, visited))
                return true;
        }
        return false;
    }
    in_loop() {
        return this.can_reach(this);
    }
    find_shortest_path(to) {
        let paths = new Set([[this]]);
        while (true) {
            const new_paths = new Set();
            for (const path of paths) {
                const back = path[path.length - 1];
                if (back == to) {
                    return path;
                }
                for (const child of back.childs) {
                    new_paths.add([...path, child]);
                }
            }
            paths = new_paths;
        }
    }
    find_longest_path(to) {
        let longest_path = [];
        let paths = new Set([[this]]);
        while (paths.size > 0) {
            const new_paths = new Set();
            for (const path of paths) {
                const back = path[path.length - 1];
                if (back == to) {
                    longest_path = path;
                }
                else {
                    for (const child of back.childs) {
                        if (!path.includes(child)) {
                            new_paths.add([...path, child]);
                        }
                    }
                }
            }
            paths = new_paths;
        }
        return longest_path;
    }
    shortest_distance(to) {
        return this.find_shortest_path(to).length - 1;
    }
    longest_distance(to) {
        return this.find_longest_path(to).length - 1;
    }
}
export class Graph extends ObjID {
    constructor(connections) {
        super();
        this.depth_map = new Map();
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
        // assign start, end, last_step nodes
        this.nodes = new Set();
        for (const node of node_map.values()) {
            if (node.parents.size == 0) {
                this.start = node;
            }
            if (node.childs.size == 0) {
                this.end = node;
            }
            this.nodes.add(node);
        }
        if (this.end !== undefined) {
            this.last_step = set_element(this.end.parents);
        }
        // debug
        if (connections.size > 0) {
            this.start.task.description = "START";
            this.end.task.description = "END";
        }
        // loops
        this.calc_loops();
        this.thicken_loops();
        for (const loop of this.loops) {
            console.log("BW", loop);
        }
        // flattened
        if (this.is_flat()) {
            this.flattened = this;
            this.calc_depth();
        }
        else {
            this.flattened = this.copy();
            this.flattened.flatten();
            this.flattened.calc_depth();
            for (const node of this.nodes) {
                this.depth_map.set(node, this.flattened.get_depth(this.flattened.get_node_by_task(node.task)));
            }
        }
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
    // debug
    log() {
        console.log("GRAPH:");
        for (const node of this.nodes) {
            const childs = [];
            for (const child of node.childs) {
                childs.push(child.task.description);
            }
            const parents = [];
            for (const parent of node.parents) {
                parents.push(parent.task.description);
            }
            console.log('\t', node.task.description);
            console.log('\t\tPARENTS:', ...parents);
            console.log('\t\tCHILDS:', ...childs);
        }
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
            if (node.in_loop()) {
                let in_existing_loop = false;
                for (const loop of this.loops) {
                    if (loop.nodes.has(node)) {
                        in_existing_loop = true;
                        break;
                    }
                }
                if (!in_existing_loop) {
                    this.loops.add(new Loop(this.start, node));
                }
            }
        }
    }
}
//# sourceMappingURL=graph.js.map