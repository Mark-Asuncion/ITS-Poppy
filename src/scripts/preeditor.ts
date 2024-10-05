import imgStatement from "../assets/blocks/Statement.png";
import imgIf from "../assets/blocks/If.png";
import imgElif from "../assets/blocks/Elif.png";
import imgElse from "../assets/blocks/Else.png";
import imgFor from "../assets/blocks/For.png";
import { set_cwd, ProjectInfo } from "./backendconnector";
const info = localStorage.getItem("info");
if (info) {
    const projectName = document.querySelector("#project-name")! as HTMLInputElement;
    const parsed = JSON.parse(info) as ProjectInfo;
    projectName.value = parsed.projectName;
    set_cwd(parsed.path);
}

const diagramsImg = document.querySelectorAll('[aria-diagram="true"]');

diagramsImg.forEach((elem) => {
    const img = elem as HTMLImageElement;
    const type = elem.getAttribute("aria-diagram-type");
    if (!type) {
        return;
    }

    switch (type) {
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
        case "loop-for":
            img.src = imgFor;
            break;
        case "endblock":
            img.src = imgStatement;
            break;
        case "function":
        default:
            img.src = imgStatement;
            break;
    }

    // can't ***** make it work
    // dragover and drop event do not get called after dropping
    // on the div container
    // img.addEventListener("dragstart", () => {
    //     console.log("dragstart");
    //     localStorage.setItem("diagram-drag-over", type);
    // });

    img.addEventListener("click", (e) => {
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent("diagramdrop", {
            bubbles: true,
            detail: { type: type },
        }));
    });

    // const canvasContainer = document.createElement("div");
    // const stage = createStageForDiagramImage(canvasContainer);
});
