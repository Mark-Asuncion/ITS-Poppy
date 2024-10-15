import { Module } from "../scripts/backendconnector";
import { diagramToModules } from "../scripts/canvasinit";
import { DialogType, PoppyAnimation, PoppyDialog, PoppyState, Tutorial } from "./interface";
import { Tutorial01 } from "./tutorials/tutorial01";
import { write_diagrams_to_modules } from "../scripts/backendconnector";
import { Lint } from "../scripts/lint";
import { Idle } from "./animation/idle";
import { Walk } from "./animation/walk";
import { Tutorial00 } from "./tutorials/tutorial00";

// @ts-ignore
export class Poppy {
    static id = "character";
    static tutorial: Tutorial | null = null;
    static onModifiedCB: ((contents: Module[]) => void) | null = null;
    static onModifiedMutex = false;
    static qTimeout: null | NodeJS.Timeout = null
    static qDialog: PoppyDialog[] = [];

    // Poppy related vars
    static source: HTMLElement;
    static state: PoppyState;
    static animator: PoppyAnimation | null;
    static pos: { x: number, y: number };
    static targetPos: { x: number, y: number } | null = null;
    static moveSpeed = 5;
    static scale = 1.5;
    // move dialog to top middle
    static focusedInDiagram = false;

    static lastTimestamp = 0;
    static frameSizeWxH = 64;

    static getSize() {
        return {
            x: Poppy.frameSizeWxH * Poppy.scale,
            y: Poppy.frameSizeWxH * Poppy.scale
        };
    }

    static moveCharacter(pos: { x: number, y: number }) {
        Poppy.pos = pos;
        Poppy.source.style.left = `${pos.x}px`;
        Poppy.source.style.top = `${pos.y}px`;
        Poppy.setDialogPosition();
    }

    static setDialogPosition(source?: HTMLElement) {
        const dialog = (source)? source:document.querySelector(".dialog-container");
        if (dialog && dialog instanceof HTMLElement) {
            let offset = Poppy.getDialogOffset();
            let x = Poppy.pos.x + offset.x;
            if (offset.x < 0) {
                x -= dialog.clientWidth - 50;
            }
            if (Poppy.focusedInDiagram) {
                offset.y = -dialog.clientHeight - ( Poppy.frameSizeWxH / 2 );
                x = ( Poppy.pos.x + Poppy.frameSizeWxH / 2 ) - dialog.clientWidth / 2;
            }
            dialog.style.left = `${x}px`;
            dialog.style.top = `${Poppy.pos.y + offset.y}px`;
            // console.log(dialog);
        }
    }

    static getDialogOffset() {
        let anchor = Poppy.getAnchor();
        let size = Poppy.getSize();
        let x = 0;
        let y = 0;
        switch (anchor) {
            case 0:
                x = size.x;
                y = size.y;
                break;
            case 3:
                x = size.x;
                y = -size.y;
                break;
            case 1:
                x = -size.x;
                y = size.y;
                break;
            case 2:
                x = -size.x;
                y = -size.y;
                break;
        }
        return {
            x, y
        };
    }

    static getAnchor() {
        const w = window.innerWidth / 2;
        const h = window.innerHeight / 2;
        // returns what side the pos is if splitted into 4 boxes
        // | 0| 1|
        // |-----|
        // | 3| 2|
        let isLeft = false;
        let isTop = false;
        if (Poppy.pos.x < w) {
            isLeft = true;
        }
        if (Poppy.pos.y < h) {
            isTop = true;
        }
        if (isLeft && isTop) {
            return 0;
        }
        else if (!isLeft && isTop) {
            return 1;
        }
        else if (!isLeft && !isTop) {
            return 2;
        }
        else if (isLeft && !isTop) {
            return 3;
        }
    }

    static loadTutorial(id: number) {
        switch(id) {
            case 0:
                Poppy.tutorial = new Tutorial00();
                break;
            case 1:
                Poppy.tutorial = new Tutorial01();
                break;
        }
    }

    static qDialogFirst(dialog: PoppyDialog) {
        Poppy.qDialog = [dialog, ...Poppy.qDialog];
    }

    static init() {
        Poppy.source = document.createElement("div");
        Poppy.source.id = "poppy-div";
        Poppy.state = PoppyState.IDLE;
        Poppy.animator = null;


        // const div = document.createElement("div");
        // div.id = "poppy-container";
        const char = document.createElement("div");
        char.id = "character";
        // div.appendChild(char);
        Poppy.source = char;
        document.body.appendChild(char);
        window.requestAnimationFrame(Poppy.poppyOnFrame)
        char.style.scale = `${Poppy.scale}`;
        // 64 is the spritesheet item w and h
        let actualSize = Poppy.frameSizeWxH * Poppy.scale;

        let y = window.innerHeight - actualSize - 40;
        let pos = { x: 10, y: y };
        Poppy.moveCharacter(pos);
        Poppy.animator = new Idle();
    }

    static poppyOnFrame(timestamp: number) {
        if (Poppy.lastTimestamp === undefined) {
            Poppy.lastTimestamp = timestamp;
        }
        const elapsed = timestamp - Poppy.lastTimestamp;
        Poppy.lastTimestamp = timestamp;

        switch (Poppy.state) {
            case PoppyState.IDLE:
                if (!(Poppy.animator instanceof Idle)) {
                    Poppy.animator = new Idle();
                }
                if (Poppy.targetPos) {
                    Poppy.state = PoppyState.WALKING;
                    break;
                }
                const containers = document.querySelectorAll(".dialog-container");
                if (Poppy.qDialog.length !== 0 && containers.length === 0) {
                    let dialog = Poppy.qDialog.shift()!;
                    Poppy.display(dialog);
                }
                break;
            case PoppyState.WALKING:
                if (!(Poppy.animator instanceof Walk)) {
                    Poppy.animator = new Walk();
                }
                if (Poppy.targetPos == null) {
                    Poppy.state = PoppyState.IDLE;
                    break;
                }
                const distance = {
                    x: Math.abs(Poppy.pos.x - Poppy.targetPos!.x),
                    y: Math.abs(Poppy.pos.y - Poppy.targetPos!.y)
                };

                if (distance.x == 0 && distance.y == 0) {
                    Poppy.targetPos = null;
                    Poppy.state = PoppyState.IDLE;
                    break;
                }

                let isLeft = (Poppy.targetPos!.x - Poppy.pos.x) < 0;
                let isTop = (Poppy.targetPos!.y - Poppy.pos.y) < 0;
                if (!isLeft) {
                    ( Poppy.animator as Walk ).direction = 1;
                }
                let velo = {
                    x: (isLeft)? -Poppy.moveSpeed:Poppy.moveSpeed,
                    y: (isTop)? -Poppy.moveSpeed:Poppy.moveSpeed
                };
                velo.x = Math.min(velo.x, distance.x);
                velo.y = Math.min(velo.y, distance.y);
                Poppy.moveCharacter({
                    x: Poppy.pos.x + velo.x,
                    y: Poppy.pos.y + velo.y
                });
                break;
            default:
                Poppy.state = PoppyState.IDLE;
                break;
        }

        if (Poppy.animator) {
            Poppy.animator.update(elapsed);
        }
        else {
            Poppy.source.remove();
        }

        window.requestAnimationFrame(Poppy.poppyOnFrame)
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
        const container = document.querySelector(".dialog-container")
        if (Poppy.state == PoppyState.WALKING || container) {
            Poppy.qDialog.push(dialog);
            return;
        }

        const div = document.createElement("div");

        div.classList.add("dialog-container");
        div.innerHTML = `<p> ${dialog.message} </p>`;

        switch (dialog.dialogType) {
            case DialogType.NONE:
                if (Poppy.qTimeout)
                    clearTimeout(Poppy.qTimeout);

                Poppy.qTimeout = setTimeout(() => {
                    if (dialog.cb) dialog.cb();
                    Poppy.hide();
                }, (dialog.timeout != undefined)? dialog.timeout:10000);
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
        if (dialog.onDisplay)
            dialog.onDisplay()
        document.body.appendChild(div);
        Poppy.setDialogPosition(div);
    }

    static update() {
        Poppy.hide();
        if (Poppy.tutorial) {
            setTimeout(() => Poppy.tutorial!.update(), 300);
        }
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
            await write_diagrams_to_modules(contents);
            Lint.lint();
        }
        lint();

        // console.trace("modified", [Poppy.tutorial?.cursor])
        // == TUTORIAL ==
        if (Poppy.onModifiedCB) {
            Poppy.onModifiedCB(contents);
            Poppy.update();
        }

        setTimeout(() => Poppy.onModifiedMutex = false, 100);
    }

    static evMouseDown() {
        window.mDragDiv = Poppy.source;
    }

    static evMouseUp() {
        window.mDragDiv = null;
        Poppy.targetPos = window.mCursor;
        let pin = document.querySelector(".character-loc-pin")
        pin?.remove();
    }

    static evMouseMove() {
        let pin = document.querySelector(".character-loc-pin");
        if (!pin){
            const div = document.createElement("div");
            div.classList.add("character-loc-pin");
            div.classList.add("accent");
            div.innerHTML = `<i class="fa-solid fa-location-dot fa-xl"></i>`;
            pin = div;
            document.body.appendChild(pin);
        }
        let el = ( pin as HTMLElement );
        el.style.left = `${window.mCursor.x - el.clientWidth/2}px`;
        el.style.top = `${window.mCursor.y - el.clientHeight}px`;
    }
}
