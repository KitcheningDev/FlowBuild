import { load_recipe, recipe, undo_last_mod } from "./load_recipe.js";
import { display_recipe } from "./display_recipe.js";
import { recipe_index } from "./recipe_index.js";
import { recipe_to_json } from "../flowbuild/safe_recipe.js";
const recipe_nav = document.getElementById('recipe-nav');
function add_recipe_button(name, path, recipe_list) {
    const recipe_btn = document.createElement("li");
    recipe_btn.innerHTML = name;
    recipe_btn.onclick = () => display_recipe(load_recipe(path));
    recipe_list.appendChild(recipe_btn);
}
function clear_btn_callback() {
    display_recipe(load_recipe("Empty"));
}
function undo_btn_callback() {
    undo_last_mod();
    display_recipe(recipe);
}
function file_btn_callback() {
    const json = recipe_to_json(recipe);
    console.log(JSON.stringify(json, null, 1));
}
export function create_recipe_nav() {
    recipe_nav.innerHTML = "";
    for (let recipe_type of ["starters", "mains", "desserts"]) {
        const recipe_div = document.createElement('div');
        const recipe_list = document.createElement('ul');
        const header = document.createElement('h2');
        header.innerHTML = recipe_type;
        for (let name of recipe_index[recipe_type]) {
            add_recipe_button(name, `${recipe_type}/${name}`, recipe_list);
        }
        recipe_div.appendChild(header);
        recipe_div.appendChild(recipe_list);
        recipe_nav.appendChild(recipe_div);
    }
    document.getElementById("clear-btn").onclick = clear_btn_callback;
    document.getElementById("file-btn").onclick = file_btn_callback;
    document.getElementById("undo-btn").onclick = undo_btn_callback;
    document.addEventListener('keypress', (e) => {
        let icon;
        if (document.activeElement != document.body) {
            return;
        }
        if (e.key == 'u') {
            icon = document.getElementById("undo-btn");
            undo_btn_callback();
        }
        else if (e.key == 'c') {
            icon = document.getElementById("clear-btn");
            clear_btn_callback();
        }
        else if (e.key == 'h') {
            icon = document.getElementById("help-btn");
        }
        else if (e.key == 'f') {
            icon = document.getElementById("file-btn");
            file_btn_callback();
        }
        else {
            return;
        }
        icon.style.opacity = "0.7";
        setTimeout(() => { icon.style.opacity = "1"; }, 200);
    });
}
//# sourceMappingURL=create_recipe_nav.js.map