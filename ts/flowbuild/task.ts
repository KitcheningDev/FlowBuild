import { ID } from "./hash_str.js";

let task_counter = 0;
export class task_t {
    #str: string;
    #cook_id: ID;
    #duration: number;
    #id: ID;
    //debug_str: string;

    constructor(str: string, cook_id: ID, duration: number = 0) {
        this.#str = str;
        this.#cook_id = cook_id;
        this.#duration = duration;
        this.#id = ++task_counter;
        //this.debug_str = str;
    }
    copy(): task_t {
        return new task_t(this.#str, this.#cook_id, this.#duration);
    }

    get str(): string {
        return this.#str;
    }
    get cook_id(): ID {
        return this.#cook_id;
    }
    get duration(): number {
        return this.#duration;
    }
    get id(): ID {
        return this.#id;
    }
}