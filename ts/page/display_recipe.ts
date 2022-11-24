import { recipe_t } from "../flowbuild/recipe.js";
import { draw_recipe } from "../flowbuild/draw/draw_recipe.js";
import { init_global_config } from "../flowbuild/config.js";

const title = document.getElementById('chart-title');
export function display_recipe(recipe: recipe_t): void {
    title.innerHTML = recipe.name;
    init_global_config();
    draw_recipe(recipe);
}