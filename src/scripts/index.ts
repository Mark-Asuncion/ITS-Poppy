// import { invoke } from "@tauri-apps/api/tauri";
import { diagramToModules, init } from "./canvasinit";
import { dialog_one_dir, get_cwd_name, set_cwd, write_diagrams_to_modules } from "./backendconnector";

async function set_project_name(input_element: HTMLInputElement) {
    const isUntitled = input_element.value.toLowerCase() === "untitled project";
    if (isUntitled) {
        const folder = await dialog_one_dir("Pick the Project Folder");
        console.log("Picked Folder", folder);
        set_cwd(folder);
        input_element.value = await get_cwd_name();
    }

}

window.addEventListener("DOMContentLoaded", () => {
    const canvasStage = init();
    const inpProjName = document.querySelector("#project-name") as HTMLInputElement;
    const playBtn = document.querySelector("#play-btn") as HTMLButtonElement;

    if (inpProjName) {
        inpProjName.addEventListener("focus", async () => {
            set_project_name(inpProjName);
        });
    }

    playBtn?.addEventListener("click", async () => {
        await set_project_name(inpProjName);
        const contents = diagramToModules(canvasStage);
        write_diagrams_to_modules(contents);
    });
});
