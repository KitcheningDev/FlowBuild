import { Task } from "./task.js";
import { Graph } from "../graph/graph.js";
import { set_element, set_merge } from "../../utils/set.js";
import { Cook, get_cook } from "./cook.js";
import { Tag } from "./tag.js";

class RecipeData {
    title: string;
    difficulty: string;
    duration: number;
    prep_time: number;
    image_list: string[];
    num_shares: number;
    num_likes: number;
    user: string;
    visibiliy: string;
    tags: Set<Tag>;

    constructor() {
        this.title = 'Unnamed';
        this.difficulty = 'default';
        this.duration = 0;
        this.prep_time = 0;
        this.image_list = [];
        this.num_shares = 0;
        this.num_likes = 0;
        this.user = 'Henrik';
        this.visibiliy = 'public';
        this.tags = new Set();
    }
}

export class Recipe extends RecipeData {
    #connections: Map<Task, Set<Task>>;

    constructor() {
        super();
        this.load_default();
    }

    load_default(): void {
        this.#connections = new Map<Task, Set<Task>>();   
        const start = new Task('START', get_cook(''));
        const task1 = new Task('TASK 1', get_cook('1'));
        const last_step = new Task('LAST STEP', get_cook(''));
        const end = new Task('END', get_cook(''));
        this.#connections.set(start, new Set([task1]));
        this.#connections.set(task1, new Set([last_step]));
        this.#connections.set(last_step, new Set([end]));
    }

    add_connection(from: Task, to: Task): void {
        if (!this.#connections.has(from)) {
            this.#connections.set(from, new Set());
        }
        this.#connections.get(from)?.add(to);
    }
    remove_connection(from: Task, to: Task): void {
        const childs = this.#connections.get(from);
        if (childs !== undefined) {
            childs.delete(to);
            if (childs.size == 0) {
                this.#connections.delete(from);
            }
        }
    }
    has_conn(from: Task, to: Task): boolean {
        const childs = this.#connections.get(from);
        if (childs === undefined) {
            return false;
        }
        else {
            return childs.has(to);
        }
    }
    remove_task(task: Task): void {
        if (this.#connections.has(task)) {
            const task_childs = this.#connections.get(task) as Set<Task>;
            for (const [parent, childs] of this.#connections) {
                if (childs.has(task)) {
                    childs.delete(task);
                    this.#connections.set(parent, set_merge(childs, task_childs));
                }
            }
            this.#connections.delete(task);
        }
    }
    has_task(task: Task): boolean {
        for (const [parent, childs] of this.#connections) {
            if (parent == task || childs.has(task)) {
                return true;
            }
        }
        return false;
    }
    get_task_by_id(id: number): Task | null {
        for (const [task, childs] of this.#connections) {
            if (task.id == id) {
                return task;
            }
            for (const child of childs) {
                if (child.id == id) {
                    return child;
                }
            }
        }
        return null;
    }
    get_cook_by_id(id: number): Cook | null {
        for (const [task, childs] of this.#connections) {
            if (task.cook.id == id) {
                return task.cook;
            }
            for (const child of childs) {
                if (child.cook.id == id) {
                    return child.cook;
                }
            }
        }
        return null;
    }
    
    get_tasks(): Set<Task> {
        const tasks = new Set<Task>();
        for (const [parent, childs] of this.#connections) {
            tasks.add(parent);
            for (const child of childs) {
                tasks.add(child);
            }
        }
        return tasks;
    }
    get_parents(task: Task): Set<Task> {
        const parents = new Set<Task>();
        for (const [parent, childs] of this.#connections) {
            if (childs.has(task)) {
                parents.add(parent);
            }
        }
        return parents;
    }
    get_childs(task: Task): Set<Task> {
        if (this.#connections.has(task)) {
            return this.#connections.get(task);
        }
        else {
            return new Set();
        }
    }
    get_start(): Task {
        for (const task of this.get_tasks()) {
            if (this.get_parents(task).size == 0) {
                return task;
            }
        }
    }
    get_end(): Task {
        for (const task of this.get_tasks()) {
            if (this.get_childs(task).size == 0) {
                return task;
            }
        }
    }
    get_last_step(): Task {
        return set_element(this.get_parents(this.get_end()));
    }

    get_cooks(): Set<Cook> {
        const cooks = new Set<Cook>();
        for (const [task, childs] of this.#connections) {
            cooks.add(task.cook);
            for (const child of childs) {
                cooks.add(child.cook);
            }
        }
        cooks.delete(this.get_start().cook);
        return cooks;

    }
    get_num_cooks(): number {
        return this.get_cooks().size;
    }

    create_graph(): Graph {
        return new Graph(this.#connections);
    }
}