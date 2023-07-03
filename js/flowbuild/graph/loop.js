import { ObjID } from "../../utils/obj_id.js";
import { Node } from "./node.js";
import { Task } from "../recipe/task.js";
import { setClone } from "../../utils/set.js";
export class Loop extends ObjID {
    constructor(start, loop_member) {
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
    dummyfy() {
        const added = new Set();
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
    isFlat() {
        return !this.loop_bottom.reachable(this.loop_top);
    }
    flatten() {
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
    unflatten() {
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
    calcBackwards() {
        this.backwards = new Set();
        for (const head of this.backwards_heads) {
            this.addBackwards(head);
        }
    }
    addBackwards(node) {
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
    calcBackwardsHeads() {
        this.backwards_heads = new Set();
        for (const backwards_head of this.loop_top.parents) {
            if (this.nodes.has(backwards_head)) {
                this.backwards_heads.add(backwards_head);
            }
        }
    }
    calcBackwardsTails() {
        this.backwards_tails = new Set();
        for (const backwards_tail of this.loop_bottom.childs) {
            if (this.nodes.has(backwards_tail)) {
                this.backwards_tails.add(backwards_tail);
            }
        }
    }
    calcLoopTop(start) {
        this.loop_top = null;
        for (const entry of this.loop_entries) {
            if (this.loop_top === null || start.maxDistance(entry) < start.minDistance(this.loop_top)) {
                this.loop_top = entry;
            }
        }
    }
    calcLoopBottom(start) {
        this.loop_bottom = null;
        for (const entry of this.loop_exits) {
            if (this.loop_bottom === null || start.maxDistance(this.loop_bottom) < start.minDistance(entry)) {
                this.loop_bottom = entry;
            }
        }
    }
    calcLoopEntries() {
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
    calcLoopExits() {
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
    addNode(node) {
        if (!this.nodes.has(node)) {
            this.nodes.add(node);
            for (const child of node.childs) {
                if (child.reachable(node)) {
                    this.addNode(child);
                }
            }
        }
    }
}
//# sourceMappingURL=loop.js.map