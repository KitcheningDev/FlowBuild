import { ObjID } from "../../utils/obj_id.js";
import { set_element } from "../../utils/set.js";
import { Task } from "../recipe/task.js";

export class Node extends ObjID {
    task: Task;
    parents: Set<Node>;
    childs: Set<Node>;

    constructor(task: Task, parents: Set<Node> = new Set(), childs: Set<Node> = new Set()) {
        super();
        this.task = task;
        this.parents = parents;
        this.childs = childs;
    }

    // graph properties
    is_start(): boolean {
        return this.parents.size == 0;
    }
    is_end(): boolean {
        return this.childs.size == 0;
    }
    is_last_step(): boolean {
        return this.childs.size == 1 && set_element(this.childs).is_end();
    }

    // graph traversal
    can_reach(to: Node, visited: Set<Node> = new Set()) {
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
    in_loop(): boolean {
        return this.can_reach(this);
    }
    find_shortest_path(to: Node): Node[] {
        let paths = new Set<Node[]>([[this]]);
        while (true) {
            const new_paths = new Set<Node[]>();
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
    find_longest_path(to: Node): Node[] {
        let longest_path = [] as Node[];
        let paths = new Set<Node[]>([[this]]);
        while (paths.size > 0) {
            const new_paths = new Set<Node[]>();
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
    shortest_distance(to: Node): number {
        return this.find_shortest_path(to).length - 1;
    }
    longest_distance(to: Node): number {
        return this.find_longest_path(to).length - 1;
    }
}
