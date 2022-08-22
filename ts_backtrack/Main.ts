import { Grid, Tile, Vec2 } from "./flowbuild/grid.js";
import { Recipe } from "./flowbuild/Recipe.js";
import { recipes } from "./Recipes.js";
import { DrawGrid } from "./editor/DrawGrid.js";
import { Graph } from "./flowbuild/Graph.js";
import { Flowbuild } from "./flowbuild/Flowbuild.js";
import "./editor/Editor.js";
import { curr_recipe } from "./editor/Editor.js";
import { default_config } from "./flowbuild/Configs/Default.js";

console.log("main started");
// recipes
function LoadRecipe(name: string) {
    const req = new XMLHttpRequest();
    req.onload = () => { 
        curr_recipe.SetConnections(JSON.parse(req.responseText)["paths"]);
        DrawGrid(new Flowbuild(curr_recipe, default_config).grid); 
    }
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

/*
for (let starter of recipes["starters"])
    LoadRecipe("starters/" + starter);
for (let mains of recipes["mains"])
    LoadRecipe("mains/" + mains);
*/

//const grid = new Grid(7, 10);
//grid.SetText("START", new Vec2(3, 0));
//grid.SetText("END", new Vec2(3, 9));
//sDrawGrid(grid);