import { Graph } from "../graph/graph.js";
import { Rule } from "./rule.js";
import { CookRule } from "./rules/cook_rule.js";
import { ConnRule } from "./rules/conn_rule.js";
import { SyncLineRule } from "./rules/sync_line_rule.js";
import { PathRule } from "./rules/path_rule.js";
import { set_element } from "../../utils/set.js";

export function create_rules(graph: Graph, loop_rules: boolean = true): Set<Rule> {
    const rules = new Set<Rule>();
    for (const parent of graph.nodes) {
        for (const child of parent.childs) {
            rules.add(new ConnRule(parent, child, !graph.is_backwards(parent) && graph.is_backwards(child)));
        }
    }
    for (const sync_line of graph.sync_lines) {
        rules.add(new SyncLineRule(sync_line.members, sync_line.shared));
    }
    for (const node of graph.nodes) {
        if (node.childs.size == 1 && set_element(node.childs).parents.size == 1) {
            rules.add(new PathRule(node, set_element(node.childs)));
        }
    }

    // if (loop_rules) {
    //     for (const loop of graph.loops) {
    //         for (const rule of create_loop_rules(loop)) {
    //             rules.add(rule);
    //         }
    //     }
    // }
    rules.add(new CookRule());
    // rules.add(new EndRule(graph));
    return rules;
}