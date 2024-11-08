import { TUTORIALS } from "../themes/tutorials";
import { ProjectInfo, load_projects, dialog_one_dir, new_project, load_open_project, del_project } from "./backendconnector";
import { getVersion } from '@tauri-apps/api/app';
import { notifyPush } from "./notify";

const contentsContainer = document.querySelector("#projects-list")! as HTMLDivElement;

// === Sidebar ===
const sidebarMenus = [
    document.querySelector("#sdprojects")! as HTMLDivElement,
    document.querySelector("#sdlearn")! as HTMLDivElement,
    // document.querySelector("#sdaboutus")! as HTMLDivElement
];

sidebarMenus[0].parentElement!.addEventListener("click", (e) => {
    if (sidebarMenus[0].contains(e.target as Node) &&
        !sidebarMenus[0].classList.contains("highlight")) {
        sidebarMenus[0].classList.add("highlight");
        sidebarMenus[1].classList.remove("highlight");
        // sidebarMenus[2].classList.remove("highlight");
    }
    else if (sidebarMenus[1].contains(e.target as Node) &&
        !sidebarMenus[1].classList.contains("highlight")) {
        sidebarMenus[1].classList.add("highlight");
        sidebarMenus[0].classList.remove("highlight");
        // sidebarMenus[2].classList.remove("highlight");
    }

    // else if (sidebarMenus[2].contains(e.target as Node) &&
    //     !sidebarMenus[2].classList.contains("highlight")) {
    //     sidebarMenus[2].classList.add("highlight");
    //     sidebarMenus[0].classList.remove("highlight");
    //     sidebarMenus[1].classList.remove("highlight");
    // }

    contentsContainer.innerHTML = "";
    listContents(contentsContainer);
});

// ===============

// === Set Version ===
async function setVersion() {
    document.querySelector(".ver")!.innerHTML = `<small>Version ${ await getVersion() }</small>`;
}
setVersion();
// ===================

let filter: string = "";

//=== Searchbar ===
const searchbar = document.querySelector(".searchbar > .textbox > input");
if (searchbar) {
    searchbar.addEventListener("input", (e) => {
        e.stopPropagation();
        contentsContainer.innerHTML = "";
        filter = (searchbar! as HTMLInputElement).value.trim();
        listContents(contentsContainer);
    });
}
//=============================

//=== List Projects ===
let rmProject: ProjectInfo | null = null;
const rmProjectBtn = document.querySelector("#removeProject")! as HTMLButtonElement;
rmProjectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("remove: ", rmProject);
    if (rmProject) {
        del_project(rmProject.path);
        window.location.reload();
    }
});

function createProjectInfoElement(info: ProjectInfo, isTutorial = false, tutorialId = 0) {
    const root = document.createElement("div");
    root.classList.add("card");
    root.classList.add("border-light");

    let innerHtml = `<h4 class="p-2">${info.projectName}</h4>`;
    innerHtml += `<div id="removeBtn" class="proj-settings d-flex align-items-start justify-content-end p-2"> <i class="fa-solid btn-close"></i> </div>`;
    innerHtml += `<div class="path"><small class="text-muted">${info.path}</small></div>`;
    root.innerHTML = innerHtml;
    const rmBtn = root.querySelector("#removeBtn")!;
    const rmITag = rmBtn.querySelector("i")!;
    root.addEventListener("click", (e) => {

        if (e.target === rmBtn || e.target === rmITag) {
            return;
        }
        e.stopPropagation();
        if (!isTutorial) {
            localStorage.setItem("info", JSON.stringify(info));
        }
        else {
            localStorage.setItem("info", JSON.stringify({
                ...info,
                tutorialId: tutorialId
            }));
        }
        window.open("../editor.html", "_self");
    });
    rmBtn.addEventListener("click", (e) => {
        e.preventDefault();
        rmProject = info;
        del_project(rmProject.path);
        window.location.reload();
    });
    return root;
}

async function listContents(root: HTMLElement) {
    if (sidebarMenus[0].classList.contains("highlight")) {
        const projects = await load_projects();
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            if (filter.length !== 0) {
                const regRes = project.projectName.match(new RegExp(`\\b${filter}\\b`, 'i'));
                if (regRes == null || (regRes && regRes.length == 0)) {
                    continue;
                }
            }
            root.appendChild(createProjectInfoElement(project));
        }
    }
    else if (sidebarMenus[1].classList.contains("highlight")) {
        for (let i = 0; i < TUTORIALS.length; i++) {
            const project = TUTORIALS[i];
            if (filter) {
                const regRes = project.projectName.match(new RegExp(`.*${filter}.*`));
                if (regRes == null || (regRes && regRes.length == 0)) {
                    continue;
                }
            }
            root.appendChild(createProjectInfoElement(project, true, project.tutorialId));
        }
    }
}

listContents(contentsContainer);
//=============================

//=== Open And Load Project ===
const openBtn = document.querySelector(".openproj")! as HTMLButtonElement;
openBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const folder = await dialog_one_dir("Pick A Project Folder");
    if (folder) {
        load_open_project(folder)
            .then((e) => {
                if (e) {
                    window.location.reload();
                }
            });
    }
});
//=============================

// === New Project ===
function registerNewProjectDialogEvents(modal: HTMLElement) {
    const name = modal.querySelector("#projectName")! as HTMLInputElement;
    const folderInp = modal.querySelector("#projectFolder")! as HTMLInputElement;

    const createBtn = modal.querySelector("#projectCreate")! as HTMLButtonElement;
    folderInp.addEventListener("focusin", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        folderInp.blur();
        const folder = await dialog_one_dir("Pick A Folder");
        folderInp.value = folder;
    });

    createBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (name.value.length == 0 || folderInp.value.length == 0) {
            notifyPush("Input cannot be empty", "warn");
            return;
        }
        new_project(name.value, folderInp.value);
        contentsContainer.innerHTML = "";
        listContents(contentsContainer);
    });
}
const modal = document.getElementById("npmodal")!;
registerNewProjectDialogEvents(modal);
// ===================

