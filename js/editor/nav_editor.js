import { create_new_recipe, load_recipe } from "./editor.js";
import { recipes } from "./server.js";
// create
const create_btn = document.getElementById('create-btn');
create_btn.addEventListener('click', (e) => {
    create_new_recipe();
});
// recipe list
function filter_recipes(pattern) {
    const filtered = [];
    for (const recipe of recipes) {
        if (recipe.title.toLowerCase().indexOf(pattern) != -1) {
            filtered.push(recipe);
        }
    }
    return filtered;
}
function update_recommendation() {
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
        div.addEventListener('click', (e) => {
            console.log(recipe);
            load_recipe(recipe);
            recipe_list.style.display = "none";
        });
        recipe_list.appendChild(div);
    }
}
// search bar
const search_bar = document.getElementById('search-bar');
const search_input = document.getElementById('search-input');
const recipe_list = document.getElementById('recipe-list');
search_input.addEventListener('keyup', (e) => {
    update_recommendation();
});
document.addEventListener('click', (e) => {
    if (!search_bar.contains(e.target)) {
        recipe_list.style.display = "none";
    }
});
document.addEventListener('focusin', (e) => {
    if (search_bar.contains(document.activeElement)) {
        recipe_list.style.display = "";
        update_recommendation();
    }
});
//# sourceMappingURL=nav_editor.js.map