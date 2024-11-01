import { Lint } from "../../scripts/lint";
import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial02 extends Tutorial {
    timer = 0;
    constructor() {
        super();
        this.name = "Control";
        this.cursor = 0;
        Lint.autoOpen = false;
    }

    update() {
    switch(this.cursor) {
        case 0:
            Poppy.display({
                message: "Welcome! In this lesson, we will learn about <span class=\"accent\">conditional statements</span> in Python. These statements let you execute different blocks of code based on certain conditions.",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 1).bind(this)
            });
            break;
        case 1:
            Poppy.display({
                message: "Let's start with the basic <span class=\"info\">if statement</span>. An if statement checks a condition and runs the code block if the condition is true. Drag a <span class=\"accent\">Statement and Control 'If' Diagram</span> to the center.",
                onDisplay: ( () => {
                    const btn = document.querySelector("#btn-diagram-view")! as HTMLElement;
                    if ( !btn.classList.contains("active") ) {
                        btn.click();
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
                    }
                    Poppy.focusedInDiagram = true;
                } ).bind(this),
                dialogType: DialogType.NONE,
                timeout: -1
            });
            Poppy.onDiagramDrop = (() => {
                let dgs = window.mCvRootNode.getDiagramGroups();
                if (dgs.length == 0) {
                    return;
                }
                let nodes = dgs[0].nodes;
                if (nodes.length == 0) {
                    console.warn("SHOULD NOT HAPPEN");
                    return;
                }
                let firstNode = nodes[0];
                let secondNode = (nodes.length > 1)? nodes[1]:null;
                if (secondNode && secondNode.name() == "If") {
                        this.cursor = 2;
                        this.highlightRemove();
                        Poppy.qDialogRemoveFirst();
                        Poppy.focusedInDiagram = false;
                        Poppy.onDiagramDrop = null;
                        Poppy.update();
                }
                else if (firstNode.name() == "Statement") {
                    const diagram = document.querySelector("img[data-diagram-type=\"control-if\"]")! as HTMLElement;
                    this.highlight(diagram, (() => {}), true);
                    const rect = diagram.getBoundingClientRect();
                    Poppy.targetPos = {
                        x: rect.x + rect.width + 5,
                        y: rect.y + 30
                    };
                }
            }).bind(this);
            break;
        case 2:
            Poppy.display({
                message: `Notice the <span class="info">: (colon)</span> at the end of the if diagram this is how Python creates a block, In other languages they uses <span class="info">{} (braces)</span>. In Python there is no need for braces you only need a <span class="info">:</span> and a <span class="info">INDENTION</span> denoting that the line of code is inside a block. Here’s an example of an if statement:<pre><span class=\"info\">age = 13 <br>if age < 13: <br>   print('You are a child.')</span></pre>`,
                onDisplay: () => {
                    Poppy.focusedInDiagram = true;
                },
                dialogType: DialogType.NONE
            });
            Poppy.addOnModified([
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint('You are a child.')\n"
                },
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint(\"You are a child.\")\n"
                }
            ], (() => {
                this.cursor = 3;
                Poppy.focusedInDiagram = false;
            }).bind(this), (() => {} ).bind(this));
            // remove goto error because the first edit will trigger a mismatch
            break;
        case 3:
            Poppy.display({
                message: `Try running this code. Change the value of <span class=\"info\">age</span> to see how the output changes!. by the way what do you think the output if the <span class="info">age is 13</span>`,
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 4).bind(this)
            });
            break;
        case 4:
            Poppy.display({
                message: `Did you guess the output right? Now, let’s introduce the <span class=\"info\">elif statement</span>. This allows you to check multiple conditions. If the first condition is false, it checks the next one. But first I want you to take a look at the <span class="accent"> diagram below the statement</span>`,
                onDisplay: (() => {
                    let dgs = window.mCvRootNode.getDiagramGroups();
                    if (dgs.length == 0) {
                        this.cursor = 1;
                        Poppy.qDialogRemoveFirst();
                        Poppy.update();
                        return;
                    }

                    let dg = dgs[0];
                    let node = dg.nodes[dg.nodes.length-1];
                    dg.highlight({
                        ...node.position(),
                        ... node.size()
                    });
                }).bind(this),
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 41).bind(this)
            });
            break;
        case 41:
            Poppy.display({
                message: `This is called an <span class="accent">End Block</span> Diagram. Since <span class="accent">INDENTION</span> is important in Python to indicate which is in the block, how do we remove it from the block? we remove it either by <span class="accent">Unindenting or increasing the Indention</span>. <span class="accent">End Block Unindents by 1 time</span> the diagrams below it. Pay attention to space on the left side multiple <span class="accent">End Block</span> might be needed depending on how nested a block is.`,
                dialogType: DialogType.NEXT,
                cb: (() => {
                    this.cursor = 5;
                    let dgs = window.mCvRootNode.getDiagramGroups();
                    if (dgs.length == 0) {
                        return;
                    }
                    let dg = dgs[0];
                    dg.highlightRemove();
                }).bind(this)
            });
            break;
        case 5:
            Poppy.display({
                message: "Let's try the elif diagram. add an elif diagram on the bottom of End Block and add this <pre><span class=\"info\">elif age < 18:<br>    print('You are a teenager.')</span></pre>",
                onDisplay: () => {
                    let dgs = window.mCvRootNode.getDiagramGroups();
                    if (dgs.length == 0) {
                        return;
                    }
                    let dg = dgs[0];
                    if (dg.nodes[0].getContent() != "age = 13") {
                        dg.nodes[0].setTextValue("age = 13");
                    }
                },
                dialogType: DialogType.NONE
            });
            Poppy.addOnModified([
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint('You are a child.')\nelif age < 18:\n\tprint('You are a teenager.')\n"
                },
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint(\"You are a child.\")\nelif age < 18:\n\tprint(\"You are a teenager.\")\n"
                }
            ], (() => this.cursor = 6).bind(this), (() => {} ).bind(this));
            break;
        case 6:
            Poppy.display({
                message: "Try running this code. Change the value of <span class=\"info\">age</span> to see how the different conditions are checked!",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 7).bind(this)
            });
            break;
        case 7:
            Poppy.display({
                message: "Finally, let’s learn about the <span class=\"info\">else statement</span>. This runs if all previous conditions are false.",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 8).bind(this)
            });
            break;
        case 8:
            Poppy.display({
                message: `Here’s a complete example:<pre><span class=\"info\">age = 13 <br>if age < 13: <br>    print('You are a child.') <br>elif age < 18: <br>    print('You are a teenager.') <br>else: <br>    print('You are an adult.')</span></pre> <span class="accent">else</span> also creates a block so you need to <span class="accent">unindent</span> first before adding the <span class="accent">else diagram</span>`,
                dialogType: DialogType.NONE,
                onDisplay: (() => {
                    const currentPos = Poppy.pos;
                    Poppy.targetPos = {
                        x: currentPos.x,
                        y: currentPos.y - 50
                    };
                })
            });
            Poppy.addOnModified([
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint('You are a child.')\nelif age < 18:\n\tprint('You are a teenager.')\nelse:\n\tprint('You are an adult.')\n"
                },
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint(\"You are a child.\")\nelif age < 18:\n\tprint(\"You are a teenager.\")\nelse:\n\tprint(\"You are an adult.\")\n"
                }
            ], (() => this.cursor = 9).bind(this), (() => this.cursor = -3 ).bind(this));
            break;
        case 81:
            Poppy.display({
                message: "Here’s a complete example:<pre><span class=\"info\">age = 13 <br>if age < 13: <br>    print('You are a child.') <br>elif age < 18: <br>    print('You are a teenager.') <br>else: <br>    print('You are an adult.')</span></pre>",
                dialogType: DialogType.NONE
            });
            Poppy.addOnModified([
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint('You are a child.')\nelif age < 18:\n\tprint('You are a teenager.')\nelse:\n\tprint('You are an adult.')\n"
                },
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint(\"You are a child.\")\nelif age < 18:\n\tprint(\"You are a teenager.\")\nelse:\n\tprint(\"You are an adult.\")\n"
                }
            ], (() => this.cursor = 9).bind(this), (() => this.cursor = -3 ).bind(this));
            break;
        case 9:
            Poppy.display({
                message: "Try running this complete example to see how all three statements work together!",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 10).bind(this)
            });
            break;
        case 10:
            Poppy.display({
                message: "Well done! Now you know how to use if, elif, and else statements in Python. Feel free to experiment with different conditions!",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 11).bind(this)
            });
            break;
        case -1:
            Poppy.display({
                message: "Hmm, it seems something went wrong. Did you type the if statement correctly?",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 2).bind(this)
            });
            break;
        case -2:
            Poppy.display({
                message: "Hmm, it seems something went wrong. Did you type the elif statement correctly?",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 5).bind(this)
            });
            break;
        case -3:
            Poppy.display({
                message: "Hmm, it seems something went wrong. Did you type the else statement correctly?",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 81).bind(this)
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
