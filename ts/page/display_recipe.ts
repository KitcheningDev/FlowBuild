import { recipe_t } from "../flowbuild/recipe.js";
import { draw_recipe } from "../flowbuild/draw/draw_recipe.js";
import { default_init_config } from "../flowbuild/config.js";

export function display_recipe(recipe: recipe_t): void {
    //title.innerHTML = recipe.name;
    recipe.update();
    default_init_config();
    draw_recipe(recipe);
}