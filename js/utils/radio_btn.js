export function select_radio_btn(option, container) {
    console.log("SELCTED", option);
    let to_select = null;
    for (const btn of container.children) {
        if (btn.innerHTML == option) {
            to_select = btn;
            btn.classList.add('radio-btn-selected');
        }
        else if (btn.classList.contains('radio-btn-selected')) {
            btn.classList.remove('radio-btn-selected');
        }
    }
    return to_select;
}
export function get_selected_radio_btn(container) {
    for (const btn of container.children) {
        if (btn.classList.contains('radio-btn-selected')) {
            return btn;
        }
    }
    return null;
}
export function init_radio_btns(default_option, options, container) {
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
        btn.onclick = () => { console.log("HALLO"); select_radio_btn(btn.innerHTML, container); };
    }
    return select_radio_btn(default_option, container);
}
//# sourceMappingURL=radio_btn.js.map