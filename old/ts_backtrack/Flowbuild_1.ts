import { Graph } from "./Graph.js";
import { Arrow, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Grid, SyncLine, Vec2 } from "./Grid.js";
import { Recipe } from "./Recipe.js";
import { Path } from "./Graph.js";

function Swap(arr: Array<Path>, i1: number, i2: number): void {
    if (i1 == i2)
        return;
    const temp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = temp;
}

class PathGrid {
    origin: Vec2;
    readonly in: Vec2;
    readonly out: Vec2;
    readonly grid: Grid;

    constructor(path: Path) {
        this.origin = new Vec2();
        this.in = new Vec2();
        
        if (path.nodes.length > 3 && 0) {
            this.grid = new Grid(new Vec2(2, Math.ceil(path.nodes.length / 2)));
            this.out = new Vec2(path.nodes.length % 2, Math.floor(path.nodes.length / 2));
        }
        else {
            this.grid = new Grid(new Vec2(1, path.nodes.length));
            this.out = new Vec2(0, path.nodes.length - 1);
            for (let i = 0; i < path.nodes.length; ++i) {
                const coords = new Vec2(0, i);
                this.grid.SetText(path.nodes[i], coords);

                if (i != 0)
                    this.grid.OverlapArrow(ArrowUp(), coords);
                if (i != path.nodes.length - 1)
                    this.grid.OverlapArrow(ArrowDown(), coords);
            }
        }
    }

    GlobalIn(): Vec2 {
        return this.origin.Copy().AddVec(this.in);
    }
    GlobalOut(): Vec2 {
        return this.origin.Copy().AddVec(this.out);
    }
}

export class Flowbuild {
    grid: Grid;
    #graph: Graph;

    #pathgrids: Map<Path, PathGrid>;
    #depth_map: Array<Array<Path>>;
    #best_depth_map: Array<Array<Path>>;
    #best_depth_eval: number;

    constructor(recipe: Recipe) {
        this.#graph = recipe.CreateGraph();    
        this.#pathgrids = new Map<Path, PathGrid>();

        for (const path of this.#graph.path_map.values())
            this.#pathgrids.set(path, new PathGrid(path));

        this.grid = new Grid(this.GridBounds());
        this.#depth_map = [...this.#graph.depth_map];
        this.#best_depth_map = [...this.#graph.depth_map];
        this.#best_depth_eval = this.EvalDepthMap();
        this.PermutateIndex(1, 0);
        this.#depth_map = this.#best_depth_map;
        
        //let min_eval = this.EvalDepthMap();
        //for ()
        this.SetOrigin();
        this.FillGrid();
    }

    private PermutateIndex(depth: number, index: number): void {
        if (index == this.#depth_map[depth].length) {
            if (depth == this.#graph.depth) {
                const new_eval = this.EvalDepthMap();
                if (new_eval >= this.#best_depth_eval) {
                    console.log(new_eval, this.#best_depth_eval);
                    this.#best_depth_map = [];
                    for (let depth = 0; depth <= this.#graph.depth; ++depth)
                        this.#best_depth_map.push([...(this.#depth_map[depth])]);
                    this.#best_depth_eval = new_eval;
                    console.log(...this.#best_depth_map[1]);
                }
                return;
            }
            this.PermutateIndex(depth + 1, 0);
        }
        for (let i = index; i < this.#depth_map[depth].length; ++i) {
            Swap(this.#depth_map[depth], index, i);
            this.PermutateIndex(depth, index + 1);
            Swap(this.#depth_map[depth], index, i);
        }
    }
    private EvalDepthMap(): number {
        let x_diff = 0;
        this.SetOrigin();
        for (let depth = 1; depth < this.#depth_map.length; ++depth) {
            for (const path of this.#depth_map[depth]) {
                for (const child of path.childs)
                    x_diff += Math.abs(this.#pathgrids.get(path).GlobalOut().x - this.#pathgrids.get(child).GlobalIn().x);
            }
        }
        return x_diff;
    }

    private SetOrigin(): void {
        let y_off = 0;
        for (let depth = 0; depth <= this.#graph.depth; ++depth) {
            const depth_bounds = this.DepthBounds(depth);
            let x_off = Math.floor((this.grid.size.x - depth_bounds.x) / 2);
            for (const path of this.#depth_map[depth]) {
                this.#pathgrids.get(path).origin = new Vec2(x_off, y_off);
                x_off += this.#pathgrids.get(path).grid.size.x;
            }
            y_off += depth_bounds.y + 1;
        }
    }
    private DepthBounds(depth: number): Vec2 {
        const out = new Vec2();
        for (const path of this.#graph.depth_map[depth]) {
            const path_bounds = this.#pathgrids.get(path).grid.size;
            out.x += path_bounds.x;
            out.y = Math.max(path_bounds.y, out.y);
        }
        return out;
    }
    private GridBounds(): Vec2 {
        const out = new Vec2();
        for (let depth = 0; depth <= this.#graph.depth; ++depth) {
            const depth_bounds = this.DepthBounds(depth);
            out.x = Math.max(depth_bounds.x, out.x);
            out.y += depth_bounds.y + 1;
        }
        return out;
    }
    private FillGrid(): void {
        for (const path of this.#graph.path_map.values()) {
            const pathgrid = this.#pathgrids.get(path);
            this.grid.SetSubGrid(pathgrid.grid, pathgrid.origin);
            this.CreateParentConnections(path);
        }
        /*
        if (this.#graph.path_map.size == 2)
            return;
        for (let x = 0; x < this.grid.size.x; ++x)
            this.grid.SetSyncLine(new SyncLine(true, false), new Vec2(x, 2));
        */
    }
    private CreateParentConnections(path: Path): void {
        if (path == this.#graph.start)
            return;
        if (path.parents.length > 1) {
            let minx = 999;
            let maxx = 0;
            for (const parent of path.parents) {
                const out = this.#pathgrids.get(parent).GlobalOut();
                if (minx > out.x)
                    minx = out.x;
                if (maxx < out.x)
                    maxx = out.x;
                //this.CreateConnection(out, new Vec2(out.x, this.#pathgrids.get(path).origin.y - 1));
            }
            //this.CreateConnection(new Vec2(0, -1).AddVec(this.#pathgrids.get(path).origin), this.#pathgrids.get(path).origin);
            for (let x = minx; x <= maxx; ++x)
                this.grid.SetSyncLine(new SyncLine(false, true), new Vec2(x, this.#pathgrids.get(path).origin.y - 2));
        }
        else if (path.parents[0].childs.length > 1) {
            let minx = 999;
            let maxx = 0;
            for (const child of path.parents[0].childs) {
                const out = this.#pathgrids.get(child).GlobalOut();
                if (minx > out.x)
                    minx = out.x;
                if (maxx < out.x)
                    maxx = out.x;
                //this.CreateConnection(new Vec2(0, -1).AddVec(out), out);
            }
            //this.CreateConnection(this.#pathgrids.get(path).origin, this.#pathgrids.get(path).origin);
            for (let x = minx; x <= maxx; ++x)
                this.grid.SetSyncLine(new SyncLine(true, false), new Vec2(x, this.#pathgrids.get(path).origin.y));
        }
        else {
            for (const parent of path.parents) {
                if (parent == this.#graph.start)
                    continue;
                const from = this.#pathgrids.get(parent).GlobalOut();
                const to = this.#pathgrids.get(path).GlobalIn();
                this.CreateConnection(from, to);
            }
        }
    }
    private CreateConnection(from: Vec2, to: Vec2): void {
        this.grid.OverlapArrow(ArrowDown(), from);  
        for (let y = from.y + 1; y < to.y - 1; ++y) {
            this.grid.OverlapArrow(ArrowUp(), new Vec2(from.x, y));
            this.grid.OverlapArrow(ArrowDown(), new Vec2(from.x, y));
        }
        this.grid.OverlapArrow(ArrowUp(), new Vec2(from.x, to.y - 1));
        
        const minx = Math.min(from.x, to.x);
        const maxx = Math.max(from.x, to.x);
        for (let x = minx; x <= maxx; x++) {
            if (x != minx)
                this.grid.OverlapArrow(ArrowLeft(), new Vec2(x, to.y - 1));
            if (x != maxx)
                this.grid.OverlapArrow(ArrowRight(), new Vec2(x, to.y - 1));
        }

        this.grid.OverlapArrow(ArrowDown(), new Vec2(0, -1).AddVec(to));
        this.grid.OverlapArrow(ArrowUp(), to);
    }
}