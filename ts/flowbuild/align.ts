import { set_element, set_equal, set_merge } from "../utils/set.js";
import { Graph } from "./graph/graph.js";
import { Node } from "./graph/node.js";

function create_div(...cls: string[]): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add(...cls);
    return div;
}
function create_line(): HTMLElement {
    const wrapper = create_div('path');
    wrapper.appendChild(create_div('path-line'));
    wrapper.appendChild(create_div('path-angle', 'fa-solid', 'fa-angle-down', 'fa-xs'));
    return wrapper;
}

export class Alignment {
    members: (Alignment | Node)[];
    type: 'hor' | 'ver' | 'path';
    in: Set<Node>;
    out: Set<Node>;
    parents: Set<Node>;
    childs: Set<Node>;

    constructor(members: (Alignment | Node)[], type: 'hor' | 'ver' | 'path') {
        this.members = members;
        this.type = type;

        this.in = new Set();
        this.out = new Set();
        this.parents = new Set();
        this.childs = new Set();
        if (type == 'hor') {
            for (const member of members as Array<Alignment>) {
                this.in = set_merge(this.in, member.in);
                this.out = set_merge(this.out, member.out);
                this.parents = set_merge(this.parents, member.parents);
                this.childs = set_merge(this.childs, member.childs);
            }
        }
        else if (type == 'ver') {
            this.in = (members[0] as Alignment).in;
            this.out = (members[members.length - 1] as Alignment).out;
            this.parents = (members[0] as Alignment).parents;
            this.childs = (members[members.length - 1] as Alignment).childs;
        }
        else if (type == 'path') {
            this.in = new Set([members[0] as Node]);
            this.out = new Set([members[members.length - 1] as Node]);
            this.parents = set_merge(this.parents, (members[0] as Node).parents);
            this.childs = set_merge(this.childs, (members[members.length - 1] as Node).childs);
        }
    }

    to_html(): HTMLDivElement {
        const div = create_div('align-' + this.type);
        if (this.type == 'path') {
            if (!(this.members[0] as Node).is_start()) {
                const line = create_line();
                const line_wrapper = create_div('wrapper');
                line_wrapper.appendChild(line);
                div.appendChild(line_wrapper);
            }
            for (const member of this.members as Node[]) {
                const box = create_div('flow-task');
                box.id = member.task.id.toString();
                box.textContent = member.task.description;
                if (member == this.members[0]) {
                    box.classList.add('top');
                }
                if (member == this.members[this.members.length - 1]) {
                    box.classList.add('bottom');
                }

                // connectors
                box.append(create_div('editor-add', 'fa-solid', 'fa-plus', 'fa-sharp', 'fa-xl'));
                box.append(create_div('editor-remove', 'fa-solid', 'fa-minus', 'fa-sharp', 'fa-xl'));
                if (!member.is_last_step()) {
                    box.appendChild(create_div('editor-connector'));
                }

                const wrapper = create_div('wrapper');
                wrapper.appendChild(box);
                div.appendChild(wrapper);

                const line = create_line();
                const line_wrapper = create_div('wrapper');
                if (member == this.members[this.members.length - 1]) {
                    if (member.is_end()) {
                        break;
                    }
                    line.classList.add('end');
                    line_wrapper.classList.add('end');
                }
                line_wrapper.appendChild(line);
                div.appendChild(line_wrapper);
            }
        }
        else if (this.type == 'hor') {
            for (const member of this.members as Alignment[]) {
                div.appendChild(member.to_html());
            }
        }
        else if (this.type == 'ver') {
            for (const member of this.members as Alignment[]) {
                const member_html = member.to_html();
                if (member == this.members[0]) {
                    member_html.classList.add('top');
                }
                if (member == this.members[this.members.length - 1]) {
                    member_html.classList.add('bottom');
                }

                const wrapper = create_div('wrapper');
                if (member == this.members[this.members.length - 1]) {
                    member_html.classList.add('end');
                    wrapper.classList.add('end');
                }
                wrapper.appendChild(member_html);
                div.appendChild(wrapper);
            }
        }
        return div;
    }
};

export function create_paths(graph: Graph): Set<Alignment> {
    const relation_map = new Map<Node, Set<Node>>();
    for (const node of graph.nodes) {
        relation_map.set(node, new Set([node]));
    }
    for (const parent of graph.nodes) {
        if (parent.childs.size == 1) {
            const child = set_element(parent.childs);
            if (child.parents.size == 1) {
                let set = set_merge(relation_map.get(parent), relation_map.get(child));
                for (const node of set) {
                    relation_map.set(node, set);
                }
            }
        }
    }

    const paths = new Set<Alignment>();
    const visited = new Set<Set<Node>>();
    for (const [node, set] of relation_map) {
        if (!visited.has(set)) {
            paths.add(new Alignment([...set].sort((a: Node, b: Node) => graph.get_depth(a) - graph.get_depth(b)), 'path'));
            visited.add(set);
        }
    }
    return paths;
}
export function hor_merge(ver_aligns: Set<Alignment>, rigorous: boolean = true): Set<Alignment> {
    const relation_map = new Map<Alignment, Set<Alignment>>();
    for (const align of ver_aligns) {
        relation_map.set(align, new Set([align]));
    }
    for (const align1 of ver_aligns) {
        for (const align2 of ver_aligns) {
            if (set_equal(align1.parents, align2.parents) && (!rigorous || set_equal(align1.childs, align2.childs))) {
                const set = set_merge(relation_map.get(align1), relation_map.get(align2));
                for (const align of set) {
                    relation_map.set(align, set);
                }
            }
        }
    }

    const hor_aligns = new Set<Alignment>();
    const visited = new Set<Set<Alignment>>();
    for (const [align, set] of relation_map) {
        if (!visited.has(set)) {
            if (set.size == 1) {
                hor_aligns.add(set_element(set));
            }
            else {
                hor_aligns.add(new Alignment([...set], 'hor'));
            }
            visited.add(set);
        }
    }
    return hor_aligns;
}
export function ver_merge(hor_aligns: Set<Alignment>, rigorous: boolean = true): Set<Alignment> {
    const relation_map = new Map<Alignment, Set<Alignment>>();
    for (const align of hor_aligns) {
        relation_map.set(align, new Set([align]));
    }
    for (const align1 of hor_aligns) {
        for (const align2 of hor_aligns) {
            if (set_equal(align1.childs, align2.in) && set_equal(align1.out, align2.parents)) {
                const set = set_merge(relation_map.get(align1), relation_map.get(align2));
                for (const align of set) {
                    relation_map.set(align, set);
                }
            }
        }
    }

    const ver_aligns = new Set<Alignment>();
    const visited = new Set<Set<Alignment>>();
    for (const [align, set] of relation_map) {
        if (!visited.has(set)) {
            if (set.size == 1) {
                ver_aligns.add(set_element(set));
            }
            else {
                ver_aligns.add(new Alignment([...set], 'ver'));
            }
            visited.add(set);
        }
    }
    return ver_aligns;
}
export function align(graph: Graph): Alignment {
    let aligns = create_paths(graph);
    let rigorous = true;
    while (true) {
        const hor_aligns = hor_merge(aligns, rigorous);
        if (hor_aligns.size < aligns.size) {
            aligns = hor_aligns;
            rigorous = true;
            continue;
        }
        const ver_aligns = ver_merge(aligns, rigorous);
        if (ver_aligns.size < aligns.size) {
            aligns = ver_aligns;
            rigorous = true;
            continue;
        }

        if (rigorous) {
            rigorous = false;
        }
        else {
            break;
        }
    }
    console.log(...aligns);
    return set_element(aligns);
}