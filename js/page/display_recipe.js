import { draw_recipe } from "../flowbuild/draw/draw_recipe.js";
import { default_init_config } from "../flowbuild/config.js";
export function display_recipe(recipe) {
    //title.innerHTML = recipe.name;
    recipe.update();
    default_init_config();
    draw_recipe(recipe);
}
//# sourceMappingURL=display_recipe.js.map