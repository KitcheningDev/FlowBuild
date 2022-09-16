import { Vec2 } from "../Utils/Vec2.js";
import { Rect } from "../Utils/Rect.js";
import { LastElem, AtIndex } from "../Utils/Funcs.js";
import { CreateDefaultConfig } from "./Config.js";
import { Path } from "./Graph.js";
import { Recipe } from "./Recipe.js";
import { config } from "./Config.js";

export interface PathBounds {
    in: Vec2;
    out: Vec2;
    size: Vec2;
    node_rects: Rect[]; 
}
export function CreatePathBounds(path: Path): PathBounds {
    const path_bounds = { in: new Vec2(), out: new Vec2(), size: new Vec2(), node_rects: []} as PathBounds;

    const node_rects = path_bounds.node_rects;

    // node_bounds size
    for (const node of path.nodes)
        node_rects.push(new Rect(new Vec2(), config.GetBoxSize(node))); 

    // node_bounds origins
    let dirs :string[];
    //if (path.nodes.length >= 9)
    //    dirs = [ "right", "right", "down", "left", "left", "down" ];
    if (path.nodes.length >= 4)
        dirs = [ "right", "down", "left", "down" ];
    else
        dirs = [ "down" ];

    const same_x_map = new Map<number, Rect[]>();
    const same_y_map = new Map<number, Rect[]>();
    let dir_index = 0;
    let curr_x = 0;
    let curr_y = 0;
    for (const rect of node_rects) {
        if (!same_x_map.has(curr_x))
            same_x_map.set(curr_x, []);
        if (!same_y_map.has(curr_y))
            same_y_map.set(curr_y, []);
        
        same_x_map.get(curr_x).push(rect);
        same_y_map.get(curr_y).push(rect);

        if (dirs[dir_index] == "right")
            curr_x++;
        else if (dirs[dir_index] == "left")
            curr_x--;
        else if (dirs[dir_index] == "down")
            curr_y++;
        dir_index = (dir_index + 1) % dirs.length;
    }

    // calc max size x and y's for origins
    const max_size_x_map = new Map<number, number>();
    const max_size_y_map = new Map<number, number>();
    for (const [x, rect_arr] of same_x_map.entries())
        max_size_x_map.set(x, (() => { let max_x = 0; for (const rect of rect_arr) { max_x = Math.max(rect.size.x, max_x); } return max_x; })() );
    for (const [y, rect_arr] of same_y_map.entries())
        max_size_y_map.set(y, (() => { let max_y = 0; for (const rect of rect_arr) { max_y = Math.max(rect.size.y, max_y); } return max_y; })() );

    let last :Rect;
    dir_index = 0;
    curr_x = 0;
    curr_y = 0;
    for (const curr of node_rects) {
        if (last != undefined) {
            console.log(last.origin, curr.origin);
            if (dirs[dir_index] == "right") {
                curr.origin.x = last.origin.x + (max_size_x_map.get(curr_x) + max_size_x_map.get(curr_x + 1)) / 2;
                curr.origin.y = last.origin.y;
                curr_x++; 
            }
            else if (dirs[dir_index] == "left") {
                curr.origin.x = last.origin.x - (max_size_x_map.get(curr_x) + max_size_x_map.get(curr_x - 1)) / 2;
                curr.origin.y = last.origin.y;
                curr_x--; 
            }
            else if (dirs[dir_index] == "down") {
                curr.origin.x = last.origin.x;
                curr.origin.y = last.origin.y + (max_size_y_map.get(curr_y) + max_size_y_map.get(curr_y + 1)) / 2;
                console.log(curr.origin.y, last.origin.y, max_size_y_map.get(curr_y), max_size_y_map.get(curr_y + 1))
                curr_y++; 
            }
            dir_index = (dir_index + 1) % dirs.length;
        }
        last = curr;
    }

    // size
    let min_x = node_rects[0].Left().x;
    let max_x = node_rects[0].Right().x;
    let min_y = node_rects[0].Top().y;
    let max_y = node_rects[0].Bottom().y;
    for (const rect of node_rects) {
        min_x = Math.min(rect.Left().x, min_x);
        max_x = Math.max(rect.Right().x, max_x);
        min_y = Math.min(rect.Top().y, min_y);
        max_y = Math.max(rect.Bottom().y, max_y);
    }
    path_bounds.size = new Vec2(max_x - min_x, max_y - min_y);

    // offset node_rects x
    const center_x = min_x + (max_x - min_x) / 2;
    for (const rect of node_rects)
        rect.origin.x -= center_x;

    // in out
    path_bounds.in = node_rects[0].origin.Copy();
    path_bounds.out = LastElem(node_rects).origin.Copy();
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