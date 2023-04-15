import { ObjID } from "../../utils/obj_id.js";
import { Cook } from "./cook.js";
import { Ingredient } from "./ingredient.js";

export class Task extends ObjID {
    description: string;
    ingredients: Set<Ingredient>;
    cook: Cook;
    duration: number;

    constructor(description: string, cook: Cook, ingredients: Set<Ingredient> = new Set(), duration: number = 0) {
        super();
        this.description = description;
        this.cook = cook;
        this.ingredients = ingredients;
        this.duration = duration;
    }

    is_empty(): boolean {
        return this.description == '';
    }
}