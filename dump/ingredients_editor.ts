import { Ingredient, Product, Unit } from "../flowbuild/recipe/task.js";
import { recipe } from "./editor.js";
import { addCls, appendChilds, create, createDiv, parent } from "./html.js";

// html
const container = document.getElementById("ingredient-container") as HTMLTableSectionElement;
const add_ingredient = document.getElementById("ingredient-add");
// update
export function updateIngredients(): void {
    recipe.ingredients = new Set<Ingredient>();
    for (const row of container.rows) {
        const product = row.children.item(0).textContent.trim();
        const amount = row.children.item(1).textContent.trim();
        const unit = row.children.item(2).textContent.trim();
        recipe.ingredients.add(new Ingredient(new Product(product), parseInt(amount), new Unit(unit)));
    }
}
export function loadIngredients(): void {
    container.textContent = "";
    for (const ingredient of recipe.ingredients) {
        addRow(ingredient);
    }
}
container.addEventListener('keypress', (e: KeyboardEvent) => {
    updateIngredients();
});
// add
function addRow(ingredient: Ingredient = new Ingredient(new Product('product'), 0, new Unit('unit'))): void {
    const row = addCls(container.insertRow(), 'ingredient');
    
    const name = addCls(row.insertCell(), 'ingredient-property');
    name.textContent = ingredient.product.name;
    name.contentEditable = 'true';

    const amount = addCls(row.insertCell(), 'ingredient-property');
    amount.textContent = ingredient.amount.toString();
    amount.contentEditable = 'true';
    
    const unit = addCls(row.insertCell(), 'ingredient-property');
    unit.textContent = ingredient.unit.name;
    unit.contentEditable = 'true';
    
    appendChilds(row.insertCell(), appendChilds(createDiv('icon'), create('i', 'ingredient-delete', 'fa-solid', 'fa-trash')));
}
add_ingredient.addEventListener('click', (e: MouseEvent) => {
    addRow();
    updateIngredients();
});
// delete
container.addEventListener('click', (e: MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.classList.contains("ingredient-delete")) {
        if (container.rows.length > 1) {
            parent(el, 'ingredient').remove();
            updateIngredients();
        }
    }
});
// deselect on focusout
document.addEventListener('focusout', (e: FocusEvent) =>  {
    window.getSelection().removeAllRanges();
});
// default ingredient
addRow();