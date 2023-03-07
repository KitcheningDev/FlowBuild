export function select_radio_btn(option: string, container: HTMLElement): HTMLElement {
    console.log("SELCTED", option);
    let to_select = null as HTMLElement;
    for (const btn of container.children) {
        if (btn.innerHTML == option) {
            to_select = btn as HTMLElement;
            btn.classList.add('radio-btn-selected');
        }
        else if (btn.classList.contains('radio-btn-selected')) {
            btn.classList.remove('radio-btn-selected');
        }
    }
    return to_select;
}
export function get_selected_radio_btn(container: HTMLElement): HTMLElement {
    for (const btn of container.children) {
        if (btn.classList.contains('radio-btn-selected')) {
            return btn as HTMLElement;
        }
    }
    return null;
}
export function init_radio_btns(default_option: string, options: string[], container: HTMLElement): HTMLElement {
    container.innerHTML = "";
    for (const option of options) {
        const btn = document.createElement('span');
        btn.innerHTML = option;
        btn.classList.add('radio-btn');
    
        container.appendChild(btn);
        container.innerHTML += " ";
    }
    for (const btn of container.children) {
        console.log("ADDED ONCLICK TO ", btn.innerHTML);
        (btn as HTMLElement).onclick = () => { console.log("HALLO"); select_radio_btn(btn.innerHTML, container) };
    }
    return select_radio_btn(default_option, container);
}