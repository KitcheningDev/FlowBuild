import { Grocerie } from "./grocerie.js";

export class Ingredient {
    grocerie: Grocerie;
    amount: number;
    unit: string;

    constructor(grocerie: Grocerie, amount: number, unit: string) {
        this.grocerie = grocerie;
        this.amount = amount;
        this.unit = unit;
    }
}