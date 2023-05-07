import { draw_recipe } from "../flowbuild/draw_recipe.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { RecipeModifier } from "./recipe_modifier.js";
export let recipe = null;
export let modifier = null;
export function create_new_recipe() {
    recipe = new Recipe();
    modifier = new RecipeModifier(recipe);
    draw_recipe(recipe);
}
create_new_recipe();
//# sourceMappingURL=editor.js.map