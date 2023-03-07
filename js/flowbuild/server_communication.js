function send_html_request(type, str) {
    const req = new XMLHttpRequest();
    req.onload = () => {
        console.log("REQUEST:", type, str, "RESPONSE:", req.responseText);
    };
    console.log(name);
    req.open(type, str, false);
    req.send();
}
// function add_recipe(): void {
//     const {
//         "PK":"RECIPE#1",
//         "SK":"RECIPE#1",
//         "creationDate":"06/12/2022 20:58:00",
//         "updateDate":"06/12/2022 20:58:00",
//         "title":"testRecipe",
//         "difficulty":1,
//         "duration":1500,
//         "imageList":["https://cdn.pixabay.com/photo/2014/04/22/02/56/pizza-329523_960_720.jpg"],
//         "numCooks":1,
//         "numShares":10,
//         "numLikes":10,
//         "recipeState":"public"
//     }
// }
export function log_all_recipes() {
    send_html_request("GET", "https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe");
}
export function upload_recipe(recipe) {
}
//# sourceMappingURL=server_communication.js.map