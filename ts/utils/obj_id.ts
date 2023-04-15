let obj_counter = 0;
export type ID = number;
export class ObjID {
    readonly id: ID
    constructor() {
        this.id = ++obj_counter;
    }
}