import { Vec2 } from "../Utils/Vec2.js";
import { Rect } from "../Utils/Rect.js";
import { LastElem, AtIndex } from "../Utils/Funcs.js";
import { CreateDefaultConfig } from "./Config.js";
import { Path } from "./Graph.js";
import { Recipe } from "./Recipe.js";

export let config = CreateDefaultConfig();
export function ResetConfig(): void {
    config = CreateDefaultConfig();
}

export interface PathBounds {
    in: Vec2;
    out: Vec2;
    size: Vec2;
    node_rects: Rect[]; 
}
function Mirror(path_bounds: PathBounds): void {
    if (path_bounds.node_rects.length == 1)
        return;
    path_bounds.in.x = path_bounds.node_rects[1].origin.x;
    path_bounds.out.x = path_bounds.node_rects[path_bounds.node_rects.length - 2].origin.x;

    let x_left = path_bounds.node_rects[0].origin.x;
    let x_right = path_bounds.node_rects[1].origin.x;
    for (let i = 0; i < path_bounds.node_rects.length; ++i)
    {
        if (i % 4 == 0 || i % 4 == 3)
            path_bounds.node_rects[i].origin.x = x_right;
        else 
            path_bounds.node_rects[i].origin.x = x_left;
    }
}
function CreateNodeRects(path: Path): Rect[] {
    const node_bounds = [] as Rect[];
    // size
    for (const node of path.nodes)
        node_bounds.push(new Rect(new Vec2(), config.GetBoxSize(node))); 

    // alternate
    if (path.nodes.length >= 4) {
        // max_x
        let max_x_left = 0;
        let max_x_right = 0;
        for (let i = 0; i < node_bounds.length; ++i) {
            if (i % 4 == 0 || i % 4 == 3)
                max_x_left = Math.max(node_bounds[i].size.x, max_x_left);
            else
                max_x_right = Math.max(node_bounds[i].size.x, max_x_right);
        }

        const center = (max_x_left + max_x_right) / 2;
        for (let i = 0; i < node_bounds.length; ++i) {
            if (i % 4 == 0 || i % 4 == 3)
                node_bounds[i].origin.x = max_x_left / 2 - center;
            else 
                node_bounds[i].origin.x = max_x_left + max_x_right / 2 - center;

            if (i < 2)
                continue;//node_bounds[i].origin.y = node_bounds[i].size.y / 2;
            else if (i % 2 == 1)
                node_bounds[i].origin.y = Math.max(node_bounds[i - 2].Down().y, node_bounds[i - 3].Down().y) + Math.max(node_bounds[i].size.y, node_bounds[i - 1].size.y) / 2;
            else if (i == node_bounds.length - 1)
                node_bounds[i].origin.y = Math.max(node_bounds[i - 1].Down().y, node_bounds[i - 2].Down().y) + node_bounds[i].size.y / 2;
            else
                node_bounds[i].origin.y = Math.max(node_bounds[i - 1].Down().y, node_bounds[i - 2].Down().y) + Math.max(node_bounds[i].size.y, node_bounds[i + 1].size.y) / 2;
        }
    }
    // straight
    else {
        for (let i = 1; i < node_bounds.length; ++i)
            node_bounds[i].origin.y = node_bounds[i].size.y / 2 + ((i > 0) ? node_bounds[i - 1].Down().y : 0);
    }
    return node_bounds;
}
export function CreatePathBounds(path: Path): PathBounds {
    const path_bounds = {} as PathBounds;
    path_bounds.node_rects = CreateNodeRects(path);
    path_bounds.in = path_bounds.node_rects[0].origin.Copy();
    path_bounds.out = LastElem(path_bounds.node_rects).origin.Copy();

    // size
    // x
    let max_x = 0;
    let min_x = 0
    for (const node_rect of path_bounds.node_rects) {
        max_x = Math.max(node_rect.Right().x, max_x);
        min_x = Math.min(node_rect.Left().x, min_x);
    }
    let diff_x = max_x - min_x;
    // y
    let min_y = 0;
    let max_y = 0;
    if (path.nodes.length > 1) {
        min_y = Math.min(path_bounds.node_rects[0].Top().y, path_bounds.node_rects[1].Top().y);
        max_y = Math.max(AtIndex(path_bounds.node_rects, -1).Down().y, AtIndex(path_bounds.node_rects, -2).Down().y)
    }
    else {
        min_y = path_bounds.node_rects[0].Top().y;
        max_y = path_bounds.node_rects[0].size.y;
    }
    let diff_y = max_y - min_y;
    path_bounds.size = new Vec2(diff_x, diff_y);

    return path_bounds;
}
export function CreatePathBoundsMap(recipe: Recipe): Map<Path, PathBounds> {
    const graph = recipe.graph;

    // map
    const path_bounds_map = new Map<Path, PathBounds>();
    for (const path of graph.paths)
        path_bounds_map.set(path, CreatePathBounds(path));

    return path_bounds_map;
}