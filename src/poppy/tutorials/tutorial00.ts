import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial00 extends Tutorial {
    // cursorErrReturn: number = 1;
    constructor() {
        super();
        this.name = "Learn the app";
        this.cursor = 0;
    }

    update() {
        switch(this.cursor) {
            case 0: {
                Poppy.display({
                    message: "Welcome! we're going to learn how to use the application",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor++).bind(this)
                });
                break;
            }
            case 1: {
                Poppy.display({
                    message: "First let's learn how to create a module",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor++).bind(this)
                });
                break;
            }
            case 2: {
                Poppy.display({
                    message: "Click the highlighted button to display a list of available diagrams",
                    dialogType: DialogType.NONE,
                    onDisplay: ( () => {
                        const btn = document.querySelector("#btn-diagram-view")! as HTMLElement;
                        console.log("onDisplay");
                        this.highlight(btn);
                        const rect = btn.getBoundingClientRect();
                        Poppy.targetPos = {
                            x: rect.x + rect.width + 5,
                            y: rect.y + 30
                        };
                    } ).bind(this),
                    // cb: (() => {
                    //     this.cursor++;
                    //     this.highlightRemove();
                    // }).bind(this)
                });
                break;
            }
            case 3: {
                Poppy.display({
                    message: "Oh, I'm sorry. I am probably covering the view. You can hold and drag me to make me move. Try it!.",
                    dialogType: DialogType.NEXT,
                    cb: (() => {
                        this.cursor++;
                    }).bind(this)
                });
               break;
            }
            case 4: {
                Poppy.display({
                    message: "",
                    dialogType: DialogType.NEXT,
                    cb: (() => {
                        this.cursor++;
                    }).bind(this)
                });
               break;
            }
            case 5: {
                break;
            }
            case -1: {
                this.cursor = 3;
                break;
            }
            default:
                Poppy.tutorial = null;
                console.log("end of tutorial");
            break;
        }
    }

    highlightRemove() {
        const highlighters = document.querySelectorAll(".highlighter")
        highlighters.forEach((v) => v.remove());
    }

    highlight(el: HTMLElement) {
        const div = document.createElement("div");
        const rect = el.getBoundingClientRect();
        div.classList.add("highlighter");
        div.style.left = `${rect.x}px`;
        div.style.top = `${rect.y}px`;
        div.style.width = `${rect.width}px`;
        div.style.height = `${rect.height}px`;
        let ref = this;
        div.addEventListener("click", (e) => {
            e.preventDefault();
            if (el instanceof HTMLButtonElement)
                el.click();
            ref.highlightRemove();
            this.cursor = 3;
            Poppy.update();
        });
        document.body.appendChild(div);
    }
}
