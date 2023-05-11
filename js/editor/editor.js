import { draw_recipe } from "../flowbuild/draw_recipe.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { load_ingredients } from "./ingredients_editor.js";
import { RecipeModifier } from "./recipe_modifier.js";
import { load_upload } from "./upload_editor.js";
export let recipe = null;
export let modifier = null;
export function create_new_recipe() {
    load_recipe(new Recipe().load_default());
}
export function load_recipe(new_recipe) {
    recipe = new_recipe;
    modifier = new RecipeModifier(new_recipe);
    if (new_recipe.is_empty()) {
        new_recipe.load_default();
    }
    draw_recipe(new_recipe);
    load_ingredients();
    load_upload();
}
create_new_recipe();
//# sourceMappingURL=editor.js.map