import { ID, task_t } from "./task.js";
import { path_bounds_t } from "./path_bounds.js";

export class path_t {
    tasks: task_t[];

    parents: Set<path_t>;
    childs: Set<path_t>;

    #id: ID;
    #bounds: path_bounds_t;
    
    #in_loop: boolean;
    #is_loop_entry: boolean;
    #is_loop_exit: boolean;
    #is_bw: boolean;

    constructor(head: task_t) {
        this.tasks = [head];
        this.#id = head.id;

        this.parents = new Set();
        this.childs = new Set();
        this.reset();
    }

    reset(): void {
        this.#in_loop = null;
        this.#is_loop_entry = null;
        this.#is_loop_exit = null;
        this.#is_bw = null;
        
        this.#bounds = null;
    }
    split(new_head: task_t): path_t {
        if (this.head == new_head) {
            return this;
        }

        const new_path = new path_t(new_head);

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
    reverse(): void {
        this.tasks.reverse();

        const temp = this.parents;
        this.parents = this.childs;
        this.childs = temp;

        // if (this.parents.size == 1) {
        //     const [parent] = this.parents;
        //     if (parent.is_loop_entry) {
        //         this.parents = parent.parents;
        //     }
        // }
        // if (this.childs.size == 1) {
        //     const [child] = this.childs;
        //     if (child.is_loop_exit) {
        //         this.childs = child.childs;
        //     }
        // }
    }
    get head(): task_t {
        return this.tasks[0];
    }
    get id(): ID {
        return this.#id;
    }
    get cook_id(): ID {
        return this.tasks[0].cook_id;
    }
    get in_loop(): boolean {
        if (this.#in_loop === null) {
            this.#in_loop = has_path(this, this);
        }
        return this.#in_loop;
    }
    get is_loop_entry(): boolean {
        if (this.#is_loop_entry === null) {
            this.#is_loop_entry = false;
            if (this.in_loop) {   
                for (const parent of this.parents) {
                    if (!has_path(this, parent)) {
                        this.#is_loop_entry = true;
                        break;
                    }
                }
            }
        }
        return this.#is_loop_entry;
    }
    get is_loop_exit(): boolean {
        if (this.#is_loop_exit === null) {
            this.#is_loop_exit = false;
            if (this.in_loop) {
                for (const child of this.childs) {
                    if (!has_path(child, this)) {
                        this.#is_loop_exit = true;
                        break;
                    }
                }
            }
        }
        return this.#is_loop_exit
    }
    get is_bw(): boolean {
        if (this.#is_bw === null) {
            this.#is_bw = false;
            for (const child of this.childs) {
                if (child.is_loop_entry && has_path(child, this)) {
                    this.#is_bw = true;
                    return true;
                }
            }
            if (!this.is_loop_exit) {
                for (const child of this.childs) {
                    if (child.is_bw) {
                        this.#is_bw = true;
                        return true;
                    }
                }
            }
        }
        return this.#is_bw;
    }
    get bounds(): path_bounds_t {
        if (this.#bounds === null) {
            this.#bounds = new path_bounds_t(this.tasks);
        }
        return this.#bounds;
    }
}

export function has_path(from: path_t, to: path_t, visited: Set<path_t> = new Set()): boolean {
    if (visited.has(from))
        return false;
    visited.add(from);
    for (const child of from.childs) {
        if (child == to || has_path(child, to, visited))
            return true;
    }
    return false;
}