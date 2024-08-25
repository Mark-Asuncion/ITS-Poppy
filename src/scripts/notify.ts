export function notifyPush(text: string, iconType: string = "info", timeout: number = 5000) {
    if (!window.mNotifyDiv) {
        window.mNotifyDiv = document.createElement("div");
        window.mNotifyDiv.classList.add("notify-container");
        document.body.appendChild(window.mNotifyDiv);
    }
    const id = Date.now();
    const item = document.createElement("div");
    item.id = `notify-${id}`;
    item.classList.add("notify-item");

    let icon = "";
    let color = "";
    let icType = iconType;
    if (iconType == "error") {
        icon = String.raw`<i class="fa-solid fa-exclamation"></i>`;
        color = "error";
    }
    else if (iconType == "warn") {
        icon = String.raw`<i class="fa-solid fa-exclamation"></i>`;
        color = "warning";
    }
    else {
        icon = String.raw`<i class="fa-solid fa-info"></i>`;
        color = "info";
        icType = "info";
    }
    const iconElem = document.createElement("div");
    iconElem.classList.add("notify-icon-container");
    iconElem.classList.add(`notify-type-${icType}`);
    iconElem.classList.add(`border-${color}`);
    iconElem.classList.add(color);
    iconElem.innerHTML = icon;

    const closeBtn = document.createElement("button");
    closeBtn.classList.add("notify-close-btn");
    closeBtn.innerHTML = String.raw`<i class="fa-solid fa-x"></i>`;
    closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        notifyPop(id);
    });

    const p = document.createElement("p");
    p.classList.add("notify-text-content");
    p.classList.add(color);
    p.textContent = text;

    item.appendChild(iconElem);
    item.appendChild(p);
    item.appendChild(closeBtn);

    window.mNotifyDiv.appendChild(item);
    setTimeout(() => {
        notifyPop(id)
    },timeout)
}

export function notifyPop(id: number) {
    if (!window.mNotifyDiv) {
        return;
    }
    if (window.mNotifyDiv.childElementCount == 0) {
        window.mNotifyDiv.remove();
    }
    const childs = window.mNotifyDiv.querySelectorAll(`div#notify-${id}`);
    childs.forEach((v) => {
        v.remove();
    });
}
