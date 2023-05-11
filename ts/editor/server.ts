import { get_cook } from "../flowbuild/recipe/cook.js";
import { Ingredient } from "../flowbuild/recipe/ingredient.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Tag } from "../flowbuild/recipe/tag.js";
import { Task } from "../flowbuild/recipe/task.js";

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

    for (const ingredient of json['ingredients']) {
        recipe.ingredients.add(parse_ingredient(ingredient));
    }
    for (const data of json['tasks']) {
        const task = parseInt(data['SK'].substring(5));
        for (const child of conns.get(task)) {
            recipe.add_connection(tasks.get(task), tasks.get(child));
        }
    }
    for (const data of json['tags']) {
        recipe.tags.add(new Tag(data['tag']));
    }

    return recipe;
}
// load recipe related data
send_html_request('GET', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", (json: any) => {
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
        for (const data of json) {
            recipes.push(parse_recipe(data));
        }
    });
});

// upload
export function upload_recipe(): void {

}