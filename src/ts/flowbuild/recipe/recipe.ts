import { Cook, Cook1, Task } from "./task.js";
import { Graph } from "../graph/graph.js";
import { RecipeData } from "./recipe_data.js";
import { ID } from "../../utils/obj_id.js";

export class Recipe extends RecipeData {
    constructor() {
        super();
        this.loadDefault();
    }
    // access
    get conns(): IterableIterator<[Task, Set<Task>]> {
        return this.#connections.entries();
    }
    get tasks(): Set<Task> {
        const tasks = new Set<Task>();
        for (const [parent, childs] of this.conns) {
            tasks.add(parent);
            for (const child of childs) {
                tasks.add(child);
            }
        }
        return tasks;
    }
    get cooks(): Set<Cook> {
        const cooks = new Set<Cook>();
        for (const task of this.tasks) {
            if (task.cook) {
                cooks.add(task.cook);
            }
        }
        return cooks;
    }
    hasTask(task: Task): boolean {
        return this.tasks.has(task);
    }
    byID(id: ID): Task | null {
        for (const task of this.tasks) {
            if (task.id == id) {
                return task;
            }
        }
        return null;
    }
    // relatives
    parents(task: Task): Set<Task> {
        const parents = new Set<Task>();
        for (const [parent, childs] of this.conns) {
            if (childs.has(task)) {
                parents.add(parent);
            }
        }
        return parents;
    }
    childs(task: Task): Set<Task> {
        for (const [parent, childs] of this.conns) {
            if (parent == task) {
                return new Set([...childs]);
            }
        }
        return new Set();
    }
    // global
    get start(): Task | null{
        for (const task of this.tasks) {
            if (this.parents(task).size == 0) {
                return task;
            }
        }
        return null;
    }
    get end(): Task | null{
        for (const task of this.tasks) {
            if (this.childs(task).size == 0) {
                return task;
            }
        }
        return null;
    }
    // modify
    clear(): void {
        this.#connections = new Map<Task, Set<Task>>();
    }
    deleteTask(task: Task): void {
        const parents = this.parents(task);
        const childs = this.childs(task);
        for (const parent of parents) {
            this.removeConn(parent, task);
        }
        for (const child of childs) {
            this.removeConn(task, child);
        }
        for (const parent of parents) {
            for (const child of childs) {
                if (parent == this.start && child == this.end) {
                    continue;
                }
                if (parent == this.start && 0 < this.parents(child).size) {
                    continue;
                }
                if (child == this.end && 0 < this.childs(parent).size) {
                    continue;
                }
                this.addConn(parent, child);
            }
        }
    }
    addConn(from: Task, to: Task, ...rest: Task[]): void {
        // create entry
        if (!this.#connections.has(from)) {
            this.#connections.set(from, new Set());
        }
        // add connection
        this.#connections.get(from).add(to);
        // recursion
        if (rest.length > 0) {
            return this.addConn(to, rest[0], ...rest.slice(1));
        }
    }
    removeConn(from: Task, to: Task, ...rest: Task[]): void {
        // remove connection
        this.#connections.get(from).delete(to);
        // delete entry
        if (this.#connections.get(from).size == 0) {
            this.#connections.delete(from);
        }
        // recursion
        if (rest.length > 0) {
            return this.removeConn(to, rest[0], ...rest.slice(1));
        }
    }
    loadDefault(): void {
        this.clear();
        const t1 = new Task('task1', Cook1);
        const t2 = new Task('task2', Cook1);
        const t3 = new Task('task3', Cook1);
        const t4 = new Task('task4', Cook1);
        const t5 = new Task('task5', Cook1);
        this.addConn(new Task('START'), t1, t2, new Task('END'));
        this.addConn(this.start, t3, t4, this.end);
        this.addConn(this.start, t3, t5, this.end);
    }

    loadFromData(recipeData:any) {
        this.clear();
        const tasksMap = new Map();
    
        // Create START and END tasks
        const startTask = new Task('START');
        const endTask = new Task('END');
        tasksMap.set(0, startTask); // Assign ID 0 to START task
        tasksMap.set(-1, endTask);  // Assign ID -1 to END task
    
        // Create tasks
        recipeData.instructions.forEach((instruction) => {
            const taskId = instruction.id;
            const task = new Task(`task${taskId}`, Cook1);
            task.description = instruction.body;
            tasksMap.set(taskId, task);
        });
    
        // Connect tasks directly to START and END
        recipeData.conns.forEach((connection) => {
            const fromTaskIds = connection.from.map((taskId) => tasksMap.get(taskId));
            const toTaskIds = connection.to.map((taskId) => tasksMap.get(taskId));
    
            if (fromTaskIds.some((fromTask) => !fromTask)) {
                console.error('One or more from-tasks not found.');
                return;
            }
    
            if (toTaskIds.some((toTask) => !toTask)) {
                console.error('One or more to-tasks not found.');
                return;
            }
    
            // Connect tasks directly to START
            if (connection.from.includes(0)) {
                fromTaskIds.forEach((fromTask) => {
                    this.addConn(startTask, fromTask);
                });
            }
    
            // Connect tasks directly to END
            if (connection.to.includes(-1)) {
                toTaskIds.forEach((toTask) => {
                    this.addConn(toTask, endTask);
                });
            }
    
            // Connect other tasks
            fromTaskIds.forEach((fromTask) => {
                toTaskIds.forEach((toTask) => {
                    if (!connection.from.includes(0) && !connection.to.includes(-1)) {
                        this.addConn(fromTask, toTask);
                    }
                });
            });
        });
    
        // Connect the first task to START
        const firstTask = tasksMap.get(recipeData.conns[0]?.from[0]);
        if (firstTask) {
            this.addConn(startTask, firstTask);
        }
    
        // Connect the last task to END
        const lastTask = tasksMap.get(recipeData.conns.slice(-1)[0]?.to[0]);
        if (lastTask) {
            this.addConn(lastTask, endTask);
        }
    }
    // graph
    createGraph(): Graph {
        return new Graph(this.#connections);
    }
    // member
    #connections: Map<Task, Set<Task>>;
}