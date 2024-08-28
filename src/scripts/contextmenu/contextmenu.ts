import { _ContextMenuItem } from "./interface";

export function contextMenuShow() {
    if (window.mContextMenu.length == 0) {
        return;
    }

    const div = document.createElement("div");
    div.id = "mContextMenuContainer";
    div.classList.add("context-menu-container");
    div.style.left = `${window.mCursor.x}px`;
    div.style.top = `${window.mCursor.y}px`;

    let elements: Node[] = [];

    for (let i=0;i<window.mContextMenu.length;i++) {
        elements.push(item(window.mContextMenu[i]));
    }
    div.append(...elements);

    document.body.appendChild(div);
}

export function contextMenuHide() {
    const divs = document.querySelectorAll("#mContextMenuContainer");
    for (let i=0;i<divs.length;i++) {
        if (!divs[i])
            continue;
        divs[i].remove();
    }
}

function item(opts: _ContextMenuItem): Node {
    let ret: HTMLElement;
    if (opts.separator) {
        ret = document.createElement("hr");
        ret.style.height = `${opts.separator}px`;
        ret.style.color = "black";
    }
    else if (opts.callback){
        const btn = document.createElement("button");
        btn.classList.add("context-menu-button");
        btn.textContent = opts.name;
        btn.type = "button";
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            opts.callback!();
            contextMenuHide();
        })
        ret = btn;
    }
    else {
        const p = document.createElement("p");
        p.classList.add("context-menu-p");
        p.textContent = opts.name;
        ret = p;
    }
    return ret;
}
