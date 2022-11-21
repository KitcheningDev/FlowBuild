import { recipe_t } from "../flowbuild/recipe.js";

export let recipe: recipe_t = null;
export function load_recipe(name: string): recipe_t {
    const req = new XMLHttpRequest();
    req.onload = () => { 
                const json = JSON.parse(req.responseText);
        recipe = new recipe_t(json);
    }
    req.open("GET", `${document.URL}/recipes/${name}.json`, false);
    req.send();
    return recipe;
}