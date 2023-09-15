import { drawRecipe } from "../flowbuild/draw_recipe.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Tag } from "../flowbuild/recipe/recipe_data.js";
import { Cook1, Cook2, Ingredient, Product, Task, Unit } from "../flowbuild/recipe/task.js";
import { html } from "./html.js";
import { server } from "./server.js";
function isNumSeq(str) {
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
class Connection {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
;
class Change {
    constructor() {
        this.added = [];
        this.removed = [];
    }
}
;
class RecipeEditor {
    constructor(recipe) {
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
            //server.uploadRecipe(recipe);
            server.uploadFullRecipe(recipe);
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
        html.upload.owner_input.onkeyup = () => this.updateRecipeOwner();
        html.upload.tags_input.onclick = () => this.updateRecipetags();
        // flowchart editor
        html.flowchart.canvas.onpointerdown = (ev) => {
            const target = ev.target;
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
            else if (html.parent(target, 'connect')) {
                this.showAddRemove();
            }
            else if (html.parent(target, 'trash')) {
                this.deleteTask();
                this.hideTaskEditor();
                this.deselectTask();
            }
            else if (html.parent(target, 'add')) {
                const to = this.recipe.byID(parseInt(html.parent(target, 'add').id.slice(4)));
                this.addConn(to);
                this.hideTaskEditor();
                this.deselectTask();
            }
            else if (html.parent(target, 'remove')) {
                const to = this.recipe.byID(parseInt(html.parent(target, 'remove').id.slice(7)));
                this.removeConn(to);
                this.hideTaskEditor();
                this.deselectTask();
            }
            else if (html.parent(target, 'cook-new')) {
                const btn = html.parent(target, 'cook-new');
                let task;
                if (btn.id == 'new-Küchenlehrling') {
                    task = new Task('-task-', Cook1);
                }
                else if (btn.id == 'new-Küchenmeister') {
                    task = new Task('-task-', Cook2);
                }
                this.submitChange([new Connection(this.recipe.start, task), new Connection(task, this.recipe.end)], []);
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
        };
        document.body.addEventListener('keydown', (ev) => {
            if (ev.key == 'u' && document.activeElement.tagName != "INPUT") {
                this.undoChange();
            }
        });
        document.getElementById('undo-btn').onclick = () => this.undoChange();
    }
    loadRecipe(recipe) {
        this.recipe = recipe;
        this.task = null;
        this.from = null;
        this.to = null;
        this.history = [];
        this.loadIngredientEditor();
        this.loadFlowchart();
        this.hideTaskEditor();
        this.hideUploadEditor();
    }
    // history
    submitChange(added, removed) {
        const change = new Change();
        change.added = added.filter((conn) => !this.recipe.childs(conn.from).has(conn.to));
        change.removed = removed.filter((conn) => this.recipe.childs(conn.from).has(conn.to));
        for (const conn of change.added) {
            this.recipe.addConn(conn.from, conn.to);
        }
        for (const conn of change.removed) {
            this.recipe.removeConn(conn.from, conn.to);
        }
        this.history.push(change);
        // console.error(this.history);
    }
    undoChange() {
        if (this.history.length == 0) {
            return;
        }
        const change = this.history[this.history.length - 1];
        // console.error(change);
        for (const conn of change.added) {
            this.recipe.removeConn(conn.from, conn.to);
        }
        for (const conn of change.removed) {
            this.recipe.addConn(conn.from, conn.to);
        }
        this.history.pop();
        this.loadFlowchart();
    }
    // ingredient editor
    loadIngredientEditor() {
        html.ingredient.container.innerHTML = "";
        for (const ingredient of this.recipe.ingredients) {
            this.addIngredientRow(ingredient);
        }
    }
    updateRecipeIngredients() {
        this.recipe.ingredients = new Set();
        for (const row of html.ingredient.container.rows) {
            const [product, amount, unit, cat] = row.getElementsByClassName('ingredient-property');
            this.recipe.ingredients.add(new Ingredient(new Product(product.value.trim()), parseFloat(amount.value.trim()), new Unit(unit.value.trim()), cat.value));
        }
        //console.log(this.recipe.ingredients);
    }
    addIngredientRow(ingredient = new Ingredient(new Product('product'), 0, new Unit('unit'), "categorie")) {
        const row = html.addCls(html.ingredient.container.insertRow(), 'ingredient');
        row.onkeyup = () => this.updateRecipeIngredients();
        // product
        const product = html.create('input', 'ingredient-property');
        product.value = ingredient.product.name;
        product.type = 'text';
        html.appendChilds(row.insertCell(), product);
        // amount
        const amount = html.create('input', 'ingredient-property');
        amount.value = ingredient.amount.toString();
        amount.type = 'text';
        html.appendChilds(row.insertCell(), amount);
        // unit
        const unit = html.create('input', 'ingredient-property');
        unit.value = ingredient.unit.name;
        unit.type = 'text';
        html.appendChilds(row.insertCell(), unit);
        //categorie products
        const categorie = html.create('select', 'ingredient-property');
        const categories = JSON.parse(sessionStorage.getItem("categories"));
        categories.forEach((element) => {
            const option = document.createElement('option');
            option.value = element.PK;
            option.text = element.name;
            if (sessionStorage.getItem("search")) {
                const search = JSON.parse(sessionStorage.getItem("search")).recipeCategories;
                const isProductInCategory = search.some((searchCategory) => searchCategory.products.some((product) => product.grocerie === ingredient.product.name && searchCategory.PK === element.PK));
                option.selected = isProductInCategory;
            }
            categorie.appendChild(option);
        });
        categorie.onchange = () => this.updateRecipeIngredients();
        html.appendChilds(row.insertCell(), categorie);
        // onkeydown
        product.onkeydown = (ev) => {
            if (ev.key == 'Enter') {
                amount.focus();
            }
        };
        amount.onkeydown = (ev) => {
            if (ev.key == 'Enter') {
                unit.focus();
            }
        };
        unit.onkeydown = (ev) => {
            if (ev.key == 'Enter') {
                unit.blur();
            }
        };
        // trash
        const trash = html.createDiv('trash', 'ingredient-delete', 'fa-solid', 'fa-trash');
        trash.onclick = (e) => {
            row.remove();
            this.updateRecipeIngredients();
        };
        html.appendChilds(row.insertCell(), trash);
        this.updateRecipeIngredients();
    }
    // flowchart editor
    selectTask(task) {
        this.deselectTask();
        this.from = task;
        this.showConnectTrash();
    }
    deselectTask() {
        if (this.from) {
            this.hideConnectTrash();
            this.hideAddRemove();
            this.from = null;
        }
    }
    ignoreConnection(to) {
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
    showNew() {
        for (const element of document.getElementsByClassName('cook-new')) {
            element.classList.add('selected');
        }
    }
    hideNew() {
        for (const element of document.getElementsByClassName('cook-new')) {
            element.classList.remove('selected');
        }
    }
    showConnectTrash() {
        var _a, _b;
        this.hideNew();
        (_a = document.getElementById('connector-' + this.from.id)) === null || _a === void 0 ? void 0 : _a.classList.add('selected');
        (_b = document.getElementById('trash-' + this.from.id)) === null || _b === void 0 ? void 0 : _b.classList.add('selected');
    }
    hideConnectTrash() {
        var _a, _b;
        this.hideNew();
        (_a = document.getElementById('connector-' + this.from.id)) === null || _a === void 0 ? void 0 : _a.classList.remove('selected');
        (_b = document.getElementById('trash-' + this.from.id)) === null || _b === void 0 ? void 0 : _b.classList.remove('selected');
    }
    showAddRemove() {
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
    hideAddRemove() {
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
    deleteTask() {
        const change = new Change();
        const parents = this.recipe.parents(this.from);
        const childs = this.recipe.childs(this.from);
        for (const parent of parents) {
            change.removed.push(new Connection(parent, this.from));
        }
        for (const child of childs) {
            change.removed.push(new Connection(this.from, child));
        }
        for (const parent of parents) {
            for (const child of childs) {
                if (parent == this.recipe.start && child == this.recipe.end) {
                    continue;
                }
                if (parent == this.recipe.start && 0 < this.recipe.parents(child).size) {
                    continue;
                }
                if (child == this.recipe.end && 0 < this.recipe.childs(parent).size) {
                    continue;
                }
                change.added.push(new Connection(parent, child));
            }
        }
        // this.recipe.deleteTask(this.from);
        this.submitChange(change.added, change.removed);
        this.loadFlowchart();
    }
    addConn(to) {
        const change = new Change();
        change.added.push(new Connection(this.from, to));
        const graph = this.recipe.createGraph();
        if (!graph.byTask(to).reachable(graph.byTask(this.from))) {
            change.removed.push(new Connection(this.from, this.recipe.end), new Connection(this.recipe.start, to));
        }
        this.submitChange(change.added, change.removed);
        this.loadFlowchart();
    }
    removeConn(to) {
        const change = new Change();
        const start = this.recipe.start;
        const end = this.recipe.end;
        change.removed.push(new Connection(this.from, to));
        if (this.recipe.childs(this.from).size == 1) {
            change.added.push(new Connection(this.from, end));
        }
        if (this.recipe.parents(to).size == 1) {
            change.added.push(new Connection(start, to));
        }
        this.submitChange(change.added, change.removed);
        this.loadFlowchart();
    }
    loadFlowchart() {
        drawRecipe(this.recipe);
    }
    // task editor
    loadTaskEditor(task) {
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
    updateTaskDescription() {
        this.task.description = html.task.description_input.value.trim();
        this.loadFlowchart();
    }
    // cook
    updateTaskCook(cook) {
        this.task.cook = cook;
        this.loadFlowchart();
    }
    // duration
    updateTaskDuration() {
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
    isTaskEditorVisible() {
        return !html.task.editor.classList.contains('hide');
    }
    showTaskEditor() {
        html.task_upload_pop_up.classList.remove('hide');
        html.task.editor.classList.remove('hide');
        html.upload.editor.classList.add('hide');
    }
    hideTaskEditor() {
        html.task_upload_pop_up.classList.add('hide');
        html.task.editor.classList.add('hide');
    }
    toggleTaskEditor() {
        if (this.isTaskEditorVisible()) {
            this.hideTaskEditor();
        }
        else {
            this.showTaskEditor();
        }
    }
    // upload editor
    loadUploadEditor() {
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
    updateRecipeTitle() {
        this.recipe.title = html.upload.title_input.value.trim();
    }
    // difficulty
    updateRecipeDifficulty() {
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
    updateRecipeDuration() {
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
    isUploadEditorVisible() {
        return !html.upload.editor.classList.contains('hide');
    }
    showUplaodEditor() {
        html.task_upload_pop_up.classList.remove('hide');
        html.upload.editor.classList.remove('hide');
        html.task.editor.classList.add('hide');
    }
    hideUploadEditor() {
        html.task_upload_pop_up.classList.add('hide');
        html.upload.editor.classList.add('hide');
    }
    toggleUploadEditor() {
        if (this.isUploadEditorVisible()) {
            this.hideUploadEditor();
        }
        else {
            this.showUplaodEditor();
        }
    }
    // owner
    updateRecipeOwner() {
        this.recipe.owner.name = html.upload.owner_input.value.trim();
    }
    updateRecipetags() {
        const selectedOptions = Array.from(html.upload.tags_input.selectedOptions).map(option => option.textContent);
        const selectedOptionsPKs = Array.from(html.upload.tags_input.selectedOptions).map(option => option.value);
        const tag = Array.from(this.recipe.tags).map(tag => tag.name);
        if (!tag.includes(selectedOptionsPKs[0])) {
            const paragraph = html.upload.chosen_tags;
            if (paragraph.textContent.length > 0) {
                paragraph.textContent = paragraph.textContent + " ," + selectedOptions[0];
            }
            else {
                paragraph.textContent = selectedOptions[0];
            }
            console.log('Selected options:', selectedOptions);
            for (const selectedTag of selectedOptionsPKs) {
                this.recipe.tags.add(new Tag(selectedTag));
            }
            console.log('recipe tags:', this.recipe.tags);
        }
        else {
            console.log(" already chosen");
        }
    }
}
export const editor = new RecipeEditor(new Recipe());
// document.addEventListener('keypress', (event: KeyboardEvent) => {
//     if (event.key == 'Enter') {
//         for (const file of html.upload.image_input.files) {
//             const FR = new FileReader();
//             FR.onloadend = function () {
//                 console.log(FR.result);
//             };
//             FR.readAsDataURL(file);
//         }
//     }
// })
//# sourceMappingURL=editor.js.map