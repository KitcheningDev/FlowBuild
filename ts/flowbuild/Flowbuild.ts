import { Grid, Vec2 } from "./grid.js";
import { Recipe } from "./Recipe.js";
import { BacktrackParams, FlowbuildConfig, PathLayout } from "./Config.js";
import { Move, TextCoords, ArrowCoords } from "./Move.js";
import { Graph, Path } from "./Graph.js";
import { Arrow } from "./grid.js";

export class Flowbuild {
    readonly grid: Grid;
    #graph: Graph;
    #config: FlowbuildConfig;
    #backtrack_order: Array<string>;

    constructor(recipe: Recipe, config: FlowbuildConfig) {
        this.grid = new Grid(7, 10);
        this.#graph = recipe.CreateGraph();
        
        const hor_spacing_order = [];
        const ver_padding_order = [];
        for (let i = 0; i < config.hor_spacing_order.length; ++i) {
            let val = Math.round(config.hor_spacing_order[i] * 7);
            if (val == 0)
                val = 1;
            if (i > 0 && hor_spacing_order[hor_spacing_order.length - 1] != val)
                hor_spacing_order.push(val);
        }
        for (let i = 0; i < config.ver_padding_order.length; ++i) {
            let val = Math.round(config.ver_padding_order[i] * 7);
            if (val == 0)
                val = 1;
            if (i > 0 && ver_padding_order[ver_padding_order.length - 1] != val)
                ver_padding_order.push(val);
        }
        this.#config = new FlowbuildConfig(config.layout_order, hor_spacing_order, ver_padding_order);

        this.#backtrack_order = [];
        this.RecursiveCreateBacktrackOrder(this.#graph.start);
        this.#backtrack_order.shift();

        console.log(this.#graph);
        console.log(this.#backtrack_order);
        this.grid.SetText("START", new Vec2(3, 0));
        this.grid.SetText("END", new Vec2(4, 9));
        console.log("Backtrack success ", this.Backtrack(0, 0, 0, 0));
    }

    RecursiveCreateBacktrackOrder(path: Path): void {
        for (const parent of path.parents) {
            let found = false;
            for (const curr of this.#backtrack_order) {
                if (curr == parent.Head()) {
                    found = true;
                    break;
                }
            }
            if (!found)
                this.RecursiveCreateBacktrackOrder(parent);
        }
        let found = false;
        for (const curr of this.#backtrack_order) {
            if (curr == path.Head()) {
                found = true;
                break;
            }
        }
        if (!found)
            this.#backtrack_order.push(path.Head());
        for (const child of path.childs)
            this.RecursiveCreateBacktrackOrder(child);
    }
    Backtrack(backtrack_index: number, layout_index: number, hor_spacing_index: number, ver_padding_index: number): boolean {
        if (backtrack_index == this.#backtrack_order.length)
            return true;

        const move = this.CreateMove(this.#backtrack_order[backtrack_index],
            new BacktrackParams(
                this.#config.layout_order[layout_index],
                this.#config.hor_spacing_order[hor_spacing_index],
                this.#config.ver_padding_order[ver_padding_index],
            ));
        
        let successfull = true;
        if (move == null)
            successfull = false;
        if (successfull) {
            this.DoMove(move);
            if (this.Backtrack(backtrack_index + 1, 0, 0, 0))
                return true;
            this.UndoMove(move);
        }

        if (layout_index <= this.#config.layout_order.length - 1)
            return this.Backtrack(backtrack_index, layout_index + 1, hor_spacing_index, ver_padding_index);
        else if (hor_spacing_index <= this.#config.hor_spacing_order.length - 1)
            return this.Backtrack(backtrack_index, layout_index, hor_spacing_index + 1, ver_padding_index);
        else if (ver_padding_index <= this.#config.ver_padding_order.length - 1)
            return this.Backtrack(backtrack_index, layout_index, hor_spacing_index, ver_padding_index + 1);
        else 
            return false;
    }

    DoMove(move: Move): void {
        for (const text_coords of move.boxes)
            this.grid.SetText(text_coords.text, text_coords.coords);
        for (const arrow_coords of move.arrows)
            this.grid.OverlapArrow(arrow_coords.arrow, arrow_coords.coords);
    }
    UndoMove(move: Move): void {
        for (const text_coords of move.boxes)
            this.grid.SetText("", text_coords.coords);
        for (const arrow_coords of move.arrows)
            this.grid.SetArrow(new Arrow(), arrow_coords.coords);
    }

    // backtrack utils
    ArithmAvgX(text: string): number {
        let avg = 0;
        const node = this.#graph.node_map.get(text);
        for (const parent of node.parents)
            avg += this.grid.GetPos(parent).x;
        return Math.round(avg / node.parents.length);
    }
    ChildOff(text: string): number {
        const parent = this.#graph.node_map.get(text).parents[0];
        const index = this.#graph.node_map.get(parent).childs.indexOf(text);
        const length = this.#graph.node_map.get(parent).childs.length;

        if (length % 2)
            return index - Math.floor(length / 2);
        else if (index < length / 2)
            return index - length / 2;
        else 
            return index + 1 - length / 2;
    }
    MaxY(text: string): number {
        let max = 0;
        for (let parent of this.#graph.node_map.get(text).parents) {
            if (max < this.grid.GetPos(parent).y)
                max = this.grid.GetPos(parent).y
        }
        return max;
    }
    PathToArrowCoords(path: Array<Vec2>): Array<ArrowCoords> {
        const arrow_coords = [ new ArrowCoords(new Arrow(), path[0])];
        for (let i = 1; i < path.length; ++i) {
            const diff = new Vec2(path[i]).SubVec(path[i - 1]);
            arrow_coords.push(new ArrowCoords(new Arrow(), path[i]));
            if (diff.x == 1) {
                arrow_coords[arrow_coords.length - 2].arrow.right = true;
                arrow_coords[arrow_coords.length - 1].arrow.left = true;
            }
            else if (diff.x == -1) {
                arrow_coords[arrow_coords.length - 2].arrow.left = true;
                arrow_coords[arrow_coords.length - 1].arrow.right = true;
            }
            else if (diff.y == 1) {
                arrow_coords[arrow_coords.length - 2].arrow.down = true;
                arrow_coords[arrow_coords.length - 1].arrow.up = true;
            }
            else {
                arrow_coords[arrow_coords.length - 2].arrow.up = true;
                arrow_coords[arrow_coords.length - 1].arrow.down = true;
            }
        }
        return arrow_coords;
    }
    BTS(from: Vec2, to: Vec2, move: Move): Array<Vec2> {
        let paths = [[from]];
        let new_paths = [];
        const visited = [from];
        while (paths.length > 0) {
            for (const path of paths) {
                const curr_coords = path[path.length - 1];
                
                const up = new Vec2(0, -1).AddVec(curr_coords);
                const right = new Vec2(1, 0).AddVec(curr_coords);
                const down = new Vec2(0, 1).AddVec(curr_coords);
                const left = new Vec2(-1, 0).AddVec(curr_coords);;
                for (const new_coords of [up, right, down, left]) {
                    if (new_coords.Equals(to))
                        return [...path, to];
                    if (!this.grid.InBounds(new_coords) || this.grid.Get(new_coords).text != "")
                        continue;
                    let is_valid = true;
                    for (const visited_coords of visited) {
                        if (visited_coords.Equals(new_coords)) {
                            is_valid = false;
                            break;
                        }
                    }
                    if (is_valid) {
                        visited.push(new_coords);
                        new_paths.push([...path, new_coords]);
                    }
                }
            }
            paths = new_paths;
            new_paths = [];
        }
        return null;
    }

    CreateMove(head: string, params: BacktrackParams): Move {
        const move = new Move(); 
        const node = this.#graph.node_map.get(head);
        const path = this.#graph.path_map.get(head);

        const head_coords = new Vec2(
            this.ArithmAvgX(head) + this.ChildOff(head) * params.hor_spacing,
            this.MaxY(head) + 1 * params.ver_padding);
        console.log(head_coords);
        if (!this.grid.InBounds(head_coords) || !this.grid.IsEmpty(head_coords)) {
            console.log("failed head coords");
            return null;
        }
        for (const parent of node.parents) {
            const path = this.BTS(this.grid.GetPos(parent), head_coords, move);
            if (path == null) {
                console.log("failed path");
                return null;
            }
            const arrows = this.PathToArrowCoords(path);
            for (const arrow of arrows)
                move.arrows.push(arrow);
        }

        move.boxes.push(new TextCoords(head, head_coords));
        for (let i = 1; i < path.nodes.length; ++i) {
            if (path.nodes[i] == "END")
                break;
            let coords: Vec2;
            if (params.layout == PathLayout.Straight)
                coords = new Vec2(0, i).AddVec(head_coords);
            else if (params.layout == PathLayout.Alternate) {
                let ver = 0;
                if (i % 4 == 1 || i % 4 == 2) 
                    ver = 1;
                coords = new Vec2(ver, Math.floor(i / 2)).AddVec(head_coords);
            }
            if (!this.grid.InBounds(head_coords) || !this.grid.IsEmpty(coords)) {
                console.log("failed node coords");
                return null;
            }
            move.boxes.push(new TextCoords(path.nodes[i], coords));
        }

        return move;
    }
}