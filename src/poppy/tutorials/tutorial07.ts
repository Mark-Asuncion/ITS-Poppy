import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial07 extends Tutorial {
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
                message: "Before that, let me teach you on how to make an <span class =\"info\">indention</span> for Statement Diagram. Drag 2 Statement Diagram to the center and connect it. Click the second diagram and press tab to indent it.",
                dialogType: DialogType.NEXT,
                cb: (() => this.cursor = 4).bind(this)
            });
            break;
        case 4:
            Poppy.display({
                message: "Here’s how you can use try and except to handle that error:<pre><span class=\"info\">num1 = 10<br>num2 = 0<br>try:<br>   result = num1 / num2<br>   print(result)<br>except ZeroDivisionError:<br>   print('Cannot divide by zero!')</span></pre>",
                dialogType: DialogType.NONE,
            });
            Poppy.addOnModified([
                {
                    name: "main",
                    content: "num1 = 10\nnum2 = 0\ntry:\n\tresult = num1 / num2\n\tprint(result)\nexcept ZeroDivisionError:\n\tprint('Cannot divide by zero!')\n"
                },
                {
                    name: "main",
                    content: "num1 = 10\nnum2 = 0\ntry:\n\tresult = num1 / num2\n\tprint(result)\nexcept ZeroDivisionError:\n\tprint(\"Cannot divide by zero!\")\n"
                }
            ], (() => this.cursor = 5).bind(this), (() => {}).bind(this));
            break;
        case 5:
            Poppy.display({
                message: "Try running this code. Change the value of <span class=\"info\">num2</span> to see how the error is handled!",
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
}