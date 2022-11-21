import { create_recipe_nav } from "./page/create_recipe_nav.js";
import { load_recipe } from "./page/load_recipe.js";
import { display_recipe } from "./page/display_recipe.js";
import "./page/chart_editor.js";

create_recipe_nav();
display_recipe(load_recipe("Empty"));