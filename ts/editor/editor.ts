import { draw_recipe } from "../flowbuild/draw_recipe.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { RecipeModifier } from "./recipe_modifier.js";

export let recipe = null as Recipe;
export let modifier = null as RecipeModifier;
export function create_new_recipe(): void {
    recipe = new Recipe();
    modifier = new RecipeModifier(recipe);
    draw_recipe(recipe);
}
create_new_recipe();