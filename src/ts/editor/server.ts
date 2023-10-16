import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Tag, Owner } from "../flowbuild/recipe/recipe_data.js";
import {
  Cook,
  Cook1,
  Cook2,
  Ingredient,
  Product,
  Task,
  Unit,
} from "../flowbuild/recipe/task.js";
import { randomID } from "../utils/obj_id.js";
import { editor } from "./editor.js";
import { html } from "./html.js";
import { config as prodConfig } from "../environment/config.prod.js";
import { config as stagingConfig } from "../environment/config.staging.js";
import { config as devConfig } from "../environment/config.dev.js";
import { environment } from "../environment/environment.js";

// Load the appropriate configuration file
let config: any;
switch (environment) {
  case "prod":
    config = prodConfig;
    break;
  case "staging":
    config = stagingConfig;
    break;
  default:
    config = devConfig;
    break;
}

// Access the configuration for the microservices
const DEFAULT_API_RECIPE = prodConfig.DEFAULT_API_RECIPE;
const DEFAULT_API_TAG = prodConfig.DEFAULT_API_TAG;
const DEFAULT_API_INGREDIENT = prodConfig.DEFAULT_API_INGREDIENT;
const DEFAULT_API_TASK = prodConfig.DEFAULT_API_TASK;
const DEFAULT_API_IMAGES = prodConfig.DEFAULT_API_IMAGES;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
class Server {
  tagsList = [];
  constructor() {
    this.loadRecipes();
    html.search.input.onkeyup = () => this.updateSearchResult();
    this.initialiseTags();
  }

  private initialiseTags(): void {
    this.httpReq(
      "GET",
      DEFAULT_API_TAG + "/tag",
      (list: any) => {
        this.tagsList = list;
        for (const json of list) {
          const option = document.createElement("option");
          option.value = json.PK; // Change 'option_value' to your desired value
          option.textContent = json.tag; // Change 'Option Text' to your desired text
          html.upload.tags_input.appendChild(option);
        }
      },
      undefined,
      true
    );
  }

  // load
  get isUpToDate(): boolean {
    return !this.inload;
  }
  private preload(): void {
    // icon
    html.search.load_icon.classList.add("fa-circle-notch", "fa-spin");
    html.search.load_icon.classList.remove("fa-magnifying-glass");
    console.log("DATABASE LOADING");
    const newTextElement = document.createElement("p");
    newTextElement.className = "loader-text"; // Set the class attribute
    newTextElement.id = "loader-text"; // Set the id attribute
    newTextElement.textContent = "Fecthing our delecious recipes...";
    html.loader.appendChild(newTextElement);
  }
  private onload(): void {
    // icon
    html.search.load_icon.classList.remove("fa-circle-notch", "fa-spin");
    html.search.load_icon.classList.add("fa-magnifying-glass");
    this.updateSearchResult();
    console.log("DATABASE LOAD DONE");
    const textelemnt = document.getElementById("loader-text");
    textelemnt.textContent = "Thank you for waiting";
    setTimeout(() => {
      html.loader.style.display = "none";
    }, 1000);
  }

  loadRecipes(): void {
    // preload
    this.preload();
    // clear
    this.tags = new Map();
    this.ingredients = new Map();
    this.recipes = new Map();
    this.owner = new Map();
    this.tasks = new Map();
    this.conns = new Map();
    // inload
    this.inload = true;
    // load task related data
    this.httpReq(
      "GET",
      DEFAULT_API_TASK + "/task",
      (list: any) => {
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
        this.httpReq(
          "GET",
          DEFAULT_API_INGREDIENT + "/ingredient/categories",
          (categories: any) => {
            sessionStorage.setItem("categories", JSON.stringify(categories));
            this.httpReq(
              "GET",
              DEFAULT_API_RECIPE + "/recipe",
              (list: any) => {
                for (const json of list) {
                  this.loadEntry(json);
                }
                this.inload = false;
                this.onload();
              },
              undefined,
              true
            );
          },
          undefined,
          true
        );
      },
      undefined,
      true
    );
  }
  // http
  private httpReq(
    type: string,
    url: string,
    callback: (json: any) => void,
    data?: any | object,
    async: boolean = false
  ): void {
    const req = new XMLHttpRequest();
    req.onload = () => {
      const response = req.responseText;
      callback(JSON.parse(response));
    };

    req.open(type, url, async);

    if (data instanceof FormData) {
      // If data is FormData, no need to set Content-Type header; it will be automatically set for multipart/form-data
    } else if (data) {
      // If data is a regular object, set the Content-Type header to JSON
      req.setRequestHeader("Content-Type", "application/json");
      data = JSON.stringify(data);
    }

    req.send(data);
  }

  // decode
  private decodeTag(json: any): [number, Tag] {
    const id = parseInt(json["SK"].slice("TAG#".length));
    const tag = new Tag(json["tag"]);
    return [id, tag];
  }
  private decodeIngredient(json: any): [number, Ingredient] {
    const id = parseInt(json["SK"].slice("PROD#".length));
    const ingredient = new Ingredient(
      new Product(json["grocerie"]),
      json["quantity"],
      new Unit(json["unit"]),
      "option2",
      json["SK"]
    );
    return [id, ingredient];
  }
  private decodeOwner(json: any): [number, Owner] {
    const id = parseInt(json["SK"].slice("OWNER#".length));
    const owner = new Owner(json["username"], json["avatar"]);
    return [id, owner];
  }
  private decodeTask(json: any): [number, Task] {
    const id = parseInt(json["SK"].slice("TASK#".length));
    const task = new Task(
      json["body"],
      json["cookID"] == 0 ? null : json["cookID"] == 1 ? Cook1 : Cook2,
      json["duration"]
    );
    return [id, task];
  }
  private decodeConn(
    json: any
  ): [number, { from: Set<number>; to: Set<number> }] {
    const id = parseInt(json["SK"].slice("CONN#".length));
    const parents = new Set<number>();
    for (const parent of json["parentId"]) {
      parents.add(parseInt(parent.slice("TASK#".length)));
    }
    const childs = new Set<number>();
    for (const child of json["childId"]) {
      childs.add(parseInt(child.slice("TASK#".length)));
    }
    return [id, { from: parents, to: childs }];
  }
  private decodeRecipe(json: any): [number, Recipe] {
    const id = parseInt(json["SK"].slice("RECIPE#".length));
    const recipe = new Recipe();
    recipe.clear();
    recipe.title = json["title"];
    recipe.duration = json["duration"];
    recipe.difficulty = json["difficulty"];
    recipe.image_list = json["imageList"];
    recipe.num_likes = json["numLikes"];
    recipe.num_shares = json["numShares"];
    const tasks = new Set<number>();
    for (const taskJson of json["tasks"]) {
      tasks.add(parseInt(taskJson["SK"].slice("TASK#".length)));
    }
    for (const [id, conn] of this.conns) {
      for (const from of conn.from) {
        for (const to of conn.to) {
          if (tasks.has(from) && tasks.has(to)) {
            recipe.addConn(this.tasks.get(from), this.tasks.get(to));
          } else {
            break;
          }
        }
      }
    }
    for (const taskJson of json["tasks"]) {
      const taskID = parseInt(taskJson["SK"].slice("TASK#".length));
      recipe.tasks.add(this.tasks.get(taskID));
    }
    for (const ingredientJson of json["ingredients"]) {
      if (ingredientJson && ingredientJson["SK"])
        recipe.ingredients.add(this.loadEntry(ingredientJson)[1] as Ingredient);
    }
    for (const tagJson of json["tags"]) {
      if (tagJson && tagJson["SK"])
        recipe.tags.add(this.loadEntry(tagJson)[1] as Tag);
    }
    if (Object.keys(json["owner"]).length !== 0)
      recipe.owner = this.loadEntry(json["owner"])[1] as Owner;
    else recipe.owner = {} as Owner;
    /*for (const ownerJson of json['owner']) {
            recipe.owner.add(this.loadEntry(ownerJson)[1] as Owner);
        }*/
    return [id, recipe];
  }
  private loadEntry(json: any): [number, any] {
    if (json["SK"].startsWith("TAG")) {
      const [id, tag] = this.decodeTag(json);
      this.tags.set(id, tag);
      return [id, tag];
    } else if (json["SK"].startsWith("PROD")) {
      const [id, ingredient] = this.decodeIngredient(json);
      this.ingredients.set(id, ingredient);
      return [id, ingredient];
    } else if (json["SK"].startsWith("OWNER")) {
      const [id, owner] = this.decodeOwner(json);
      this.owner.set(id, owner);
      return [id, owner];
    } else if (json["SK"].startsWith("TASK")) {
      const [id, task] = this.decodeTask(json);
      this.tasks.set(id, task);
      return [id, task];
    } else if (json["SK"].startsWith("CONN") && json["parentId"]) {
      const [id, conn] = this.decodeConn(json);
      this.conns.set(id, conn);
      return [id, conn];
    } else if (json["SK"].startsWith("RECIPE")) {
      const [id, recipe] = this.decodeRecipe(json);
      this.recipes.set(id, recipe);
      return [id, recipe];
    }
  }
  // encode
  private encodeTag(id: number, tag: Tag): any {
    const json = { PK: "TAG#" + id, SK: "TAG#" + id };
    json["tag"] = tag.name;
    return json;
  }
  private encodeIngredient(id: number, ingredient: Ingredient): any {
    const json = { PK: "PROD#" + id, SK: "PROD#" + id };
    json["grocerie"] = ingredient.product.name;
    json["quantity"] = ingredient.amount;
    json["unit"] = ingredient.unit.name;
    return json;
  }
  private encodeOwner(id: number, owner: Owner): any {
    const json = { PK: "OWNER#" + id, SK: "OWNER#" + id };
    json["username"] = owner.name;
    json["avatar"] = owner.avatar;
    return json;
  }
  private encodeTask(id: number, task: Task): any {
    const json = { PK: "TASK#" + id, SK: "TASK#" + id };
    json["body"] = task.description;
    json["cookID"] = task.cook == null ? 0 : task.cook == Cook1 ? 1 : 2;
    json["duration"] = task.duration;
    return json;
  }
  private encodeConn(
    id: number,
    conn: { from: Set<number>; to: Set<number> }
  ): any {
    const json = { PK: "CONN#" + id, SK: "CONN#" + id };
    json["parentId"] = [];
    for (const parent of conn.from) {
      json["parentId"].push("TASK#" + parent);
    }
    json["childId"] = [];
    for (const child of conn.to) {
      json["childId"].push("TASK#" + child);
    }
    return json;
  }
  private encodeRecipe(id: number, recipe: Recipe): any {
    const json = { PK: "RECIPE#" + id, SK: "RECIPE#" + id };
    json["title"] = recipe.title;
    json["duration"] = recipe.duration;
    json["difficulty"] = recipe.difficulty;
    json["imageList"] = recipe.image_list;
    json["numLikes"] = recipe.num_likes;
    json["numShares"] = recipe.num_shares;
    return json;
  }
  // image
  public flowchartImageBase64(callback: (base64: string) => void): void {
    window["domtoimage"]
      .toPng(document.getElementById("flowchart-canvas"))
      .then(function (base64: string) {
        callback(base64);
      })
      .catch(function (error: any) {
        console.error("oops, something went wrong!", error);
      });
  }
  public uploadBase64(base64: string, callback: (url: string) => void): void {
    this.httpReq(
      "POST",
      DEFAULT_API_IMAGES + "/images/upload",
      (json: any) => {
        callback(json["imageUrl"]);
      },
      { file: base64 }
    );
  }

  public async flowchartImage(
    callback: (base64: string) => void
  ): Promise<void> {
    try {
      const blob: any = await window["domtoimage"].toBlob(
        document.getElementById("flowchart-canvas")
      );
      callback(blob);
    } catch (error) {
      console.error("Oops, something went wrong!", error);
      throw error; // Rethrow the error to propagate it
    }
  }

  public async uploadimage(blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("image", blob, "image.png"); // 'image.png' is the desired filename on the server

    try {
      const json: any = await new Promise((resolve, reject) => {
        this.httpReq(
          "POST",
          DEFAULT_API_IMAGES + "/images/uploadmulter",
          resolve,
          formData
        );
      });
      return json["imageUrl"];
    } catch (error) {
      console.error("Oops, something went wrong!", error);
      throw error; // Rethrow the error to propagate it
    }
  }
  public async uploadAllImages(files: File[]): Promise<string[]> {
    const imageUrls: string[] = [];

    try {
      for (const file of files) {
        const blob = file;
        const imageUrl = await this.uploadimage(blob);
        imageUrls.push(imageUrl);
      }
    } catch (error) {
      console.error(
        "Oops, something went wrong with uploading an image!",
        error
      );
      throw error; // Rethrow the error to propagate it
    }
    return imageUrls;
  }

  public async uploadFullRecipe(recipe: Recipe): Promise<void> {
    try {
      // Call flowchartImage to capture the canvas image
      await this.flowchartImage((blob: any) => {
        // Continue with image upload after capturing the canvas image
        const filesWithCanvasImage = [
          blob,
          ...Array.from(html.upload.image_input.files),
        ];

        this.uploadAllImages(filesWithCanvasImage)
          .then((imageUrls: string[]) => {
            recipe.image_flowChart = imageUrls.shift();
            recipe.image_list = imageUrls; // Set image URLs after all images are uploaded
            const json = this.encodeRecipeData(recipe);
            this.httpReq(
              "POST",
              DEFAULT_API_RECIPE + "/recipe/full",
              () => {
                console.log("FINISHED UPLOADing ^_^");
                const textelemnt = document.getElementById("loader-text");
                textelemnt.textContent = "Recipe uploaded";
                const icon = document.getElementById("loader");
                icon.className = "loader-icon fa-solid fa-circle-check";
                setTimeout(() => {
                  html.loader.style.display = "none";
                }, 1000);
              },
              json
            );
          })
          .catch((error) => {
            // Handle any errors in the image upload process
            console.error(
              "Oops, something went wrong with uploading images!",
              error
            );
            const textelemnt = document.getElementById("loader-text");
            textelemnt.textContent = "Error occured please try again";
            const icon = document.getElementById("loader");
            icon.className = "fail-icon fa-solid fa-xmark";
            setTimeout(() => {
              html.loader.style.display = "none";
            }, 1000);
          });
      });
    } catch (error) {
      // Handle any errors in capturing the canvas image
      console.error(
        "Oops, something went wrong with capturing the canvas image!",
        error
      );
    }
  }

  private encodeRecipeData(recipe: Recipe): any {
    const recipeData = {
      recipe: {
        PK: "RECIPE#" + recipe.id,
        SK: "RECIPE#" + recipe.id,
        title: recipe.title,
        duration: recipe.duration,
        difficulty: recipe.difficulty,
        imageList: recipe.image_list,
        imageFlowChart: recipe.image_flowChart,
        numLikes: recipe.num_likes,
        numShares: recipe.num_shares,
      },
      owner: recipe.owner,
      tasks: [],
      ingredients: [],
      user: "USER#1",
      tags: [],
      conns: [],
    };

    // Encode and append tasks
    for (const task of recipe.tasks) {
      const taskData = this.encodeTask(task.id, task);
      taskData["PK"] = "TASK#" + task.id;
      recipeData["tasks"].push(taskData);
    }

    // Encode and append ingredients
    for (const ingredient of recipe.ingredients) {
      const ingredientData = this.encodeIngredient(ingredient.id, ingredient);
      ingredientData["PK"] = "RECIPE#" + recipe.id;
      recipeData["ingredients"].push(ingredientData);
    }

    // Encode and append owner
    /*for (const owner of recipe.owner) {
            const ownerData = this.encodeOwner(owner.id, owner);
            ownerData['PK'] = 'RECIPE#' + recipe.id;
            recipeData['owner'].push(ownerData);
        }*/

    // Encode and append tags
    for (const tag of recipe.tags) {
      const tagData = this.encodeTag(tag.id, tag);
      tagData["PK"] = "RECIPE#" + recipe.id;
      recipeData["tags"].push(tag.name);
    }

    // Encode and append conns
    for (const [parent, childs] of recipe.conns) {
      const conn = { from: new Set<number>(), to: new Set<number>() };
      conn.from.add(parent.id);
      for (const child of childs) {
        conn.to.add(child.id);
      }
      const connData = this.encodeConn(randomID(), conn);
      connData["PK"] = "TASK#" + parent.id;
      recipeData["conns"].push(connData);
    }

    return recipeData;
  }

  /* uploadRecipe(recipe: Recipe): void {
        const image_urls = [] as string[];
        
        this.flowchartImage((blob: any) => {            
            this.uploadimage(blob, (image: any) => {
                image_urls.push(image.url);
            })
        })
        for (const file of html.upload.image_input.files) {
            const blob = file;
            server.uploadimage(blob, (image: any) => {
                image_urls.push(image.url);
            });
        }
        // recipe
        this.httpReq('POST', DEFAULT_API_RECIPE+"/recipe", () => {
            // tasks
            for (const task of recipe.tasks) {
                const json = this.encodeTask(task.id, task);
                json['PK'] = 'RECIPE#' + recipe.id;
                this.httpReq('POST', DEFAULT_API_RECIPE+"/recipe", () => { }, json);

                const ownjson = this.encodeTask(task.id, task);
                ownjson['PK'] = 'TASK#' + task.id;
                this.httpReq('POST', DEFAULT_API_TASK+"/task", () => { }, ownjson);
            }
            for (const ingredient of recipe.ingredients) {
                const json = this.encodeIngredient(ingredient.id, ingredient);
                json['PK'] = 'RECIPE#' + recipe.id;
                this.httpReq('POST', DEFAULT_API_RECIPE+"/recipe", () => { }, json);
            }
            // owner
            for (const owner of recipe.owner) {
                const json = this.encodeOwner(owner.id, owner);
                json['PK'] = 'RECIPE#' + recipe.id;
                this.httpReq('POST', DEFAULT_API_TASK+"/task", () => { }, json);
            }
            // tags
            for (const tag of recipe.tags) {
                const json = this.encodeTag(tag.id, tag);
                json['PK'] = 'RECIPE#' + recipe.id;
                this.httpReq('POST', DEFAULT_API_RECIPE+"/recipe", () => { }, json);
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
                this.httpReq('POST', DEFAULT_API_TASK+"/task", () => { }, json);
            }
            console.log('UPLOAD SUCCESS', recipe.title);
        },
            this.encodeRecipe(recipe.id, recipe));
    }*/
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
      const img = html.create("img") as HTMLImageElement;
      if (0 < recipe.image_list.length) {
        img.src = recipe.image_list[0];
      }
      // title
      const title = html.createDiv("result-title");
      title.textContent = recipe.title;

      const versep = html.appendChilds(
        html.createDiv("ver-sep"),
        html.createDiv("inner")
      );

      const time = html.createDiv("time");
      time.textContent = (recipe.duration / 60).toString() + "min";
      const timewrap = html.appendChilds(
        html.createDiv("hor-align", "recipe-property"),
        html.createDiv("icon", "fa-regular", "fa-clock"),
        time
      );
      const align = html.createDiv("hor-align");
      align.appendChild(timewrap);
      align.innerHTML +=
        "<div class='difficulty-icon' ><div class='diff-1' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square' > </div></div><div class='diff-2' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square' > </div></div><div class='diff-3' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square' > </div></div><div class='diff-4' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square' > </div></div><div class='diff-5' ><div class='not-selected icon fa-regular fa-square' > </div><div class='selected icon fa-solid fa-square'> </div></div></div>";
      align
        .querySelector(".diff-" + recipe.difficulty)
        .classList.add("selected");

      const wrap = html.appendChilds(html.createDiv("wrap"), align);
      // item
      const item = html.appendChilds(
        html.createDiv("search-result"),
        html.appendChilds(html.createDiv("hor-align"), img, title),
        versep,
        wrap
      );
      item.onclick = async () => {
        // for (const task of recipe.tasks) {
        //     console.log(task.id, task.description);
        // }
        try {
          const data = {
            pks: Array.from(recipe.ingredients).map((value) => ({
              SK: value.PK,
            })),
          };
          const json: any = await new Promise((resolve, reject) => {
            this.httpReq(
              "POST",
              DEFAULT_API_INGREDIENT + "/ingredient/getCategories",
              resolve,
              data
            );
          });
          sessionStorage.setItem(
            "search",
            JSON.stringify({
              search: true,
              recipeCategories: json,
            })
          );
        } catch (error) {
          console.error("Oops, something went wrong!", error);
          throw error; // Rethrow the error to propagate it
        }
        editor.loadRecipe(recipe);
      };
      // add
      html.appendChilds(html.search.result, item);
    }
  }
  // members
  private inload: boolean;
  recipes: Map<number, Recipe>;
  tasks: Map<number, Task>;
  owner: Map<number, Owner>;
  conns: Map<number, { from: Set<number>; to: Set<number> }>;
  ingredients: Map<number, Ingredient>;
  tags: Map<number, Tag>;
}
export const server = new Server();
document.addEventListener("keypress", (ev) => {
  if (ev.key == "Enter") {
    server.flowchartImage((blob: any) => {
      server.uploadimage(blob).then((url) => {
        console.log(url);
      });
    });
  }
});
