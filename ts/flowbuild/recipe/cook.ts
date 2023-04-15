import { ObjID } from "../../utils/obj_id.js";

export class Cook extends ObjID {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    is_empty(): boolean {
        return this.name == '';
    }
}

let cook_map = new Map<string, Cook>();
export function get_cook(str: string): Cook {
    if (!cook_map.has(str)) {
        cook_map.set(str, new Cook(str));
    }
    return cook_map.get(str);
}