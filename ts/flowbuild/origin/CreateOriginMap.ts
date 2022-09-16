import { Vec2 } from "../../Utils/Vec2.js";
import { Path } from "../Graph.js";
import { Recipe } from "../Recipe";
import { CreateOriginXMap } from "./CreateOriginXMap.js";
import { CreateOriginYMap } from "./CreateOriginYMap.js";
import { PathBounds } from "../PathBounds";

export function CreateOriginMap(recipe: Recipe, path_bounds: Map<Path, PathBounds>): Map<Path, Vec2> {
    const x_map = CreateOriginXMap(recipe, path_bounds);
    const y_map = CreateOriginYMap(recipe, path_bounds);
    
    const origin_map = new Map<Path, Vec2>();
    for (const path of recipe.graph.paths)
        origin_map.set(path, new Vec2(x_map.get(path), y_map.get(path)));
    return origin_map;
}