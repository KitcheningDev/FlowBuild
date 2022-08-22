import { Graph, Path } from "./Graph.js";
import { Grid, Vec2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Arrow, Tile, SyncLine } from "./grid.js";
import { Recipe } from "./Recipe.js";

class PathGrid {
    origin: Vec2;
    shift: number;
    readonly in: Vec2;
    readonly out: Vec2;
    readonly grid: Grid;
    readonly path: Path;

    constructor(path: Path) {
        this.origin = new Vec2();
        this.in = new Vec2();
        this.path = path;
        this.shift = 0;

        if (path.nodes.length > 3) {
            this.out = new Vec2(path.nodes.length % 2, Math.floor(path.nodes.length / 2));
            this.grid = new Grid(new Vec2(2, Math.ceil(path.nodes.length / 2)));

            for (let i = 0; i < path.nodes.length; ++i) {
                let ver = 0;
                if (i % 4 == 1 || i % 4 == 2) 
                    ver = 1;
                const coords = new Vec2(ver, Math.floor(i / 2));
                this.grid.SetText(path.nodes[i], coords);

                if (i != 0) {
                    if (i % 4 == 0 || i % 4 == 2)
                        this.grid.OverlapArrow(ArrowUp(), coords);
                    else if (i % 4 == 1)
                        this.grid.OverlapArrow(ArrowLeft(), coords);
                    else
                        this.grid.OverlapArrow(ArrowRight(), coords);
                }
                if (i != path.nodes.length - 1) {
                    if (i % 4 == 0)
                        this.grid.OverlapArrow(ArrowRight(), coords);
                    else if (i % 4 == 1 || i % 4 == 3)
                        this.grid.OverlapArrow(ArrowDown(), coords);
                    else
                        this.grid.OverlapArrow(ArrowLeft(), coords);
                }
            }
        }
        else {

            this.out = new Vec2(0, path.nodes.length - 1);
            this.grid = new Grid(new Vec2(1, path.nodes.length));
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

class Arrangement {
    origin: Vec2;
    size: Vec2;
    members: Arrangement[];
    is_hor: boolean;
    path: Path;

    constructor() {
        this.origin = new Vec2();
        this.size = new Vec2();
        this.members = [];
        this.is_hor = true;
        this.path = null;
    }

    Top(): Vec2 {
        return new Vec2(this.origin.x, this.origin.y + this.size.y);
    }
    Left(): Vec2 {
        return new Vec2(this.origin.x + this.size.x, this.origin.y);
    }

    CalcSize(): void {
        if (this.is_hor) {
            this.size.x = this.members[this.members.length - 1].Left().x;
            this.size.y = 0;
            for (const member of this.members)
                this.size.y = Math.max(member.size.y, this.size.y);
        }
        else {
            this.size.y = this.members[this.members.length - 1].Top().y;
            this.size.x = 0;
            for (const member of this.members)
                this.size.x = Math.max(member.size.x, this.size.x);
        }
    }

    CalcOrigin(from: number = 0, to: number = this.members.length - 1): void {
        if (this.is_hor) {
            if (from == 0) {
                this.members[0].origin.x = 0;
                from++;   
            }
            for (let i = from; i <= to; ++i)
                this.members[i].origin.x = this.members[i - 1].Left().x;
        }
        else {
            if (from == 0) {
                this.members[0].origin.y = 0;
                from++;   
            }
            for (let i = from; i <= to; ++i)
                this.members[i].origin.y = this.members[i - 1].Top().y;
        }
    }

    SwapMembers(i1: number, i2: number): void {
        if (i1 == i2)
            return;
        if (i1 > i2)
            return this.SwapMembers(i2, i1);
        const temp = this.members[i1];
        this.members[i1] = this.members[i2];
        this.members[i2] = temp;
        this.CalcOrigin(i1, i2);
    }

    Copy(): Arrangement {
        const out = new Arrangement();
        out.origin = this.origin.Copy();
        out.size = this.size.Copy();
        for (const member of this.members)
            out.members.push(member.Copy());
        out.is_hor = this.is_hor;
        out.path = this.path;
        return out;
    }
}
function TieToArrangement(members: Arrangement[], is_hor: boolean): Arrangement {
    if (members.length == 0)
        return null;
    else if (members.length == 1)
        return members[0];
    
    const out = new Arrangement();
    out.members = members;
    out.is_hor = is_hor;
    out.CalcOrigin()
    out.CalcSize();
    return out;
}

const depth_padding = 1;
export class Flowbuild {
    grid: Grid;
    #graph: Graph;
    #path_grids: Map<Path, PathGrid>;
    #arrangement: Arrangement;
    
    #best_arr: Arrangement;
    #best_eval: number;

    #depth_heights: Array<number>;
    #depth_widths: Array<number>;

    constructor(recipe: Recipe) {
        this.#graph = recipe.CreateGraph();

        this.#path_grids = new Map<Path, PathGrid>();
        for (const path of this.#graph.path_map.values())
            this.#path_grids.set(path, new PathGrid(path));
        
        this.#depth_heights = [0];
        this.#depth_widths = [1];
        this.#arrangement = this.CreateArrangement();

        this.#best_arr = this.#arrangement;
        this.#best_eval = this.EvalPermutation();
        this.Permutate(this.#arrangement, 0);
        this.#arrangement = this.#best_arr;

        this.grid = new Grid(this.#arrangement.size);
        this.SetGridPathOrigins();
        this.ShiftCoords();

        console.log(this.#arrangement);
        for (const path_grid of this.#path_grids.values())
            console.log(path_grid.path.Head(), path_grid.path.advanced.depth);

        this.FillGrid();
    }

    // arrangement
    private CreatePathArrangement(path: Path): Arrangement {
        const out = new Arrangement();
        out.size = this.#path_grids.get(path).grid.size;
        out.path = path;
        return out;
    }
    private CreateDepthArrangement(depth: number): Arrangement {
        const members = [];
        for (const path of this.#graph.depth_map[depth]) {
            if (path.advanced.depth_diff <= 1)
                members.push(this.CreatePathArrangement(path))
        }
        return TieToArrangement(members, true);
    }
    private CreateArrangement(depth: number = this.#graph.depth): Arrangement {
        if (depth == 0)
            return this.CreateDepthArrangement(0);
        const former_arr = this.CreateArrangement(depth - 1);
        this.#depth_heights.push(former_arr.size.y + depth_padding);
        const curr_depth_arr = this.CreateDepthArrangement(depth);
        const curr_arr_members = [TieToArrangement([former_arr, curr_depth_arr], false)];
        for (const path of this.#graph.path_map.values()) {
            if (path.advanced.depth_diff > 1 && path.advanced.depth + path.advanced.depth_diff == depth + 1) {
                const arr = this.CreatePathArrangement(path);
                arr.origin.y = this.#depth_heights[path.advanced.depth];
                curr_arr_members.push(arr);
            }
        }
        const out = TieToArrangement(curr_arr_members, true);
        this.#depth_widths.push(out.size.x);
        return out;
    }

    private EvalPermutation(): number {
        let x = 0;
        for (const path of this.#graph.path_map.values()) {
            for (const child of path.childs)
                x += Math.abs(this.#path_grids.get(path).GlobalOut().x - this.#path_grids.get(child).GlobalIn().x);
        }
        return x;
    }
    private Permutate(arr: Arrangement = this.#arrangement, index: number): void {
        if (arr.path == this.#graph.start) {
            this.SetGridPathOrigins();
            const new_eval = this.EvalPermutation();
            if (new_eval < this.#best_eval) {
                console.log(new_eval, this.#best_eval);
                this.#best_eval = new_eval;
                this.#best_arr = this.#arrangement.Copy();
            }
            return;
        }
        if (index == arr.members.length - 1 || !arr.is_hor) {
            for (const member of arr.members)
                this.Permutate(member, 0);
        }
        for (let i = index; i < arr.members.length; ++i) {
            arr.SwapMembers(index, i);
            this.Permutate(arr, index + 1);
            arr.SwapMembers(index, i);
        }
    }

    private SetGridPathOrigins(arr: Arrangement = this.#arrangement, off: Vec2 = new Vec2()): void {
        for (const member of arr.members) {
            if (member.path)
                this.#path_grids.get(member.path).origin = off.Copy().AddVec(member.origin);
            else 
                this.SetGridPathOrigins(member, off.Copy().AddVec(member.origin));
        }
        if (arr == this.#arrangement)
            this.ShiftCoords();
    }
    private ShiftCoords(): void {
        for (const depth_paths of this.#graph.depth_map) {
            let max_x = -1;
            for (const path of depth_paths) {
                max_x = Math.max(this.#path_grids.get(path).origin.x + this.#arrangement.size.x - 1, max_x);
            }
            let whole_shift = Math.floor((this.#arrangement.size.x - max_x - 1) / 2);
            let frac_shift = 0;
            if ((this.#arrangement.size.x % 2) == (max_x % 2))
                frac_shift += 0.5;
            for (const path of depth_paths) {
                this.#path_grids.get(path).origin.x += whole_shift;
                this.#path_grids.get(path).shift = frac_shift;
            }
        }
    }

    private FillGrid(): void {
        for (const path_grid of this.#path_grids.values())
            this.grid.SetSubGrid(path_grid.grid, path_grid.origin, path_grid.shift);
        for (const path_grid of this.#path_grids.values()) {
            console.log(path_grid.path.Head(), path_grid.origin);
            for (const child of path_grid.path.childs) {
                this.CreateConnection(path_grid.GlobalOut(), this.#path_grids.get(child).GlobalIn())
            }
        }
        this.CreateSyncLines();
    }
    private CreateSyncLines(): void {
        for (const path of this.#graph.path_map.values()) {
            if (path.childs.length > 1) {
                let min_x = 999;
                let max_x = -1;
                for (const child of path.childs) {
                    let x = this.#path_grids.get(child).GlobalIn().x;
                    min_x = Math.min(x, min_x);
                    max_x = Math.max(x, max_x);
                }

                for (let x = min_x; x <= max_x; ++x)
                    this.grid.OverlapSyncLine(new SyncLine(true, false), new Vec2(x, this.#path_grids.get(path.childs[0]).GlobalIn().y));
            }
            if (path.parents.length > 1) {
                let min_x = 999;
                let max_x = -1;
                for (const parent of path.parents) {
                    let x = this.#path_grids.get(parent).GlobalOut().x;
                    min_x = Math.min(x, min_x);
                    max_x = Math.max(x, max_x);
                }

                for (let x = min_x; x <= max_x; ++x)
                    this.grid.OverlapSyncLine(new SyncLine(false, true), new Vec2(x, this.#path_grids.get(path).GlobalIn().y - 2));
            }
        }
    }
    private CreateConnection(from: Vec2, to: Vec2): void {
        return;
        for (let y = from.y; y < to.y; ++y) {
            if (y != from.y)
                this.grid.OverlapArrow(ArrowUp(), new Vec2(from.x, y));
            if (y != to.y - 1)
                this.grid.OverlapArrow(ArrowDown(), new Vec2(from.x, y));
        }
        const min_x = Math.min(from.x, to.x);
        const max_x = Math.max(from.x, to.x); 
        for (let x = min_x; x <= max_x; ++x) {
            if (x != min_x)
                this.grid.OverlapArrow(ArrowLeft(), new Vec2(x, to.y - 1));
            if (x != max_x)
                this.grid.OverlapArrow(ArrowRight(), new Vec2(x, to.y - 1));
        }
        this.grid.OverlapArrow(ArrowDown(), new Vec2(0, -1).AddVec(to));
        this.grid.OverlapArrow(ArrowUp(), to);
    }
}