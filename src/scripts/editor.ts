// import { invoke } from "@tauri-apps/api/tauri";
import { diagramToModules, init } from "./canvasinit";
import { dialog_one_dir, get_cwd_name, set_cwd, write_diagrams_to_modules } from "./backendconnector";
import { TerminalInstance } from "./terminal/instance";

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

if (inpProjName) {
    inpProjName.addEventListener("focus", async () => {
        set_project_name(inpProjName);
    });
}


window["mSave"] = () => {
    const contents = diagramToModules(canvasStage);
    write_diagrams_to_modules(contents);
};

playBtn?.addEventListener("click", async () => {
    await set_project_name(inpProjName);
    const contents = diagramToModules(canvasStage);
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

// document.addEventListener("mousedown", (e) => {
//     // draggable
//     const el = e.target;
//     if (el instanceof HTMLDivElement && el.id !== "diagram-container") {
//         e.preventDefault();
//         e.stopPropagation();
//         const isDraggable = el.classList.contains("draggable");
//         if (isDraggable)
//             window.mDragDiv = el;
//     }
// });
//
// document.addEventListener("mouseup", (_) => {
//     // remove draggable
//     if (window.mDragDiv)
//         window.mDragDiv = null;
// });

document.body.addEventListener("mousemove", (e) => {
    if (!window.mCursor) {
        window.mCursor = {
            x: e.clientX,
            y: e.clientY
        };
        return;
    }

    window.mCursor.x = e.clientX;
    window.mCursor.y = e.clientY;
    // console.log(`cursor: ${window.mCursor.x}, ${window.mCursor.y}`);
})

window.mContextMenu = [];
