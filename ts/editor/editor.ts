import { drawRecipe } from "../flowbuild/draw_recipe.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Cook, Cook1, Cook2, Ingredient, Product, Task, Unit } from "../flowbuild/recipe/task.js";
import { html } from "./html.js";
import { server } from "./server.js";

function isNumSeq(str: string): boolean {
    if (str.length == 0) {
        return false;
    }
    for (let i = 0; i < str.length; ++i) {
        if (!('0' <= str[i] && str[i] <= '9')) {
            return false;
        }
    }
    return true;
}
class RecipeEditor {
    constructor(recipe: Recipe) {
        this.loadRecipe(recipe);
        // create
        html.create_recipe_btn.onclick = () => this.loadRecipe(new Recipe());
        // ingredient editor
        html.ingredient.add.onpointerdown = () => this.addIngredientRow();
        // task editor
        html.task.description_input.onkeyup = () => this.updateTaskDescription();
        html.task.cook1.parentElement.onmouseup = () => this.updateTaskCook(Cook1);
        html.task.cook2.parentElement.onmouseup = () => this.updateTaskCook(Cook2);
        html.task.duration_input.onkeyup = () => this.updateTaskDuration();
        html.task.sec.parentElement.onpointerup = () => this.updateTaskDuration();
        html.task.min.parentElement.onmouseup = () => this.updateTaskDuration();
        html.task.hr.parentElement.onmouseup = () => this.updateTaskDuration();
        // upload editor
        html.upload.toggle.onpointerdown = () => { this.loadUploadEditor(); this.toggleUploadEditor(); };
        html.upload.submit.onpointerdown = () => {
            console.log("UPLOADING...");
            server.uploadRecipe(recipe);
            this.hideUploadEditor();
        };
        html.upload.title_input.onkeyup = () => this.updateRecipeTitle();
        html.upload.diff1.parentElement.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.diff2.parentElement.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.diff3.parentElement.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.diff4.parentElement.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.diff5.parentElement.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.duration_input.onkeyup = () => this.updateRecipeDuration();
        html.upload.min.parentElement.onpointerup = () => this.updateRecipeDuration();
        html.upload.hr.parentElement.onpointerup = () => this.updateRecipeDuration();
        // flowchart editor
        html.flowchart.canvas.onpointerdown = (ev: PointerEvent) => {
            const target = ev.target as HTMLElement;
            if (target.classList.contains('flow-task')) {
                const task = this.recipe.byID(parseInt(target.id));
                if (this.isTaskEditorVisible()) {
                    if (target.id == this.task.id.toString()) {
                        this.hideTaskEditor();
                        this.deselectTask();
                    }
                    else {
                        this.loadTaskEditor(task);
                        this.selectTask(task);
                    }
                }
                else {
                    this.loadTaskEditor(task);
                    this.selectTask(task);
                    this.showTaskEditor();
                }
            }
            else if (target.classList.contains('flow-start')) {
                const task = this.recipe.byID(parseInt(target.id));
                this.hideTaskEditor();
                if (this.from && target.id == this.from.id.toString()) {
                    this.deselectTask();
                }
                else {
                    this.selectTask(task);
                }
            }
            else if (html.parent(target, 'editor-connect')) {
                this.showAddRemove();
            }
            else if (html.parent(target, 'editor-trash')) {
                this.deleteTask();
                this.hideTaskEditor();
                this.deselectTask();
            }
            else if (html.parent(target, 'editor-add')) {
                const to = this.recipe.byID(parseInt(html.parent(target, 'editor-add').id.slice(4)));
                this.addConn(to);
                this.hideTaskEditor();
                this.deselectTask();
            }
            else if (html.parent(target, 'editor-remove')) {
                const to = this.recipe.byID(parseInt(html.parent(target, 'editor-remove').id.slice(7)));
                this.removeConn(to);
                this.hideTaskEditor();
                this.deselectTask();
            }
            else if (html.parent(target, 'cook-new')) {
                const btn = html.parent(target, 'cook-new');
                let task: Task;
                if (btn.id == 'new-Küchenlehrling') {
                    task = new Task('-task-', Cook1);
                }
                else if (btn.id == 'new-Küchenmeister') {
                    task = new Task('-task-', Cook2);
                }
                this.recipe.addConn(this.recipe.start, task, this.recipe.end);    
                this.loadFlowchart();

                this.loadTaskEditor(task);
                this.selectTask(task);
                this.showTaskEditor();
                html.task.description_input.select();
                this.showAddRemove();
            }
            else {
                this.hideTaskEditor();
                this.deselectTask();
            }
        }
    }
    loadRecipe(recipe: Recipe): void {
        this.recipe = recipe;
        this.task = null;
        this.from = null;
        this.to = null;
        this.loadIngredientEditor();
        this.loadFlowchart();
        this.hideTaskEditor();
        this.hideUploadEditor();
    }
    // ingredient editor
    private loadIngredientEditor(): void {
        html.ingredient.container.innerHTML = "";
        for (const ingredient of this.recipe.ingredients) {
            this.addIngredientRow(ingredient);
        }
    }
    private updateRecipeIngredients(): void {
        this.recipe.ingredients = new Set<Ingredient>();
        for (const row of html.ingredient.container.rows) {
            const [product, amount, unit] = row.getElementsByClassName('ingredient-property') as HTMLCollectionOf<HTMLInputElement>;
            this.recipe.ingredients.add(new Ingredient(new Product(product.value.trim()), parseFloat(amount.value.trim()), new Unit(unit.value.trim())));
        }
    }
    private addIngredientRow(ingredient: Ingredient = new Ingredient(new Product('product'), 0, new Unit('unit'))): void {
        const row = html.addCls(html.ingredient.container.insertRow(), 'ingredient');
        row.onkeyup = () => this.updateRecipeIngredients();
        // product
        const product = html.create('input', 'ingredient-property') as HTMLInputElement;
        product.value = ingredient.product.name;
        product.type = 'text';
        html.appendChilds(row.insertCell(), product);
        // amount
        const amount = html.create('input', 'ingredient-property') as HTMLInputElement;
        amount.value = ingredient.amount.toString();
        amount.type = 'text';
        html.appendChilds(row.insertCell(), amount);
        // unit
        const unit = html.create('input', 'ingredient-property') as HTMLInputElement;
        unit.value = ingredient.unit.name;
        unit.type = 'text';
        html.appendChilds(row.insertCell(), unit);
        // onkeydown
        product.onkeydown = (ev: KeyboardEvent) => {
            if (ev.key == 'Enter') {
                amount.focus();
            }
        }
        amount.onkeydown = (ev: KeyboardEvent) => {
            if (ev.key == 'Enter') {
                unit.focus();
            }
        }
        unit.onkeydown = (ev: KeyboardEvent) => {
            if (ev.key == 'Enter') {
                unit.blur();
            }
        }
        // trash
        const trash = html.create('i', 'ingredient-delete', 'fa-solid', 'fa-trash');
        trash.onclick = (e: MouseEvent) => {
            html.parent(e.target as HTMLElement, 'ingredient').remove();
            this.updateRecipeIngredients();
        };
        html.appendChilds(row.insertCell(), html.appendChilds(html.createDiv('icon'), trash));
        this.updateRecipeIngredients();
    }
    // flowchart editor
    private selectTask(task: Task): void {
        this.deselectTask();
        this.from = task;
        this.showConnectTrash();
    }
    private deselectTask(): void {
        if (this.from) {
            this.hideConnectTrash();
            this.hideAddRemove();
            this.from = null;
        }
    }
    private ignoreConnection(to: Task): boolean {
        if (to == this.recipe.start) {
            return true;
        }
        else if (to == this.recipe.end && this.recipe.childs(this.from).size > 1 && !this.recipe.childs(this.from).has(to)) {
            return true;
        }
        else if (this.from == this.recipe.start && this.recipe.childs(this.from).has(to) && this.recipe.parents(to).size == 1) {
            return true;
        }
        else if (to == this.recipe.end && this.recipe.parents(to).has(this.from) && this.recipe.childs(this.from).size == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    private showNew(): void {
        for (const element of document.getElementsByClassName('cook-new')) {
            element.classList.add('selected');
        }
    }
    private hideNew(): void {
        for (const element of document.getElementsByClassName('cook-new')) {
            element.classList.remove('selected');
        }
    }
    private showConnectTrash(): void {
        this.hideNew();
        document.getElementById('connector-' + this.from.id)?.classList.add('selected');
        document.getElementById('trash-' + this.from.id)?.classList.add('selected');
    }
    private hideConnectTrash(): void {
        this.hideNew();
        document.getElementById('connector-' + this.from.id)?.classList.remove('selected');
        document.getElementById('trash-' + this.from.id)?.classList.remove('selected');
    }
    private showAddRemove(): void {
        this.hideConnectTrash();
        this.hideNew();
        const relatives = this.recipe.childs(this.from);
        for (const task of this.recipe.tasks) {
            if (this.ignoreConnection(task)) {
                continue;
            }
            if (relatives.has(task)) {
                // document.getElementById('new-' + task.id).classList.add('selected');
                document.getElementById('remove-' + task.id).classList.add('selected');
            }
            else if (task != this.from) {
                document.getElementById('add-' + task.id).classList.add('selected');
            }
        }
    }
    private hideAddRemove(): void {
        this.showNew();
        const relatives = this.recipe.childs(this.from);
        for (const task of this.recipe.tasks) {
            if (this.ignoreConnection(task)) {
                continue;
            }
            if (relatives.has(task)) {
                document.getElementById('remove-' + task.id).classList.remove('selected');
                // document.getElementById('new-' + task.id).classList.remove('selected');
            }
            else if (task != this.from) {
                document.getElementById('add-' + task.id).classList.remove('selected');
            }
        }
    }
    private deleteTask(): void {
        this.recipe.deleteTask(this.from);
        this.loadFlowchart();
    }
    private addConn(to: Task): void {
        this.recipe.addConn(this.from, to);
        const graph = this.recipe.createGraph();
        if (!graph.byTask(to).reachable(graph.byTask(this.from))) {
            this.recipe.removeConn(this.from, this.recipe.end);
            this.recipe.removeConn(this.recipe.start, to);    
        }
        this.loadFlowchart();
    }
    private removeConn(to: Task): void {
        const start = this.recipe.start;
        const end = this.recipe.end;
        this.recipe.removeConn(this.from, to);
        if (this.recipe.childs(this.from).size == 0) {
            this.recipe.addConn(this.from, end);
        }
        if (this.recipe.parents(to).size == 0) {
            this.recipe.addConn(start, to);
        }
        this.loadFlowchart();
    }
    private loadFlowchart(): void {
        drawRecipe(this.recipe);
    }
    // task editor
    private loadTaskEditor(task: Task): void {
        this.task = task;
        // description
        html.task.description_input.value = task.description;
        // cook
        if (task.cook) {
            html.task.cook_section.style.display = '';
            if (this.task.cook == Cook1) {
                html.task.cook1.checked = true;
                html.task.cook2.checked = false;
            }
            else if (this.task.cook == Cook2) {
                html.task.cook1.checked = false;
                html.task.cook2.checked = true;
            }
            else {
                html.task.cook1.checked = false;
                html.task.cook2.checked = false;
            }
        }
        else {
            html.task.cook_section.style.display = 'none';
        }
        // duration
        html.task.sec.checked = false;
        html.task.min.checked = false;
        html.task.hr.checked = false;
        if (this.task.duration == 0) {
            html.task.duration_input.value = '0';
            html.task.sec.checked = true;
        }
        else {
            if (this.task.duration % 3600 == 0) {
                html.task.duration_input.value = (this.task.duration / 3600).toString();
                html.task.hr.checked = true;
            }
            else if (this.task.duration % 60 == 0) {
                html.task.duration_input.value = (this.task.duration / 60).toString();
                html.task.min.checked = true;
            }
            else {
                html.task.duration_input.value = (this.task.duration / 1).toString();
                html.task.sec.checked = true;
            }
        }
    }
    // description
    private updateTaskDescription(): void {
        this.task.description = html.task.description_input.value.trim();
        this.loadFlowchart();
    }
    // cook
    private updateTaskCook(cook: Cook): void {
        this.task.cook = cook;
        this.loadFlowchart();
    }
    // duration
    private updateTaskDuration(): void {
        if (isNumSeq(html.task.duration_input.value)) {
            this.task.duration = parseInt(html.task.duration_input.value);
            if (html.task.sec.checked) {
                this.task.duration *= 1;
            }
            else if (html.task.min.checked) {
                this.task.duration *= 60;
            }
            else if (html.task.hr.checked) {
                this.task.duration *= 3600;
            }
        }
    }
    // visibility
    private isTaskEditorVisible(): boolean {
        return !html.task.editor.classList.contains('hidden');
    }
    private showTaskEditor(): void {
        html.task.editor.classList.remove('hidden');
        html.upload.editor.classList.add('hidden');
    }
    private hideTaskEditor(): void {
        html.task.editor.classList.add('hidden');
    }
    private toggleTaskEditor(): void {
        if (this.isTaskEditorVisible()) {
            this.hideTaskEditor();
        }
        else {
            this.showTaskEditor();
        }
    }
    // upload editor
    private loadUploadEditor(): void {
        // title
        html.upload.title_input.value = this.recipe.title;
        // difficulty
        html.upload.diff1.checked = false;
        html.upload.diff2.checked = false;
        html.upload.diff3.checked = false;
        html.upload.diff4.checked = false;
        html.upload.diff5.checked = false;
        if (this.recipe.difficulty == 1) {
            html.upload.diff1.checked = true;
        }
        else if (this.recipe.difficulty == 2) {
            html.upload.diff2.checked = true;
        }
        else if (this.recipe.difficulty == 3) {
            html.upload.diff3.checked = true;
        }
        else if (this.recipe.difficulty == 4) {
            html.upload.diff4.checked = true;
        }
        else if (this.recipe.difficulty == 5) {
            html.upload.diff5.checked = true;
        }
        // duration
        html.upload.min.checked = false;
        html.upload.hr.checked = false;
        if (this.recipe.duration == 0) {
            html.upload.duration_input.value = '0';
            html.upload.min.checked = true;
        }
        else {
            if (this.recipe.duration % 3600 == 0) {
                html.upload.duration_input.value = (this.recipe.duration / 3600).toString();
                html.upload.hr.checked = true;
            }
            else if (this.recipe.duration % 60 == 0) {
                html.upload.duration_input.value = (this.recipe.duration / 60).toString();
                html.upload.min.checked = true;
            }
        }
    }
    // title
    private updateRecipeTitle(): void {
        this.recipe.title = html.upload.title_input.value.trim();
    }
    // difficulty
    private updateRecipeDifficulty(): void {
        if (html.upload.diff1.checked) {
            this.recipe.difficulty = 1;
        }
        else if (html.upload.diff2.checked) {
            this.recipe.difficulty = 2;
        }
        else if (html.upload.diff3.checked) {
            this.recipe.difficulty = 3;
        }
        else if (html.upload.diff4.checked) {
            this.recipe.difficulty = 4;
        }
        else if (html.upload.diff5.checked) {
            this.recipe.difficulty = 5;
        }
    }
    // duration
    private updateRecipeDuration(): void {
        if (isNumSeq(html.upload.duration_input.value)) {
            this.recipe.duration = parseInt(html.upload.duration_input.value);
            if (html.upload.min.checked) {
                this.recipe.duration *= 60;
            }
            else if (html.upload.hr.checked) {
                this.recipe.duration *= 3600;
            }
        }
    }
    // visibility
    private isUploadEditorVisible(): boolean {
        return !html.upload.editor.classList.contains('hidden');
    }
    private showUplaodEditor(): void {
        html.upload.editor.classList.remove('hidden');
        html.task.editor.classList.add('hidden');
    }
    private hideUploadEditor(): void {
        html.upload.editor.classList.add('hidden');
    }
    private toggleUploadEditor(): void {
        if (this.isUploadEditorVisible()) {
            this.hideUploadEditor();
        }
        else {
            this.showUplaodEditor();
        }
    }
    // member
    private recipe: Recipe;
    private task: Task | null;
    private from: Task | null;
    private to: Task | null;
}
export const editor = new RecipeEditor(new Recipe());