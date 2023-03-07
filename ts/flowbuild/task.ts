export type ID = number;
let task_counter = 0;
export class task_t {
    str: string;
    cook_id: ID;
    duration: number;
    #id: ID;

    constructor(str: string, cook_id: ID, duration: number = 0) {
        this.str = str;
        this.cook_id = cook_id;
        this.duration = duration;
        this.#id = ++task_counter;
    }
    copy(): task_t {
        return new task_t(this.str, this.cook_id, this.duration);
    }

    get id(): ID {
        return this.#id;
    }
}