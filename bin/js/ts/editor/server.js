import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Tag, Owner } from "../flowbuild/recipe/recipe_data.js";
import { Cook1, Cook2, Ingredient, Product, Task, Unit } from "../flowbuild/recipe/task.js";
import { randomID } from "../utils/obj_id.js";
import { editor } from "./editor.js";
import { html } from "./html.js";
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class Server {
    constructor() {
        this.loadRecipes();
        html.search.input.onkeyup = () => this.updateSearchResult();
    }
    // load 
    get isUpToDate() {
        return !this.inload;
    }
    preload() {
        // icon
        html.search.load_icon.classList.add('fa-spinner', 'fa-spin');
        html.search.load_icon.classList.remove('fa-check');
    }
    onload() {
        // icon
        html.search.load_icon.classList.remove('fa-spinner', 'fa-spin');
        html.search.load_icon.classList.add('fa-check');
        this.updateSearchResult();
        console.log("DATABASE LOAD DONE");
    }
    loadRecipes() {
        // preload
        this.preload();
        // clear
        this.tags = new Map();
        this.ingredients = new Map();
        this.recipes = new Map();
        this.owners = new Map();
        this.tasks = new Map();
        this.conns = new Map();
        // inload
        this.inload = true;
        // load task related data
        this.httpReq('GET', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", (list) => {
            for (const json of list) {
                this.loadEntry(json);
            }
            for (const task of this.tasks) {
                console.log("TASK", task);
            }
            for (const conn of this.conns.values()) {
                console.log("CONN", conn.from, conn.to);
            }
            // load recipes
            this.httpReq('GET', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", (list) => {
                for (const json of list) {
                    this.loadEntry(json);
                }
                this.inload = false;
                this.onload();
            }, undefined, true);
        }, undefined, true);
    }
    // http
    httpReq(type, str, callback, body, async = false) {
        const req = new XMLHttpRequest();
        req.onload = () => {
            const response = req.responseText;
            console.log("BODY", body, "RESPONSE", JSON.parse(response));
            callback(JSON.parse(response));
        };
        req.open(type, str, async);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(body));
    }
    // decode
    decodeTag(json) {
        const id = parseInt(json['SK'].slice("TAG#".length));
        const tag = new Tag(json['tag']);
        return [id, tag];
    }
    decodeIngredient(json) {
        const id = parseInt(json['SK'].slice("PROD#".length));
        const ingredient = new Ingredient(new Product(json['grocerie']), json['quantity'], new Unit(json['unit']));
        return [id, ingredient];
    }
    decodeOwner(json) {
        const id = parseInt(json['SK'].slice("OWNER#".length));
        const owner = new Owner(json['username'], json['avatar']);
        return [id, owner];
    }
    decodeTask(json) {
        const id = parseInt(json['SK'].slice("TASK#".length));
        const task = new Task(json['body'], (json['cookID'] == 0 ? null : (json['cookID'] == 1 ? Cook1 : Cook2)), json['duration']);
        return [id, task];
    }
    decodeConn(json) {
        const id = parseInt(json['SK'].slice("CONN#".length));
        const parents = new Set();
        for (const parent of json['parentId']) {
            parents.add(parseInt(parent.slice("TASK#".length)));
        }
        const childs = new Set();
        for (const child of json['childId']) {
            childs.add(parseInt(child.slice("TASK#".length)));
        }
        return [id, { from: parents, to: childs }];
    }
    decodeRecipe(json) {
        const id = parseInt(json['SK'].slice("RECIPE#".length));
        const recipe = new Recipe();
        recipe.clear();
        recipe.title = json['title'];
        recipe.duration = json['duration'];
        recipe.difficulty = json['difficulty'];
        recipe.image_list = json['imageList'];
        recipe.num_likes = json['numLikes'];
        recipe.num_shares = json['numShares'];
        const tasks = new Set();
        for (const taskJson of json['tasks']) {
            tasks.add(parseInt(taskJson['SK'].slice("TASK#".length)));
        }
        if (recipe.title == "LastTest10") {
            console.log(...tasks);
        }
        for (const [id, conn] of this.conns) {
            for (const from of conn.from) {
                for (const to of conn.to) {
                    if (tasks.has(from) && tasks.has(to)) {
                        if (recipe.title == "LastTest10") {
                            console.log("R", from, to);
                            // console.log("R", this.tasks.get(from).description, this.tasks.get(to).description);
                        }
                        recipe.addConn(this.tasks.get(from), this.tasks.get(to));
                    }
                    else {
                        break;
                    }
                }
            }
        }
        for (const taskJson of json['tasks']) {
            if (recipe.title == "LastTest10") {
                console.log(taskJson);
            }
            const taskID = parseInt(taskJson['SK'].slice("TASK#".length));
            recipe.tasks.add(this.tasks.get(taskID));
        }
        for (const ingredientJson of json['ingredients']) {
            recipe.ingredients.add(this.loadEntry(ingredientJson)[1]);
        }
        for (const tagJson of json['tags']) {
            recipe.tags.add(this.loadEntry(tagJson)[1]);
        }
        for (const ownerJson of json['owner']) {
            recipe.owners.add(this.loadEntry(ownerJson)[1]);
        }
        return [id, recipe];
    }
    loadEntry(json) {
        if (json['SK'].startsWith('TAG')) {
            const [id, tag] = this.decodeTag(json);
            this.tags.set(id, tag);
            return [id, tag];
        }
        else if (json['SK'].startsWith('PROD')) {
            const [id, ingredient] = this.decodeIngredient(json);
            this.ingredients.set(id, ingredient);
            return [id, ingredient];
        }
        else if (json['SK'].startsWith('OWNER')) {
            const [id, owner] = this.decodeOwner(json);
            this.owners.set(id, owner);
            return [id, owner];
        }
        else if (json['SK'].startsWith('TASK')) {
            const [id, task] = this.decodeTask(json);
            this.tasks.set(id, task);
            return [id, task];
        }
        else if (json['SK'].startsWith('CONN') && json['parentId']) {
            const [id, conn] = this.decodeConn(json);
            this.conns.set(id, conn);
            return [id, conn];
        }
        else if (json['SK'].startsWith('RECIPE')) {
            const [id, recipe] = this.decodeRecipe(json);
            this.recipes.set(id, recipe);
            return [id, recipe];
        }
    }
    // encode
    encodeTag(id, tag) {
        const json = { 'PK': 'TAG#' + id, 'SK': 'TAG#' + id };
        json['tag'] = tag.name;
        return json;
    }
    encodeIngredient(id, ingredient) {
        const json = { 'PK': 'PROD#' + id, 'SK': 'PROD#' + id };
        json['grocerie'] = ingredient.product.name;
        json['quantity'] = ingredient.amount;
        json['unit'] = ingredient.unit.name;
        return json;
    }
    encodeOwner(id, owner) {
        const json = { 'PK': 'OWNER#' + id, 'SK': 'OWNER#' + id };
        json['username'] = owner.name;
        json['avatar'] = owner.avatar;
        return json;
    }
    encodeTask(id, task) {
        const json = { 'PK': 'TASK#' + id, 'SK': 'TASK#' + id };
        json['body'] = task.description;
        json['cookID'] = (task.cook == null ? 0 : (task.cook == Cook1 ? 1 : 2));
        json['duration'] = task.duration;
        return json;
    }
    encodeConn(id, conn) {
        const json = { 'PK': 'CONN#' + id, 'SK': 'CONN#' + id };
        json['parentId'] = [];
        for (const parent of conn.from) {
            json['parentId'].push('TASK#' + parent);
        }
        json['childId'] = [];
        for (const child of conn.to) {
            json['childId'].push('TASK#' + child);
        }
        return json;
    }
    encodeRecipe(id, recipe) {
        const json = { 'PK': 'RECIPE#' + id, 'SK': 'RECIPE#' + id };
        json['title'] = recipe.title;
        json['duration'] = recipe.duration;
        json['difficulty'] = recipe.difficulty;
        json['imageList'] = recipe.image_list;
        json['numLikes'] = recipe.num_likes;
        json['numShares'] = recipe.num_shares;
        return json;
    }
    uploadRecipe(recipe) {
        // recipe
        this.httpReq('POST', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", () => {
            // tasks
            for (const task of recipe.tasks) {
                const json = this.encodeTask(task.id, task);
                json['PK'] = 'RECIPE#' + recipe.id;
                this.httpReq('POST', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", () => { }, json);
                const ownjson = this.encodeTask(task.id, task);
                ownjson['PK'] = 'TASK#' + task.id;
                this.httpReq('POST', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", () => { }, ownjson);
            }
            for (const ingredient of recipe.ingredients) {
                const json = this.encodeIngredient(ingredient.id, ingredient);
                json['PK'] = 'RECIPE#' + recipe.id;
                this.httpReq('POST', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", () => { }, json);
            }
            // owners
            for (const owner of recipe.owners) {
                const json = this.encodeOwner(owner.id, owner);
                json['PK'] = 'RECIPE#' + recipe.id;
                this.httpReq('POST', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", () => { }, json);
            }
            // tags
            for (const tag of recipe.tags) {
                const json = this.encodeTag(tag.id, tag);
                json['PK'] = 'RECIPE#' + recipe.id;
                this.httpReq('POST', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", () => { }, json);
            }
            // conns
            for (const [parent, childs] of recipe.conns) {
                // conn
                const conn = { from: new Set(), to: new Set() };
                conn.from.add(parent.id);
                for (const child of childs) {
                    conn.to.add(child.id);
                }
                // json
                const json = this.encodeConn(randomID(), conn);
                json['PK'] = 'TASK#' + parent.id;
                this.httpReq('POST', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", () => { }, json);
            }
            console.log('UPLOAD SUCCESS', recipe.title);
        }, this.encodeRecipe(recipe.id, recipe));
    }
    // search
    matchingRecipes(query) {
        const list = [];
        for (const [_, recipe] of this.recipes) {
            if (recipe.title.toLowerCase().includes(query.toLowerCase())) {
                list.push(recipe);
            }
        }
        return list;
    }
    updateSearchResult() {
        const result = this.matchingRecipes(html.search.input.value);
        html.search.result.innerHTML = "";
        for (const recipe of result) {
            // img
            const img = html.create('img');
            if (0 < recipe.image_list.length) {
                img.src = recipe.image_list[0];
            }
            // title
            const title = html.create('label');
            title.textContent = recipe.title;
            // item
            const item = html.appendChilds(html.createDiv('search-item', 'btn'), img, title);
            item.onclick = () => {
                for (const task of recipe.tasks) {
                    console.log(task.id, task.description);
                }
                editor.loadRecipe(recipe);
            };
            // add
            html.appendChilds(html.search.result, item);
        }
        ;
    }
}
;
export const server = null; //new Server();
//# sourceMappingURL=server.js.map