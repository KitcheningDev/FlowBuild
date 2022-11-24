import { ID } from "./hash_str.js";
import { task_t } from "./task.js";
import { path_bounds_t } from "./path_bounds.js";

export class path_t {
    tasks: task_t[];

    parents: Set<path_t>;
    childs: Set<path_t>;

    #in_loop: boolean;
    #is_loop_entry: boolean;
    #is_loop_exit: boolean;
    #bw_parents: Set<path_t>;
    #bw_childs: Set<path_t>;
    #is_bw: boolean;

    #bounds: path_bounds_t;

    constructor(head: task_t) {
        this.tasks = [head];

        this.parents = new Set();
        this.childs = new Set();
        this.reset();
    }

    reset(): void {
        this.#in_loop = null;
        this.#is_loop_entry = null;
        this.#is_loop_exit = null;
        this.#bw_parents = null;
        this.#bw_childs = null;
        this.#is_bw = null;
        
        this.#bounds = null;
    }
    get head(): task_t {
        return this.tasks[0];
    }
    get id(): ID {
        return this.head.id;
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
                    if (!parent.in_loop || !has_path(this, parent)) {
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
                    if (!child.in_loop || !has_path(child, this)) {
                        this.#is_loop_exit = true;
                        break;
                    }
                }
            }
        }
        return this.#is_loop_exit
    }
    get bw_parents(): Set<path_t> {
        if (this.#bw_parents === null) {
            this.#bw_parents = new Set();
            for (const parent of this.parents) {
                if (parent.is_bw) {
                    this.#bw_parents.add(parent);
                }
            }
        }
        return this.#bw_parents;
    }
    get bw_childs(): Set<path_t> {
        if (this.#bw_childs === null) {
            this.#bw_childs = new Set();
            for (const child of this.childs) {
                if (child.is_bw) {
                    this.#bw_childs.add(child);
                }
            }
        }
        return this.#bw_childs;
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
