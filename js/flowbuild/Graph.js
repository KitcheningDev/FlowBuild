class GraphNode {
    constructor(text) {
        this.text = text;
        this.parents = [];
        this.childs = [];
    }
}
class AdvancedPath {
    constructor() {
        this.depth = 0;
        this.depth_diff = 0;
        this.is_reversed = false;
        this.in_loop = false;
        this.is_loop_entry = false;
        this.is_loop_exit = false;
        this.reversed_parents = [];
        this.reversed_childs = [];
        this.boxes_to_end = 0;
    }
}
export class Path {
    constructor(head) {
        this.nodes = [head];
        this.parents = [];
        this.childs = [];
        this.advanced = new AdvancedPath();
    }
    Head() {
        if (this.nodes.length)
            return this.nodes[0];
        else
            return null;
    }
}
export class Graph {
    constructor(connections) {
        // node map
        this.node_map = new Map();
        this.CreateNodeMap(connections);
        // check validity
        this.is_valid = this.IsValid();
        if (!this.is_valid)
            return;
        // path map
        this.path_map = new Map();
        this.RecursiveAdd("START");
        this.start = this.path_map.get("START");
        this.end = this.GetEnd();
        // advanced
        //this.SetLoopProperties();
        //this.ReverseLoops();
        //this.RecursiveSetBoxesToEnd(this.start);
        //this.SortChilds();
        this.RecursiveSetDepth();
        this.SetDepthDiff();
        this.depth_map = [];
        for (let i = 0; i <= this.end.advanced.depth; ++i)
            this.depth_map.push([]);
        for (const path of this.path_map.values())
            this.depth_map[path.advanced.depth].push(path);
        /*
        for (const depth of this.depth_map) {
            const text_arr = []
            for (const path of depth)
                text_arr.push([path.Head(), path.advanced.depth_diff]);
            //console.log("Depth: ", depth[0].advanced.depth, ...text_arr);
        }
        for (let [head, path] of path_map.entries()) {
            console.log("Head", head);
            console.log("Nodes", path.nodes);
            console.table(path.parents);
            console.table(path.childs);
            console.log("Reversed", path.is_reversed);
            console.table(path.reversed_in);
            console.table(path.reversed_out);
            console.log();
        }
        */
        this.depth = this.end.advanced.depth;
    }
    CreateNodeMap(connections) {
        for (const path of connections) {
            let prev = "";
            for (const text of path) {
                if (!this.node_map.has(text))
                    this.node_map.set(text, new GraphNode(text));
                if (prev) {
                    if (!this.node_map.get(text).parents.includes(prev))
                        this.node_map.get(text).parents.push(prev);
                    if (!this.node_map.get(prev).childs.includes(text))
                        this.node_map.get(prev).childs.push(text);
                }
                prev = text;
            }
        }
    }
    IsValid() {
        if (!this.node_map.has("START") || !this.node_map.has("END"))
            return false;
        if (this.node_map.get("START").parents.length > 0 || this.node_map.get("END").childs.length > 0)
            return false;
        for (const node of this.node_map.values()) {
            if (node.childs.includes("END") && node.childs.length > 1)
                return false;
            else if (node.parents.includes("START") && node.parents.length > 1)
                return false;
            else if (node.parents.length == 0 && node.text != "START")
                return false;
            else if (node.childs.length == 0 && node.text != "END")
                return false;
        }
        // To Do: currently no loops in reversed paths allowed
        return true;
    }
    RecursiveAdd(head) {
        if (this.path_map.has(head))
            return this.path_map.get(head);
        const path = new Path(head);
        this.path_map.set(head, path);
        let curr_node = this.node_map.get(head);
        // To Do: Remove "START" guard
        if (head != "START") {
            let child_node = null;
            while (curr_node.childs.length == 1) {
                child_node = this.node_map.get(curr_node.childs[0]);
                if (child_node.parents.length > 1)
                    break;
                path.nodes.push(child_node.text);
                curr_node = child_node;
            }
        }
        for (const child of curr_node.childs) {
            const child_path = this.RecursiveAdd(child);
            path.childs.push(child_path);
            child_path.parents.push(path);
        }
        return path;
    }
    GetEnd() {
        for (const path of this.path_map.values()) {
            if (path.childs.length == 0)
                return path;
        }
    }
    RecursiveSetDepth(path = this.end, visited = new Set()) {
        if (visited.has(path))
            return;
        visited.add(path);
        for (const parent of path.parents)
            this.RecursiveSetDepth(parent, visited);
        for (const parent of path.parents)
            path.advanced.depth = Math.max(path.advanced.depth, parent.advanced.depth + 1);
    }
    SetDepthDiff() {
        for (const path of this.path_map.values()) {
            if (path.childs.length == 0)
                continue;
            path.advanced.depth_diff = path.childs[0].advanced.depth - path.advanced.depth;
            for (const child of path.childs)
                path.advanced.depth_diff = Math.min(path.advanced.depth_diff, child.advanced.depth - path.advanced.depth);
        }
    }
    HasPath(from, to, visited = new Set()) {
        if (visited.has(from))
            return false;
        visited.add(from);
        for (const child of from.childs) {
            if (child == to || this.HasPath(child, to, visited))
                return true;
        }
        return false;
    }
    SetLoopProperties() {
        for (const path of this.path_map.values())
            path.advanced.in_loop = this.HasPath(path, path);
        for (const path of this.path_map.values()) {
            if (!path.advanced.in_loop)
                continue;
            const reversed_parents = [];
            for (const parent of path.parents) {
                if (!parent.advanced.in_loop || !this.HasPath(path, parent))
                    path.advanced.is_loop_entry = true;
                else
                    reversed_parents.push(parent);
            }
            if (path.advanced.is_loop_entry) {
                path.advanced.reversed_parents = reversed_parents;
                path.parents = path.parents.filter((to_check) => { return !reversed_parents.includes(to_check); });
                for (const reversed_parent of reversed_parents)
                    reversed_parent.advanced.is_reversed = true;
            }
            const reversed_childs = [];
            for (const child of path.childs) {
                if (!child.advanced.in_loop || !this.HasPath(child, path))
                    path.advanced.is_loop_exit = true;
                else
                    reversed_childs.push(child);
            }
            if (path.advanced.is_loop_exit) {
                path.advanced.reversed_childs = reversed_childs;
                path.childs = path.childs.filter((to_check) => { return !reversed_childs.includes(to_check); });
                for (const reversed_child of reversed_childs)
                    reversed_child.advanced.is_reversed = true;
            }
        }
    }
    ReverseLoops() {
        for (const path of this.path_map.values()) {
            if (!path.advanced.is_reversed)
                continue;
            path.nodes.reverse();
            const temp = path.parents;
            path.parents = path.childs;
            path.childs = temp;
            const reversed_temp = path.advanced.reversed_parents;
            path.advanced.reversed_parents = path.advanced.reversed_childs;
            path.advanced.reversed_childs = reversed_temp;
        }
    }
    RecursiveSetBoxesToEnd(path, visited = new Set()) {
        if (visited.has(path))
            return;
        visited.add(path);
        if (path == this.end) {
            path.advanced.boxes_to_end = path.nodes.length;
            return;
        }
        for (let child of path.childs)
            this.RecursiveSetBoxesToEnd(child, visited);
        path.advanced.boxes_to_end = path.childs[0].advanced.boxes_to_end;
        for (let child of path.childs) {
            if (child.advanced.boxes_to_end < path.advanced.boxes_to_end)
                path.advanced.boxes_to_end = child.advanced.boxes_to_end;
        }
        path.advanced.boxes_to_end += path.nodes.length;
    }
    SortChilds() {
        for (let path of this.path_map.values()) {
            path.childs.sort((a, b) => {
                if (a.childs.length < b.childs.length)
                    return 1;
                else if (a.childs.length > b.childs.length)
                    return -1;
                else if (a.advanced.boxes_to_end <= b.advanced.boxes_to_end)
                    return 1;
                else
                    return -1;
            });
        }
    }
}
//# sourceMappingURL=Graph.js.map