import { CookRule } from "./rules/cook_rule.js";
import { EndRule } from "./rules/end_rule.js";
import { create_loop_rules } from "./rules/loop_rule.js";
import { ParentsRule } from "./rules/parent_rule.js";
export function create_rules(graph) {
    const rules = new Set();
    for (const node of graph.nodes) {
        if (!node.is_start()) {
            rules.add(new ParentsRule(node));
        }
    }
    for (const loop of graph.loops) {
        for (const rule of create_loop_rules(loop)) {
            rules.add(rule);
        }
    }
    rules.add(new CookRule());
    rules.add(new EndRule(graph));
    return rules;
}
//# sourceMappingURL=create_rules.js.map