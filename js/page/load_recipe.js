import { recipe_t } from "../flowbuild/recipe.js";
import { last_elem } from "../utils/funcs.js";
export let recipe = null;
let recipe_log = [];
export function cache_recipe_mod() {
    recipe_log.push(recipe);
    recipe = recipe.copy();
}
export function undo_last_mod() {
    if (recipe_log.length == 1) {
        return;
    }
    recipe_log.pop();
    recipe = last_elem(recipe_log).copy();
}
export function load_recipe(name) {
    const req = new XMLHttpRequest();
    req.onload = () => {
        const json = JSON.parse(req.responseText);
        recipe = new recipe_t(json);
        recipe_log = [];
        cache_recipe_mod();
    };
    console.log(name);
    req.open("GET", `${document.URL}/recipes/${name}.json`, false);
    req.send();
    return recipe;
}
//# sourceMappingURL=load_recipe.js.map