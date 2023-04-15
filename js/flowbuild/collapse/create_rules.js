import { CookRule } from "./rules/cook_rule.js";
import { ConnRule } from "./rules/parent_rule.js";
export function create_rules(graph, loop_rules = true) {
    const rules = new Set();
    for (const parent of graph.nodes) {
        for (const child of parent.childs) {
            rules.add(new ConnRule(parent, child, !graph.is_backwards(parent) && graph.is_backwards(child)));
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
//# sourceMappingURL=create_rules.js.map