// NOTES
// the loaded recipe is automatically drawn and updated on the html_element with the id #flowchart-container
// modify recipe data via a form
// modify task data via a form that opens when you click on a task html_element(contained in #flowchart-container)
// modify flowchart via drag and drop between task html_elements
// recipe creation / loading
create_new_recipe();
void ;
load_recipe_from_database(title, string);
boolean; // returns if recipe exists or not
// recipe uploading
upload_recipe(username, string, visibility, string);
void ;
// recipe data(operates on current recipe, either a new recipe or a loaded recipe)
set_recipe_title(title, string);
void ;
get_recipe_title();
string;
get_recipe_ingredients();
{
    grocerie: string, quantity;
    string, unit;
    string;
}
[];
set_recipe_ingredients(ingredients, { grocerie: string, quantity: string, unit: string }[]);
void ;
set_recipe_images(url_list, string[]);
void ;
get_recipe_images();
string[];
set_recipe_duration(duration, number);
void ;
get_recipe_duration();
number;
set_recipe_prep_time(prep_time, number);
void ;
get_recipe_prep_time();
number;
set_recipe_difficulty(difficulty, string);
void ;
get_recipe_difficulty();
string;
get_recipe_num_shares();
number;
get_recipe_num_likes();
number;
// task data(operates on task with id "task_id")
get_task_id(html_el, HTMLElement);
number | null; // returns null if html_element is not a task
set_task_description(task_id, number, description, string);
void ;
get_task_description(task_id, number);
string;
get_task_ingredients();
{
    grocerie: string, quantity;
    string, unit;
    string;
}
[];
set_task_ingredients(ingredients, { grocerie: string, quantity: string, unit: string }[]);
void ;
set_task_cook(task_id, number, cook, string);
void ;
get_task_cook(task_id, number);
string;
set_task_duration(task_id, number, duration, number);
void ;
get_task_duration(task_id, number);
number;
// modify flowchart(operates on current recipe)
add_task(previous_task_id, number);
void ;
add_task();
void ; // if no argument passed, creates a task from the start node
add_task_between(previous_task_id, number, next_task_id, number);
void ; // adds task between two tasks
remove_task(task_id, number);
void ;
add_connection(from_task_id, number, to_task_id, number);
void ;
remove_connection(from_task_id, number, to_task_id, number);
void ;
//# sourceMappingURL=api_layout.js.map