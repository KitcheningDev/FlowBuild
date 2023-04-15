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
export function send_html_request(type, str, body) {
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
function add_task(task, recipe_key) {
    const key = recipe_key + task.id.toString();
    const add_body = {
        "PK": recipe_key,
        "SK": key
    };
    send_html_request("POST", "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", add_body);
    const update_body = {
        "PK": key,
        "SK": key,
        "body": task.description,
        "cookId": task.cook.id,
        "duration": task.duration
    };
    send_html_request("PUT", "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", update_body);
    return key;
}
function add_connection(from_id, to_id) {
    const key = from_id + to_id;
    const body = {
        "PK": from_id,
        "SK": key,
        "parentId": from_id,
        "childId": to_id
    };
    send_html_request("POST", "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task", body);
    return key;
}
function add_recipe(recipe) {
    const key = "RECIPE#" + Date.now().toString();
    const today = get_date();
    const body = {
        "PK": key,
        "SK": key,
        "creationDate": today,
        "updateDate": today,
        "title": recipe.title,
        "difficulty": recipe.difficulty,
        "duration": recipe.duration,
        "imageList": recipe.image_list,
        "numCooks": recipe.get_num_cooks(),
        "numShares": recipe.num_shares,
        "numLikes": recipe.num_likes,
        "recipeState": recipe.visibiliy
    };
    send_html_request("POST", "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", body);
    const task_key_map = new Map();
    const graph = recipe.create_graph();
    for (const node of graph.nodes) {
        const task_key = add_task(node.task, key);
        task_key_map.set(node.task, task_key);
    }
    for (const parent of graph.nodes) {
        for (const child of parent.childs) {
            add_connection(task_key_map.get(parent.task), task_key_map.get(child.task));
        }
    }
    return key;
}
export function log_all_recipes() {
    send_html_request("GET", "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe");
}
export function upload_recipe(recipe) {
    add_recipe(recipe);
    console.log("UPLOADED RECIPE!");
}
//# sourceMappingURL=database.js.map