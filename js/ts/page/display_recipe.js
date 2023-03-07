import { draw_recipe } from "../flowbuild/draw_recipe.js";
import { init_global_config } from "../flowbuild/config.js";
const title = document.getElementById('chart-title');
export function display_recipe(recipe) {
    title.innerHTML = recipe.name;
    init_global_config();
    draw_recipe(recipe);
}
//# sourceMappingURL=display_recipe.js.map