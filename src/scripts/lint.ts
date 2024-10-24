import { DialogType } from "../poppy/interface";
import { Poppy } from "../poppy/poppy";
import { PoppyErrMessages } from "../themes/lint";
import { LintInfo, lint } from "./backendconnector";
import { setHover } from "./canvas/tooltip";

// TODO
// @ts-ignore
export class Lint {
    static list: LintInfo[] = [];
    static lastOpenedAuto: number = 0;

    static async lint() {
        let lintinfo = await lint();
        Lint.list = lintinfo as LintInfo[];
        Lint.fill();
        if (lintinfo instanceof String) {
            // show err
            console.warn(lintinfo);
            return;
        }

        if (lintinfo.length != 0) {
            Poppy.swapDialog = {
                message: "There are pending error/s",
                dialogType: DialogType.NONE,
                timeout: 5000,
                notif: true
            };
        }

        if (Lint.list.length !== 0 && (Date.now() - Lint.lastOpenedAuto < 5000 || Lint.lastOpenedAuto == 0)) {
            if (window.mFocusDiagram != true)
                Lint.open();
            Lint.lastOpenedAuto = Date.now();
        }
    }

    static fill() {
        // const btn = document.querySelector("#btn-diagram-error")! as HTMLButtonElement;
        const view = document.querySelector("#diagram-error")! as HTMLDivElement;
        view.innerHTML = "";

        if (Lint.list.length === 0) {
            return;
        }

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
                if (message.errorCode[0] == "E") {
                    row.classList.add("lint-error");
                }
                else if (message.errorCode[0] == "W") {
                    row.classList.add("lint-warn");
                }
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

                // {
                //     let questionBtn = document.createElement("button") as HTMLButtonElement;
                //     questionBtn.type = "button";
                //     questionBtn.classList.add("d-flex");
                //     questionBtn.classList.add("br-none");
                //     questionBtn.classList.add("no-radius");
                //     questionBtn.classList.add("fill-width");
                //     questionBtn.classList.add("h-max-content");
                //     questionBtn.classList.add("vt-center");
                //
                //     let questionIcon = document.createElement("i");
                //     questionIcon.classList.add("fa-solid");
                //     questionIcon.classList.add("fa-question");
                //
                //     questionBtn.appendChild(questionIcon);
                //     col.appendChild(questionBtn);
                // }
                {
                    let gotoBtn = document.createElement("button") as HTMLButtonElement;
                    gotoBtn.type = "button";
                    gotoBtn.classList.add("d-flex");
                    gotoBtn.classList.add("br-none");
                    gotoBtn.classList.add("no-radius");
                    gotoBtn.classList.add("fill-width");
                    gotoBtn.classList.add("h-max-content");
                    gotoBtn.classList.add("vt-center");

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
                            Lint.close();
                            node?.focus();
                            let absPos = node?.getAbsolutePosition();
                            if (absPos) {
                                let friendlyMessage = PoppyErrMessages[message.errorCode];
                                console.log(friendlyMessage, message.errorCode);
                                if (friendlyMessage) {
                                    Poppy.targetPos = absPos;
                                    Poppy.focusedInDiagram = true;
                                    let dialog = {
                                        message: friendlyMessage,
                                        dialogType: DialogType.NEXT,
                                        cb: () => {
                                            Poppy.focusedInDiagram = false;
                                        }
                                    };
                                    Poppy.swapDialog = dialog;
                                }
                            }
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

    static isOpen() {
        const btn = document.querySelector("#btn-diagram-error")! as HTMLButtonElement;
        const tname = btn.getAttribute("aria-target")!;
        const target = document.querySelector("#" + tname)!;
        return target.classList.contains("d-block");
    }

    static open() {
        if (!Lint.isOpen()) {
            const btn = document.querySelector("#btn-diagram-error")! as HTMLButtonElement;
            btn.click();
        }
    }

    static close() {
        if (Lint.isOpen()) {
            const btn = document.querySelector("#btn-diagram-error")! as HTMLButtonElement;
            btn.click();
        }
    }
}

window["Lint"] = Lint;
