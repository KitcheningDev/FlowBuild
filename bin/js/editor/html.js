// generic event listeners
document.addEventListener('focusin', (ev) => {
    if (ev.target instanceof HTMLInputElement) {
        ev.target.select();
    }
});
// html
export var html;
(function (html) {
    // funcs
    function create(tag, ...cls) {
        const el = document.createElement(tag);
        el.classList.add(...cls);
        return el;
    }
    html.create = create;
    function createDiv(...cls) {
        return create('div', ...cls);
    }
    html.createDiv = createDiv;
    function addCls(el, ...cls) {
        el.classList.add(...cls);
        return el;
    }
    html.addCls = addCls;
    function appendChilds(parent, ...childs) {
        for (const child of childs) {
            parent.appendChild(child);
        }
        return parent;
    }
    html.appendChilds = appendChilds;
    function parent(element, cls) {
        if (element.classList.contains(cls)) {
            return element;
        }
        else if (element.parentElement) {
            return parent(element.parentElement, cls);
        }
        else {
            return null;
        }
    }
    html.parent = parent;
    // create
    html.create_recipe_btn = document.getElementById('create-btn');
    let search;
    (function (search) {
        search.input = document.getElementById('search-input');
        search.result = document.getElementById('search-result-list');
        search.load_icon = document.getElementById('loading-icon');
    })(search = html.search || (html.search = {}));
    // flowchart editor
    let flowchart;
    (function (flowchart) {
        flowchart.canvas = document.getElementById('flowchart-canvas');
        flowchart.container = document.getElementById('flowchart-container');
    })(flowchart = html.flowchart || (html.flowchart = {}));
    // ingredient editor
    let ingredient;
    (function (ingredient) {
        ingredient.container = document.getElementById('ingredient-container');
        ingredient.add = document.getElementById('ingredient-add');
    })(ingredient = html.ingredient || (html.ingredient = {}));
    html.task_upload_pop_up = document.getElementById('task-upload-pop-up');
    // task editor
    let task;
    (function (task) {
        task.editor = document.getElementById('task-card');
        task.description_input = document.getElementById('task-description-input');
        task.duration_list = document.getElementById('task-duration-list');
        task.duration_input = document.getElementById('task-duration-input');
        task.cook_section = document.getElementById('task-cook-section');
        task.cook_list = document.getElementById('task-cook-list');
        task.cook1 = document.getElementById('task-cook-1');
        task.cook2 = document.getElementById('task-cook-2');
        task.sec = document.getElementById('task-sec');
        task.min = document.getElementById('task-min');
        task.hr = document.getElementById('task-hour');
    })(task = html.task || (html.task = {}));
    // upload editor
    let upload;
    (function (upload) {
        upload.editor = document.getElementById('upload-card');
        upload.toggle = document.getElementById('upload-btn');
        upload.submit = document.getElementById('recipe-submit');
        upload.image_input = document.getElementById('image');
        upload.title_input = document.getElementById('recipe-title-input');
        upload.duration_list = document.getElementById('recipe-duration-list');
        upload.duration_input = document.getElementById('recipe-duration-input');
        upload.difficulty_list = document.getElementById('recipe-difficulty-list');
        upload.diff1 = document.getElementById('recipe-difficulty-1');
        upload.diff2 = document.getElementById('recipe-difficulty-2');
        upload.diff3 = document.getElementById('recipe-difficulty-3');
        upload.diff4 = document.getElementById('recipe-difficulty-4');
        upload.diff5 = document.getElementById('recipe-difficulty-5');
        upload.min = document.getElementById('recipe-min');
        upload.hr = document.getElementById('recipe-hour');
        upload.owner_input = document.getElementById('recipe-owner-input');
        upload.tags_input = document.getElementById('recipe-tags-input');
        upload.chosen_tags = document.getElementById('chosen-tags');
    })(upload = html.upload || (html.upload = {}));
})(html || (html = {}));
//# sourceMappingURL=html.js.map