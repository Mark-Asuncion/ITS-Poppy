import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial05 extends Tutorial {
    // cursorErrReturn: number = 1;
    constructor() {
        super();
        this.name = "Variables";
        this.cursor = 0;
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
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 2).bind(this)
            });
            break;
        case 2:
            Poppy.display({
                message: "Here’s an example of an if statement: <br><span class=\"info\">age = 18 <br>if age >= 18: <br>print('You are an adult.')</span>",
                dialogType: DialogType.NONE
            });
            Poppy.addOnModified([
                {
                    name: "main",
                    content: "age = 18\nif age >= 18:\n\tprint('You are an adult.')\n"
                },
                {
                    name: "main",
                    content: "age = 18\nif age >= 18:\n\tprint(\"You are an adult.\")\n"
                }
            ], (() => this.cursor = 3).bind(this), (() => {}).bind(this));
            break;
        case 3:
            Poppy.display({
                message: "Try running this code. Change the value of <span class=\"info\">age</span> to see how the output changes!",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 4).bind(this)
            });
            break;
        case 4:
            Poppy.display({
                message: "Now, let’s introduce the <span class=\"info\">elif statement</span>. This allows you to check multiple conditions. If the first condition is false, it checks the next one.",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 5).bind(this)
            });
            break;
        case 5:
            Poppy.display({
                message: "<pre>Here's an example using elif: <br><span class=\"info\">age = 13 <br>if age < 13: <br>    print('You are a child.')<br> elif age < 18: <br>   print('You are a teenager.')</span></pre>",
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
            ], (() => this.cursor = 6).bind(this), (() => {}).bind(this));
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
                message: "Here’s a complete example: <pre><<span class=\"info\">age = 13 <br>if age < 13: <br>    print('You are a child.') <br>elif age < 18 and age >= 13: <br>    print('You are a teenager.') <br>else: <br>    print('You are an adult.')</span>",
                dialogType: DialogType.NONE
            });
            Poppy.addOnModified([
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint('You are a child.')\nelif age < 18 and age >= 13:\n\tprint('You are a teenager.')\nelse:\n\tprint('You are an adult.')\n"
                },
                {
                    name: "main",
                    content: "age = 13\nif age < 13:\n\tprint(\"You are a child.\")\nelif age < 18 and age >= 13:\n\tprint(\"You are a teenager.\")\nelse:\n\tprint(\"You are an adult.\")\n"
                }
            ], (() => this.cursor = 9).bind(this), (() => {}).bind(this));
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
                cb: (() => this.cursor = 3).bind(this)
            });
            break;
        case -2:
            Poppy.display({
                message: "Hmm, it seems something went wrong. Did you type the elif statement correctly?",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 6).bind(this)
            });
            break;
        case -3:
            Poppy.display({
                message: "Hmm, it seems something went wrong. Did you type the else statement correctly?",
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
}