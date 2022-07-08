class GraphNode {
    constructor(text) {
        this.text = text;
        this.parents = new Array();
        this.childs = new Array();
    }
}
export class Path {
    constructor(head) {
        this.nodes = new Array(head);
        this.parents = new Array();
        this.childs = new Array();
        this.reversed_in = new Array();
        this.reversed_out = new Array();
        this.is_reversed = false;
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
        this.is_valid = true;
        const node_map = new Map();
        for (let path of connections) {
            let prev = "";
            for (let text of path) {
                if (!node_map.has(text))
                    node_map.set(text, new GraphNode(text));
                if (prev) {
                    if (!node_map.get(text).parents.includes(prev))
                        node_map.get(text).parents.push(prev);
                    if (!node_map.get(prev).childs.includes(text))
                        node_map.get(prev).childs.push(text);
                }
                prev = text;
            }
        }
        if (!node_map.has("START") || node_map.get("START").parents.length > 0 ||
            !node_map.has("END") || node_map.get("END").childs.length > 0) {
            this.is_valid = false;
            return;
        }
        const path_map = new Map();
        this.RecursiveAdd("START", path_map, node_map);
        this.ReverseLoops(path_map);
        this.start = path_map.get("START");
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
    }
    ReverseLoops(path_map) {
        for (let [head, path] of path_map.entries()) {
            let reversed_out = new Array();
            let has_path_to_end = false;
            for (let child of path.childs) {
                const is_own_child = this.IsOwnChild(child);
                if (!is_own_child)
                    has_path_to_end = true;
                else
                    reversed_out.push(child);
            }
            if (has_path_to_end) {
                for (let rev of reversed_out) {
                    path.childs = path.childs.filter((path) => { return path != rev; });
                    path.reversed_out.push(rev);
                    if (rev == path) {
                        path.parents = path.parents.filter((path) => { return path != rev; });
                        path.reversed_in.push(path);
                    }
                    else
                        this.Reverse(rev, path);
                }
            }
        }
    }
    Reverse(curr_path, end) {
        if (curr_path == end)
            return;
        if (curr_path.childs.length > 0 && curr_path.childs[0] == end) {
            end.parents = end.parents.filter((path) => { return path != curr_path; });
            end.reversed_in.push(curr_path);
        }
        for (let child of curr_path.childs)
            this.Reverse(child, end);
        curr_path.is_reversed = true;
        curr_path.nodes.reverse();
        const cache = [...curr_path.childs];
        curr_path.childs = curr_path.parents;
        curr_path.parents = cache;
    }
    IsOwnChild(to_check, curr_path = to_check, visited = new Set()) {
        visited.add(curr_path);
        for (let child of curr_path.childs) {
            if (child == to_check || (!visited.has(child) && this.IsOwnChild(to_check, child, visited)))
                return true;
        }
        return false;
    }
    RecursiveAdd(head, path_map, node_map) {
        if (path_map.has(head))
            return path_map.get(head);
        const head_path = new Path(head);
        path_map.set(head, head_path);
        let curr_node = node_map.get(head);
        let child_node = null;
        while (curr_node.childs.length == 1) {
            child_node = node_map.get(curr_node.childs[0]);
            if (child_node.parents.length > 1)
                break;
            curr_node = child_node;
            head_path.nodes.push(curr_node.text);
        }
        for (let child of curr_node.childs) {
            const child_path = this.RecursiveAdd(child, path_map, node_map);
            head_path.childs.push(child_path);
            child_path.parents.push(head_path);
        }
        return head_path;
    }
}
//# sourceMappingURL=Graph.js.map