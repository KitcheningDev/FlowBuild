import { get_cook } from "../flowbuild/recipe/cook.js";
import { Ingredient } from "../flowbuild/recipe/ingredient.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Task } from "../flowbuild/recipe/task.js";
import { create_new_recipe } from "./editor.js";
const create_btn = document.getElementById('create-btn');
create_btn.addEventListener('click', (e) => {
    create_new_recipe();
});
export function send_html_request(type, str, callback, body) {
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
        console.log(JSON.stringify(JSON.parse(response), null, 4));
        callback(JSON.parse(response));
    };
    req.open(type, str, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(body));
}
const recipes = [];
const tasks = [];
function parse_recipe(json) {
    const recipe = new Recipe();
    recipe.title = json['title'];
    recipe.difficulty = json['difficulty'];
    recipe.duration = json['duration'];
    recipe.prep_time = json['prepTime'];
    recipe.num_shares = json['numShares'];
    recipe.num_likes = json['numLikes'];
    recipe.visibiliy = json['recipeState'];
    recipe.image_list = json['imageList'];
    // for (const task of json['tasks']) {
    //     send_html_request('GET', 'https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task/object/task/1/prod', (json: any) => {
    //         console.log(json);
    //     }, { pks: "TASK#3" });
    // }
    for (const ingredient of json['ingredients']) {
        recipe.ingredients.add(new Ingredient(ingredient['grocerie'], parseFloat(ingredient['amount']), ingredient['unit']));
    }
    return recipe;
}
send_html_request('GET', "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe", (json) => {
    for (const recipe_json of json) {
        recipes.push(parse_recipe(recipe_json));
    }
});
send_html_request('GET', "https://ks29sd5rn3.execute-api.us-east-1.amazonaws.com/staging/task/task/2", (json) => {
    for (const task of json) {
        if (task['SK'].startsWith('TASK')) {
            tasks.push(new Task(task['body'], get_cook(task['cookId'].toString()), new Set(), task['duration']));
        }
    }
    console.log(tasks);
});
function filter_recipes(pattern) {
    const filtered = [];
    for (const recipe of recipes) {
        if (recipe.title.toLowerCase().indexOf(pattern) != -1) {
            filtered.push(recipe);
        }
    }
    return filtered;
}
function update_recommendation() {
    recipe_list.innerHTML = "";
    for (const recipe of filter_recipes(search_input.value.trim().toLowerCase())) {
        const div = document.createElement('div');
        div.classList.add('recipe-preview');
        const img = document.createElement('img');
        img.src = recipe.image_list[0];
        img.width = 101;
        img.height = 64;
        const label = document.createElement('label');
        label.textContent = recipe.title;
        const download = document.createElement('i');
        download.classList.add('fa-solid', 'fa-download', 'fa-2x');
        div.appendChild(img);
        div.appendChild(label);
        // div.appendChild(download);
        recipe_list.appendChild(div);
    }
}
// const search_btn = document.getElementById('search-btn');
const search_input = document.getElementById('search-input');
const recipe_list = document.getElementById('recipe-list');
search_input.addEventListener('keyup', (e) => {
    update_recommendation();
});
search_input.addEventListener('focusin', () => {
    recipe_list.style.display = "";
    update_recommendation();
});
search_input.addEventListener('focusout', () => {
    recipe_list.style.display = "none";
});
//# sourceMappingURL=nav_editor.js.map