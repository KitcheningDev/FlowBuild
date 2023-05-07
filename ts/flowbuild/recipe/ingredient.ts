import { Grocerie } from "./grocerie.js";

export class Ingredient {
    grocerie: string;
    amount: number;
    unit: string;

    constructor(grocerie: string, amount: number, unit: string) {
        this.grocerie = grocerie;
        this.amount = amount;
        this.unit = unit;
    }
}