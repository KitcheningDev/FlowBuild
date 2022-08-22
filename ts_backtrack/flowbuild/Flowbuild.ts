import { Grid, SyncLine, Vec2 } from "./grid.js";
import { Recipe } from "./Recipe.js";
import { BacktrackParams, FlowbuildConfig, PathLayout } from "./Config.js";
import { Move } from "./Move.js";
import { Graph, Path } from "./Graph.js";
import { Arrow } from "./grid.js";
import { DefaultMove } from "./DefaultMove.js";
import { default_config } from "./Configs/Default.js";

const size = new Vec2(7, 10);
export class Flowbuild {
    readonly grid: Grid;
    #graph: Graph;
    #config: FlowbuildConfig;
    #backtrack_order: Array<string>;

    constructor(recipe: Recipe, config: FlowbuildConfig) {
        this.grid = new Grid(size.x, size.y);
        this.#graph = recipe.CreateGraph();
        
        const hor_spacing_order = [];
        const ver_padding_order = [];
        for (let i = 0; i < config.hor_spacing_order.length; ++i) {
            let val = Math.round(config.hor_spacing_order[i] * size.x);
            if (val == 0)
                val = 1;
            if (i > 0 && hor_spacing_order[hor_spacing_order.length - 1] != val)
                hor_spacing_order.push(val);
        }
        for (let i = 0; i < config.ver_padding_order.length; ++i) {
            let val = Math.round(config.ver_padding_order[i] * size.y);
            if (val == 0)
                val = 1;
            if (i > 0 && ver_padding_order[ver_padding_order.length - 1] != val)
                ver_padding_order.push(val);
        }
        this.#config = new FlowbuildConfig(config.layout_order, hor_spacing_order, ver_padding_order);

        this.#backtrack_order = [];
        this.RecursiveCreateBacktrackOrder(this.#graph.start);
        this.#backtrack_order.shift();

        this.grid.SetText("START", new Vec2(Math.floor(size.x / 2), 0));
        this.grid.SetText("END", new Vec2(Math.floor(size.x / 2) + 1, size.y - 1));

        const success = this.Backtrack(0, 0, 0, 0);
        console.log("Backtrack success ", success);
        if (!success)
            this.grid = null;
    }

    RecursiveCreateBacktrackOrder(path: Path): void {
        if (this.#backtrack_order.includes(path.Head()))
            return;
        for (const parent of path.parents) {
            if (!this.#backtrack_order.includes(parent.Head()))
                this.RecursiveCreateBacktrackOrder(parent);
        }
        this.#backtrack_order.push(path.Head());
        for (const child of path.childs)
            this.RecursiveCreateBacktrackOrder(child);
    }
    Backtrack(backtrack_index: number, layout_index: number, hor_spacing_index: number, ver_padding_index: number): boolean {
        if (backtrack_index == this.#backtrack_order.length)
            return true;

        const move = new DefaultMove(this.#graph, this.grid).CreateMove(this.#backtrack_order[backtrack_index],
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

        if (layout_index < this.#config.layout_order.length - 1)
            return this.Backtrack(backtrack_index, layout_index + 1, hor_spacing_index, ver_padding_index);
        else if (hor_spacing_index < this.#config.hor_spacing_order.length - 1)
            return this.Backtrack(backtrack_index, layout_index, hor_spacing_index + 1, ver_padding_index);
        else if (ver_padding_index < this.#config.ver_padding_order.length - 1)
            return this.Backtrack(backtrack_index, layout_index, hor_spacing_index, ver_padding_index + 1);
        else 
            return false;
    }

    DoMove(move: Move): void {
        for (const text_coords of move.boxes)
            this.grid.SetText(text_coords.text, text_coords.coords);
        for (const arrows of move.arrows) {
            for (const arrow_coords of arrows)
                this.grid.OverlapArrow(arrow_coords.arrow, arrow_coords.coords);
        }
        for (const sync_line_coords of move.sync_lines)
            this.grid.SetSyncLine(sync_line_coords.sync_line, sync_line_coords.coords);
    }
    UndoMove(move: Move): void {
        for (const text_coords of move.boxes)
            this.grid.SetText("", text_coords.coords);
        for (const arrows of move.arrows) {
            for (const arrow_coords of arrows)
                this.grid.SetArrow(new Arrow(), arrow_coords.coords);
        }
        for (const sync_line_coords of move.sync_lines)
            this.grid.SetSyncLine(new SyncLine(), sync_line_coords.coords);
    }
}