import { ObjID } from "../../utils/obj_id.js";

export class Grocerie extends ObjID {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }
}