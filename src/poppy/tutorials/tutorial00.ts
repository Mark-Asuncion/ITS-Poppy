import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial00 extends Tutorial {
    // cursorErrReturn: number = 1;
    constructor() {
        super();
        this.name = "Hello World";
        this.cursor = 0;
    }

    update() {
        switch(this.cursor) {
            case 0: {
                Poppy.display({
                    message: "Welcome! we're going to learn how to use the application",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 1).bind(this)
                });
                break;
            }
            case 1: {
                Poppy.display({
                    message: "First let's learn how to create a module",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 2).bind(this)
                });
                break;
            }
            case 2: {
                Poppy.display({
                    message: "Click the highlighted button to display this list of available diagrams",
                    dialogType: DialogType.NONE,
                    onDisplay: ( () => {
                        const btn = document.querySelector("#btn-diagram-view")! as HTMLElement;
                        console.log("onDisplay");
                        this.highlight(btn, (() => this.cursor=3).bind(this));
                        const rect = btn.getBoundingClientRect();
                        Poppy.targetPos = {
                            x: rect.x + rect.width + 5,
                            y: rect.y + 30
                        };
                    } ).bind(this),
                });
                break;
            }
            case 3: {
                Poppy.display({
                    message: "Oh, I'm sorry. I am probably covering the view. You can hold and drag me to make me move. Try it!.",
                    dialogType: DialogType.NEXT,
                    cb: (() => {
                        this.cursor = 4;
                    }).bind(this)
                });
               break;
            }
            case 4: {
                Poppy.display({
                    message: "Let's try printing \"Hello, World!\". First, to create a line of code drag the diagram I am pointing at into the editor view.",
                    dialogType: DialogType.NEXT,
                    onDisplay: ( () => {
                        const btn = document.querySelector("img[aria-diagram-type=\"statement\"]")! as HTMLElement;
                        console.log("onDisplay");
                        this.highlight(btn, () => {});
                        const rect = btn.getBoundingClientRect();
                        Poppy.targetPos = {
                            x: rect.x - Poppy.frameSizeWxH,
                            y: rect.y + 30
                        };
                    } ).bind(this),
                    cb: (() => {
                        this.cursor = 5;
                        this.highlightRemove();
                    }).bind(this)
                });
               break;
            }
            case 5: {
                Poppy.display({
                    message: "To print a message in python we use the 'print' built-in function. Try typing print(\"Hello, World!\") into the Diagram",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "print('Hello, World!')\n"
                    },
                    {
                        name: "main",
                        content: "print(\"Hello, World!\")\n"
                    }
                ], ( () => this.cursor=6 ).bind(this), (() => this.cursor=-1).bind(this));
                break;
            }
            case 6:
                Poppy.display({
                    message: "Good job! Now let's try running the program to see if its right. Do you see the green play button at the top-right corner. Click that button to run the program",
                    dialogType: DialogType.NONE,
                    onDisplay: ( () => {
                        const btn = document.querySelector("#play-btn")! as HTMLElement;
                        this.highlight(btn, (() => this.cursor=7).bind(this));
                        const rect = btn.getBoundingClientRect();
                        Poppy.targetPos = {
                            x: rect.x - Poppy.frameSizeWxH,
                            y: rect.y + 50
                        };
                    } ).bind(this),
                });
                break;
            case 7:
                Poppy.display({
                    message: "A black panel full of text has been opened. This is called a Terminal. In here you will see the output of your program. By the way the Terminal here is not perfect, it is recommended to use your system terminal for advanced programs",
                    dialogType: DialogType.NEXT,
                    cb: (() => {
                        this.cursor=8;
                    }).bind(this)
                });
                break;
            case 8:
                Poppy.display({
                    message: "Great Job! You just made your first Python program. Let's keep this going. You can go back by click the left arrow button at the top left to go back.",
                    onDisplay: ( () => {
                        const btn = document.querySelector("#back-btn")! as HTMLElement;
                        this.highlight(btn, (() => this.cursor=9).bind(this));
                        const rect = btn.getBoundingClientRect();
                        Poppy.targetPos = {
                            x: rect.x + rect.width + 10,
                            y: rect.y + 30
                        };
                    } ).bind(this),
                    dialogType: DialogType.NEXT,
                    cb: (() => {
                        this.cursor=9;
                    }).bind(this)
                });
                break;
            case -1: {
                Poppy.display({
                    message: "In Python, printing something is very simple. We use the `print()` function. It's a built-in function, now try printing \"Hello, World!\"",
                    dialogType: DialogType.NONE,
                    // cb: (() => this.cursor = 3).bind(this)
                });
                this.cursor = 5;
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

    highlight(el: HTMLElement, cb?: () => void) {
        this.highlightRemove();
        const div = document.createElement("div");
        const rect = el.getBoundingClientRect();
        console.log(rect);
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
            if (cb)
                cb();
            Poppy.update();
        });
        document.body.appendChild(div);
    }
}