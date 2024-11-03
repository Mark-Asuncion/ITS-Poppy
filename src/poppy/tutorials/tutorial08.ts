import { Lint } from "../../scripts/lint";
import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial08 extends Tutorial {
    // cursorErrReturn: number = 1;
    constructor() {
        super();
        this.name = "Error Handling";
        this.cursor = 0;
        Lint.autoOpen = false;
    }

    update() {
    switch(this.cursor) {
        case 0:
            Poppy.display({
                message: "Welcome! In this lesson, we will learn about <span class=\"accent\">error handling</span> in Python using <span class=\"info\">try</span> and <span class=\"info\">except</span> blocks.",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 1).bind(this)
            });
            break;
        case 1:
            Poppy.display({
                message: "Error handling allows you to manage exceptions or errors that may occur during the execution of your program. This helps to prevent your program from crashing.",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 2).bind(this)
            });
            break;
        case 2:
            Poppy.display({
                message: "Let’s start with a simple example. Imagine you want to divide two numbers entered by the user. If the user enters 0 as the denominator, it will cause an error.",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 3).bind(this)
            });
            break;
        case 3:
            Poppy.display({
                message: `Drag a <span class="accent">Statement</span> Diagram into the editor`,
                    dialogType: DialogType.NONE,
                    timeout: -1,
                    onDisplay: (() => {
                    const btn = document.querySelector("#btn-diagram-view")! as HTMLElement;
                        if ( !btn.classList.contains("active") ) {
                            btn.click();
                        }
                        const diagram = document.querySelector("img[data-diagram-type=\"statement\"]")! as HTMLElement;
                        this.highlight(diagram, (() => {}), true);
                        const rect = diagram.getBoundingClientRect();
                        const targetPos = {
                            x: rect.x + rect.width + 5,
                            y: rect.y + 40
                        };
                        const distance = {
                            x: Math.abs(Poppy.pos.x - targetPos.x),
                            y: Math.abs(Poppy.pos.y - targetPos.y)
                        };
                        if (distance.x != 0 && distance.y != 0)
                        Poppy.targetPos = targetPos;
                    }).bind(this),
                });
                Poppy.onDiagramDrop = (() => {
                    let dgs = window.mCvRootNode.getDiagramGroups();
                    if (dgs.length == 0) {
                        return;
                    }
                    if (dgs[0].nodes[0].name() == "Statement") {
                        this.cursor = 31;
                        this.highlightRemove();
                        Poppy.qDialogRemoveFirst();
                        Poppy.update();
                        Poppy.onDiagramDrop = null;
                        return;
                    }
                }).bind(this);
            break;
        case 31:
            Poppy.display({
                message: `Drag another <span class="accent">Statement</span> Diagram into the editor and connect it to the first <span class="accent">Statement</span> Diagram`,
                    dialogType: DialogType.NONE,
                    timeout: -1,
                    onDisplay: (() => {
                    const btn = document.querySelector("#btn-diagram-view")! as HTMLElement;
                        if ( !btn.classList.contains("active") ) {
                            btn.click();
                        }
                        const diagram = document.querySelector("img[data-diagram-type=\"statement\"]")! as HTMLElement;
                        this.highlight(diagram, (() => {}), true);
                        const rect = diagram.getBoundingClientRect();
                        const targetPos = {
                            x: rect.x + rect.width + 5,
                            y: rect.y + 40
                        };
                        const distance = {
                            x: Math.abs(Poppy.pos.x - targetPos.x),
                            y: Math.abs(Poppy.pos.y - targetPos.y)
                        };
                        if (distance.x != 0 && distance.y != 0)
                        Poppy.targetPos = targetPos;
                    }).bind(this),
                });
                Poppy.onDiagramDrop = (() => {
                    let dgs = window.mCvRootNode.getDiagramGroups();
                    if (dgs.length == 0) {
                        return;
                    }
                    if (dgs[0].nodes[1].name() == "Statement") {
                        this.cursor = 32;
                        this.highlightRemove();
                        Poppy.qDialogRemoveFirst();
                        Poppy.update();
                        Poppy.onDiagramDrop = null;
                        return;
                    }
                }).bind(this);
            break;
        case 32:
            Poppy.display({
                message: `Drag a <span class="accent">Try</span> Diagram into the editor and connect it below the <span class="accent">Statement</span> Diagram`,
                    dialogType: DialogType.NONE,
                    timeout: -1,
                    onDisplay: (() => {
                    const btn = document.querySelector("#btn-diagram-view")! as HTMLElement;
                        if ( !btn.classList.contains("active") ) {
                            btn.click();
                        }
                        const tname = btn.getAttribute("aria-target")!;
                        const target = document.querySelector("#" + tname)! as HTMLDivElement;
                        const diagram = document.querySelector("img[data-diagram-type=\"try\"]")! as HTMLElement;
                        target.scrollTo({
                            top: 800,
                            behavior: "instant",
                        });
                        this.highlight(diagram, (() => {}), true);
                        const rect = diagram.getBoundingClientRect();
                        const targetPos = {
                            x: rect.x + rect.width + 5,
                            y: rect.y + 40
                        };
                        const distance = {
                            x: Math.abs(Poppy.pos.x - targetPos.x),
                            y: Math.abs(Poppy.pos.y - targetPos.y)
                        };
                        if (distance.x != 0 && distance.y != 0)
                        Poppy.targetPos = targetPos;
                    }).bind(this),
                });
                Poppy.onDiagramDrop = (() => {
                    let dgs = window.mCvRootNode.getDiagramGroups();
                    if (dgs.length == 0) {
                        return;
                    }
                    if (dgs[0].nodes[2].name() == "Try") {
                        this.cursor = 4;
                        this.highlightRemove();
                        Poppy.qDialogRemoveFirst();
                        Poppy.update();
                        Poppy.onDiagramDrop = null;
                        return;
                    }
                }).bind(this);
            break;
        case 4:
            Poppy.display({
                message: "Here’s how you can use try and except to handle that error:<pre><span class=\"info\">num1 = int(input('Enter a numerator: '))<br>num2 = int(input('Enter a denominator: '))<br>try:<br>   result = num1 / num2<br>   print(result)<br>except ZeroDivisionError:<br>   print('Cannot divide by zero!')</span></pre>",
                dialogType: DialogType.NONE,
            });
            Poppy.addOnModified([
                {
                    name: "main",
                    content: "num1 = int(input('Enter a numerator: '))\nnum2 = int(input('Enter a denominator: '))\ntry:\n\tresult = num1 / num2\n\tprint(result)\nexcept ZeroDivisionError:\n\tprint('Cannot divide by zero!')\n"
                },
                {
                    name: "main",
                    content: "num1 = int(input(\"Enter a numerator: \"))\nnum2 = int(input(\"Enter a denominator: \"))\ntry:\n\tresult = num1 / num2\n\tprint(result)\nexcept ZeroDivisionError:\n\tprint(\"Cannot divide by zero!\")\n"
                }
            ], (() => this.cursor = 5).bind(this));
            break;
        case 5:
            Poppy.display({
                message: `Try running this code and input <span class="accent">0</span> or other numbers on <span class="accent">num2</span> to see how the error is handled!`,
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 6).bind(this)
            });
            break;
        case 6:
            Poppy.display({
                message: "Well done! You now know how to handle errors in Python using try and except. Feel free to experiment with different scenarios!",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 11).bind(this)
            });
            break;
        case -1:
            Poppy.display({
                message: "Hmm, it seems something went wrong. Did you type the try block correctly?",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 4).bind(this)
            });
            break;
        case -2:
            Poppy.display({
                message: "Hmm, it seems something went wrong. Did you type the multiple exceptions correctly?",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 7).bind(this)
            });
            break;
        case -3:
            Poppy.display({
                message: "Hmm, it seems something went wrong. Did you type the general exception correctly?",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 9).bind(this)
            });
            break;
        default:
            Poppy.tutorial = null;
            console.log("End of tutorial");
            break;
		}
	}

    highlightRemove() {
        const highlighters = document.querySelectorAll(".highlighter")
        highlighters.forEach((v) => v.remove());
    }

    highlight(el: HTMLElement, cb?: () => void, ignoreEvents = false) {
        this.highlightRemove();
        const div = document.createElement("div");
        const rect = el.getBoundingClientRect();
        div.classList.add("highlighter");
        div.style.left = `${rect.x}px`;
        div.style.top = `${rect.y}px`;
        div.style.width = `${rect.width}px`;
        div.style.height = `${rect.height}px`;
        if (ignoreEvents) {
            div.style.pointerEvents = "none";
        }
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
