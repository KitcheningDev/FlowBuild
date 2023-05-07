import { Ingredient } from "../flowbuild/recipe/ingredient.js";
import { recipe } from "./editor.js";
import { add_cls, append_childs, create, create_div, parent } from "./html.js";

const container = document.getElementById("ingredient-container") as HTMLTableSectionElement;
const add_ingredient = document.getElementById("ingredient-add");

// update
function update_ingredients(): void {
    recipe.ingredients = new Set<Ingredient>();
    for (const row of container.rows) {
        const grocerie = row.children.item(0).textContent.trim();
        const amount = row.children.item(1).textContent.trim();
        const unit = row.children.item(2).textContent.trim();
        recipe.ingredients.add(new Ingredient(grocerie, parseInt(amount), unit));
    }
}
container.addEventListener('keypress', (e: KeyboardEvent) => {
    update_ingredients();
});

// add
function add_row(): void {
    const row = add_cls(container.insertRow(), 'ingredient');
    
    const name = add_cls(row.insertCell(), 'ingredient-property');
    name.textContent = "product";
    name.contentEditable = 'true';

    const amount = add_cls(row.insertCell(), 'ingredient-property');
    amount.textContent = "0";
    amount.contentEditable = 'true';
    
    const unit = add_cls(row.insertCell(), 'ingredient-property');
    unit.textContent = "unit";
    unit.contentEditable = 'true';
    
    append_childs(row.insertCell(), append_childs(create_div('icon'), create('i', 'ingredient-delete', 'fa-solid', 'fa-trash')));
}
add_ingredient.addEventListener('click', (e: MouseEvent) => {
    add_row();
    update_ingredients();
});

// delete
container.addEventListener('click', (e: MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.classList.contains("ingredient-delete")) {
        if (container.rows.length > 1) {
            parent(el, 'ingredient').remove();
            update_ingredients();
        }
    }
});

// deselect on focusout
document.addEventListener('focusout', (e: FocusEvent) =>  {
    window.getSelection().removeAllRanges();
});

// default ingredient
add_row();