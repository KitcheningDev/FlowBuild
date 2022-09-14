import { Graph, Path } from "./Graph.js";
import { Recipe } from "./Recipe.js";
import { Arrow, Grid, Vec2 } from "./Grid.js";

enum PathLayout {
    Straight, Alternate
}

export class Flowbuild {
    grid: Grid;
    #graph: Graph;
    #path_coords_in: Map<Path, Vec2>;
    #path_coords_out: Map<Path, Vec2>; 

    constructor(recipe: Recipe) {
        this.#graph = recipe.CreateGraph();
        this.grid = new Grid(this.GridBounds());
        this.#path_coords_in = new Map<Path, Vec2>();
        this.#path_coords_out = new Map<Path, Vec2>();
        this.SetPathCoords();

        this.FillGrid();
    }

    private PathBounds(path: Path): Vec2 {
        if (path.nodes.length < 4)
            return new Vec2(1, path.nodes.length);
        else 
            return new Vec2(2, Math.ceil(path.nodes.length / 2));
    }
    private DepthBounds(): Vec2[] {
        const depth_bounds = [];
        for (let i = 0; i <= this.#graph.end.advanced.depth; ++i)
            depth_bounds.push(new Vec2());
        for (const path of this.#graph.path_map.values()) {
            const bounds = this.PathBounds(path);
            if (path.childs.length == 0) {
                depth_bounds[path.advanced.depth].x += bounds.x;
                if (depth_bounds[path.advanced.depth].y < bounds.y)
                    depth_bounds[path.advanced.depth].y = bounds.y;
            }
            for (let i = path.advanced.depth; i < path.advanced.depth + path.advanced.depth_diff; ++i) {
                depth_bounds[i].x += bounds.x;
                if (depth_bounds[i].y < bounds.y)
                    depth_bounds[i].y = bounds.y;
            }
        }
        return depth_bounds;
    }
    private GridBounds(): Vec2 {
        const height_bounds = this.DepthBounds();
        const out = new Vec2();
        for (const bounds of height_bounds) {
            if (out.x < bounds.x)
                out.x = bounds.x;
            out.y += bounds.y + 1;
        }
        if (out.x % 2 == 0)
            out.x++;
        return out;
    }
    private PathLayout(path: Path): PathLayout {
        if (path.nodes.length < 4)
            return PathLayout.Straight;
        else 
            return PathLayout.Alternate;
    }

    private SetPathCoords(): void {
        const depth_bounds = this.DepthBounds();
        const coords = new Vec2();
        for (let depth = 0; depth <= this.#graph.end.advanced.depth; ++depth) {
            coords.x = Math.floor((this.grid.size.x - depth_bounds[depth].x) / 2);
            for (const path of this.#graph.depth_map[depth]) {
                console.log(path.Head(), coords);
                this.#path_coords_in.set(path, coords.Copy());
                switch(this.PathLayout(path)) {
                    case PathLayout.Straight:
                        this.#path_coords_out.set(path, new Vec2(0, this.PathBounds(path).y - 1).AddVec(coords));
                        break;
                    case PathLayout.Alternate:
                        if (path.nodes.length % 4 == 0 || path.nodes.length % 4 == 3)
                            this.#path_coords_out.set(path, new Vec2(0, depth_bounds[depth].y - 1).AddVec(coords));
                        else 
                            this.#path_coords_out.set(path, new Vec2(1, depth_bounds[depth].y - 1).AddVec(coords));
                        break;
                }
                coords.x += this.PathBounds(path).x;
            }
            coords.y += depth_bounds[depth].y + 1;
        }
    }


    private FillGrid(): void {
        for (const [path, head_coords] of this.#path_coords_in.entries()) {
            switch(this.PathLayout(path)) {
                case PathLayout.Straight:
                    this.FillPathStraight(path, head_coords);
                    break;
                case PathLayout.Alternate:
                    this.FillPathAlternate(path, head_coords);
                    break;
            }
        }
        for (const path of this.#graph.path_map.values()) {
            for (const child of path.childs)
                this.CreateConnection(this.#path_coords_out.get(path), this.#path_coords_in.get(child));
        }
    }
    private CreateConnection(from: Vec2, to: Vec2): void {
        this.grid.OverlapArrow(new Arrow(false, false, true, false), from);
        this.grid.OverlapArrow(new Arrow(true, false, false, false), new Vec2(0, 1).AddVec(from));

        const minx = Math.min(from.x, to.x);
        const maxx = Math.max(from.x, to.x);
        for (let x = minx; x <= maxx; x++) {
            if (x != minx)
                this.grid.OverlapArrow(new Arrow(false, false, false, true), new Vec2(x, from.y + 1));
            if (x != maxx)
                this.grid.OverlapArrow(new Arrow(false, true, false, false), new Vec2(x, from.y + 1));
        }

        this.grid.OverlapArrow(new Arrow(false, false, true, false), new Vec2(0, -1).AddVec(to));
        this.grid.OverlapArrow(new Arrow(true, false, false, false), to);
    }
    private FillPathStraight(path: Path, head_coords: Vec2): void {
        for (let i = 0; i < path.nodes.length; ++i) {
            const coords = new Vec2(0, i).AddVec(head_coords);
            this.grid.SetText(path.nodes[i], coords);

            if (i != 0)
                this.grid.OverlapArrow(new Arrow(true, false, false, false), coords);
            if (i != path.nodes.length - 1)
                this.grid.OverlapArrow(new Arrow(false, false, true, false), coords);
        }
    }
    private FillPathAlternate(path: Path, head_coords: Vec2): void {
        for (let i = 0; i < path.nodes.length; ++i) {
            let ver = 0;
            if (i % 4 == 1 || i % 4 == 2) 
                ver = 1;
            const coords = new Vec2(ver, Math.floor(i / 2)).AddVec(head_coords);
            this.grid.SetText(path.nodes[i], coords);
            
            if (i != 0) {
                if (i % 4 == 0 || i % 4 == 2)
                    this.grid.OverlapArrow(new Arrow(true, false, false, false), coords);
                else if (i % 4 == 1)
                    this.grid.OverlapArrow(new Arrow(false, false, false, true), coords);
                else
                    this.grid.OverlapArrow(new Arrow(false, true, false, false), coords);
            }
            if (i != path.nodes.length - 1) {
                if (i % 4 == 0)
                    this.grid.OverlapArrow(new Arrow(false, true, false, false), coords);
                else if (i % 4 == 1 || i % 4 == 3)
                    this.grid.OverlapArrow(new Arrow(false, false, true, false), coords);
                else
                    this.grid.OverlapArrow(new Arrow(false, false, false, true), coords);
            }
        }
    }
}