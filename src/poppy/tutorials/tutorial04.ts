import { createDiagramFrom } from "../../scripts/canvas/utils";
import { Lint } from "../../scripts/lint";
import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial04 extends Tutorial {
    once = false;
    constructor() {
        super();
        this.name = "Functions";
        this.cursor = 0;
        Lint.autoOpen = false;
    }

    update() {
        switch (this.cursor) {
            case 0:
                Poppy.display({
                    message: "Welcome! In this tutorial, we’ll learn about <span class=\"accent\">functions</span> in Python. A function is a block of code that performs a specific task and can be reused in your programs.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 1).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: "You can define a function using the <span class=\"accent\">def</span> keyword, followed by the function name and parentheses. Like this: <code>def greet():</code>",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 111).bind(this)
                });
                break;
            case 111:
                Poppy.display({
                    message: `It is worth noting that <span class="accent">defining</span> a function also creates a block, which means the code below it needs to be <span class="accent">indented</span> to be included in the function. But don't worry—the <span class="accent">Def Function Diagram</span> already <span class="accent">indents</span> the code below it.`,
                    onDisplay: () => {
                        Poppy.targetPos = {
                            x: Poppy.pos.x + 100,
                            y: Poppy.pos.y - 300
                        };
                    },
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 2).bind(this)
                });
                break;
            case 2:
                Poppy.display({
                    message: "Drag a <span class=\"info\">Def Function Diagram</span> into the editor and define the function <span class=\"info\">def greet():</span>",
                    onDisplay: (() => {
                    const btn = document.querySelector("#btn-diagram-view")! as HTMLElement;
                        if ( !btn.classList.contains("active") ) {
                            btn.click();
                        }
                        const tname = btn.getAttribute("aria-target")!;
                        const target = document.querySelector("#" + tname)! as HTMLDivElement;
                        const diagram = document.querySelector("img[data-diagram-type=\"def\"]")! as HTMLElement;
                        target.scrollTo({
                            top: 600,
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
                    dialogType: DialogType.NONE,
                    timeout: -1
                });
                Poppy.onDiagramDrop = (() => {
                    let dgs = window.mCvRootNode.getDiagramGroups();
                    if (dgs.length == 0) {
                        return;
                    }
                    if (dgs[0].nodes[0].name() == "DefFunction") {
                        this.cursor = 21;
                        this.highlightRemove();
                        Poppy.qDialogRemoveFirst();
                        Poppy.update();
                        Poppy.onDiagramDrop = null;
                        return;
                    }
                }).bind(this);
                break;
            case 21:
                Poppy.display({
                    message: `Now, define a function called <span class="accent">greet</span>`,
                    dialogType: DialogType.NONE,
                    timeout: -1
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet( ):\n"
                    }
                ], (() => this.cursor = 3).bind(this));
                break;
            case 3:
                Poppy.display({
                    message: "Inside the function, add a print statement to greet the user: <pre><span class=\"info\">    print('Hello, world!')</span></pre>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint('Hello, world!')\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint(\"Hello, world!\")\n"
                    }
                ], (() => this.cursor = 4).bind(this), (() => {}).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: "Great! Now let’s call the <span class=\"accent\">greet</span> function to see it in action. Add <span class=\"info\">greet()</span> below the function definition:<pre><span class=\"info\">def greet():<br>   print('Hello, world!')<br><br>greet()</span></pre>",
                    onDisplay: () => {
                        Poppy.addHint({
                            message: `Since <span class="accent">defining a function</span> creates a <span class="info">block,</span> we need to <span class="info">unindent.</span> We can do so by using <span class="accent">End Block Diagram</span>.`,
                            dialogType: DialogType.NEXT
                        });
                    },
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint('Hello, world!')\ngreet( )\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint(\"Hello, world!\")\ngreet( )\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint('Hello, world!')\ngreet()\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint(\"Hello, world!\")\ngreet()\n"
                    }
                ], (() => {this.cursor = 5; Poppy.removeHint();}).bind(this), (() => this.cursor = -1).bind(this));
                if (!this.once) {
                    this.once = true;
                    setTimeout((() => {
                        let edHint = document.querySelector("#editor-hint");
                        if (!edHint) {
                            return;
                        }

                        let rect = edHint.getBoundingClientRect();
                        rect.x -= Poppy.frameSizeWxH;
                        rect.y += 80;
                        Poppy.targetPos = {
                            x: rect.x, y: rect.y
                        };
                        Poppy.swapDialog = {
                            message: "You can press the question mark for a hint if you are having a trouble.",
                            dialogType: DialogType.NEXT,
                            cb: ( () => {
                                this.cursor = 4;
                                Poppy.qDialog = [];
                                Poppy.update();
                            } ).bind(this)
                        };
                    }).bind(this), 1000);
                }
                break;
            case 5:
                Poppy.display({
                    message: "When you run the code, it should print: <span class=\"info\">Hello, world!</span> Now you can define functions to perform different tasks.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 6).bind(this)
                });
                break;

            // Separate section for return statements
            case 6:
                Poppy.display({
                    message: "Now, let’s learn how to return values from functions. We'll modify the <span class=\"accent\">greet</span> function to return a greeting message.",
                    dialogType: DialogType.NEXT,
                    cb: (() => {
                        this.cursor = 7;
                        let dgs = window.mCvRootNode.getDiagramGroups();
                        if (dgs.length == 0) {
                            return;
                        }
                        let nodes = dgs[0].nodes;
                        nodes.forEach((n) => {
                            n.remove();
                            n.destroy();
                        });
                        dgs[0].nodes = [];
                        dgs[0].addDiagram(createDiagramFrom("def", "def greet( ):"));
                        dgs[0].addDiagram(createDiagramFrom("statement", "'Hello, world!'"));
                        dgs[0].refresh();
                    }).bind(this)
                });
                break;
            case 7:
                Poppy.display({
                    message: "Update the <span class=\"accent\">greet</span> function to use the return statement like this:<pre><span class=\"info\">def greet():<br>    return 'Hello, world!'</span></pre>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet( ):\n\treturn 'Hello, world!'\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\treturn \"Hello, world!\"\n"
                    }
                ], (() => this.cursor = 8).bind(this), (() => {}).bind(this));
                break;
            case 8:
                Poppy.display({
                    message: "Now let’s call the <span class=\"accent\">greet</span> function and store the returned value in a variable. Add the following code:<pre><span class=\"info\">message = greet()<br>print(message)</span></pre>",
                    onDisplay: () => {
                        Poppy.addHint({
                            message: `Since <span class="accent">defining a function</span> creates a <span class="info">block,</span> we need to <span class="info">unindent.</span> We can do so by using <span class="accent">End Block Diagram</span>.`,
                            dialogType: DialogType.NEXT
                        });
                    },
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet( ):\n\treturn 'Hello, world!'\nmessage = greet()\nprint(message)\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\treturn \"Hello, world!\"\nmessage = greet()\nprint(message)\n"
                    }
                ], (() => {this.cursor = 9; Poppy.removeHint();}).bind(this), (() => {}).bind(this));
                break;
            case 9:
                Poppy.display({
                    message: "When you run the code, it should print: <span class=\"info\">Hello, world!</span> This demonstrates how to use return values in functions.",
                    dialogType: DialogType.NEXT,
                    cb: (() => {
                        this.cursor = 10;
                        let dgs = window.mCvRootNode.getDiagramGroups();
                        if (dgs.length == 0) {
                            return;
                        }
                        let nodes = dgs[0].nodes;
                        nodes.forEach((n) => {
                            n.remove();
                            n.destroy();
                        });
                        dgs[0].nodes = [];
                        dgs[0].addDiagram(createDiagramFrom("def", "def greet( ):"));
                        dgs[0].addDiagram(createDiagramFrom("statement", "return 'Hello, world!'"));
                        dgs[0].refresh();
                    }).bind(this)
                });
                break;

            // Back to modifying greet to take a name
            case 10:
                Poppy.display({
                    message: `Now, let’s modify the <span class=\"accent\">greet</span> function to accept a name. Change it to: <pre><span class=\"info\">def greet(name):</span></pre> Again, Python is <span class="accent">dynamically typed</span>, which means the name can be any type depending on what you pass.`,
                    onDisplay: () => {
                        Poppy.addHint({
                            message: `To accept a argument, you can add <span class="accent">name</span> between the <span class="accent">( ) brackets</span>.`,
                            dialogType: DialogType.NEXT
                        });
                    },
                    dialogType: DialogType.NEXT,
                    cb: (() => {
                        this.cursor = 11;
                        Poppy.removeHint();
                    }).bind(this)
                });
                break;
            case 11:
                Poppy.display({
                    message: "Update the return statement to include the <span class=\"info\">name</span> parameter. Change it to: <pre><span class=\"info\">return 'Hello, ' + name + '!'</span></pre>",
                    // onDisplay: () => {
                    //     Poppy.addHint({
                    //         message: "to add a ",
                    //         dialogType: DialogType.NEXT
                    //     })
                    // },
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet(name):\n\treturn 'Hello, ' + name + '!'\n"
                    },
                    {
                        name: "main",
                        content: "def greet(name):\n\treturn \"Hello, \" + name + \"!\"\n"
                    }
                ], (() => {
                        this.cursor = 12;
                        // Poppy.removeHint();
                    }).bind(this), (() => {}).bind(this));
                break;
            case 12:
                Poppy.display({
                    message: "Let's assign the return value to a variable: <code>message = greet('Poppy')</code>. Now when you print <span class=\"info\">message</span>, it will return the greeting message. Try to print it.",
                    onDisplay: () => {
                        Poppy.addHint({
                            message: `Since <span class="accent">defining a function</span> creates a <span class="info">block,</span> we need to <span class="info">unindent.</span> We can do so by using <span class="accent">End Block Diagram</span>.`,
                            dialogType: DialogType.NEXT
                        });
                    },
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet(name):\n\treturn 'Hello, ' + name + '!'\nmessage = greet('Poppy')\nprint(message)\n"
                    },
                    {
                        name: "main",
                        content: "def greet(name):\n\treturn \"Hello, \" + name + \"!\"\nmessage = greet(\"Poppy\")\nprint(message)\n"
                    }
                ], (() => {this.cursor = 13; Poppy.removeHint();}).bind(this), (() => {}).bind(this));
                break;
            case 13:
                Poppy.display({
                    message: "When you run the program, it should print: <span class=\"info\">Hello, Poppy!</span> You can now pass different names to the function.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 14).bind(this)
                });
                break;
            case 14:
                Poppy.display({
                    message: "That's it for this lesson on functions! Experiment with creating and calling your own functions to strengthen your understanding.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 15).bind(this)
                });
                break;
            case -1:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct. Did you define the <span class=\"accent\">greet</span> function correctly?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 4).bind(this)
                });
                break;
            case -2:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct. Did you type them correctly?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 8).bind(this)
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