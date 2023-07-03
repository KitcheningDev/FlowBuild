import { drawRecipe } from "../flowbuild/draw_recipe.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Cook1, Cook2, Ingredient, Product, Unit } from "../flowbuild/recipe/task.js";
import { html } from "./html.js";
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
class RecipeEditor {
    constructor(recipe) {
        this.loadRecipe(recipe);
        // create
        html.create_recipe_btn.onclick = () => this.loadRecipe(new Recipe());
        // ingredient editor
        html.ingredient.add.onpointerdown = () => this.addIngredientRow();
        // task editor
        html.task.description_input.onkeyup = () => this.updateTaskDescription();
        html.task.cook1.onmouseup = () => this.updateTaskCook();
        html.task.cook2.onmouseup = () => this.updateTaskCook();
        html.task.duration_input.onkeyup = () => this.updateTaskDuration();
        html.task.sec.onpointerup = () => this.updateTaskDuration();
        html.task.min.onmouseup = () => this.updateTaskDuration();
        html.task.hr.onmouseup = () => this.updateTaskDuration();
        // upload editor
        html.upload.toggle.onpointerdown = () => { this.loadUploadEditor(); this.toggleUploadEditor(); };
        html.upload.submit.onpointerdown = () => { console.log("ToDo: Upload"); this.hideUploadEditor(); };
        html.upload.title_input.onkeyup = () => this.updateRecipeTitle();
        html.upload.diff1.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.diff2.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.diff3.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.diff4.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.diff5.onpointerup = () => this.updateRecipeDifficulty();
        html.upload.duration_input.onkeyup = () => this.updateRecipeDuration();
        html.upload.min.onpointerup = () => this.updateRecipeDuration();
        html.upload.hr.onpointerup = () => this.updateRecipeDuration();
        // flowchart editor
        html.flowchart.canvas.onpointerdown = (ev) => {
            const task = ev.target;
            if (task.classList.contains('flow-task')) {
                if (this.isTaskEditorVisible()) {
                    if (task.id == this.task.id.toString()) {
                        this.hideTaskEditor();
                    }
                    else {
                        this.loadTaskEditor(this.recipe.byID(parseInt(task.id)));
                    }
                }
                else {
                    this.loadTaskEditor(this.recipe.byID(parseInt(task.id)));
                    this.showTaskEditor();
                }
            }
            else {
                this.hideTaskEditor();
            }
        };
    }
    loadRecipe(recipe) {
        this.recipe = recipe;
        this.task = null;
        this.loadIngredientEditor();
        this.loadFlowchart();
        this.hideTaskEditor();
        this.hideUploadEditor();
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
            const [product, amount, unit] = row.getElementsByClassName('ingredient-property');
            this.recipe.ingredients.add(new Ingredient(new Product(product.value.trim()), parseFloat(amount.value.trim()), new Unit(unit.value.trim())));
        }
    }
    addIngredientRow(ingredient = new Ingredient(new Product('product'), 0, new Unit('unit'))) {
        const row = html.addCls(html.ingredient.container.insertRow(), 'ingredient');
        row.onkeyup = () => this.updateRecipeIngredients();
        const name = html.create('input', 'ingredient-property');
        name.value = ingredient.product.name;
        name.type = 'text';
        html.appendChilds(row.insertCell(), name);
        const amount = html.create('input', 'ingredient-property');
        amount.value = ingredient.amount.toString();
        amount.type = 'text';
        html.appendChilds(row.insertCell(), amount);
        const unit = html.create('input', 'ingredient-property');
        unit.value = ingredient.unit.name;
        unit.type = 'text';
        html.appendChilds(row.insertCell(), unit);
        name.onkeydown = (ev) => {
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
        const trash = html.create('i', 'ingredient-delete', 'fa-solid', 'fa-trash');
        trash.onclick = (e) => {
            html.parent(e.target, 'ingredient').remove();
            this.updateRecipeIngredients();
        };
        html.appendChilds(row.insertCell(), html.appendChilds(html.createDiv('icon'), trash));
        this.updateRecipeIngredients();
    }
    // flowchart editor
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
        console.log(this.task);
        drawRecipe(this.recipe);
    }
    // cook
    updateTaskCook() {
        if (html.task.cook1.checked) {
            this.task.cook = Cook1;
        }
        else if (html.task.cook2.checked) {
            this.task.cook = Cook2;
        }
        else {
            this.task.cook = null;
        }
        console.log(this.task);
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
        console.log(this.task);
    }
    // visibility
    isTaskEditorVisible() {
        return !html.task.editor.classList.contains('hidden');
    }
    showTaskEditor() {
        html.task.editor.classList.remove('hidden');
        html.upload.editor.classList.add('hidden');
    }
    hideTaskEditor() {
        html.task.editor.classList.add('hidden');
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
        return html.upload.editor.classList.contains('hidden');
    }
    showUplaodEditor() {
        html.upload.editor.classList.remove('hidden');
        html.task.editor.classList.add('hidden');
    }
    hideUploadEditor() {
        html.upload.editor.classList.add('hidden');
    }
    toggleUploadEditor() {
        if (this.isUploadEditorVisible()) {
            this.hideUploadEditor();
        }
        else {
            this.showUplaodEditor();
        }
    }
}
export const editor = new RecipeEditor(new Recipe());
//# sourceMappingURL=recipe_editor.js.map