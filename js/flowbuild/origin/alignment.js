import { config } from "../config.js";
export var alignment;
(function (alignment) {
    function create(type, members = []) {
        if (typeof type == 'object') {
            return { members: [], type: type, size_x: type.bounds.size.x };
        }
        members = members.filter((member) => { return member !== null; });
        if (members.length == 0) {
            return null;
        }
        else if (members.length == 1) {
            return members[0];
        }
        let size_x = 0;
        if (type == 'hor') {
            members.forEach((member) => { size_x += member.size_x; });
            size_x += config.box_margin * (members.length - 1);
        }
        else {
            members.forEach((member) => { size_x = Math.max(member.size_x, size_x); });
        }
        return { members: members, type: type, size_x: size_x };
    }
    alignment.create = create;
    function get_member_off_x(align, index) {
        if (align.type !== 'hor') {
            return 0;
        }
        let off_x = align.members[0].size_x / 2;
        for (let i = 0; i < index; ++i) {
            off_x += (align.members[i].size_x + align.members[i + 1].size_x) / 2 + config.box_margin;
        }
        return off_x - align.size_x / 2;
    }
    alignment.get_member_off_x = get_member_off_x;
    function copy(align) {
        const out = { members: [], type: align.type, size_x: align.size_x };
        for (const member of align.members) {
            out.members.push(copy(member));
        }
        return out;
    }
    alignment.copy = copy;
    function swap_members(align, i1, i2) {
        if (i1 == i2) {
            return;
        }
        const temp = align.members[i1];
        align.members[i1] = align.members[i2];
        align.members[i2] = temp;
    }
    alignment.swap_members = swap_members;
})(alignment || (alignment = {}));
//# sourceMappingURL=alignment.js.map