export function create(tag, ...cls) {
    const el = document.createElement(tag);
    el.classList.add(...cls);
    return el;
}
export function create_div(...cls) {
    return create('div', ...cls);
}
export function add_cls(el, ...cls) {
    el.classList.add(...cls);
    return el;
}
export function append_childs(parent, ...childs) {
    for (const child of childs) {
        parent.appendChild(child);
    }
    return parent;
}
export function parent(el, cls) {
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
//# sourceMappingURL=html.js.map