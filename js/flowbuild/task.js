import { ObjID } from "../utils/obj_id.js";
export class Task extends ObjID {
    constructor(description, portions, cook, duration) {
        super();
        this.description = description;
        this.portions = portions;
        this.cook = cook;
        this.duration = duration;
    }
    is_empty() {
        return this.description == '';
    }
}
//# sourceMappingURL=task.js.map