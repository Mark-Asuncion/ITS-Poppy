import { Lint } from "../../scripts/lint";
import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial06 extends Tutorial {
    timer = 0;
    once = false;
    constructor() {
        super();
        this.name = "User Input";
        this.cursor = 0;
        Lint.autoOpen = false;
    }

    update() {
        switch(this.cursor) {
            case 0:
                Poppy.display({
                    message: "Welcome! Today we’re going to learn about <span class=\"accent\">user input</span> in Python. User input allows your program to receive data from the user while it’s running.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 1).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: "In Python, you can get user input using the <span class=\"info\">input()</span> function. Let’s start with a simple example.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 2).bind(this)
                });
                break;
            case 2:
                Poppy.display({
                    message: "First, let’s ask the user for their name using a <span class=\"accent\">Statement Diagram</span>. Here’s how you can do it: <span class=\"info\">name = input('What is your name? ')</span>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "name = input('What is your name? ')\n"
                    },
                    {
                        name: "main",
                        content: "name = input(\"What is your name? \")\n"
                    }
                ], (() => this.cursor = 3).bind(this), (() => {}).bind(this));
                break;
            case 3:
                Poppy.display({
                    message: `Great! Now, let’s print a greeting message using the name the user provided. <span class=\"info\">('Hello, ' [name]!)</span>. You can append <span class="accent">variables</span> to string if you use <span class="accent">+</span> on strings like adding numbers.`,
                    onDisplay: () => {
                        Poppy.addHint({
                            message: `<span class="accent">print</span> the name with this format <span class="accent">"Hello, [name]!"</span>. You append a variable to a string with <span class="accent">+</span> like this <span class="accent">'Hello, ' + name + '!'</span>`,
                            dialogType: DialogType.NEXT,
                            onDisplay: () => { Poppy.qDialog = [] },
                        });
                    },
                    dialogType: DialogType.NONE,
                });

                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `name = input('What is your name? ')\nprint('Hello, ' + name + '!')\n`
                    },
                    {
                        name: "main",
                        content: `name = input("What is your name? ")\nprint("Hello, " + name + "!")\n`
                    },
                ], (() => {
                        this.cursor = 4;
                        Poppy.qDialog = [];
                        Poppy.removeHint();
                    } ).bind(this));

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
                            message: "You can press the question mark for a hint if you are having a trouble",
                            dialogType: DialogType.NEXT,
                        };
                    }).bind(this), 1000);
                }
                break;
            case 4:
                Poppy.display({
                    message: "Try running the code to see the greeting message. What happens when you enter your name?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 5).bind(this)
                });
                break;
            case 5:
                Poppy.display({
                    message: "Excellent! Now you’ve learned how to take user input and use it in your program. You can experiment with other questions, like asking for the user’s age.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 6).bind(this)
                });
                break;
            case 6:
                Poppy.display({
                    message: "To ask for the user's age, you can use: <span class=\"info\">age = input('How old are you? ')</span>. Remember, the input will be a string!",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `name = input('What is your name? ')\nprint('Hello, ' + name + '!')\nage = input('How old are you? ')\n`
                    },
                    {
                        name: "main",
                        content: `name = input("What is your name? ")\nprint("Hello, " + name + "!")\nage = input("How old are you? ")\n`
                    },
                ], (() => this.cursor = 7).bind(this));

                break;
            case 7:
                Poppy.display({
                    message: "If you want to use the age in calculations, you’ll need to convert it to an integer: <span class=\"info\">age = int(input('How old are you? '))</span>.",
                    dialogType: DialogType.NONE,
                    onDisplay: () => {
                        Poppy.addHint({
                            message: `To convert the value returned by input you can enclose <span class="accent">input<span> with <span  class="accent">int<span> like this <span  class="accent">int(input())</span>.`,
                            dialogType: DialogType.NEXT,
                        })
                    }
                });

                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `name = input('What is your name? ')\nprint('Hello, ' + name + '!')\nage = int(input('How old are you? '))\n`
                    },
                    {
                        name: "main",
                        content: `name = input("What is your name? ")\nprint("Hello, " + name + "!")\nage = int(input("How old are you? "))\n`
                    },
                ], (() => this.cursor = 8).bind(this), (() => this.cursor = -2).bind(this));
                break;
            case 8:
                Poppy.display({
                    message: "Awesome! Now you know how to take user input and use it in your Python programs.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 9).bind(this)
                });
                break;
            case -1:
                Poppy.display({
                    message: "Hmm, it seems something went wrong. Did you type the input statement correctly?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 3).bind(this)
                });
                break;
            case -2:
                Poppy.display({
                    message: "Hmm, it seems something went wrong. Remember to convert the input to an integer if you're doing calculations!",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 7).bind(this)
                });
                break;
            default:
                Poppy.tutorial = null;
                console.log("End of tutorial");
                break;
        }
    }    
}
