export function create_icon_callback(icon, callback) {
    return () => {
        icon.style.opacity = "0.7";
        setTimeout(() => {
            icon.style.opacity = "";
            callback();
        }, 150);
    };
}
//# sourceMappingURL=icon.js.map