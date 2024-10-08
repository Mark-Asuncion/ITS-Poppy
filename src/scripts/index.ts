import { ProjectInfo, load_projects, dialog_one_dir, new_project, load_open_project, del_project } from "./backendconnector";
import { getVersion } from '@tauri-apps/api/app';

// === Set Version ===
async function setVersion() {
    document.querySelector(".ver")!.innerHTML = `<small>Version ${ await getVersion() }</small>`;
}
setVersion();
// ===================

// const newProject = document.querySelector("#npbutton")! as HTMLButtonElement;
// const span = document.getElementsByClassName("close")[0]! as HTMLSpanElement;
const projectsList = document.querySelector("#projects-list")! as HTMLDivElement;
let filter: string = "";

//=== Searchbar ===
const searchbar = document.querySelector(".searchbar > .textbox > input")! as HTMLInputElement;
searchbar.addEventListener("input", (e) => {
    e.stopPropagation();
    projectsList.innerHTML = "";
    filter = searchbar.value.trim();
    listProjects(projectsList);
});
//=============================

//=== List Projects ===
let rmProject: ProjectInfo | null = null;
const rmProjectBtn = document.querySelector("#removeProject")! as HTMLButtonElement;
rmProjectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("remove: ", rmProject);
    if (rmProject) {
        del_project(rmProject.path);
        projectsList.innerHTML = "";
        listProjects(projectsList);
    }
});

function createProjectInfoElement(info: ProjectInfo) {
    const root = document.createElement("div");
    root.classList.add("card");
    root.classList.add("border-light");

    let innerHtml = `<h4 class="p-2">${info.projectName}</h4>`;
    innerHtml += `<div id="removeBtn" class="proj-settings d-flex align-items-start justify-content-end p-2"> <i class="fa-solid btn-close" data-bs-toggle="modal" data-bs-target="#removeModal"></i> </div>`;
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
    });
    return root;
}

async function listProjects(root: HTMLElement) {
    const projects = await load_projects();
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        if (filter.length !== 0) {
            const regRes = project.projectName.match(filter+".\\+*");
            if (regRes == null || (regRes && regRes[0] == project.projectName)) {
                continue;
            }
        }
        root.appendChild(createProjectInfoElement(project));
    }

    for (let i = 0; i < TUTORIALS.length; i++) {
        const project = TUTORIALS[i];
        if (filter) {
            const regRes = project.projectName.match(filter+".\\+*");
            if (regRes == null || (regRes && regRes[0] == project.projectName)) {
                continue;
            }
        }
        root.appendChild(createProjectInfoElement(project, true, i));
    }
}

listProjects(projectsList);
//=============================

//=== Open And Load Project ===
const openBtn = document.querySelector(".openproj")! as HTMLButtonElement;
openBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const folder = await dialog_one_dir("Pick A Project Folder");
    if (folder) {
        load_open_project(folder);
        window.location.reload();
    }
});
//=============================

// function registerModalEvents(modal: HTMLElement) {
//     newProject.onclick = function () {
//         modal.style.display = "block";
//     }
//     span.onclick = function () {
//         modal.style.display = "none";
//     }
//     window.onclick = function (event: Event) {
//         if (event.target == modal) {
//             modal.style.display = "none";
//         }
//     }
// }

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
        new_project(name.value, folderInp.value);
        window.location.reload();
    });
}
const modal = document.getElementById("npmodal")!;
registerNewProjectDialogEvents(modal);
// ===================

