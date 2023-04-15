import { PathBounds } from "./path_bounds.js";
import { ObjID } from "./obj_id.js";
export class Path extends ObjID {
    constructor(head) {
        super();
        this.tasks = [head];
        this.parents = new Set();
        this.childs = new Set();
    }
    split(new_head) {
        if (this.head == new_head) {
            return this;
        }
        const new_path = new Path(new_head);
        // tasks
        const index = this.tasks.indexOf(new_head);
        new_path.tasks = this.tasks.slice(index);
        this.tasks.splice(index);
        // relatives
        new_path.childs = this.childs;
        new_path.parents = new Set([this]);
        this.childs = new Set([new_path]);
        // adjust childs
        for (const child of new_path.childs) {
            child.parents.delete(this);
            child.parents.add(new_path);
        }
        return new_path;
    }
    reverse() {
        this.tasks.reverse();
        // swap parents and childs
        const temp = this.parents;
        this.parents = this.childs;
        this.childs = temp;
    }
    get head() {
        return this.tasks[0];
    }
    get cook_id() {
        return this.tasks[0].cook_id;
    }
    in_loop() {
        return can_reach(this, this);
    }
    is_loop_entry() {
        if (this.in_loop()) {
            for (const parent of this.parents) {
                if (!can_reach(this, parent)) {
                    return true;
                }
            }
        }
        return false;
    }
    is_loop_exit() {
        if (this.in_loop()) {
            for (const child of this.childs) {
                if (!can_reach(child, this)) {
                    return true;
                }
            }
        }
        return false;
    }
    is_bw() {
        for (const child of this.childs) {
            if (child.is_loop_entry() && can_reach(child, this)) {
                return true;
            }
        }
        if (!this.is_loop_exit()) {
            for (const child of this.childs) {
                if (child.is_bw()) {
                    return true;
                }
            }
        }
        return false;
    }
    bounds() {
        return new PathBounds(this.tasks);
    }
}
export function can_reach(from, to, visited = new Set()) {
    if (visited.has(from)) {
        return false;
    }
    visited.add(from);
    for (const child of from.childs) {
        if (child == to || can_reach(child, to, visited))
            return true;
    }
    return false;
}
//# sourceMappingURL=path.js.map