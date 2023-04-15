import { ObjID } from "../../utils/obj_id.js";
export class Task extends ObjID {
    constructor(description, cook, ingredients = new Set(), duration = 0) {
        super();
        this.description = description;
        this.cook = cook;
        this.ingredients = ingredients;
        this.duration = duration;
    }
    is_empty() {
        return this.description == '';
    }
}
//# sourceMappingURL=task.js.map