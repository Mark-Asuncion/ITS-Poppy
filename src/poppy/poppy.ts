import { Module } from "../scripts/backendconnector";
import { diagramToModules } from "../scripts/canvasinit";
import { DialogType, PoppyDialog, Tutorial } from "./interface";
import { Tutorial01 } from "./tutorials/tutorial01";
import { write_diagrams_to_modules } from "../scripts/backendconnector";
import { Lint } from "../scripts/lint";

// @ts-ignore
export class Poppy {
    static source: HTMLElement;
    static pos: { x: number, y: number };
    static tutorial: Tutorial | null = null;
    static onModifiedCB: ((contents: Module[]) => void) | null = null;
    static onModifiedMutex = false;
    static qTimeout: null | NodeJS.Timeout = null

    static loadTutorial(id: number) {
        switch(id) {
            case 1:
                Poppy.tutorial = new Tutorial01();
                break;
        }
    }

    static init() {
        Poppy.source = document.createElement("div");
        Poppy.source.id = "poppy-div";

        Poppy.pos = { x: 300, y: 0 };
    }

    static hide() {
        const containers = document.querySelectorAll(".dialog-container");
        if (Poppy.qTimeout)
            clearTimeout(Poppy.qTimeout);
        Poppy.qTimeout = null;
        containers.forEach((v) => {
            v.remove();
        });
    }

    static display(dialog: PoppyDialog) {
        const div = document.createElement("div");
        const poppySize = {
            w: Number(Poppy.source.style.width.substring(0, Poppy.source.style.width.length-2)),
            // h: Poppy.source.style.height.substring(0, Poppy.source.style.height.length-2)
        };

        div.classList.add("dialog-container");
        div.style.left = `${Poppy.pos.x + poppySize.w + 10}px`;
        div.style.top = `${Poppy.pos.y}px`;
        div.innerHTML = `<p> ${dialog.message} </p>`;
        switch (dialog.dialogType) {
            case DialogType.NONE:
                if (Poppy.qTimeout)
                    clearTimeout(Poppy.qTimeout);

                Poppy.qTimeout = setTimeout(() => {
                    if (dialog.cb) dialog.cb();
                    Poppy.hide();
                }, 10000);
                break;
            case DialogType.NEXT:
                // console.log(this.tutorial?.cursor);
                const btn = document.createElement("button");
                btn.classList.add("dialog-button");
                btn.innerText = "Next"
                btn.addEventListener("click", () => {
                    if (dialog.cb)
                        dialog.cb();
                    Poppy.update();
                });
                div.appendChild(btn);
                break;
            default:
                console.warn("SHOULD NOT HAPPEN");
                break;
        }
        document.body.appendChild(div);
    }

    static update() {
        Poppy.hide();
        if (Poppy.tutorial) {
            setTimeout(() => Poppy.tutorial!.update(), 300);
        }
    }

    static onError() {
    }

    static onWarning() {
    }

    static onPraise() {
    }

    static addOnModified(modules: Module[], onSuccess: () => void, onFail: () => void) {
        Poppy.onModifiedCB = (contents) => {
            let map = new Map<string, string[]>();
            for (let i=0;i<contents.length;i++) {
                if (map.get(contents[i].name) == undefined) {
                    map.set(contents[i].name, [contents[i].content]);
                }
                else {
                    map.get(contents[i].name)?.push(contents[i].content);
                }
            }

            let correctn = 0;
            for (let i=0;i<modules.length;i++) {
                let mmodule = map.get(modules[i].name);
                if (!mmodule) {
                    continue;
                }

                for (let j=0;j<mmodule.length;j++) {
                    if (mmodule[j] === modules[i].content) {
                        correctn++;
                        break;
                    }
                }
            }

            // console.log(correctn, map.size);
            if (correctn == map.size) {
                onSuccess();
                Poppy.onModifiedCB = null;
            }
            else {
                onFail();
            }
        };
    }

    static onModified() {
        if (Poppy.onModifiedMutex) {
            return;
        }
        if (window.mCvStage == undefined ||
            window.mCvRootNode == undefined) {
            console.warn("SHOULD NOT HAPPEN");
        }
        Poppy.onModifiedMutex = true;

        const contents = diagramToModules(window.mCvStage);
        let lint = async () => {
            write_diagrams_to_modules(contents);
            Lint.lint();
        }
        lint();

        // TODO: save then
        // send contents to pylint

        // console.trace("modified", [Poppy.tutorial?.cursor])
        // == TUTORIAL ==
        if (Poppy.onModifiedCB) {
            Poppy.onModifiedCB(contents);
            Poppy.update();
        }

        setTimeout(() => Poppy.onModifiedMutex = false, 100);
    }
}
