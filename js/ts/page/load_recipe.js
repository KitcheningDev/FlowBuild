import { recipe_t } from "../flowbuild/recipe.js";
export function load_recipe(name) {
    let out;
    const req = new XMLHttpRequest();
    req.onload = () => {
        console.log("loaded json recipe:", name);
        const json = JSON.parse(req.responseText);
        out = new recipe_t(json);
    };
    req.open("GET", `${document.URL}/recipes/${name}.json`, false);
    req.send();
    return out;
}
//# sourceMappingURL=load_recipe.js.map