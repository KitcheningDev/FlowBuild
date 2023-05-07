import { Graph } from "../flowbuild/graph/graph.js";
import { Node } from "../flowbuild/graph/node.js";
import { get_cook } from "../flowbuild/recipe/cook.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Task } from "../flowbuild/recipe/task.js";
import { set_element } from "../utils/set.js";
import { get_random_text } from "./random_text.js";

class RecipeDiff {
    graph: Graph;
    added: Map<Task, Set<Task>>;
    removed: Map<Task, Set<Task>>;

    constructor(graph: Graph, added: Map<Task, Set<Task>> = new Map(), removed: Map<Task, Set<Task>> = new Map()) {
        this.graph = graph;
        this.graph.flatten();
        this.added = added;
        this.removed = removed;
    }
}
export class RecipeModifier {
    recipe: Recipe;
    log: RecipeDiff[];

    constructor(recipe: Recipe) {
        this.recipe = recipe;
        this.log = [new RecipeDiff(this.recipe.create_graph())];
    }

    get curr_diff(): RecipeDiff {
        return this.log[this.log.length - 1];
    }
    do_change(): void {
        if (this.curr_diff.added.size == 0 && this.curr_diff.removed.size == 0) {
            return;
        }
        for (const [parent, childs] of this.curr_diff.added) {
            for (const child of childs) {
                this.recipe.add_connection(parent, child);
            }
        }
        for (const [parent, childs] of this.curr_diff.removed) {
            for (const child of childs) {
                this.recipe.remove_connection(parent, child);
            }
        }
        this.log.push(new RecipeDiff(this.recipe.create_graph()));
    }
    undo_change(): void {
        if (this.log.length == 1) {
            return;
        }
        this.log.pop();
        for (const [parent, childs] of this.curr_diff.added) {
            for (const child of childs) {
                this.recipe.remove_connection(parent, child);
            }
        }
        for (const [parent, childs] of this.curr_diff.removed) {
            for (const child of childs) {
                this.recipe.add_connection(parent, child);
            }
        }
        this.discard_change();
    }
    discard_change(): void {
        this.curr_diff.added = new Map();
        this.curr_diff.removed = new Map();
    }

    add_connection(from: Task, to: Task): void {
        if (this.recipe.has_conn(from, to)) {
            return;
        }

        if (!this.curr_diff.added.has(from)) {
            this.curr_diff.added.set(from, new Set());
        }
        this.curr_diff.added.get(from).add(to);
    }
    remove_connection(from: Task, to: Task): void {
        if (!this.recipe.has_conn(from, to)) {
            return;
        }

        if (!this.curr_diff.removed.has(from)) {
            this.curr_diff.removed.set(from, new Set());
        }
        this.curr_diff.removed.get(from).add(to);
    }
    add_task_from_start(task: Task): void {
        this.add_task(this.recipe.get_start(), task);
    }
    add_task(parent: Task, task: Task): void {
        this.add_task_between(parent, task, this.recipe.get_last_step());
    }
    add_task_between(parent: Task, task: Task, child: Task): void {
        this.add_connection(parent, task);
        this.add_connection(task, child);
        this.remove_connection(parent, child);
    }

    needs_end(task: Task): boolean {
        for (const child of this.recipe.get_childs(task)) {
            if (child != this.recipe.get_last_step()) {
                if (child.cook == task.cook) {
                    const task_node = this.curr_diff.graph.get_node_by_task(task);
                    const child_node = this.curr_diff.graph.get_node_by_task(child);
                    if (this.curr_diff.graph.is_backwards(child_node)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    handle_edit(from: Task | null, to: Task | null, cmd: 'add' | 'remove', preferred_cook: string): boolean {
        if (from === null || from == this.recipe.get_last_step()) {
            return false;
        }

        if (to === null) {
            if (cmd == 'add') {
                const cook = preferred_cook == '0' ? (from.cook.is_empty() ? get_cook('Küchenlehrling') : from.cook) : get_cook(preferred_cook);
                this.add_task(from, new Task(get_random_text(), cook));
                if (true || from.cook == cook) {
                    this.remove_connection(from, this.recipe.get_last_step());
                }
            }
            else if (cmd == 'remove') {
                if (from == this.recipe.get_start() || from == this.recipe.get_last_step()) {
                    return false;
                }
                const parents = this.recipe.get_parents(from);
                const childs = this.recipe.get_childs(from);
                if (parents.size == 1 && childs.size == 1 && set_element(parents) == this.recipe.get_start() && set_element(childs) == this.recipe.get_last_step()) {
                    if (this.recipe.get_childs(this.recipe.get_start()).size == 1 || this.recipe.get_parents(this.recipe.get_last_step()).size == 1) {
                        return false;
                    }
                }
                for (const parent of parents) {
                    this.remove_connection(parent, from);
                    for (const child of childs) {
                        if (parent == this.recipe.get_start() && child == this.recipe.get_last_step()) {
                            continue;
                        }
                        this.add_connection(parent, child);
                    }
                }
                for (const child of childs) {
                    this.remove_connection(from, child);
                }
            }
        }
        else {
            if (cmd == 'add') {
                if (this.recipe.has_conn(from, to)) {
                    const cook = preferred_cook == '0' ? (from.cook.is_empty() ? get_cook('Küchenlehrling') : from.cook) : get_cook(preferred_cook);
                    this.add_task_between(from, new Task(get_random_text(), cook), to);
                }
                else {
                    if (from != to && !this.curr_diff.graph.get_node_by_task(to).can_reach(this.curr_diff.graph.get_node_by_task(from))) { // && from.cook == to.cook) {
                        if (from != this.recipe.get_start()) {
                            this.remove_connection(this.recipe.get_start(), to);
                        }
                        if (to != this.recipe.get_last_step()) {
                            this.remove_connection(from, this.recipe.get_last_step());
                        }
                    }

                    this.add_connection(from, to);
                }
            }
            else if (cmd == 'remove') {
                if (!this.recipe.has_conn(from, to)) {
                    return false;
                }

                // add conn to last step
                if (this.curr_diff.graph.get_node_by_task(from).childs.size == 1) {
                    if (to == this.recipe.get_last_step()) {
                        return false;
                    }
                    this.add_connection(from, this.recipe.get_last_step());
                }

                // add conn to start
                if (this.curr_diff.graph.get_node_by_task(to).parents.size == 1) {
                    if (from == this.recipe.get_start()) {
                        return false;
                    }
                    this.add_connection(this.recipe.get_start(), to);
                }

                this.remove_connection(from, to);
            }
        }
        return true;
    }
}