import { SIDEBAR } from "../themes/diagram";
import { setHover } from "./canvas/tooltip";
import imgStatement from "../assets/blocks/Statement.png";
import imgIf from "../assets/blocks/If.png";
import imgElif from "../assets/blocks/Elif.png";
import imgElse from "../assets/blocks/Else.png";
import imgFor from "../assets/blocks/For.png";
import imgEndblock from "../assets/blocks/Endblock.png";
import imgFunction from "../assets/blocks/Function.png";
import imgClass from "../assets/blocks/Class.png";
import imgWhile from "../assets/blocks/While.png";

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

    setHover(elem as HTMLElement, elem.getAttribute("aria-roledescription")!);

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
    const tooltipMsg = SIDEBAR[key].tooltip;
    for (let j=0;j<items.length;j++) {
        // let dv = document.createElement("div");
        let img = document.createElement("img");
        img.id = `data-diagram-${items[j]}`;
        img.setAttribute("data-diagram", "true");
        img.setAttribute("data-diagram-type", items[j]);
        img.classList.add("draggable");

        switch (items[j]) {
            case "control-if":
                img.src = imgIf;
                break;
            case "control-elif":
                img.src = imgElif;
                break;
            case "control-else":
                img.src = imgElse;
                break;
            case "loop-while":
                img.src = imgWhile;
                break;
            case "loop-for":
                img.src = imgFor;
                break;
            case "endblock":
                img.src = imgEndblock;
                break;
            case "function":
                img.src = imgFunction;
                break;
            case "class":
                img.src = imgClass;
                break;
            default:
                img.src = imgStatement;
                break;
        }

        div.appendChild(img);

        setHover(img, tooltipMsg[j], "poppy");
    }

    diagramView.appendChild(div);
}
diagramView.appendChild(document.createElement("br"));
diagramView.appendChild(document.createElement("br"));
// ========================
