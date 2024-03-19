import { drawRecipe } from "../flowbuild/draw_recipe.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Tag } from "../flowbuild/recipe/recipe_data.js";
import {
  Cook,
  Cook1,
  Cook2,
  Ingredient,
  Product,
  Task,
  Unit,
} from "../flowbuild/recipe/task.js";
import { html } from "./html.js";
import { server } from "./server.js";
const fakeData = {
  recipeTitle: "Pasta Carbonara",
  difficulty: 1,
  ingredients: [
    {
      amount: 8,
      unit: "ounces",
      ingredient: "spaghetti",
    },
    {
      amount: 4,
      unit: "ounces",
      ingredient: "pancetta",
    },
    {
      amount: 2,
      unit: "cloves",
      ingredient: "garlic",
    },
    {
      amount: 2,
      unit: "large",
      ingredient: "eggs",
    },
    {
      amount: 1,
      unit: "cup",
      ingredient: "Parmesan cheese",
    },
    {
      amount: 1,
      unit: "cup",
      ingredient: "heavy cream",
    },
    {
      amount: 1,
      unit: "teaspoon",
      ingredient: "black pepper",
    },
    {
      amount: 1,
      unit: "tablespoon",
      ingredient: "olive oil",
    },
  ],
  instructions: [
    {
      id: 1,
      ingredients: [
        {
          amount: 8,
          unit: "ounces",
          ingredient: "spaghetti",
        },
        {
          amount: 4,
          unit: "ounces",
          ingredient: "pancetta",
        },
        {
          amount: 1,
          unit: "tablespoon",
          ingredient: "olive oil",
        },
      ],
      body: "1.",
      duration: "15 minutes",
    },
    {
      id: 2,
      ingredients: [
        {
          amount: 2,
          unit: "cloves",
          ingredient: "garlic",
        },
      ],
      body: "2.",
      duration: "1 minute",
    },
    {
      id: 3,
      ingredients: [
        {
          amount: 2,
          unit: "large",
          ingredient: "eggs",
        },
        {
          amount: 1,
          unit: "cup",
          ingredient: "Parmesan cheese",
        },
        {
          amount: 1,
          unit: "cup",
          ingredient: "heavy cream",
        },
        {
          amount: 1,
          unit: "teaspoon",
          ingredient: "black pepper",
        },
      ],
      body: "3.",
      duration: "2 minutes",
    },
    {
      id: 4,
      ingredients: [
        {
          amount: 1,
          unit: "cup",
          ingredient: "Parmesan cheese",
        },
      ],
      body: "4y.",
      duration: "3 minutes",
    },
    {
      id: 5,
      ingredients: [
        {
          amount: 8,
          unit: "ounces",
          ingredient: "spaghetti",
        },
        {
          amount: 4,
          unit: "ounces",
          ingredient: "pancetta",
        },
        {
          amount: 2,
          unit: "cloves",
          ingredient: "garlic",
        },
        {
          amount: 2,
          unit: "large",
          ingredient: "eggs",
        },
        {
          amount: 1,
          unit: "cup",
          ingredient: "Parmesan cheese",
        },
        {
          amount: 1,
          unit: "cup",
          ingredient: "heavy cream",
        },
        {
          amount: 1,
          unit: "teaspoon",
          ingredient: "black pepper",
        },
        {
          amount: 1,
          unit: "tablespoon",
          ingredient: "olive oil",
        },
      ],
      body: "5",
      duration: "2 minutes",
    },
  ],
  conns: [
    {
      id: 1,
      from: [1],
      to: [2],
      description: "1",
    },
    {
      id: 2,
      from: [2],
      to: [3, 4],
      description: "2.",
    },
    {
      id: 3,
      from: [3],
      to: [5],
      description: "3.",
    },
    {
      id: 4,
      from: [4],
      to: [5],
      description: "4.",
    },
  ],
  servings: 4,
};
function isNumSeq(str: string): boolean {
  if (str.length == 0) {
    return false;
  }
  for (let i = 0; i < str.length; ++i) {
    if (!("0" <= str[i] && str[i] <= "9")) {
      return false;
    }
  }
  return true;
}
class Connection {
  constructor(from: Task, to: Task) {
    this.from = from;
    this.to = to;
  }
  from: Task;
  to: Task;
}
class Change {
  constructor() {
    this.added = [];
    this.removed = [];
  }
  added: Connection[];
  removed: Connection[];
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
    html.upload.toggle.onpointerdown = () => {
      this.loadUploadEditor();
      this.toggleUploadEditor();
    };
    html.upload.submit.onpointerdown = () => {
      console.log("UPLOADING...");
      html.loader.style.display = "flex";
      const newTextElement = document.getElementById("loader-text");
      newTextElement.textContent = "UPLOADING...";
      html.loader.appendChild(newTextElement);
      //server.uploadRecipe(recipe);
      server.uploadFullRecipe(recipe);
      this.hideUploadEditor();
    };
    html.upload.title_input.onkeyup = () => this.updateRecipeTitle();
    html.upload.diff1.parentElement.onpointerup = () =>
      this.updateRecipeDifficulty();
    html.upload.diff2.parentElement.onpointerup = () =>
      this.updateRecipeDifficulty();
    html.upload.diff3.parentElement.onpointerup = () =>
      this.updateRecipeDifficulty();
    html.upload.diff4.parentElement.onpointerup = () =>
      this.updateRecipeDifficulty();
    html.upload.diff5.parentElement.onpointerup = () =>
      this.updateRecipeDifficulty();
    html.upload.duration_input.onkeyup = () => this.updateRecipeDuration();
    html.upload.min.parentElement.onpointerup = () =>
      this.updateRecipeDuration();
    html.upload.hr.parentElement.onpointerup = () =>
      this.updateRecipeDuration();
    html.upload.owner_input.onkeyup = () => this.updateRecipeOwner();
    html.upload.tags_input.onclick = () => this.updateRecipetags();
    html.recipeBot.popupButton.onclick = () => this.openRecipeBot();
    html.recipeBot.closeButton.onclick = () => this.closeRecipeBot();
    html.recipeBot.sendMessageButton.onclick = (event) => this.sendMessageBot(event);

    // flowchart editor
    html.flowchart.canvas.onpointerdown = (ev: PointerEvent) => {
      const target = ev.target as HTMLElement;
      if (target.classList.contains("flow-task")) {
        const task = this.recipe.byID(parseInt(target.id));
        if (this.isTaskEditorVisible()) {
          if (target.id == this.task.id.toString()) {
            this.hideTaskEditor();
            this.deselectTask();
          } else {
            this.loadTaskEditor(task);
            this.selectTask(task);
          }
        } else {
          this.loadTaskEditor(task);
          this.selectTask(task);
          this.showTaskEditor();
        }
      } else if (target.classList.contains("flow-start")) {
        const task = this.recipe.byID(parseInt(target.id));
        this.hideTaskEditor();
        if (this.from && target.id == this.from.id.toString()) {
          this.deselectTask();
        } else {
          this.selectTask(task);
        }
      } else if (html.parent(target, "connect")) {
        this.showAddRemove();
      } else if (html.parent(target, "trash")) {
        this.deleteTask();
        this.hideTaskEditor();
        this.deselectTask();
      } else if (html.parent(target, "add")) {
        const to = this.recipe.byID(
          parseInt(html.parent(target, "add").id.slice(4))
        );
        this.addConn(to);
        this.hideTaskEditor();
        this.deselectTask();
      } else if (html.parent(target, "remove")) {
        const to = this.recipe.byID(
          parseInt(html.parent(target, "remove").id.slice(7))
        );
        this.removeConn(to);
        this.hideTaskEditor();
        this.deselectTask();
      } else if (html.parent(target, "cook-new")) {
        const btn = html.parent(target, "cook-new");
        let task: Task;
        if (btn.id == "new-Küchenlehrling") {
          task = new Task("-task-", Cook1);
        } else if (btn.id == "new-Küchenmeister") {
          task = new Task("-task-", Cook2);
        }
        this.submitChange(
          [
            new Connection(this.recipe.start, task),
            new Connection(task, this.recipe.end),
          ],
          []
        );
        this.loadFlowchart();

        this.loadTaskEditor(task);
        this.selectTask(task);
        this.showTaskEditor();
        html.task.description_input.select();
        this.showAddRemove();
      } else {
        this.hideTaskEditor();
        this.deselectTask();
      }
    };
    document.body.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key == "u" && document.activeElement.tagName != "INPUT") {
        this.undoChange();
      }
    });
    document.getElementById("undo-btn").onclick = () => this.undoChange();
  }

  openRecipeBot(): void {
    // Initially, set the scale to 0, opacity to 0, and make it visible
    html.recipeBot.popup.style.transform = "scale(0)";
    html.recipeBot.popup.style.opacity = "0";
    html.recipeBot.popup.style.display = "block";

    // Trigger a reflow before applying the scale and opacity transitions
    html.recipeBot.popup.offsetHeight;

    // Apply the scale and opacity transitions to make the popup appear
    html.recipeBot.popup.style.transform = "scale(1)";
    html.recipeBot.popup.style.opacity = "1";
  }
  closeRecipeBot(): void {
    // Apply the scale and opacity transitions to make the popup disappear
    html.recipeBot.popup.style.transform = "scale(0)";
    html.recipeBot.popup.style.opacity = "0";

    // After the transition is complete, hide the popup
    setTimeout(() => {
      html.recipeBot.popup.style.display = "none";
    }, 300); // Adjust the duration to match your transition duration
  }

  showSearchingMessage() {
    console.log("showSearchingMessage");
    const chatMessages = document.getElementById("chat-messages");
    if (chatMessages) {
      const searchingMessage = document.createElement("div");
      searchingMessage.className = "chat-message chat-searching-message";
      searchingMessage.innerText = "Searching...";
      chatMessages.appendChild(searchingMessage);

      const loader = document.createElement("div");
      loader.className = "chat-loader";
      chatMessages.appendChild(loader);
    }
  }

  hideSearchingMessage() {
    console.log("hideSearchingMessage");
    const chatMessages = document.getElementById("chat-messages");

    // Remove the searching message and loader
    const searchingMessage = chatMessages.querySelector(
      ".chat-searching-message"
    );
    const loader = chatMessages.querySelector(".chat-loader");

    if (searchingMessage) {
      searchingMessage.remove();
    }

    if (loader) {
      loader.remove();
    }
  }

  appendReplyMessage(message: string) {
    const chatMessages = document.getElementById("chat-messages");
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message";
    messageElement.innerText = message;
    chatMessages.appendChild(messageElement);
  }

  async sendMessageBot(event:Event): Promise<void> {
    event.preventDefault();
    let message = html.recipeBot.messageInput.value.trim();
    var selectedRadio = document.querySelector('input[name="chat-category"]:checked') as any;
    if (message !== "") {
      this.appendMessage(message);
      html.recipeBot.messageInput.value = "";
      this.showSearchingMessage();     
      console.log("Selected category: " + selectedRadio?.value);
      if(selectedRadio){
        message = selectedRadio.value + " " + message 
      }
      setTimeout(async () => {
        try {
          //const recipe = fakeData;
          const recipe = await server.askRecipeBot(message)
          recipe.ingredients.forEach((element:any, index:number) => {
            const newIngredient = server.encodeBotIngredient(element);
            recipe.ingredients[index] = newIngredient;
          });
          const tempRecipe = new Recipe();
          tempRecipe.title = recipe.recipeTitle
          tempRecipe.difficulty = recipe.difficulty
          tempRecipe.ingredients = recipe.ingredients
          tempRecipe.loadFromData(recipe);
          console.log(tempRecipe);
          this.loadRecipe(tempRecipe);
          this.hideSearchingMessage();
          this.appendMessage("what do you think about the recipe : \n"+ recipe.recipeTitle,true);
        } catch (error) {
          this.hideSearchingMessage();
        }
      }, 1000);
    }
  }

  appendMessage(message: string, bot?:boolean): void {
    const messagesContainer = document.getElementById("chat-messages");
    if (messagesContainer) {
      const messageElement = document.createElement("div");
      messageElement.className = "chat-message";
      messageElement.innerText = message;
      if(bot){
        messageElement.classList.add("bot-message");
      }else{
        messageElement.classList.add("user-message");
      }
      messagesContainer.appendChild(messageElement);
    }
  }

  loadRecipe(recipe: Recipe): void {    
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
  submitChange(added: Connection[], removed: Connection[]): void {
    const change = new Change();
    change.added = added.filter(
      (conn: Connection) => !this.recipe.childs(conn.from).has(conn.to)
    );
    change.removed = removed.filter((conn: Connection) =>
      this.recipe.childs(conn.from).has(conn.to)
    );
    for (const conn of change.added) {
      this.recipe.addConn(conn.from, conn.to);
    }
    for (const conn of change.removed) {
      this.recipe.removeConn(conn.from, conn.to);
    }
    this.history.push(change);
    // console.error(this.history);
  }
  undoChange(): void {
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
  private loadIngredientEditor(): void {
    html.ingredient.container.innerHTML = "";    
    for (const ingredient of this.recipe.ingredients) {
      this.addIngredientRow(ingredient);
    }
  }
  private updateRecipeIngredients(): void {
    this.recipe.ingredients = new Set<Ingredient>();
    for (const row of html.ingredient.container.rows) {
      const [product, amount, unit, cat] = row.getElementsByClassName(
        "ingredient-property"
      ) as HTMLCollectionOf<HTMLInputElement>;
      this.recipe.ingredients.add(
        new Ingredient(
          new Product(product.value.trim()),
          parseFloat(amount.value.trim()),
          new Unit(unit.value.trim()),
          cat.value
        )
      );
    }
    //console.log(this.recipe.ingredients);
  }
  private addIngredientRow(
    ingredient: Ingredient = new Ingredient(
      new Product("product"),
      0,
      new Unit("unit"),
      "categorie"
    )
  ): void {
    const row = html.addCls(
      html.ingredient.container.insertRow(),
      "ingredient"
    );
    row.onkeyup = () => this.updateRecipeIngredients();

    // product
    const product = html.create(
      "input",
      "ingredient-property"
    ) as HTMLInputElement;
    product.value = ingredient.product.name;
    product.type = "text";
    html.appendChilds(row.insertCell(), product);
    // amount
    const amount = html.create(
      "input",
      "ingredient-property"
    ) as HTMLInputElement;
    amount.value = ingredient.amount.toString();
    amount.type = "text";
    html.appendChilds(row.insertCell(), amount);
    // unit
    const unit = html.create(
      "input",
      "ingredient-property"
    ) as HTMLInputElement;
    unit.value = ingredient.unit.name;
    unit.type = "text";
    html.appendChilds(row.insertCell(), unit);

    //categorie products
    const categorie = html.create(
      "select",
      "ingredient-property"
    ) as HTMLSelectElement;
    const categories = JSON.parse(sessionStorage.getItem("categories"));

    categories.forEach((element: any) => {
      const option = document.createElement("option");
      option.value = element.PK;
      option.text = element.name;
      if (sessionStorage.getItem("search")) {
        const search = JSON.parse(
          sessionStorage.getItem("search")
        ).recipeCategories;
        const isProductInCategory = search.some((searchCategory: any) =>
          searchCategory.products.some(
            (product: any) =>
              product.grocerie === ingredient.product.name &&
              searchCategory.PK === element.PK
          )
        );

        option.selected = isProductInCategory;
      } else {
        categorie.selectedIndex = 0;
      }
      categorie.appendChild(option);
    });
    categorie.onchange = () => this.updateRecipeIngredients();
    html.appendChilds(row.insertCell(), categorie);

    // onkeydown
    product.onkeydown = (ev: KeyboardEvent) => {
      if (ev.key == "Enter") {
        amount.focus();
      }
    };
    amount.onkeydown = (ev: KeyboardEvent) => {
      if (ev.key == "Enter") {
        unit.focus();
      }
    };
    unit.onkeydown = (ev: KeyboardEvent) => {
      if (ev.key == "Enter") {
        unit.blur();
      }
    };
    // trash
    const trash = html.createDiv(
      "trash",
      "ingredient-delete",
      "fa-solid",
      "fa-trash"
    );
    trash.onclick = (e: MouseEvent) => {
      row.remove();
      this.updateRecipeIngredients();
    };
    html.appendChilds(row.insertCell(), trash);
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
    } else if (
      to == this.recipe.end &&
      this.recipe.childs(this.from).size > 1 &&
      !this.recipe.childs(this.from).has(to)
    ) {
      return true;
    } else if (
      this.from == this.recipe.start &&
      this.recipe.childs(this.from).has(to) &&
      this.recipe.parents(to).size == 1
    ) {
      return true;
    } else if (
      to == this.recipe.end &&
      this.recipe.parents(to).has(this.from) &&
      this.recipe.childs(this.from).size == 1
    ) {
      return true;
    } else {
      return false;
    }
  }
  private showNew(): void {
    for (const element of document.getElementsByClassName("cook-new")) {
      element.classList.add("selected");
    }
  }
  private hideNew(): void {
    for (const element of document.getElementsByClassName("cook-new")) {
      element.classList.remove("selected");
    }
  }
  private showConnectTrash(): void {
    this.hideNew();
    document
      .getElementById("connector-" + this.from.id)
      ?.classList.add("selected");
    document.getElementById("trash-" + this.from.id)?.classList.add("selected");
  }
  private hideConnectTrash(): void {
    this.hideNew();
    document
      .getElementById("connector-" + this.from.id)
      ?.classList.remove("selected");
    document
      .getElementById("trash-" + this.from.id)
      ?.classList.remove("selected");
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
        document.getElementById("remove-" + task.id).classList.add("selected");
      } else if (task != this.from) {
        document.getElementById("add-" + task.id).classList.add("selected");
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
        document
          .getElementById("remove-" + task.id)
          .classList.remove("selected");
        // document.getElementById('new-' + task.id).classList.remove('selected');
      } else if (task != this.from) {
        document.getElementById("add-" + task.id).classList.remove("selected");
      }
    }
  }
  private deleteTask(): void {
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
        if (
          parent == this.recipe.start &&
          0 < this.recipe.parents(child).size
        ) {
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
  private addConn(to: Task): void {
    const change = new Change();
    change.added.push(new Connection(this.from, to));
    const graph = this.recipe.createGraph();
    if (!graph.byTask(to).reachable(graph.byTask(this.from))) {
      change.removed.push(
        new Connection(this.from, this.recipe.end),
        new Connection(this.recipe.start, to)
      );
    }
    this.submitChange(change.added, change.removed);
    this.loadFlowchart();
  }
  private removeConn(to: Task): void {
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
      html.task.cook_section.style.display = "";
      if (this.task.cook == Cook1) {
        html.task.cook1.checked = true;
        html.task.cook2.checked = false;
      } else if (this.task.cook == Cook2) {
        html.task.cook1.checked = false;
        html.task.cook2.checked = true;
      } else {
        html.task.cook1.checked = false;
        html.task.cook2.checked = false;
      }
    } else {
      html.task.cook_section.style.display = "none";
    }
    // duration
    html.task.sec.checked = false;
    html.task.min.checked = false;
    html.task.hr.checked = false;
    if (this.task.duration == 0) {
      html.task.duration_input.value = "0";
      html.task.sec.checked = true;
    } else {
      if (this.task.duration % 3600 == 0) {
        html.task.duration_input.value = (this.task.duration / 3600).toString();
        html.task.hr.checked = true;
      } else if (this.task.duration % 60 == 0) {
        html.task.duration_input.value = (this.task.duration / 60).toString();
        html.task.min.checked = true;
      } else {
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
      } else if (html.task.min.checked) {
        this.task.duration *= 60;
      } else if (html.task.hr.checked) {
        this.task.duration *= 3600;
      }
    }
  }
  // visibility
  private isTaskEditorVisible(): boolean {
    return !html.task.editor.classList.contains("hide");
  }
  private showTaskEditor(): void {
    html.task_upload_pop_up.classList.remove("hide");
    html.task.editor.classList.remove("hide");
    html.upload.editor.classList.add("hide");
  }
  private hideTaskEditor(): void {
    html.task_upload_pop_up.classList.add("hide");
    html.task.editor.classList.add("hide");
  }
  private toggleTaskEditor(): void {
    if (this.isTaskEditorVisible()) {
      this.hideTaskEditor();
    } else {
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
    } else if (this.recipe.difficulty == 2) {
      html.upload.diff2.checked = true;
    } else if (this.recipe.difficulty == 3) {
      html.upload.diff3.checked = true;
    } else if (this.recipe.difficulty == 4) {
      html.upload.diff4.checked = true;
    } else if (this.recipe.difficulty == 5) {
      html.upload.diff5.checked = true;
    }
    // duration
    html.upload.min.checked = false;
    html.upload.hr.checked = false;
    if (this.recipe.duration == 0) {
      html.upload.duration_input.value = "0";
      html.upload.min.checked = true;
    } else {
      if (this.recipe.duration % 3600 == 0) {
        html.upload.duration_input.value = (
          this.recipe.duration / 3600
        ).toString();
        html.upload.hr.checked = true;
      } else if (this.recipe.duration % 60 == 0) {
        html.upload.duration_input.value = (
          this.recipe.duration / 60
        ).toString();
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
    } else if (html.upload.diff2.checked) {
      this.recipe.difficulty = 2;
    } else if (html.upload.diff3.checked) {
      this.recipe.difficulty = 3;
    } else if (html.upload.diff4.checked) {
      this.recipe.difficulty = 4;
    } else if (html.upload.diff5.checked) {
      this.recipe.difficulty = 5;
    }
  }
  // duration
  private updateRecipeDuration(): void {
    if (isNumSeq(html.upload.duration_input.value)) {
      this.recipe.duration = parseInt(html.upload.duration_input.value);
      if (html.upload.min.checked) {
        this.recipe.duration *= 60;
      } else if (html.upload.hr.checked) {
        this.recipe.duration *= 3600;
      }
    }
  }
  // visibility
  private isUploadEditorVisible(): boolean {
    return !html.upload.editor.classList.contains("hide");
  }
  private showUplaodEditor(): void {
    html.task_upload_pop_up.classList.remove("hide");
    html.upload.editor.classList.remove("hide");
    html.task.editor.classList.add("hide");
  }
  private hideUploadEditor(): void {
    html.task_upload_pop_up.classList.add("hide");
    html.upload.editor.classList.add("hide");
  }
  private toggleUploadEditor(): void {
    if (this.isUploadEditorVisible()) {
      this.hideUploadEditor();
    } else {
      this.showUplaodEditor();
    }
  }
  // owner
  private updateRecipeOwner(): void {
    this.recipe.owner.name = html.upload.owner_input.value.trim();
  }
  private updateRecipetags(): void {
    const selectedOptions = Array.from(
      html.upload.tags_input.selectedOptions
    ).map((option) => option.textContent);
    const selectedOptionsPKs = Array.from(
      html.upload.tags_input.selectedOptions
    ).map((option) => option.value);
    const tag = Array.from(this.recipe.tags).map((tag) => tag.name);
    if (!tag.includes(selectedOptionsPKs[0])) {
      const paragraph = html.upload.chosen_tags;
      if (paragraph.textContent.length > 0) {
        paragraph.textContent =
          paragraph.textContent + " ," + selectedOptions[0];
      } else {
        paragraph.textContent = selectedOptions[0];
      }

      console.log("Selected options:", selectedOptions);

      for (const selectedTag of selectedOptionsPKs) {
        this.recipe.tags.add(new Tag(selectedTag));
      }
      console.log("recipe tags:", this.recipe.tags);
    } else {
      console.log(" already chosen");
    }
  }
  // member
  private recipe: Recipe;
  private task: Task | null;
  private from: Task | null;
  private to: Task | null;
  private history: Change[];
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
