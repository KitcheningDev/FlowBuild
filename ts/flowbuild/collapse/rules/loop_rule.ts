import { Loop } from "../../graph/loop.js";
import { Rule } from "../rule.js";
import { AdjacencyRule } from "./adjacency_rule.js";

export function create_loop_rules(loop: Loop): Rule[] {
    return [
        new AdjacencyRule(new Set([loop.loop_top, ...loop.backwards_heads])),
        new AdjacencyRule(new Set([loop.loop_bottom, ...loop.backwards_tails]))
    ];
}