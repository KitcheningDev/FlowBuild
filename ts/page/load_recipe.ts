import { recipe_t } from "../flowbuild/recipe.js";
import { last_elem } from "../utils/funcs.js";

export let recipe: recipe_t = null;
let recipe_log = [];
export function log_recipe_mod(): void {
    recipe_log.push(recipe);
    recipe = recipe.copy();
}
export function undo_last_mod(): void {
    if (recipe_log.length == 1) {
        return;
    }
    recipe_log.pop();
    recipe = last_elem(recipe_log).copy();
}

export function load_recipe(name: string): recipe_t {
    const req = new XMLHttpRequest();
    req.onload = () => { 
        const json = JSON.parse(req.responseText);
        recipe = new recipe_t(json);
        recipe_log = [];
        log_recipe_mod();
    }
    console.log(name);
    req.open("GET", `${document.URL}/recipes/${name}.json`, false);
    req.send();
    return recipe;
}