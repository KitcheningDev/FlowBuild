import { LastElem } from "../Utils/Funcs.js";
import { Vec2, Sub, Div } from "../Utils/Vec2.js";
import { Path } from "./Graph.js";
import { PathBounds } from "./PathBounds.js";

export class Arrangement {
    members: Arrangement[];
    readonly dir: "hor" | "ver" | "none";
    readonly path_bounds_pair: [Path, PathBounds];
    readonly size: Vec2;

    constructor(members: Arrangement[], dir: "hor" | "ver" | "none", path_bounds_pair: [Path, PathBounds] = null) {
        this.members = members;
        this.dir = dir;
        this.path_bounds_pair = path_bounds_pair;

        this.size = (function GetArrangementSize(): Vec2 {
            if (path_bounds_pair != null)
                return path_bounds_pair[1].size;
            
            const size = new Vec2();
            for (let i = 0; i < members.length; ++i) {
                if (dir == "hor") {
                    if (members.length == 2)
                        size.x += members[i].size.x;
                    else
                        size.x += Math.max(members[i].size.x, members[members.length - 1 - i].size.x);
                    size.y = Math.max(members[i].size.y, size.y);
                }
                else if (dir == "ver") {
                    size.y += members[i].size.y;
                    size.x = Math.max(members[i].size.x, size.x);
                }
            }
            return size;
        })();
    }

    GetMemberOffset(index: number): Vec2 {
        const offset = new Vec2();
        for (let i = 0; i < index; ++i) {
            if (this.dir == "hor") {
                if (this.members.length == 2)
                    offset.x = (this.members[0].size.x + this.members[1].size.x) / 2;
                else {
                    const left = Math.max(this.members[i].size.x, this.members[this.members.length - 1 - i].size.x);
                    const right = Math.max(this.members[i + 1].size.x, this.members[this.members.length - 2 - i].size.x);
                    offset.x += (left + right) / 2;
                }
            }
            else if (this.dir == "ver")
                offset.y += this.members[i].size.y;
        }
        
        if (this.dir == "hor")
        {
            if (this.members.length == 2)
                offset.x -= (this.members[0].size.x + this.members[1].size.x) / 4;
            else
                offset.x -= (this.size.x - Math.max(this.members[0].size.x, LastElem(this.members).size.x)) / 2;
        }
        return offset;
    }
    SwapMembers(i1: number, i2: number): void {
        const temp = this.members[i1];
        this.members[i1] = this.members[i2];
        this.members[i2] = temp;
    }

    Copy(): Arrangement {
        const members = [];
        for (const member of this.members)
            members.push(member.Copy());
        return new Arrangement(members, this.dir, this.path_bounds_pair);
    }
}