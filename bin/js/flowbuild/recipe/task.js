import { ObjID } from "../../utils/obj_id.js";
export class Cook {
    constructor(name, title = name) {
        this.name = name;
        this.title = title;
    }
}
export class Product {
    constructor(name) {
        this.name = name;
    }
}
export class Unit {
    constructor(name) {
        this.name = name;
    }
}
;
export class Ingredient extends ObjID {
    constructor(product, amount, unit) {
        super();
        this.product = product;
        this.amount = amount;
        this.unit = unit;
    }
}
export class Task extends ObjID {
    constructor(description, cook = null, duration = 0, ingredients = new Set()) {
        super();
        this.description = description;
        this.cook = cook;
        this.duration = duration;
        this.ingredients = ingredients;
    }
}
export const Cook1 = new Cook('Küchenlehrling', 'Küchen lehrling');
export const Cook2 = new Cook('Küchenmeister', 'Küchen meister');
//# sourceMappingURL=task.js.map