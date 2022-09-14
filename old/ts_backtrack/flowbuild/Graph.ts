class GraphNode {
    text: string;
    parents: Array<string>;
    childs: Array<string>;

    constructor(text: string) {
        this.text = text;
        this.parents = new Array<string>();
        this.childs = new Array<string>();
    }
}

class AdvancedPath {
    is_reversed: boolean;
    
    in_loop: boolean;
    is_loop_entry: boolean;
    is_loop_exit: boolean;
    
    reversed_parents: Array<Path>;
    reversed_childs: Array<Path>;
    
    boxes_to_end: number;

    constructor() {
        this.is_reversed = false;

        this.in_loop = false;
        this.is_loop_entry = false;
        this.is_loop_exit = false;

        this.reversed_parents = new Array<Path>();
        this.reversed_childs = new Array<Path>();

        this.boxes_to_end = 0;
    }
}

export class Path {
    nodes: Array<string>;
    parents: Array<Path>;
    childs: Array<Path>;
    advanced: AdvancedPath;

    constructor(head: string) {
        this.nodes = new Array<string>(head);
        this.parents = new Array<Path>();
        this.childs = new Array<Path>();
        this.advanced = new AdvancedPath();
    }

    Head(): string {
        if (this.nodes.length)
            return this.nodes[0];
        else 
            return null;
    }
}

export class Graph {
    readonly start: Path;
    readonly end: Path;
    readonly is_valid: boolean;
    readonly node_map: Map<string, GraphNode>;
    readonly path_map: Map<string, Path>;

    constructor(connections: Array<Array<string>>) {
        // node map
        this.node_map = new Map<string, GraphNode>();
        this.CreateNodeMap(connections);

        // check validity
        this.is_valid = this.IsValid();
        if (!this.is_valid)
            return;
        
        // path map
        this.path_map = new Map<string, Path>();
        this.RecursiveAdd("START");
        this.start = this.path_map.get("START");
        this.end = this.GetEnd(this.start);

        // advanced
        this.SetLoopProperties();
        this.ReverseLoops();
        this.RecursiveSetBoxesToEnd(this.start);
        this.SortChilds();

        /*
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
    }
    
    private CreateNodeMap(connections: Array<Array<string>>): void {
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
    private IsValid(): boolean {
        if (!this.node_map.has("START") || !this.node_map.has("END"))
            return false;
        if (this.node_map.get("START").parents.length > 0 || this.node_map.get("END").childs.length > 0)
            return false;

        for (const node of this.node_map.values()) {
            if (node.parents.length == 0 && node.text != "START")
                return false;
            else if (node.childs.length == 0 && node.text != "END")
                return false;
        }

        // To Do: currently no loops in reversed paths allowed
        return true;
    }
    private RecursiveAdd(head: string): Path {
        if (this.path_map.has(head))
            return this.path_map.get(head);

        const path = new Path(head);
        this.path_map.set(head, path);

        let curr_node = this.node_map.get(head);
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
    private GetEnd(path: Path, visited: Set<Path> = new Set<Path>()): Path {
        if (path.childs.length == 0)
            return path;

        visited.add(path);
        for (const child of path.childs) {
            if (!visited.has(child)) {
                const found_path = this.GetEnd(child, visited);
                if (found_path != null)
                    return found_path;
            }
        }
        return null;
    }

    private HasPath(from: Path, to: Path, visited: Set<Path> = new Set<Path>()): boolean {
        if (visited.has(from))
            return false;
        visited.add(from);
        for (const child of from.childs) {
            if (child == to || this.HasPath(child, to, visited))
                return true;
        }
        return false;
    }
    private SetLoopProperties(): void {
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
                path.parents = path.parents.filter((to_check: Path) => { return !reversed_parents.includes(to_check); });
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
                path.childs = path.childs.filter((to_check: Path) => { return !reversed_childs.includes(to_check); });
                for (const reversed_child of reversed_childs)
                    reversed_child.advanced.is_reversed = true;
            }
        }
    }
    private ReverseLoops(): void {
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

    private RecursiveSetBoxesToEnd(path: Path, visited: Set<Path> = new Set<Path>()): void {
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
    private SortChilds(): void {
        for (let path of this.path_map.values()) {
            path.childs.sort((a: Path, b: Path) => {
                if (a.childs.length < b.childs.length)
                    return 1;
                else if (a.childs.length > b.childs.length)
                    return -1;
                else if (a.advanced.boxes_to_end <= b.advanced.boxes_to_end)
                    return 1;
                else 
                    return -1 
            })
        }   
    }
}