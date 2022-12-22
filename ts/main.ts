import { load_recipe } from "./page/load_recipe.js";
import { display_recipe } from "./page/display_recipe.js";
import "./page/chart_editor.js";
import "./page/create_toolbox.js";

display_recipe(load_recipe("Empty"));