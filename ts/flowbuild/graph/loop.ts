import { ObjID } from "../../utils/obj_id.js";
import { Node } from "./node.js";
import { Task } from "../recipe/task.js";
import { setClone } from "../../utils/set.js";

export class Loop extends ObjID {
    constructor(start: Node, loop_member: Node) {
        super();

        // set nodes
        this.nodes = new Set();
        this.addNode(loop_member);

        // calc loop properties
        this.calcLoopEntries();
        this.calcLoopExits();
        this.calcLoopTop(start);
        this.calcLoopBottom(start);

        // backwards
        this.calcBackwardsHeads();
        this.calcBackwardsTails();
        this.calcBackwards();
    }
    dummyfy(): Set<Node> {
        const added = new Set<Node>();
        // dummy top
        if (this.loop_top == this.loop_bottom) {
            const top = new Node(new Task('', this.loop_bottom.task.cook), new Set([...this.loop_bottom.parents]), new Set([this.loop_bottom]));
            this.loop_bottom.parents = new Set([top]);
            for (const parent of top.parents) {
                parent.childs.delete(this.loop_bottom);
                parent.childs.add(top);
            }
            this.loop_top = top;
            this.nodes.add(top);
            this.loop_entries.delete(this.loop_bottom);
            this.loop_entries.add(top);
            added.add(top);
        }
        // dummy backwards
        if (this.backwards.size == 0) {
            const backwards = new Node(new Task('', this.loop_bottom.task.cook), new Set([this.loop_bottom]), new Set([this.loop_top]));
            this.nodes.add(backwards);
            this.backwards.add(backwards);
            this.backwards_heads.add(backwards);
            this.backwards_heads.delete(this.loop_top);
            this.backwards_heads.delete(this.loop_bottom);
            this.backwards_tails.add(backwards);
            this.backwards_tails.delete(this.loop_top);
            this.backwards_tails.delete(this.loop_bottom);
            this.loop_top.parents.add(backwards);
            this.loop_bottom.childs.add(backwards);
            this.loop_top.parents.delete(this.loop_bottom);
            this.loop_bottom.childs.delete(this.loop_top);
            added.add(backwards);
        }
        return added;
    }
    isFlat(): boolean {
        return !this.loop_bottom.reachable(this.loop_top);
    }
    flatten(): void {
        if (this.isFlat()) {
            return;
        }
        // parents
        for (const backwards_head of this.backwards_heads) {
            this.loop_top.parents.delete(backwards_head);
        }
        for (const backwards_head of this.backwards_heads) {
            for (const parent of this.loop_top.parents) {
                parent.childs.add(backwards_head);
            }
            backwards_head.childs = setClone(this.loop_top.parents);
        }
        // childs
        for (const loop_exit of this.loop_exits) {
            for (const backwards_node of this.backwards) {
                if (loop_exit.childs.has(backwards_node)) {
                    loop_exit.childs.delete(backwards_node);
                    loop_exit.parents.add(backwards_node);
                }
            }
        }
        // reverse
        for (const node of this.backwards) {
            const temp = node.childs;
            node.childs = node.parents;
            node.parents = temp;
        }
    }
    unflatten(): void {
        if (!this.isFlat()) {
            return;
        }
        // reverse
        for (const node of this.backwards) {
            const temp = node.childs;
            node.childs = node.parents;
            node.parents = temp;
        }
        // childs
        for (const loop_exit of this.loop_exits) {
            for (const backwards_node of this.backwards) {
                if (loop_exit.parents.has(backwards_node)) {
                    loop_exit.parents.delete(backwards_node);
                    loop_exit.childs.add(backwards_node);
                }
            }
        }
        // parents
        for (const backwards_head of this.backwards_heads) {
            for (const parent of this.loop_top.parents) {
                parent.childs.delete(backwards_head);
            }
            backwards_head.childs = new Set([this.loop_top]);
        }
        for (const backwards_head of this.backwards_heads) {
            this.loop_top.parents.add(backwards_head);
        }
    }

    // calc
    private calcBackwards(): void {
        this.backwards = new Set<Node>();
        for (const head of this.backwards_heads) {
            this.addBackwards(head);
        }
    }
    private addBackwards(node: Node): void {
        if (this.loop_exits.has(node)) {
            return;
        }
        this.backwards.add(node);
        for (const parent of node.parents) {
            if (this.nodes.has(parent)) {
                this.addBackwards(parent);
            }
        }
    }
    private calcBackwardsHeads(): void {
        this.backwards_heads = new Set<Node>();
        for (const backwards_head of this.loop_top.parents) {
            if (this.nodes.has(backwards_head)) {
                this.backwards_heads.add(backwards_head);
            }
        }
    }
    private calcBackwardsTails(): void {
        this.backwards_tails = new Set<Node>();
        for (const backwards_tail of this.loop_bottom.childs) {
            if (this.nodes.has(backwards_tail)) {
                this.backwards_tails.add(backwards_tail);
            }
        }
    }
    private calcLoopTop(start: Node): void {
        this.loop_top = null;
        for (const entry of this.loop_entries) {
            if (this.loop_top === null || start.maxDistance(entry) < start.minDistance(this.loop_top)) {
                this.loop_top = entry;
            }
        }
    }
    private calcLoopBottom(start: Node): void {
        this.loop_bottom = null;
        for (const entry of this.loop_exits) {
            if (this.loop_bottom === null || start.maxDistance(this.loop_bottom) < start.minDistance(entry)) {
                this.loop_bottom = entry;
            }
        }
    }
    private calcLoopEntries(): void {
        this.loop_entries = new Set();
        for (const node of this.nodes) {
            for (const parent of node.parents) {
                if (!node.reachable(parent)) {
                    this.loop_entries.add(node);
                    break;
                }
            }
        }
    }
    private calcLoopExits(): void {
        this.loop_exits = new Set();
        for (const node of this.nodes) {
            for (const child of node.childs) {
                if (!child.reachable(node)) {
                    this.loop_exits.add(node);
                    break;
                }
            }
        }
    }
    private addNode(node: Node): void {
        if (!this.nodes.has(node)) {
            this.nodes.add(node);
            for (const child of node.childs) {
                if (child.reachable(node)) {
                    this.addNode(child);
                }
            }
        }
    }

    // members
    nodes: Set<Node>;
    backwards: Set<Node>;

    loop_entries: Set<Node>;
    loop_exits: Set<Node>;

    loop_top: Node;
    loop_bottom: Node;

    backwards_heads: Set<Node>;
    backwards_tails: Set<Node>;
}
