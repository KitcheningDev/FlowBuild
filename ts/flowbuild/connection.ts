import { ID, task_t } from "./task.js";

export class connection_t {
    from: task_t;
    to: task_t;

    constructor(from: task_t, to: task_t) {
        this.from = from;
        this.to = to;
    }

    get id(): ID {
        return this.from.id * (2 ** 20) + this.to.id;
    }
}