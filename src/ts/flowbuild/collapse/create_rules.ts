import { Graph } from "../graph/graph.js";
import { Rule } from "./rule.js";
import { CookRule } from "./rules/cook_rule.js";
import { sample, setEqual } from "../../utils/set.js";
import { Node } from "../graph/node.js";
import { NeighbourRule } from "./rules/neighbour_rule.js";
import { ParentRule } from "./rules/parent_rule.js";
import { ConnRule } from "./rules/conn_rule.js";

function parentNeighbours(node: Node): Set<Node> {
    return new Set([...sample(node.parents).childs].filter((neighbour: Node) => setEqual(neighbour.parents, node.parents)));
}
function childNeighbours(node: Node): Set<Node> {
    return new Set([...sample(node.childs).parents].filter((neighbour: Node) => setEqual(neighbour.childs, node.childs)));
}
export function createRules(graph: Graph): Set<Rule> {
    const rules = new Set<Rule>();
    for (const parent of graph.nodes) {
        for (const child of parent.childs) {
            rules.add(new ConnRule(parent, child, !graph.isBackwards(parent) && graph.isBackwards(child)));
        }
    }
    for (const node of graph.nodes) {
        // parent
        // if (!node.isStart()) {
        //     rules.add(new ParentRule(node));
        // }
        // neighbour
        if (!node.isStart()) {
            const parentNodes = parentNeighbours(node);
            if (parentNodes.size > 1) {
                rules.add(new NeighbourRule(parentNodes));
            }
        }
        if (!node.isEnd()) {
            const childNodes = childNeighbours(node);
            if (childNodes.size > 1) {
                rules.add(new NeighbourRule(childNodes));
            }
        }
    }
    // for (const node of graph.nodes) {
    //     if (node.childs.size == 1 && sample(node.childs).parents.size == 1) {
    //         if (node.task.cook == sample(node.childs).task.cook) {
    //             rules.add(new PathRule(node, sample(node.childs)));
    //         }
    //     }
    // }
    rules.add(new CookRule());
    return rules;
}