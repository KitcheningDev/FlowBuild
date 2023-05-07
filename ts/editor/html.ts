export function create(tag: string, ...cls: string[]): HTMLElement {
    const el = document.createElement(tag);
    el.classList.add(...cls);
    return el;
}
export function create_div(...cls: string[]): HTMLDivElement {
    return create('div', ...cls) as HTMLDivElement;
}

export function add_cls<T extends HTMLElement>(el: T, ...cls: string[]): T {
    el.classList.add(...cls);
    return el;
}
export function append_childs(parent: HTMLElement, ...childs: HTMLElement[]): HTMLElement {
    for (const child of childs) {
        parent.appendChild(child);
    }
    return parent;
}

export function parent(el: HTMLElement, cls: string): HTMLElement {
    if (el.parentElement === null) {
        return null;
    }

    if (el.parentElement.classList.contains(cls)) {
        return el.parentElement;
    }
    else {
        return parent(el.parentElement, cls);
    }
}