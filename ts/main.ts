import { Recipe } from "./flowbuild/recipe/recipe.js";
import { Cook } from "./flowbuild/recipe/cook.js";
import { Task } from "./flowbuild/recipe/task.js";
import { collapse } from "./flowbuild/collapse/collapse.js";
import { add_sync_lines } from "./flowbuild/collapse/post_process/add_sync_lines.js";
import { draw_grid } from "./flowbuild/position/draw.js";
import { get_grid_offset } from "./flowbuild/position/get_grid_offset.js";
import { add_lines } from "./flowbuild/collapse/post_process/add_lines.js";
import { add_cook_lines } from "./flowbuild/collapse/post_process/add_cook_lines.js";
import { add_start_end } from "./flowbuild/collapse/post_process/add_start_end.js";
import { create_rules } from "./flowbuild/collapse/create_rules.js";
import { add_connection, recipe, set_cook } from "./test_recipe.js";
import { log_graph, log_grid } from "./flowbuild/log.js";
import { local_center } from "./flowbuild/collapse/post_process/center_nodes.js";
import { MetricGrid } from "./flowbuild/position/metric_grid.js";
import { draw_recipe } from "./flowbuild/draw_recipe.js";
import { send_html_request } from "./api/database.js";

// const recipe = new Recipe("recipe");

// --test !!!invalid
// const start = new Task("START", [], new Cook(""), 0);
// const task1 = new Task("task 1 shfjsdhsjdh jsdj hjsd hjsdhj", [], new Cook("cook 1"), 5);
// const task2 = new Task("task 2", [], new Cook("cook 1"), 5);
// const task3 = new Task("task 3", [], new Cook("cook 1"), 5);
// const task4 = new Task("task 4 hjksd hksjd hjsd hsjdjh shdj sjd jdjshd jshd jhsjd jsd jsdjsd hjsd jsd j", [], new Cook("cook 1"), 5);
// const task5 = new Task("task 5", [], new Cook("cook 1"), 5);
// const task6 = new Task("task 6", [], new Cook("cook 1"), 5);
// const end = new Task("END", [], new Cook(""), 0);

// recipe.add_connection(start, task1);
// recipe.add_connection(start, task2);

// recipe.add_connection(task2, task3);
// recipe.add_connection(task2, task4);

// recipe.add_connection(task3, task5);
// recipe.add_connection(task3, task6);

// recipe.add_connection(task1, end);
// recipe.add_connection(task4, end);
// recipe.add_connection(task5, end);
// recipe.add_connection(task6, end);

// --hummus
// const start = new Task("START", [], new Cook(""), 0);
// const task1 = new Task("Kichererbsen abwaschen", [], new Cook("1"), 0);
// const task2 = new Task("Zitrone pressen", [], new Cook("1"), 0);
// const task3 = new Task("Knoblauch pressen", [], new Cook("2"), 0);
// const task4 = new Task("Gemüse &amp; Brot schneiden", [], new Cook("2"), 0);
// const task5 = new Task("Mit Tahina &amp; Öl pürieren", [], new Cook("1"), 0);
// const task6 = new Task("Würzen", [], new Cook("1"), 0);
// const task7 = new Task("Gemeinsam anrichten", [], new Cook(""), 0);
// const end = new Task("END", [], new Cook(""), 0);

// recipe.add_connection(start, task1);
// recipe.add_connection(start, task3);
// recipe.add_connection(start, task4);

// recipe.add_connection(task1, task2);
// recipe.add_connection(task2, task5);
// recipe.add_connection(task3, task5);
// recipe.add_connection(task5, task6);

// recipe.add_connection(task4, task7);
// recipe.add_connection(task6, task7);

// recipe.add_connection(task7, end);


// --bruschetta
// const start = new Task("START", [], new Cook(""), 0);
// const task1 = new Task("Tomaten entkernen", [], new Cook("1"), 0);
// const task2 = new Task("Tomaten Würfeln", [], new Cook("1"), 0);
// const task3 = new Task("Zwiebeln schneiden", [], new Cook("1"), 0);
// const task4 = new Task("Oliven schneiden", [], new Cook("1"), 0);
// const task5 = new Task("In Essig &amp; Öl schwenken", [], new Cook("1"), 0);
// const task6 = new Task("Würzen", [], new Cook("1"), 0);
// const task7 = new Task("Ofen auf 180°C vorheizen", [], new Cook("2"), 0);
// const task8 = new Task("Baguette schneiden", [], new Cook("2"), 0);
// const task9 = new Task("Brot mit Öl bestreichen", [], new Cook("2"), 0);
// const task10 = new Task("3-4 Blätter zum Dekorieren beiseite legen", [], new Cook("2"), 0);
// const task11 = new Task("Restlichen Basilikum hacken", [], new Cook("2"), 0);
// const task12 = new Task("Brot für 10 Minuten backen ", [], new Cook("2"), 0);
// const task13 = new Task("Mit Knoblauchzehe einreiben", [], new Cook("2"), 0);
// const task14 = new Task("Auf Brot anrichten &amp; servieren", [], new Cook(""), 0);
// const end = new Task("END", [], new Cook(""), 0);

// recipe.add_connection(start, task1);
// recipe.add_connection(start, task7);

// recipe.add_connection(task1, task2);
// recipe.add_connection(task2, task3);
// recipe.add_connection(task3, task4);
// recipe.add_connection(task4, task5);
// recipe.add_connection(task5, task6);
// recipe.add_connection(task6, task14);

// recipe.add_connection(task7, task8);
// recipe.add_connection(task8, task9);
// recipe.add_connection(task9, task10);
// recipe.add_connection(task10, task11);
// recipe.add_connection(task11, task5);
// recipe.add_connection(task11, task14);
// recipe.add_connection(task9, task12);
// recipe.add_connection(task12, task13);
// recipe.add_connection(task13, task5);
// recipe.add_connection(task13, task14);
// recipe.add_connection(task14, end);

// --loop-test
// const start = new Task("START", [], new Cook(''), 0);
// const task1 = new Task("task1", [], new Cook(''), 0);
// const entry_task = new Task("entry", [], new Cook(''), 0);
// const exit_task = new Task("exit", [], new Cook(''), 0);
// const task4 = new Task("task4", [], new Cook(''), 0);
// const loop_task = new Task("loop", [], new Cook(''), 0);
// const end = new Task("END", [], new Cook(''), 0);

// recipe.add_connection(start, task1);
// recipe.add_connection(task1, entry_task);
// recipe.add_connection(entry_task, exit_task);

// // recipe.add_connection(exit_task, entry_task);

// recipe.add_connection(exit_task, loop_task);
// recipe.add_connection(loop_task, entry_task);

// recipe.add_connection(exit_task, task4);
// recipe.add_connection(task4, end);

// --pilz-risotto
// const start = new Task("START", [], new Cook(''), 0);
// const task1 = new Task("Zwiebel schneiden", [], new Cook('1'), 0);
// const task2 = new Task("Knoblauch schneiden", [], new Cook('1'), 0);
// const task3 = new Task("Alles in Öl anbraten bis glasig", [], new Cook('1'), 0);
// const task4 = new Task("Reis 2 min mit anbraten", [], new Cook('1'), 0);
// const task5 = new Task("Mit Weißwein ablöschen", [], new Cook('1'), 0);
// const task6 = new Task("Reis fertig?", [], new Cook('1'), 0);
// const task7 = new Task("Parmesan einschmelzen lassen", [], new Cook('1'), 0);
// const task8 = new Task("Pfifferlinge in Öl anbraten", [], new Cook('1'), 0);
// const task9 = new Task("Pfifferlinge abtupfen & unterheben", [], new Cook('1'), 0);

// const task10 = new Task("Gemüsebrühe ansetzen", [], new Cook('2'), 0);
// const task11 = new Task("Warten bis vollst. aufgesogen", [], new Cook('2'), 0);
// const task12 = new Task("Konstantes rühren unter offenem deckel", [], new Cook('2'), 0);
// const task13 = new Task("Mit 1 Kelle Brühe Übergießen", [], new Cook('2'), 0);

// const task14 = new Task("Abschmecken &amp; servieren", [], new Cook('1'), 0);
// const end = new Task("END", [], new Cook(''), 0);

// const dummy = task6;//new Task("dummy", [], new Cook('1'), 0);

// recipe.add_connection(start, task1);
// recipe.add_connection(task1, task2);
// recipe.add_connection(task2, task3);
// recipe.add_connection(task3, task4);
// recipe.add_connection(task4, task5);
// recipe.add_connection(task5, dummy);
// // recipe.add_connection(dummy, task6);
// recipe.add_connection(task6, task7);
// recipe.add_connection(task6, task8);
// recipe.add_connection(task7, task9);
// recipe.add_connection(task8, task9);
// recipe.add_connection(task9, task14);
// recipe.add_connection(task14, end);

// recipe.add_connection(start, task10);
// recipe.add_connection(task10, dummy);
// recipe.add_connection(task6, task13);
// recipe.add_connection(task13, task11);
// recipe.add_connection(task13, task12);
// recipe.add_connection(task11, dummy);
// recipe.add_connection(task12, dummy);

// --tacos
// const start = new Task('START', [], new Cook(''), 0);
// const last_step = new Task('last step', [], new Cook(''), 0);
// const end = new Task('END', [], new Cook(''), 0);

// const task1 = new Task('task 1', [], new Cook('1'), 0);
// const task2 = new Task('task 2', [], new Cook('1'), 0);
// const task3 = new Task('task 3', [], new Cook('1'), 0);
// const task4 = new Task('task 4', [], new Cook('1'), 0);
// const task5 = new Task('task 5', [], new Cook('1'), 0);
// const task6 = new Task('task 6', [], new Cook('1'), 0);

// const task7 = new Task('task 7', [], new Cook('2'), 0);
// const task8 = new Task('task 8', [], new Cook('2'), 0);
// const task9 = new Task('task 9', [], new Cook('2'), 0);
// const task10 = new Task('task 10', [], new Cook('2'), 0);
// const task11 = new Task('task 11', [], new Cook('2'), 0);
// const task12 = new Task('task 12', [], new Cook('2'), 0);
// const task13 = new Task('task 13', [], new Cook('2'), 0);
// const task14 = new Task('task 14', [], new Cook('2'), 0);
// const task15 = new Task('task 15', [], new Cook('2'), 0);
// const task16 = new Task('task 16', [], new Cook('2'), 0);

// recipe.add_connection(start, task1);
// recipe.add_connection(start, task2);
// recipe.add_connection(start, task7);
// recipe.add_connection(start, task14);

// recipe.add_connection(task2, task9);

// recipe.add_connection(task1, task3);
// recipe.add_connection(task3, task4);
// recipe.add_connection(task3, task5);
// recipe.add_connection(task4, task6);
// recipe.add_connection(task5, last_step);
// recipe.add_connection(task6, last_step);

// recipe.add_connection(task7, task8);
// recipe.add_connection(task8, task9);
// recipe.add_connection(task9, task10);
// recipe.add_connection(task10, task11);
// recipe.add_connection(task11, task12);
// recipe.add_connection(task12, task13);
// recipe.add_connection(task13, task4);
// recipe.add_connection(task13, task5);

// recipe.add_connection(task14, task15);
// recipe.add_connection(task15, task16);
// recipe.add_connection(task16, last_step);

// recipe.add_connection(last_step, end);

// --bananenbrot
// add_connection(0, 1, 2, 3, 4, 5, 6, 7, 8, 6, 7, 9, 10, 11);
// add_connection(0, 12, 13, 3);
// add_connection(0, 14, 5);
// set_cook('1', 1, 2, 3, 4, 5, 6, 7, 8, 9);
// set_cook('2', 12, 13, 14);

// --pho-hanoi
// add_connection(0, 1, 2, 3);
// add_connection(0, 4, 5, 6, 7, 8, 9, 2);
// add_connection(0, 10, 11, 12, 13, 14, 5);
// add_connection(0, 15, 16, 2);
// add_connection(15, 17, 2);
// set_cook('1', 1, 4, 5, 6, 7, 8, 9);
// set_cook('2', 10, 11, 12, 13, 14, 15, 16, 17);

// --loaded-fries
add_connection(0, 3, 4, 5, 6, 7, 8, 1, 2);
add_connection(0, 9, 10, 11, 12, 8);
add_connection(11, 13, 14, 15, 16, 1);
set_cook('1', 3, 4, 5, 6, 7, 8);
set_cook('2', 9, 10, 11, 12, 13, 14, 15, 16);

// --tiramisu
// add_connection(0, 3, 4, 5, 6, 7, 9, 10, 11, 1, 2);
// add_connection(3, 12, 7);
// set_cook('1', 3, 4, 5, 6, 7, 9, 10, 11, 12);
// add_connection(0, 13, 14, 7);
// add_connection(13, 15, 16, 9);
// add_connection(9, 17, 18, 9);
// set_cook('2', 13, 14, 15, 16, 17, 18);

// --lasagne
// add_connection(0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1, 2);
// add_connection(0, 16, 9);
// add_connection(12, 9);
// add_connection(0, 17, 18, 9);
// set_cook('1', 3, 4, 5, 6, 7, 8, 13, 14, 15);
// set_cook('2', 9, 10, 11, 12, 16, 17, 18);

// --minimal-loop
// add_connection(0, 1, 1, 2, 3);

// --empty
// add_connection(1, 2, 3, 4);

draw_recipe(recipe);
// send_html_request('GET', 'https://7y0a1sogrh.execute-api.us-east-1.amazonaws.com/staging/recipe');