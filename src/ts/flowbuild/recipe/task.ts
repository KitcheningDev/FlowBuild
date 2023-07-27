import { ObjID } from "../../utils/obj_id.js";

export class Cook {
    constructor(name: string, title: string = name) {
        this.name = name;
        this.title = title;
    }
    // member
    name: string;
    title: string;
}
export class Product {
    constructor(name: string) {
        this.name = name;
    }
    // member
    name: string;
}
export class Unit {
    constructor(name: string) {
        this.name = name;
    }
    // member
    name: string;
};
export class Ingredient extends ObjID {
    constructor(product: Product, amount: number, unit: Unit) {
        super();
        this.product = product;
        this.amount = amount;
        this.unit = unit;
    }
    // member
    product: Product;
    amount: number;
    unit: Unit;
}
export class Task extends ObjID {
    constructor(description: string, cook: Cook | null = null, duration: number = 0, ingredients: Set<Ingredient> = new Set()) {
        super();
        this.description = description;
        this.cook = cook;
        this.duration = duration;
        this.ingredients = ingredients;
    }
    // member
    description: string;
    cook: Cook | null;
    duration: number;
    ingredients: Set<Ingredient>;
}
export const Cook1 = new Cook('Küchenlehrling', 'Küchen lehrling');
export const Cook2 = new Cook('Küchenmeister', 'Küchen meister');