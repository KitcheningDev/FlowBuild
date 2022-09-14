import { LoadRecipe } from "./Editor.js";
import { recipe_index } from "./RecipeIndex.js";

let offset = 0;
function CreateRecipeList(name: string): HTMLElement {
    const headline = document.createElement("div");
    headline.classList.add("recipe-head");
    headline.innerHTML = name + ":";
    
    const recipe_list = document.createElement("div");
    recipe_list.classList.add("recipe-list");
    recipe_list.appendChild(headline);
    document.body.appendChild(recipe_list);
    recipe_list.style.left = (70 + offset * 13).toString() + "rem";
    offset += 1;
    return recipe_list;
}
function CreateRecipeButton(name: string, path: string, recipe_list: HTMLElement): void {
    const recipe_btn = document.createElement("div");
    recipe_btn.classList.add("recipe-btn");
    recipe_btn.innerHTML = name; 
    recipe_btn.onclick = () => LoadRecipe(path);
    recipe_list.appendChild(recipe_btn);
}
CreateRecipeButton("Empty", "Empty", CreateRecipeList("templates"));
for (let recipe_type of ["starters", "mains", "desserts"]) {
    const recipe_list = CreateRecipeList(recipe_type);
    for (let name of recipe_index[recipe_type])
       CreateRecipeButton(name, `${recipe_type}/${name}`, recipe_list);
}