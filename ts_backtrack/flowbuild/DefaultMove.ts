import { Graph } from "./Graph.js";
import { Grid, Arrow, SyncLine, Vec2 } from "./Grid.js";
import { Move, TextCoords, ArrowCoords, SyncLineCoords } from "./Move.js";
import { BacktrackParams, PathLayout } from "./Config.js";

export class DefaultMove
{
    readonly #graph: Graph;
    readonly #grid: Grid;

    constructor(graph: Graph, grid: Grid) {
        this.#graph = graph;
        this.#grid = grid;
    }

    // backtrack utils
    private ArithmAvgX(text: string): number {
        let avg = 0;
        const node = this.#graph.node_map.get(text);
        for (const parent of node.parents)
            avg += this.#grid.GetPos(parent).x;
        return Math.round(avg / node.parents.length);
    }
    private MaxY(text: string): number {
        let max = 0;
        for (let parent of this.#graph.node_map.get(text).parents) {
            if (max < this.#grid.GetPos(parent).y)
                max = this.#grid.GetPos(parent).y;
        }
        return max;
    }
    private BoundsX(text: string): Array<number> {
        let min = 999;
        let max = 0;
        for (let parent of this.#graph.node_map.get(text).parents) {
            if (max < this.#grid.GetPos(parent).x)
                max = this.#grid.GetPos(parent).x;
            if (min > this.#grid.GetPos(parent).x)
                min = this.#grid.GetPos(parent).x;
        }
        return [min, max];
    }
    private ChildOff(text: string): number {
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
    private PathToArrowCoords(path: Array<Vec2>): Array<ArrowCoords> {
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
    private BTS(from: Vec2, to: Vec2, move: Move): Array<Vec2> {
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
                    if (!this.#grid.InBounds(new_coords) || this.#grid.Get(new_coords).text != "")
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
        if (head == "END")
            return move;
        const node = this.#graph.node_map.get(head);
        const path = this.#graph.path_map.get(head);

        const head_coords = new Vec2(
            this.ArithmAvgX(head) + this.ChildOff(head) * params.hor_spacing,
            this.MaxY(head) + params.ver_padding);
        if (path.parents.length > 1)
            head_coords.y++;
        if (!this.#grid.InBounds(head_coords) || !this.#grid.IsEmpty(head_coords)) {
            console.log("failed head coords", head_coords, this.#grid.IsEmpty(head_coords), this.#grid.Get(head_coords).sync_line.IsEmpty(), this.#grid.Get(head_coords).arrow);
            return null;
        }
        else 
            console.log("head coords", head_coords);

        if (path.parents.length == 1) {
            move.arrows.push(this.PathToArrowCoords(this.BTS(this.#grid.GetPos(node.parents[0]), head_coords, move)));
        }
        else {
            const bounds = this.BoundsX(head);
            for (let i = bounds[0]; i <= bounds[1]; ++i)
                move.sync_lines.push(new SyncLineCoords(new SyncLine(false, true), new Vec2(i, head_coords.y - 1)));
            for (const parent of node.parents)
                move.arrows.push(this.PathToArrowCoords(this.BTS(this.#grid.GetPos(parent), new Vec2(this.#grid.GetPos(parent).x, head_coords.y - 1), move)));
            move.arrows.push(this.PathToArrowCoords(this.BTS(new Vec2(0, -1).AddVec(head_coords), head_coords, move)));
        }

        /*
        for (const parent of node.parents) {
            const path = this.BTS(this.#grid.GetPos(parent), head_coords, move);
            if (path == null) {
                console.log("failed path");
                return null;
            }
            const arrows = this.PathToArrowCoords(path);
            for (const arrow of arrows)
                move.arrows.push(arrow);
        }
        */

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
            if (!this.#grid.InBounds(coords) || !this.#grid.IsEmpty(coords)) {
                console.log("failed node coords", coords);
                return null;
            }
            move.boxes.push(new TextCoords(path.nodes[i], coords));
        }

        for (let i = 1; i < move.boxes.length; ++i)
            move.arrows.push(this.PathToArrowCoords(this.BTS(move.boxes[i - 1].coords, move.boxes[i].coords, move)));

        return move;
    }
}