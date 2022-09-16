import { LastElem, AtIndex } from "../../Utils/Funcs.js";
import { Vec2, Sub, Div, Add } from "../../Utils/Vec2.js";
import { Path } from "../Graph.js";
import { PathBounds } from "../PathBounds.js";

export class Arrangement {
    members: Arrangement[];
    readonly dir: "hor" | "ver" | "none";
    readonly path: Path;
    readonly size_x: number;
    readonly #all_members_paths: boolean;

    constructor(members: Arrangement[], dir: "hor" | "ver" | "none", path_size_x_pair: [Path, number] = null) {
        this.members = members;
        this.dir = dir;
        
        if (path_size_x_pair != null)
            this.path = path_size_x_pair[0];
        else 
            this.path = null;

        this.#all_members_paths = true;
        for (const member of members) {
            if (member.dir != "none") {
                this.#all_members_paths = false;
                break;
            }
        }

        this.size_x = 0;
        if (path_size_x_pair == null) {
            if (dir == "hor")
                this.size_x = this.GetMemberOffX(members.length - 1) + this.GetMemberOffX(0);
            else if (dir == "ver") {
                let max_x = 0;
                for (const member of members)
                    max_x = Math.max(member.size_x, max_x);
                this.size_x = max_x;
            }
        }
        else
            this.size_x = path_size_x_pair[1];
    }

    GetMemberSizeX(index: number): number {
        if (this.#all_members_paths)
            return Math.max(this.members[index].size_x, AtIndex(this.members, -index - 1).size_x);
        else
            return this.members[index].size_x;
    }
    GetMemberOffX(index: number): number {
        if (this.dir == "ver" || this.dir == "none")
            return 0;
        else if (this.dir == "hor") {
            if (index == 0)
                return (this.GetMemberSizeX(0)  - this.size_x) / 2;
            
            const outer = this.GetMemberSizeX(index - 1);
            const inner = this.GetMemberSizeX(index);
            return this.GetMemberOffX(index - 1) + (outer + inner) / 2;
        }
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
        if (this.path)
            return new Arrangement(members, this.dir, [this.path, this.size_x]);
        else 
            return new Arrangement(members, this.dir);
    }
}