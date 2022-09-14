import { RemovePtr } from "../Utils/Funcs.js";
export class Path {
    constructor(head) {
        this.nodes = [head];
        this.parents = [];
        this.childs = [];
        this.adv = {
            depth: 0, depth_diff_min: 0, depth_diff_max: 0, /*
            in_loop: false, is_loop_entry: false, is_loop_exit: false, is_reversed: false,
            reversed_parents: [], reversed_childs: []*/
        };
    }
    Head() {
        if (this.nodes.length)
            return this.nodes[0];
        else
            return null;
    }
    Split(index) {
        if (index == 0)
            return this;
        const path2 = new Path(this.nodes[index]);
        path2.childs = this.childs;
        this.childs = [path2];
        for (const child of path2.childs) {
            child.parents = RemovePtr(child.parents, this);
            child.parents.push(path2);
        }
        path2.parents = [this];
        for (let i = index + 1; i < this.nodes.length; ++i)
            path2.nodes.push(this.nodes[i]);
        for (let i = 0; i < path2.nodes.length; ++i)
            this.nodes.pop();
        /*
        path2.adv.is_loop_exit = this.adv.is_loop_exit;
        this.adv.is_loop_exit = false;
        
        path2.adv.reversed_childs = this.adv.reversed_childs;
        this.adv.reversed_childs = [];

        path2.adv.is_reversed = this.adv.is_reversed;
        path2.adv.in_loop = this.adv.in_loop;
        */
        return path2;
    }
}
export class Graph {
    constructor(conns) {
        // node map
        this.node_map = new Map();
        this.CreateNodeMap(conns);
        // check validity
        this.is_valid = this.IsValid();
        if (!this.is_valid)
            return;
        // path map
        this.path_map = new Map();
        this.RecursiveAdd("START");
        this.start = this.path_map.get("START");
        this.end = this.GetEnd();
        // loop
        //this.SetLoopProperties();
        //this.ReverseLoops();
        // paths
        this.paths = [];
        for (const path of this.path_map.values())
            this.paths.push(path);
        // depth
        this.RecursiveSetDepth();
        this.SetDepthDiff();
        // depth map
        this.depth_map = [];
        for (let i = 0; i <= this.end.adv.depth; ++i)
            this.depth_map.push([]);
        for (const path of this.paths) {
            //if (!path.adv.is_reversed)
            this.depth_map[path.adv.depth].push(path);
        }
        this.depth = this.end.adv.depth;
        // remove reversed paths from path_map and paths
        /*
        let found = true;
        while (found) {
            found = false;
            for (const path of this.paths) {
                if (path.adv.is_reversed) {
                    this.path_map.delete(path.Head());
                    this.paths = RemovePtr(this.paths, path);
                    found = true;
                    break;
                }
            }
        }
        */
    }
    CreateNodeMap(conns) {
        for (const conn of conns) {
            if (!this.node_map.has(conn.from))
                this.node_map.set(conn.from, { text: conn.from, parents: [], childs: [] });
            if (!this.node_map.has(conn.to))
                this.node_map.set(conn.to, { text: conn.to, parents: [], childs: [] });
            if (!this.node_map.get(conn.to).parents.includes(conn.from))
                this.node_map.get(conn.to).parents.push(conn.from);
            if (!this.node_map.get(conn.from).childs.includes(conn.to))
                this.node_map.get(conn.from).childs.push(conn.to);
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
        if (head != "START") {
            let child_node = null;
            while (curr_node.childs.length == 1 && curr_node.childs[0] != "END") {
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
        /*
        if (path.adv.is_reversed && path.parents[0].adv.is_loop_entry) {
            this.RecursiveSetDepth(path.parents[0], visited);
            path.adv.depth = path.parents[0].adv.depth;
            return;
        }
        */
        for (const parent of path.parents)
            this.RecursiveSetDepth(parent, visited);
        for (const parent of path.parents)
            path.adv.depth = Math.max(path.adv.depth, parent.adv.depth + 1);
    }
    SetDepthDiff() {
        for (const path of this.path_map.values()) {
            if (path.childs.length == 0)
                continue;
            path.adv.depth_diff_min = path.childs[0].adv.depth - path.adv.depth;
            path.adv.depth_diff_max = path.childs[0].adv.depth - path.adv.depth;
            for (const child of path.childs) {
                path.adv.depth_diff_min = Math.min(path.adv.depth_diff_min, child.adv.depth - path.adv.depth);
                path.adv.depth_diff_max = Math.max(path.adv.depth_diff_max, child.adv.depth - path.adv.depth);
            }
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
}
//# sourceMappingURL=Graph.js.map