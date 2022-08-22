var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Flowbuild_graph, _Flowbuild_path_grids, _Flowbuild_arrangement, _Flowbuild_best_arr, _Flowbuild_best_eval, _Flowbuild_depth_heights, _Flowbuild_depth_widths;
import { Grid, Vec2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, SyncLine } from "./grid.js";
class PathGrid {
    constructor(path) {
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
    GlobalIn() {
        return this.origin.Copy().AddVec(this.in);
    }
    GlobalOut() {
        return this.origin.Copy().AddVec(this.out);
    }
}
class Arrangement {
    constructor() {
        this.origin = new Vec2();
        this.size = new Vec2();
        this.members = [];
        this.is_hor = true;
        this.path = null;
    }
    Top() {
        return new Vec2(this.origin.x, this.origin.y + this.size.y);
    }
    Left() {
        return new Vec2(this.origin.x + this.size.x, this.origin.y);
    }
    CalcSize() {
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
    CalcOrigin(from = 0, to = this.members.length - 1) {
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
    SwapMembers(i1, i2) {
        if (i1 == i2)
            return;
        if (i1 > i2)
            return this.SwapMembers(i2, i1);
        const temp = this.members[i1];
        this.members[i1] = this.members[i2];
        this.members[i2] = temp;
        this.CalcOrigin(i1, i2);
    }
    Copy() {
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
function TieToArrangement(members, is_hor) {
    if (members.length == 0)
        return null;
    else if (members.length == 1)
        return members[0];
    const out = new Arrangement();
    out.members = members;
    out.is_hor = is_hor;
    out.CalcOrigin();
    out.CalcSize();
    return out;
}
const depth_padding = 1;
export class Flowbuild {
    constructor(recipe) {
        _Flowbuild_graph.set(this, void 0);
        _Flowbuild_path_grids.set(this, void 0);
        _Flowbuild_arrangement.set(this, void 0);
        _Flowbuild_best_arr.set(this, void 0);
        _Flowbuild_best_eval.set(this, void 0);
        _Flowbuild_depth_heights.set(this, void 0);
        _Flowbuild_depth_widths.set(this, void 0);
        __classPrivateFieldSet(this, _Flowbuild_graph, recipe.CreateGraph(), "f");
        __classPrivateFieldSet(this, _Flowbuild_path_grids, new Map(), "f");
        for (const path of __classPrivateFieldGet(this, _Flowbuild_graph, "f").path_map.values())
            __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").set(path, new PathGrid(path));
        __classPrivateFieldSet(this, _Flowbuild_depth_heights, [0], "f");
        __classPrivateFieldSet(this, _Flowbuild_depth_widths, [1], "f");
        __classPrivateFieldSet(this, _Flowbuild_arrangement, this.CreateArrangement(), "f");
        __classPrivateFieldSet(this, _Flowbuild_best_arr, __classPrivateFieldGet(this, _Flowbuild_arrangement, "f"), "f");
        __classPrivateFieldSet(this, _Flowbuild_best_eval, this.EvalPermutation(), "f");
        this.Permutate(__classPrivateFieldGet(this, _Flowbuild_arrangement, "f"), 0);
        __classPrivateFieldSet(this, _Flowbuild_arrangement, __classPrivateFieldGet(this, _Flowbuild_best_arr, "f"), "f");
        this.grid = new Grid(__classPrivateFieldGet(this, _Flowbuild_arrangement, "f").size);
        this.SetGridPathOrigins();
        this.ShiftCoords();
        console.log(__classPrivateFieldGet(this, _Flowbuild_arrangement, "f"));
        for (const path_grid of __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").values())
            console.log(path_grid.path.Head(), path_grid.path.advanced.depth);
        this.FillGrid();
    }
    // arrangement
    CreatePathArrangement(path) {
        const out = new Arrangement();
        out.size = __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(path).grid.size;
        out.path = path;
        return out;
    }
    CreateDepthArrangement(depth) {
        const members = [];
        for (const path of __classPrivateFieldGet(this, _Flowbuild_graph, "f").depth_map[depth]) {
            if (path.advanced.depth_diff <= 1)
                members.push(this.CreatePathArrangement(path));
        }
        return TieToArrangement(members, true);
    }
    CreateArrangement(depth = __classPrivateFieldGet(this, _Flowbuild_graph, "f").depth) {
        if (depth == 0)
            return this.CreateDepthArrangement(0);
        const former_arr = this.CreateArrangement(depth - 1);
        __classPrivateFieldGet(this, _Flowbuild_depth_heights, "f").push(former_arr.size.y + depth_padding);
        const curr_depth_arr = this.CreateDepthArrangement(depth);
        const curr_arr_members = [TieToArrangement([former_arr, curr_depth_arr], false)];
        for (const path of __classPrivateFieldGet(this, _Flowbuild_graph, "f").path_map.values()) {
            if (path.advanced.depth_diff > 1 && path.advanced.depth + path.advanced.depth_diff == depth + 1) {
                const arr = this.CreatePathArrangement(path);
                arr.origin.y = __classPrivateFieldGet(this, _Flowbuild_depth_heights, "f")[path.advanced.depth];
                curr_arr_members.push(arr);
            }
        }
        const out = TieToArrangement(curr_arr_members, true);
        __classPrivateFieldGet(this, _Flowbuild_depth_widths, "f").push(out.size.x);
        return out;
    }
    EvalPermutation() {
        let x = 0;
        for (const path of __classPrivateFieldGet(this, _Flowbuild_graph, "f").path_map.values()) {
            for (const child of path.childs)
                x += Math.abs(__classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(path).GlobalOut().x - __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(child).GlobalIn().x);
        }
        return x;
    }
    Permutate(arr = __classPrivateFieldGet(this, _Flowbuild_arrangement, "f"), index) {
        if (arr.path == __classPrivateFieldGet(this, _Flowbuild_graph, "f").start) {
            this.SetGridPathOrigins();
            const new_eval = this.EvalPermutation();
            if (new_eval < __classPrivateFieldGet(this, _Flowbuild_best_eval, "f")) {
                console.log(new_eval, __classPrivateFieldGet(this, _Flowbuild_best_eval, "f"));
                __classPrivateFieldSet(this, _Flowbuild_best_eval, new_eval, "f");
                __classPrivateFieldSet(this, _Flowbuild_best_arr, __classPrivateFieldGet(this, _Flowbuild_arrangement, "f").Copy(), "f");
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
    SetGridPathOrigins(arr = __classPrivateFieldGet(this, _Flowbuild_arrangement, "f"), off = new Vec2()) {
        for (const member of arr.members) {
            if (member.path)
                __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(member.path).origin = off.Copy().AddVec(member.origin);
            else
                this.SetGridPathOrigins(member, off.Copy().AddVec(member.origin));
        }
        if (arr == __classPrivateFieldGet(this, _Flowbuild_arrangement, "f"))
            this.ShiftCoords();
    }
    ShiftCoords() {
        for (const depth_paths of __classPrivateFieldGet(this, _Flowbuild_graph, "f").depth_map) {
            let max_x = -1;
            for (const path of depth_paths) {
                max_x = Math.max(__classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(path).origin.x + __classPrivateFieldGet(this, _Flowbuild_arrangement, "f").size.x - 1, max_x);
            }
            let whole_shift = Math.floor((__classPrivateFieldGet(this, _Flowbuild_arrangement, "f").size.x - max_x - 1) / 2);
            let frac_shift = 0;
            if ((__classPrivateFieldGet(this, _Flowbuild_arrangement, "f").size.x % 2) == (max_x % 2))
                frac_shift += 0.5;
            for (const path of depth_paths) {
                __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(path).origin.x += whole_shift;
                __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(path).shift = frac_shift;
            }
        }
    }
    FillGrid() {
        for (const path_grid of __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").values())
            this.grid.SetSubGrid(path_grid.grid, path_grid.origin, path_grid.shift);
        for (const path_grid of __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").values()) {
            console.log(path_grid.path.Head(), path_grid.origin);
            for (const child of path_grid.path.childs) {
                this.CreateConnection(path_grid.GlobalOut(), __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(child).GlobalIn());
            }
        }
        this.CreateSyncLines();
    }
    CreateSyncLines() {
        for (const path of __classPrivateFieldGet(this, _Flowbuild_graph, "f").path_map.values()) {
            if (path.childs.length > 1) {
                let min_x = 999;
                let max_x = -1;
                for (const child of path.childs) {
                    let x = __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(child).GlobalIn().x;
                    min_x = Math.min(x, min_x);
                    max_x = Math.max(x, max_x);
                }
                for (let x = min_x; x <= max_x; ++x)
                    this.grid.OverlapSyncLine(new SyncLine(true, false), new Vec2(x, __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(path.childs[0]).GlobalIn().y));
            }
            if (path.parents.length > 1) {
                let min_x = 999;
                let max_x = -1;
                for (const parent of path.parents) {
                    let x = __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(parent).GlobalOut().x;
                    min_x = Math.min(x, min_x);
                    max_x = Math.max(x, max_x);
                }
                for (let x = min_x; x <= max_x; ++x)
                    this.grid.OverlapSyncLine(new SyncLine(false, true), new Vec2(x, __classPrivateFieldGet(this, _Flowbuild_path_grids, "f").get(path).GlobalIn().y - 2));
            }
        }
    }
    CreateConnection(from, to) {
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
_Flowbuild_graph = new WeakMap(), _Flowbuild_path_grids = new WeakMap(), _Flowbuild_arrangement = new WeakMap(), _Flowbuild_best_arr = new WeakMap(), _Flowbuild_best_eval = new WeakMap(), _Flowbuild_depth_heights = new WeakMap(), _Flowbuild_depth_widths = new WeakMap();
//# sourceMappingURL=Flowbuild.js.map