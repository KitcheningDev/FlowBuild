import { drawRecipe } from "../flowbuild/draw_recipe.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { loadIngredients } from "./ingredients_editor.js";
import { RecipeModifier } from "./recipe_modifier.js";
import { loadUploadCard } from "./upload_editor.js";

export let recipe = null as Recipe;
export let modifier = null as RecipeModifier;
export function createNewRecipe(): void {
    recipe.loadDefault();
    loadRecipe();
}
export function loadRecipe(new_recipe: Recipe = recipe): void {
    recipe = new_recipe;
    drawRecipe(recipe);
    loadIngredients();
    loadUploadCard();
}
// default
createNewRecipe();