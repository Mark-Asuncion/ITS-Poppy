import { ProjectInfo, load_projects, dialog_one_dir, new_project, load_open_project } from "./backendconnector";
import editorHTML from "../editor.html";
const btn = document.querySelector("#npbutton")! as HTMLButtonElement;
const span = document.getElementsByClassName("close")[0]! as HTMLSpanElement;
const projectsList = document.querySelector("#projects-list")! as HTMLDivElement;
const searchbar = document.querySelector("#search-bar")! as HTMLInputElement;

function registerSearchBarEvents(searchbar: HTMLInputElement) {
    searchbar.addEventListener("input", (e) => {
        e.stopPropagation();
        projectsList.replaceChildren();
        const filter = searchbar.value.trim();
        listProjects(projectsList, (filter.length != 0)? filter:undefined);
    });
}
registerSearchBarEvents(searchbar);

//---- Open And Load Project ------
const openBtn = document.querySelector("#open-button")! as HTMLButtonElement;
openBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const folder = await dialog_one_dir("Pick A Project Folder");
    if (folder) {
        load_open_project(folder);
        window.location.reload();
    }
});

function registerModalEvents(modal: HTMLElement) {
    btn.onclick = function () {
        modal.style.display = "block";
    }
    span.onclick = function () {
        modal.style.display = "none";
    }
    window.onclick = function (event: Event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function registerNewProjectDialogEvents(modal: HTMLElement) {
    const createBtn = modal.querySelector("#create")!;
    const folderInp = modal.querySelector("#folder")! as HTMLInputElement;
    folderInp.addEventListener("focusin", async (e) => {
        e.stopPropagation();
        folderInp.blur();
        const folder = await dialog_one_dir("Pick A Folder");
        folderInp.value = folder;
    });

    createBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const name = (modal.querySelector("#name")! as HTMLInputElement).value;
        const path = (modal.querySelector("#folder")! as HTMLInputElement).value;
        new_project(name, path);
        window.location.reload();
    });
}

const modal = document.getElementById("npmodal")!;
registerModalEvents(modal);
registerNewProjectDialogEvents(modal);

function createProjectInfoElement(info: ProjectInfo) {
    const root = document.createElement("div");
    root.classList.add("info-container");
    root.classList.add("d-flex");
    root.classList.add("project-container");
    root.addEventListener("click", (e) => {
        e.stopPropagation();
        localStorage.setItem("info", JSON.stringify(info));
        window.open(editorHTML, "_self");
    });

    const emblem = document.createElement("div");
    emblem.classList.add("project-emblem");
    root.appendChild(emblem);

    const projectDetails = document.createElement("div");
    projectDetails.classList.add("info-project");
    projectDetails.classList.add("d-flex");
    root.appendChild(projectDetails);

    const projectName = document.createElement("p");
    projectName.classList.add("project-name");
    projectName.innerText = info.projectName;
    projectDetails.appendChild(projectName);

    const projectPath = document.createElement("p");
    projectPath.classList.add("p-small");
    projectPath.classList.add("p-small-hover");
    projectPath.innerText = info.path;
    projectDetails.appendChild(projectPath);

    const gear = document.createElement("i");
    gear.classList.add("fa-solid");
    gear.classList.add("fa-gear");
    gear.classList.add("fa-xl");
    // TODO add click listener
    root.appendChild(gear);

    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown-content");
    const remove = document.createElement("a");
    remove.innerText = "remove";
    remove.addEventListener("click", (e) => {
        e.stopPropagation();
        console.error("NOT IMPLEMENTED");
    })
    dropdown.appendChild(remove);
    root.appendChild(dropdown);
    return root;
}

async function listProjects(root: HTMLElement, filter?: string) {
    const projects = await load_projects();
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        if (filter) {
            const regRes = project.projectName.match(filter+".\\+*");
            if (regRes == null || (regRes && regRes[0] == project.projectName)) {
                continue;
            }
        }
        root.appendChild(createProjectInfoElement(project));
    }
}

listProjects(projectsList);
