import { get_cook } from "../flowbuild/recipe/cook.js";
import { Ingredient } from "../flowbuild/recipe/ingredient.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Tag } from "../flowbuild/recipe/tag.js";
import { Task } from "../flowbuild/recipe/task.js";
import { recipe } from "./editor.js";

// html request
function send_html_request(type: string, str: string, callback: (json: any) => void, body?: any): any {
    const req = new XMLHttpRequest();
    req.onload = () => {
        const response = req.responseText;
        callback(JSON.parse(response));
    }
    req.open(type, str, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(body));
}

// load
export const recipes = [] as Recipe[];
const tasks = new Map<number, Task>();
const conns = new Map<number, Set<number>>();

function parse_conn(json: any): void {
    const pk = parseInt(json['PK'].substring(5));
    for (const parent of json['parentId']) {
        const parent_id = parseInt(parent.substring(5));
        if (!conns.has(parent_id)) {
            conns.set(parent_id, new Set());
        }
        conns.get(parent_id).add(pk);
    }
    for (const child of json['childId']) {
        conns.get(pk).add(parseInt(child.substring(5)));
    }
}
function parse_task_body(json: any): void {
    const task = tasks.get(parseInt(json['PK'].substring(5)));
    task.description = json['body'];
    task.cook = get_cook(json['cookId'].toString());
    task.duration = json['duration'];
}
function parse_ingredient(json: any): Ingredient {
    return new Ingredient(json['grocerie'], parseFloat(json['quantity']), json['unit']);
}
function parse_recipe(json: any): Recipe {
    const recipe = new Recipe();
    recipe.pk = parseInt((json['PK'] as string).substring(7));
    recipe.title = json['title'];
    recipe.difficulty = json['difficulty'];
    recipe.duration = json['duration'];
    recipe.prep_time = json['prepTime'];
    recipe.num_shares = json['numShares'];
    recipe.num_likes = json['numLikes'];
    recipe.visibiliy = json['recipeState'];
    recipe.image_list = json['imageList'];

    console.log(recipe.title);
    for (const ingredient of json['ingredients']) {
        recipe.ingredients.add(parse_ingredient(ingredient));
    }
    for (const data of json['tasks']) {
        const task = parseInt(data['SK'].substring(5));
        for (const child of conns.get(task)) {
            recipe.add_connection(tasks.get(task), tasks.get(child));
        }
        console.log(tasks.get(task));
    }
    for (const data of json['tags']) {
        recipe.tags.add(new Tag(data['tag']));
    }

    return recipe;
}
// load recipe related data
send_html_request('GET', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", (json: any) => {
    console.log(json);
    for (const data of json) {
        const pk = parseInt(data['PK'].substring(5));
        if (!tasks.has(pk)) {
            tasks.set(pk, new Task('', get_cook('0'), new Set(), 0));
        }
        if (!conns.has(pk)) {
            conns.set(pk, new Set());
        }

        if (data['SK'].startsWith('TASK')) {
            parse_task_body(data);
        }
        if (data['SK'].startsWith('PROD')) {
            tasks.get(pk).ingredients.add(parse_ingredient(data));
        }
        if (data['SK'].startsWith('CONN')) {
            parse_conn(data);
        }
    }
    // load recipes
    send_html_request('GET', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", (json: any) => {
        console.log(json);
        for (const data of json) {
            recipes.push(parse_recipe(data));
        }
    });
});

// upload
function get_date(): string {
    const d = new Date();
    const date = d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
    const time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
    return date + ' ' + time;
}
function random(): number {
    return Math.floor(1_000_000 * Math.random());
}
export function upload_recipe(): void {
    // recipe
    const recipe_json = {};
    const pk = random();
    recipe_json['PK'] = 'RECIPE#' + pk.toString();
    recipe_json['SK'] = 'RECIPE#' + pk.toString();
    recipe_json['creationDate'] = get_date();
    recipe_json['updateDate'] = get_date();
    recipe_json['numLikes'] = 0;
    recipe_json['numShares'] = 0;
    recipe_json['title'] = recipe.title;
    recipe_json['difficulty'] = recipe.difficulty;
    recipe_json['duration'] = recipe.duration;
    recipe_json['recipeState'] = 'public';
    recipe_json['prepTime'] = 0;
    recipe_json['imageList'] = [];
    recipe_json['numCooks'] = recipe.get_num_cooks();
    send_html_request('POST', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", () => {}, recipe_json); 

    console.log(recipe.ingredients);
    // ingredient
    for (const ingredient of recipe.ingredients) {
        const ingredient_json = {
            PK: "RECIPE#" + pk,
            SK: "PROD#" + random(),
            grocerie: ingredient.grocerie,
            quantity: ingredient.amount,
            unit: ingredient.unit
        };
        send_html_request('POST', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", () => {}, ingredient_json); 
    }

    // task
    const task_pk_map = new Map<Task, number>();
    for (const task of recipe.get_tasks()) {
        task_pk_map.set(task, random());
    }
    for (const task of recipe.get_tasks()) {
        const task_json = {
            PK: "TASK#" + task_pk_map.get(task).toString(),
            SK: "TASK#" + task_pk_map.get(task).toString(),
            body: task.description,
            cookId: task.cook.id,
            duration: task.duration
        };
        send_html_request('POST', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", () => {}, task_json); 
        
        // conn
        const conn_json = {
            PK: "TASK#" + task_pk_map.get(task).toString(),
            SK: "CONN#" + random().toString(),
            parentId: ["TASK#" + task_pk_map.get(task).toString()],
            childId: []
        }
        for (const child of recipe.get_childs(task)) {
            conn_json['childId'].push("TASK#" + task_pk_map.get(child).toString());
        }
        send_html_request('POST', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", () => {}, conn_json); 
    }
    for (const [task, task_pk] of task_pk_map) {
        send_html_request('POST', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", () => {}, { 
            SK: "RECIPE#" + pk.toString(),
            PK: "TASK#" + task_pk.toString()
        });
    }
}