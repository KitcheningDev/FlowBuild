import { Grid, Tile, Vec2 } from "./flowbuild/grid.js";
import { Recipe } from "./flowbuild/Recipe.js";
import { recipes } from "./Recipes.js";
import { DrawGrid } from "./editor/DrawGrid.js";
import "./editor/Editor.js";

// recipes
function LoadRecipe(name: string) {
    const req = new XMLHttpRequest();
    req.onload = () => { new Recipe(JSON.parse(req.responseText)); }
    req.open("GET", `${document.URL}/recipes/${name}.json`);
    req.send();
}

// default load
LoadRecipe("starters/Hummus");

// create recipe list
const recipe_list = document.getElementById("recipe-list");
for (let recipe_type of [ "starters", "mains" ]) {
    const headline = document.createElement("div");
    headline.classList.add("recipe-head");
    headline.innerHTML = recipe_type + ":";
    recipe_list.appendChild(headline);

    for (let name of recipes[recipe_type]) {
        const recipe_btn = document.createElement("div");
        recipe_btn.classList.add("recipe-btn");
        recipe_btn.innerHTML = name;
        recipe_btn.onclick = () => LoadRecipe(`${recipe_type}/${name}`);
        recipe_list.appendChild(recipe_btn);
    }
}

const grid = new Grid(7, 10);
grid.SetText("START", new Vec2(3, 0));
grid.SetText("END", new Vec2(3, 9));
DrawGrid(grid);