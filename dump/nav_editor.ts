import { Recipe } from "../ts/flowbuild/recipe/recipe.js";
import { createNewRecipe, loadRecipe } from "./editor.js";
import { recipes } from "./server.js";

// create
const create_btn = document.getElementById('create-btn');
create_btn.addEventListener('click', () => createNewRecipe());
// recipe list
function filter_recipes(pattern: string): Recipe[] {
    const filtered = [] as Recipe[];
    for (const recipe of recipes) {
        if (recipe && recipe.title) {
            if (recipe.title.toLowerCase().indexOf(pattern) != -1) {
                filtered.push(recipe);
            }
        }
    }
    return filtered;
}
function update_recommendation(): void {
    recipe_list.innerHTML = "";
    for (const recipe of filter_recipes(search_input.value.trim().toLowerCase())) {
        const div = document.createElement('div');
        div.classList.add('recipe-preview');

        const img = document.createElement('img');
        img.src = recipe.image_list[0];
        img.width = 101;
        img.height = 64;

        const label = document.createElement('label');
        label.textContent = recipe.title;

        const download = document.createElement('i');
        download.classList.add('fa-solid', 'fa-download', 'fa-2x');

        div.appendChild(img);
        div.appendChild(label);

        div.addEventListener('click', (e: MouseEvent) => {
            loadRecipe(recipe);
            recipe_list.style.display = "none";
        });

        recipe_list.appendChild(div);
    }
}

// search bar
const search_bar = document.getElementById('search-bar');
const search_input = document.getElementById('search-input') as HTMLInputElement;
const recipe_list = document.getElementById('recipe-list');
search_input.addEventListener('keyup', (e: MouseEvent) => {
    update_recommendation();
});
document.addEventListener('click', (e: MouseEvent) => {
    if (!search_bar.contains(e.target as Node)) {
        recipe_list.style.display = "none";
    }
});
document.addEventListener('focusin', (e: FocusEvent) => {
    if (search_bar.contains(document.activeElement)) {
        recipe_list.style.display = "";
        update_recommendation();
    }
});