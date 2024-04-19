import { set_cwd, ProjectInfo } from "./backendconnector";
const info = localStorage.getItem("info");
if (info) {
    const projectName = document.querySelector("#project-name")! as HTMLInputElement;
    const parsed = JSON.parse(info) as ProjectInfo;
    projectName.value = parsed.projectName;
    set_cwd(parsed.path);
}
