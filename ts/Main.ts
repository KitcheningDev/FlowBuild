import { Flowbuild } from "./flowbuild/Flowbuild.js";
import { recipes } from "./Recipes.js";
import { DrawGrid } from "./editor/DrawGrid.js";
import { curr_recipe } from "./editor/Editor.js";
import "./editor/Editor.js";

// recipes
function LoadRecipe(name: string) {
    const req = new XMLHttpRequest();
    req.onload = () => { 
        console.log(name);
        const loaded = JSON.parse(req.responseText);
        curr_recipe.SetConnections(loaded["paths"]);
        curr_recipe.name = loaded["name"];
        document.getElementById("recipe-name").innerHTML = curr_recipe.name;
        DrawGrid(new Flowbuild(curr_recipe).grid);
    }
    req.open("GET", `${document.URL}/recipes/${name}.json`);
    req.send();
}
LoadRecipe("Empty");

// create recipe list
let offset = 0;
function CreateRecipeList(name: string): HTMLElement {
    const headline = document.createElement("div");
    headline.classList.add("recipe-head");
    headline.innerHTML = name + ":";
    
    const recipe_list = document.createElement("div");
    recipe_list.classList.add("recipe-list");
    recipe_list.appendChild(headline);
    document.body.appendChild(recipe_list);
    recipe_list.style.left = (55 + offset * 15).toString() + "rem";
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
    for (let name of recipes[recipe_type])
       CreateRecipeButton(name, `${recipe_type}/${name}`, recipe_list);
}