import { global_config } from "../config.js";
import { path_t } from "../path.js";

export namespace alignment {
    export interface type {
        members: type[];
        type: 'hor' | 'ver' | path_t;
        size_x: number;
    }

    export function create(type: 'hor' | 'ver' | path_t, members = [] as type[]): type {
        if (typeof type == "object") {
            return { members: [], type: type, size_x: type.bounds.size.x } as type;
        }
        members = members.filter((member: type) => { return member !== null; });
        if (members.length == 0) {
            return null;
        }
        else if (members.length == 1) {
            return members[0];
        }
        let size_x = 0;
        if (type == 'hor') {
            members.forEach((member: type) => { size_x += member.size_x + global_config.box_margin; });
            size_x -= global_config.box_margin;
        }
        else {
            members.forEach((member: type) => { size_x = Math.max(member.size_x, size_x); });            
        }
        let depth = 9999;
        return { members: members, type: type, size_x: size_x };
    }
    export function get_member_off_x(align: type, index: number): number {
        if (align.type != 'hor') {
            return 0;
        }
        let off_x = align.members[0].size_x / 2;
        for (let i = 0; i < index; ++i) {
            off_x += (align.members[i].size_x + align.members[i + 1].size_x) / 2 + global_config.box_margin;
        }
        return off_x - align.size_x / 2;
    }
    export function copy(align: type): type {
        const out = { members: [], type: align.type, size_x: align.size_x } as type;
        for (const member of align.members) {
            out.members.push(copy(member));
        }
        return out;
    }
    export function swap_members(align: type, i1: number, i2: number): void {
        if (i1 == i2) {
            return;
        }
        const temp = align.members[i1];
        align.members[i1] = align.members[i2];
        align.members[i2] = temp;
    }
}