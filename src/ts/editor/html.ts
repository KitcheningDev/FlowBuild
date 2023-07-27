// generic event listeners
document.addEventListener('focusin', (ev: FocusEvent) => {
    (ev.target as HTMLInputElement).select();
});
// html
export namespace html {
    // funcs
    export function create(tag: string, ...cls: string[]): HTMLElement {
        const el = document.createElement(tag);
        el.classList.add(...cls);
        return el;
    }
    export function createDiv(...cls: string[]): HTMLDivElement {
        return create('div', ...cls) as HTMLDivElement;
    }
    export function addCls<T extends HTMLElement>(el: T, ...cls: string[]): T {
        el.classList.add(...cls);
        return el;
    }
    export function appendChilds(parent: HTMLElement, ...childs: HTMLElement[]): HTMLElement {
        for (const child of childs) {
            parent.appendChild(child);
        }
        return parent;
    }
    export function parent(element: HTMLElement, cls: string): HTMLElement {
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
    // create
    export const create_recipe_btn = document.getElementById('create-btn');
    export namespace search {
        export const input = document.getElementById('search-input') as HTMLInputElement;
        export const result = document.getElementById('search-result-list') as HTMLInputElement;
        export const load_icon = document.getElementById('loading-icon');
    }
    // flowchart editor
    export namespace flowchart {
        export const canvas = document.getElementById('flowchart-canvas');
        export const container = document.getElementById('flowchart-container');
    }
    // ingredient editor
    export namespace ingredient {
        export const container = document.getElementById('ingredient-container') as HTMLTableSectionElement;
        export const add = document.getElementById('ingredient-add') as HTMLInputElement;
    }
    export const task_upload_pop_up = document.getElementById('task-upload-pop-up');
    // task editor
    export namespace task {
        export const editor = document.getElementById('task-card');
        export const description_input = document.getElementById('task-description-input') as HTMLInputElement;
        export const duration_list = document.getElementById('task-duration-list');
        export const duration_input = document.getElementById('task-duration-input') as HTMLInputElement;
        export const cook_section = document.getElementById('task-cook-section');
        export const cook_list = document.getElementById('task-cook-list');
        export const cook1 = document.getElementById('task-cook-1') as HTMLInputElement;
        export const cook2 = document.getElementById('task-cook-2') as HTMLInputElement;
        export const sec = document.getElementById('task-sec') as HTMLInputElement;
        export const min = document.getElementById('task-min') as HTMLInputElement;
        export const hr = document.getElementById('task-hour') as HTMLInputElement;
    }
    // upload editor
    export namespace upload {
        export const editor = document.getElementById('upload-card');
        export const toggle = document.getElementById('upload-btn');
        export const submit = document.getElementById('recipe-submit');
        export const image_input = document.getElementById('image') as HTMLInputElement;
        export const title_input = document.getElementById('recipe-title-input') as HTMLInputElement;
        export const duration_list = document.getElementById('recipe-duration-list');
        export const duration_input = document.getElementById('recipe-duration-input') as HTMLInputElement;
        export const difficulty_list = document.getElementById('recipe-difficulty-list');
        export const diff1 = document.getElementById('recipe-difficulty-1') as HTMLInputElement;
        export const diff2 = document.getElementById('recipe-difficulty-2') as HTMLInputElement;
        export const diff3 = document.getElementById('recipe-difficulty-3') as HTMLInputElement;
        export const diff4 = document.getElementById('recipe-difficulty-4') as HTMLInputElement;
        export const diff5 = document.getElementById('recipe-difficulty-5') as HTMLInputElement;
        export const min = document.getElementById('recipe-min') as HTMLInputElement;
        export const hr = document.getElementById('recipe-hour') as HTMLInputElement;
    }
}