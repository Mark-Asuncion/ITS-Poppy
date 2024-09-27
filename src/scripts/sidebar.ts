import { SIDEBAR } from "../themes/diagram";

// const container = document.querySelector("#sidebar-container")! as HTMLDivElement;
const sidebarBtn = document.querySelectorAll('[aria-role="sidebar-button"]');

let gOpenedView: HTMLElement | null = null;
sidebarBtn.forEach((elem) => {
    const tname = elem.getAttribute("aria-target")
    if (!tname) {
        return;
    }
    const target = document.querySelector("#" + tname);
    const type = elem.getAttribute("aria-type");
    if (!(target && type)) {
        return;
    }

    elem.addEventListener("click", (e) => {
        e.stopPropagation();
        if (target.classList.replace("d-none", "d-block")) {
            if (gOpenedView != null && gOpenedView.classList.contains("active")) {
                gOpenedView.click();
            }
            gOpenedView = elem as HTMLElement;
            elem.classList.add("active");
            target.classList.add("sidebar-content")
        }
        else {
            gOpenedView = null;
            elem.classList.remove("active");
            target.classList.replace("d-block", "d-none");
            target.classList.remove("sidebar-content");
        }
    });
});

// ========================
// ===== DIAGRAM VIEW =====
// ========================

const diagramView = document.querySelector("#diagram-view")!;
const keys = Object.keys(SIDEBAR)
for (let i=0;i<keys.length;i++) {
    const div = document.createElement("div");
    const key = keys[i];
    div.classList.add("d-flex");
    div.classList.add("flex-dir-col");
    const emblemContainer = document.createElement("div");
    emblemContainer.classList.add("d-flex");
    emblemContainer.classList.add("diagram-title-container");
    emblemContainer.innerHTML = `<div class="diagram-emblem diagram-${key.toLowerCase()}"></div><p class="diagram-title">${key}</p>`;
    div.appendChild(emblemContainer);

    const items: string[] = SIDEBAR[key].items;
    for (let j=0;j<items.length;j++) {
        let img = `<img draggable="true" aria-diagram="true" aria-diagram-type="${items[j]}">`;
        div.innerHTML += img;
    }

    diagramView.appendChild(div);
    diagramView.innerHTML += "<br><br>";
}
// ========================
