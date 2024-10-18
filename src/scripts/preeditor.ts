import { set_cwd, ProjectInfoEx } from "./backendconnector";
import { Poppy } from "../poppy/poppy";
const info = localStorage.getItem("info");
if (info) {
    const projectName = document.querySelector("#project-name")! as HTMLInputElement;
    const parsed = JSON.parse(info) as ProjectInfoEx;
    projectName.value = parsed.projectName;
    set_cwd(parsed.path, parsed.tutorialId != undefined);
    if (parsed.tutorialId != undefined) {
        Poppy.loadTutorial(parsed.tutorialId);
    }
}
