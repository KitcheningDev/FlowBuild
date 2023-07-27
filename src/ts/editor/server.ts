import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Tag, Owner } from "../flowbuild/recipe/recipe_data.js";
import { Cook, Cook1, Cook2, Ingredient, Product, Task, Unit } from "../flowbuild/recipe/task.js";
import { randomID } from "../utils/obj_id.js";
import { editor } from "./editor.js";
import { html } from "./html.js";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class Server {
    constructor() {
        // this.loadRecipes();
        html.search.input.onkeyup = () => this.updateSearchResult();
    }
    // load 
    get isUpToDate(): boolean {
        return !this.inload;
    }
    private preload(): void {
        // icon
        html.search.load_icon.classList.add('fa-circle-notch', 'fa-spin');
        html.search.load_icon.classList.remove('fa-magnifying-glass');
    }
    private onload(): void {
        // icon
        html.search.load_icon.classList.remove('fa-circle-notch', 'fa-spin');
        html.search.load_icon.classList.add('fa-magnifying-glass');
        this.updateSearchResult();
        console.log("DATABASE LOAD DONE");
    }
    loadRecipes(): void {
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
        this.httpReq('GET', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", (list: any) => {
            for (const json of list) {
                this.loadEntry(json);
            }
            // for (const task of this.tasks) {
            //     console.log("TASK", task);
            // }
            // for (const conn of this.conns.values()) {
            //     console.log("CONN", conn.from, conn.to);
            // }
            // load recipes
            this.httpReq('GET', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", (list: any) => {
                for (const json of list) {
                    this.loadEntry(json);
                }
                this.inload = false;
                this.onload();
            }, undefined, true);
        }, undefined, true);
    }
    // http
    private httpReq(type: string, str: string, callback: (json: any) => void, body?: any, async: boolean = false): any {
        const req = new XMLHttpRequest();
        req.onload = () => {
            const response = req.responseText;
            console.log("BODY", body, "RESPONSE", JSON.parse(response));
            callback(JSON.parse(response));
        }
        req.open(type, str, async);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(body));
    }
    // decode
    private decodeTag(json: any): [number, Tag] {
        const id = parseInt(json['SK'].slice("TAG#".length));
        const tag = new Tag(json['tag']);
        return [id, tag];
    }
    private decodeIngredient(json: any): [number, Ingredient] {
        const id = parseInt(json['SK'].slice("PROD#".length));
        const ingredient = new Ingredient(new Product(json['grocerie']), json['quantity'], new Unit(json['unit']));
        return [id, ingredient];
    }
    private decodeOwner(json: any): [number, Owner] {
        const id = parseInt(json['SK'].slice("OWNER#".length));
        const owner = new Owner(json['username'], json['avatar']);
        return [id, owner];
    }
    private decodeTask(json: any): [number, Task] {
        const id = parseInt(json['SK'].slice("TASK#".length));
        const task = new Task(json['body'], (json['cookID'] == 0 ? null : (json['cookID'] == 1 ? Cook1 : Cook2)), json['duration']);
        return [id, task];
    }
    private decodeConn(json: any): [number, { from: Set<number>, to: Set<number> }] {
        const id = parseInt(json['SK'].slice("CONN#".length));
        const parents = new Set<number>();
        for (const parent of json['parentId']) {
            parents.add(parseInt(parent.slice("TASK#".length)));
        }
        const childs = new Set<number>();
        for (const child of json['childId']) {
            childs.add(parseInt(child.slice("TASK#".length)));
        }
        return [id, { from: parents, to: childs }];
    }
    private decodeRecipe(json: any): [number, Recipe] {
        const id = parseInt(json['SK'].slice("RECIPE#".length));
        const recipe = new Recipe();
        recipe.clear();
        recipe.title = json['title'];
        recipe.duration = json['duration'];
        recipe.difficulty = json['difficulty'];
        recipe.image_list = json['imageList']
        recipe.num_likes = json['numLikes'];
        recipe.num_shares = json['numShares'];
        const tasks = new Set<number>();
        for (const taskJson of json['tasks']) {
            tasks.add(parseInt(taskJson['SK'].slice("TASK#".length)));
        }
        for (const [id, conn] of this.conns) {
            for (const from of conn.from) {
                for (const to of conn.to) {
                    if (tasks.has(from) && tasks.has(to)) {
                        recipe.addConn(this.tasks.get(from), this.tasks.get(to));
                    }
                    else {
                        break;
                    }
                }
            }
        }
        for (const taskJson of json['tasks']) {
            const taskID = parseInt(taskJson['SK'].slice("TASK#".length));
            recipe.tasks.add(this.tasks.get(taskID));
        }
        for (const ingredientJson of json['ingredients']) {
            recipe.ingredients.add(this.loadEntry(ingredientJson)[1] as Ingredient);
        }
        for (const tagJson of json['tags']) {
            recipe.tags.add(this.loadEntry(tagJson)[1] as Tag);
        }
        for (const ownerJson of json['owner']) {
            recipe.owners.add(this.loadEntry(ownerJson)[1] as Owner);
        }
        return [id, recipe];
    }
    private loadEntry(json: any): [number, any] {
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
    private encodeTag(id: number, tag: Tag): any {
        const json = { 'PK': 'TAG#' + id, 'SK': 'TAG#' + id };
        json['tag'] = tag.name;
        return json;
    }
    private encodeIngredient(id: number, ingredient: Ingredient): any {
        const json = { 'PK': 'PROD#' + id, 'SK': 'PROD#' + id };
        json['grocerie'] = ingredient.product.name;
        json['quantity'] = ingredient.amount;
        json['unit'] = ingredient.unit.name;
        return json;
    }
    private encodeOwner(id: number, owner: Owner): any {
        const json = { 'PK': 'OWNER#' + id, 'SK': 'OWNER#' + id };
        json['username'] = owner.name;
        json['avatar'] = owner.avatar;
        return json;
    }
    private encodeTask(id: number, task: Task): any {
        const json = { 'PK': 'TASK#' + id, 'SK': 'TASK#' + id };
        json['body'] = task.description;
        json['cookID'] = (task.cook == null ? 0 : (task.cook == Cook1 ? 1 : 2));
        json['duration'] = task.duration;
        return json;
    }
    private encodeConn(id: number, conn: { from: Set<number>, to: Set<number> }): any {
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
    private encodeRecipe(id: number, recipe: Recipe): any {
        const json = { 'PK': 'RECIPE#' + id, 'SK': 'RECIPE#' + id };
        json['title'] = recipe.title;
        json['duration'] = recipe.duration;
        json['difficulty'] = recipe.difficulty;
        json['imageList'] = recipe.image_list;
        json['numLikes'] = recipe.num_likes;
        json['numShares'] = recipe.num_shares;
        return json;
    }
    // image
    public flowchartImageBase64(callback: (base64: string) => void): void {
        window['domtoimage'].toPng(document.getElementById('flowchart-canvas'))
            .then(function (base64: string) {
                callback(base64);
            })
            .catch(function (error: any) {
                console.error('oops, something went wrong!', error);
            });
    }
    public uploadBase64(base64: string, callback: (url: string) => void): void {
        console.log(`{ "file": "${base64}"}`);
        this.httpReq('POST', 'https://26mq4gqu64.execute-api.us-east-1.amazonaws.com/staging/images/upload', (json: any) => {
            callback(json['imageUrl']);
        }, { file: base64 });
    }
    uploadRecipe(recipe: Recipe): void {
        const image_urls = [] as string[];
        this.flowchartImageBase64((base64: string) => {
            this.uploadBase64(base64, (url: string) => {
                image_urls.push(base64);
            })
        })
        for (const file of html.upload.image_input.files) {
            const FR = new FileReader();
            FR.onloadend = function () {
                server.uploadBase64(FR.result.toString(), (url: string) => { 
                    image_urls.push(url);
                });
            };
            FR.readAsDataURL(file);
        }
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
                const conn = { from: new Set<number>(), to: new Set<number>() };
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
        },
            this.encodeRecipe(recipe.id, recipe));
    }
    // search
    private matchingRecipes(query: string): Recipe[] {
        const list = [] as Recipe[];
        for (const [_, recipe] of this.recipes) {
            if (recipe.title.toLowerCase().includes(query.toLowerCase())) {
                list.push(recipe);
            }
        }
        return list;
    }
    private updateSearchResult(): void {
        const result = this.matchingRecipes(html.search.input.textContent);
        html.search.result.innerHTML = "";
        for (const recipe of result) {
            //         <img src="https://cdn.pixabay.com/photo/2016/09/21/20/18/pumpkin-soup-1685574_960_720.jpg"
            //         alt="">
            //     <div class="result-title">Pumpkin Soup</div>
            //     <div class="ver-sep">
            //         <div class="inner"></div>
            //     </div>

            //     <div class="wrapper">

            //         <div class="hor-align">
            //             <div class="hor-align recipe-property">
            //                 <div class="icon fa-regular fa-clock"></div>
            //                 <div class="time">30min</div>
            //             </div>
            //             <div class="hor-align">
            //                 <div class="difficulty-icon">
            //                     <div class="diff-1">
            //                         <div class="not-selected icon fa-regular fa-square"></div>
            //                         <div class="selected icon fa-solid fa-square"></div>
            //                     </div>
            //                     <div class="diff-2">
            //                         <div class="not-selected icon fa-regular fa-square"></div>
            //                         <div class="selected icon fa-solid fa-square"></div>
            //                     </div>
            //                     <div class="diff-3">
            //                         <div class="not-selected icon fa-regular fa-square"></div>
            //                         <div class="selected icon fa-solid fa-square"></div>
            //                     </div>
            //                     <div class="diff-4">
            //                         <div class="not-selected icon fa-regular fa-square"></div>
            //                         <div class="selected icon fa-solid fa-square"></div>
            //                     </div>
            //                     <div class="diff-5 selected">
            //                         <div class="not-selected icon fa-regular fa-square"></div>
            //                         <div class="selected icon fa-solid fa-square"></div>
            //                     </div>
            //                 </div>
            //             </div>
            //         </div>

            //     </div>
            // </div>
            // img
            const img = html.create('img') as HTMLImageElement;
            if (0 < recipe.image_list.length) {
                img.src = recipe.image_list[0];
            }
            // title
            const title = html.createDiv('result-title');
            title.textContent = recipe.title;

            const versep = html.appendChilds(html.createDiv('ver-sep'), html.createDiv('inner'));

            const time = html.createDiv('time');
            time.textContent = (recipe.duration / 60).toString() + 'min';
            const timewrap = html.appendChilds(html.createDiv('hor-align', 'recipe-property'), html.createDiv('icon', 'fa-regular', 'fa-clock'), time);
            const align = html.createDiv('hor-align');
            align.appendChild(timewrap);
            align.innerHTML += "<div class='difficulty-icon' ><div class='diff-1' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square' > </div></div><div class='diff-2' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square' > </div></div><div class='diff-3' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square' > </div></div><div class='diff-4' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square' > </div></div><div class='diff-5' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square'> </div></div></div>";
            align.querySelector('.diff-' + recipe.difficulty).classList.add('selected');

            const wrap = html.appendChilds(html.createDiv('wrap'), align);
            // item
            const item = html.appendChilds(html.createDiv('search-result'), html.appendChilds(html.createDiv('hor-align'), img, title), versep, wrap);
            item.onclick = () => {
                // for (const task of recipe.tasks) {
                //     console.log(task.id, task.description);
                // }
                editor.loadRecipe(recipe)
            };
            // add
            html.appendChilds(html.search.result, item);
        };
    }
    // members
    private inload: boolean;
    recipes: Map<number, Recipe>;
    tasks: Map<number, Task>;
    owners: Map<number, Owner>;
    conns: Map<number, { from: Set<number>, to: Set<number> }>;
    ingredients: Map<number, Ingredient>;
    tags: Map<number, Tag>;
};
export const server = new Server();
document.addEventListener('keypress', (ev) => {
    if (ev.key == 'Enter') {
        server.flowchartImageBase64((base64: string) => {
            server.uploadBase64(base64, (url: string) => {
                console.log(url);
            })
        });
    }
})
