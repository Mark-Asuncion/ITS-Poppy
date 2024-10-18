// import { invoke } from "@tauri-apps/api/tauri";
import { diagramToModules, init } from "./canvasinit";
import { dialog_one_dir, get_cwd_name, set_cwd, write_diagrams_to_modules } from "./backendconnector";
import { TerminalInstance } from "./terminal/instance";
import { Poppy } from "../poppy/poppy";
import { setHover } from "./canvas/tooltip";

async function set_project_name(input_element: HTMLInputElement) {
    const isUntitled = input_element.value.toLowerCase() === "untitled project";
    if (isUntitled) {
        const folder = await dialog_one_dir("Pick the Project Folder");
        console.log("Picked Folder", folder);
        set_cwd(folder);
        input_element.value = await get_cwd_name();
    }

}

const canvasStage = init();
const inpProjName = document.querySelector("#project-name") as HTMLInputElement;
const playBtn = document.querySelector("#play-btn") as HTMLButtonElement;
const backBtn = document.querySelector("#back-btn") as HTMLButtonElement;

if (inpProjName) {
    inpProjName.addEventListener("focus", async () => {
        set_project_name(inpProjName);
    });
}


window["mSave"] = () => {
    const contents = diagramToModules(canvasStage);
    write_diagrams_to_modules(contents);
};

backBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    localStorage.setItem("info", "");
    window.open("../index.html", "_self");
});
setHover(backBtn, "Back");

setHover(playBtn, "Save and Run");
playBtn?.addEventListener("click", async () => {
    await set_project_name(inpProjName);
    const contents = diagramToModules(canvasStage);
    console.log(contents);
    write_diagrams_to_modules(contents);

    let termbtn = document.querySelector("#term-btn") as HTMLButtonElement
    if (!termbtn.classList.contains("active")) {
        termbtn.click();
    }

    if (TerminalInstance.instance == null) {
        setTimeout(() =>
            TerminalInstance.write("python main.py")
        , 1000);
    }
    else {
        TerminalInstance.write("python main.py");
    }
});

// =========================
// ===== DRAG AND DROP =====
// =========================

document.addEventListener("mousedown", (e) => {
    // draggable
    const el = e.target;
    if (el instanceof Element) {
        const isDraggable = el.classList.contains("draggable");
        if (isDraggable) {
            e.preventDefault();
            e.stopPropagation();
            window.mDragDiv = el;
        }

        if (el.id == Poppy.id) {
            e.preventDefault();
            e.stopPropagation();
            Poppy.evMouseDown();
        }
    }
});

document.addEventListener("mouseup", (e) => {
    // remove draggable
    if (window.mDragDiv) {
        let container = document.querySelector(".drag-item-container");
        if (container) {
            e.preventDefault();
            e.stopPropagation();
            let type = container?.getAttribute("data-diagram-type");
            container?.remove();

            let pointer = window.mCvRootNode.node.getRelativePointerPosition();
            if (pointer == null) {
                return;
            }
            window.mDragDiv = null;

            if (type)
            document.dispatchEvent(new CustomEvent("diagramdrop", {
                bubbles: true,
                detail: { type: type, pos: pointer },
            }));
        }
        else if (window.mDragDiv === Poppy.source) {
            e.preventDefault();
            e.stopPropagation();
            Poppy.evMouseUp();
        }
    }
});

document.body.addEventListener("mousemove", (e) => {
    window.mCursor = {
        x: e.clientX,
        y: e.clientY
    };
    // console.log(`cursor: ${window.mCursor.x}, ${window.mCursor.y}`);

    if (window.mDragDiv) {
        let container = document.querySelector(".drag-item-container");
        if (container) {
            e.preventDefault();
            e.stopPropagation();
            let div = container as HTMLDivElement;
            div.style.left = `${e.x}px`;
            div.style.top = `${e.y}px`;
        }
        else if (window.mDragDiv === Poppy.source) {
            e.preventDefault();
            e.stopPropagation();
            Poppy.evMouseMove();
        }
        else {
            e.preventDefault();
            e.stopPropagation();
            let type = window.mDragDiv.getAttribute("data-diagram-type");
            
            if (type == null) {
                return;
            }
            let realType = type;
            let name = type;

            if (type.startsWith("loop")) {
                type = "loop";
                name = name.replace("loop-","");
            }

            if (type.startsWith("control")) {
                type = "control";
                name = name.replace("control-","");
            }

            const div = document.createElement("div");
            div.classList.add("drag-item-container");
            div.classList.add("d-flex");
            div.classList.add("diagram-title-container");
            div.setAttribute("data-diagram-type", realType);

            div.innerHTML = `<div class="diagram-emblem diagram-${type}"></div>`;
            div.innerHTML += `<p class="diagram-title">${name}</p>`;

            // console.log(div.innerHTML);

            div.style.left = `${e.x}px`;
            div.style.top = `${e.y}px`;

            document.body.appendChild(div);
        }
    }
})

// =========================

window.mContextMenu = [];
