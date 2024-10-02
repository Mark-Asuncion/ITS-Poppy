import { LintInfo, lint } from "./backendconnector";
import { setHover } from "./canvas/utils";
import { notifyPush } from "./notify";

// TODO
// @ts-ignore
export class Lint {
    static list: LintInfo[] = [];

    static async lint() {
        let lintinfo = await lint();
        if (lintinfo instanceof String) {
            // show err
            console.warn(lintinfo);
            return;
        }
        Lint.list = lintinfo as LintInfo[];

        if (lintinfo.length != 0)
            notifyPush("Error/Warning Detected", "info", 3000);
        Lint.open();
    }

    static open() {
        if (Lint.list.length === 0) {
            return;
        }

        // const btn = document.querySelector("#btn-diagram-error")! as HTMLButtonElement;
        const view = document.querySelector("#diagram-error")! as HTMLDivElement;
        view.innerHTML = "";

        for (let i=0;i<Lint.list.length;i++) {
            const lintinfo = Lint.list[i];
            let container = document.createElement("div");
            {
                container.classList.add("d-flex");
                container.classList.add("flex-dir-col");
            }

            {
                let row = document.createElement("div");
                row.classList.add("d-flex");
                row.classList.add("vt-center");
                let fileIcon = document.createElement("i");
                {
                    fileIcon.classList.add("fa-solid");
                    fileIcon.classList.add("fa-file");
                }

                let p = document.createElement("p");
                {
                    p.classList.add("lintview-p");
                    p.innerText = lintinfo.moduleName;
                }
                row.appendChild(fileIcon);
                row.appendChild(p);
                container.appendChild(row);
            }

            for (let j=0;j<lintinfo.messages.length;j++) {
                const message = lintinfo.messages[j];
                let row = document.createElement("div");
                row.classList.add("d-flex");
                row.classList.add("gap-10");
                row.classList.add("lintview-message-container");
                row.classList.add("pad-10");

                {
                    let p = document.createElement("p");
                    p.classList.add("lintview-p");
                    p.innerText = message.message;
                    row.appendChild(p);
                }

                let col = document.createElement("div");
                col.classList.add("d-flex");
                col.classList.add("flex-dir-col");
                col.classList.add("gap-10");

                {
                    let questionBtn = document.createElement("button") as HTMLButtonElement;
                    questionBtn.type = "button";
                    questionBtn.classList.add("aspect-ratio-1");
                    questionBtn.classList.add("br-none");
                    questionBtn.classList.add("no-radius");
                    questionBtn.classList.add("fill-width");
                    questionBtn.classList.add("h-max-content");

                    let questionIcon = document.createElement("i");
                    questionIcon.classList.add("fa-solid");
                    questionIcon.classList.add("fa-question");

                    questionBtn.appendChild(questionIcon);
                    col.appendChild(questionBtn);
                }
                {
                    let gotoBtn = document.createElement("button") as HTMLButtonElement;
                    gotoBtn.type = "button";
                    gotoBtn.classList.add("aspect-ratio-1");
                    gotoBtn.classList.add("br-none");
                    gotoBtn.classList.add("no-radius");
                    gotoBtn.classList.add("fill-width");
                    gotoBtn.classList.add("h-max-content");

                    setHover(gotoBtn, "Go To Diagram");

                    gotoBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        const diagrams = window.mCvRootNode.getDiagramGroups();
                        for (let idg=0;idg<diagrams.length;idg++) {
                            const dg = diagrams[idg];
                            if (dg.name() != lintinfo.moduleName) {
                                continue;
                            }
                            let node = dg.getNodeByLineN(message.linen);
                            node?.focus();
                            break;
                        }
                    });

                    let arrowIcon = document.createElement("i");
                    arrowIcon.classList.add("fa-solid");
                    arrowIcon.classList.add("fa-arrow-right");

                    gotoBtn.appendChild(arrowIcon);
                    col.appendChild(gotoBtn);
                }

                row.appendChild(col);
                container.appendChild(row);
            }

            view.appendChild(container);
        }
    }

    static close() {
        const btn = document.querySelector("#btn-diagram-error")! as HTMLButtonElement;
        btn.click();
    }
}

window["Lint"] = Lint;
