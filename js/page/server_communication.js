import { flatten_graph } from "../flowbuild/flatten.js";
import { last_elem } from "../utils/funcs.js";
function get_date() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    const hh = String(today.getHours()).padStart(2, '0');
    const minmin = String(today.getMinutes()).padStart(2, '0');
    const ss = String(today.getSeconds()).padStart(2, '0');
    return mm + '/' + dd + '/' + yyyy + " " + hh + ":" + minmin + ":" + ss;
}
function send_html_request(type, str, body) {
    const req = new XMLHttpRequest();
    req.onload = () => {
        const response = req.responseText;
        console.log("REQUEST");
        console.log(type, str);
        if (body !== undefined) {
            console.log("BODY");
            console.log(JSON.stringify(body, null, 1));
        }
        console.log("RESPONSE");
        console.log(JSON.stringify(JSON.parse(response), null, 1));
    };
    req.open(type, str, false);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(body));
}
function add_task(task, recipe_key, task_id) {
    const key = recipe_key + task_id.toString();
    const add_body = {
        "PK": "TASK#" + key,
        "SK": "TASK#" + key,
        "body": task.str,
        "cookId": task.cook_id,
        "duration": task.duration
    };
    send_html_request("POST", "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", add_body);
    const update_body = {
        "PK": "RECIPE#" + recipe_key,
        "SK": "TASK#" + key
    };
    send_html_request("POST", "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", update_body);
    return key;
}
function add_connection(from_id, to_id) {
    const key = from_id + to_id;
    const body = {
        "PK": "TASK#" + from_id,
        "SK": "CONNECTION#" + key,
        "parentId": "TASK#" + from_id,
        "childId": "TASK#" + to_id
    };
    send_html_request("POST", "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", body);
    return key;
}
function add_recipe(recipe) {
    const key = Date.now().toString().substring(0, 10);
    const today = get_date();
    const body = {
        "PK": 'RECIPE#' + key,
        "SK": 'RECIPE#' + key,
        "creationDate": today,
        "updateDate": today,
        "title": recipe.title,
        "difficulty": recipe.difficulty,
        "duration": recipe.duration,
        "imageList": [],
        "numCooks": recipe.cook_count,
        "numShares": 1,
        "numLikes": 1,
        "recipeState": "public"
    };
    send_html_request("POST", "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", body);
    const task_key_map = new Map();
    const flattened_paths = flatten_graph(recipe.graph);
    //
    flattened_paths.shift();
    let task_id = 1;
    for (const path of flattened_paths) {
        for (const task of path.tasks) {
            const task_key = add_task(task, key, task_id);
            task_key_map.set(task, task_key);
            task_id++;
            if (task == recipe.graph.last_step) {
                break;
            }
        }
    }
    for (const path of flattened_paths) {
        for (let i = 0; i < path.tasks.length - 1; ++i) {
            if (path.tasks[i] == recipe.graph.last_step) {
                break;
            }
            add_connection(task_key_map.get(path.tasks[i]), task_key_map.get(path.tasks[i + 1]));
        }
        for (const child of path.childs) {
            add_connection(task_key_map.get(last_elem(path.tasks)), task_key_map.get(child.head));
        }
    }
    return key;
}
export function log_all_recipes() {
    send_html_request("GET", "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe");
}
export function upload_recipe(recipe) {
    add_recipe(recipe);
    console.log("UPLOADED RECIPE!!!");
}
//# sourceMappingURL=server_communication.js.map