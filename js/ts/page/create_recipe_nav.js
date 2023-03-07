import { load_recipe } from "./load_recipe.js";
import { display_recipe } from "./display_recipe.js";
import { recipe_index } from "./recipe_index.js";
const recipe_nav = document.getElementById('recipe-nav');
function add_recipe_button(name, path, recipe_list) {
    const recipe_btn = document.createElement("li");
    recipe_btn.innerHTML = name;
    recipe_btn.onclick = () => display_recipe(load_recipe(path));
    recipe_list.appendChild(recipe_btn);
}
export function create_recipe_nav() {
    recipe_nav.innerHTML = "";
    for (let recipe_type of ["starters", "mains", "desserts"]) {
        const recipe_div = document.createElement('div');
        const recipe_list = document.createElement('ul');
        const header = document.createElement('h2');
        header.innerHTML = recipe_type;
        for (let name of recipe_index[recipe_type])
            add_recipe_button(name, `${recipe_type}/${name}`, recipe_list);
        recipe_div.appendChild(header);
        recipe_div.appendChild(recipe_list);
        recipe_nav.appendChild(recipe_div);
    }
    document.getElementById("clear-btn").onclick = () => display_recipe(load_recipe("Empty"));
    document.addEventListener('keypress', (e) => {
        let icon;
        if (e.key == 'u')
            icon = document.getElementById("undo-btn");
        else if (e.key == 'c')
            icon = document.getElementById("clear-btn");
        else if (e.key == 'h')
            icon = document.getElementById("help-btn");
        else
            return;
        //icon.onclick(null);
        icon.style.opacity = "0.7";
        setTimeout(() => { icon.style.opacity = "1"; }, 200);
    });
}
//# sourceMappingURL=create_recipe_nav.js.map