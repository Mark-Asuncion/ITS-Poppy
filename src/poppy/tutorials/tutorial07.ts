import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial07 extends Tutorial {
    constructor() {
        super();
        this.name = "Functions";
        this.cursor = 0;
    }

    update() {
        switch (this.cursor) {
            case 0:
                Poppy.display({
                    message: "Welcome! In this tutorial, we’ll learn about <span class=\"accent\">functions</span> in Python. A function is a block of code that performs a specific task and can be reused.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 1).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: "You can define a function using the <span class=\"accent\">def</span> keyword, followed by the function name and parentheses. Let’s create a simple function called <span class=\"accent\">greet</span> that prints a greeting.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 2).bind(this)
                });
                break;
            case 2:
                Poppy.display({
                    message: "Drag a <span class=\"info\">Statement Diagram</span> into the editor and define the function like this: <span class=\"info\">def greet():</span>",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 3).bind(this)
                });
                break;
            case 3:
                Poppy.display({
                    message: "Inside the function, add a print statement to greet the user: <span class=\"info\">    print('Hello, world!')</span>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet():\n    print('Hello, world!')\n"
                    }
                ], (() => this.cursor = 4).bind(this), (() => {}).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: "Great! Now let’s call the <span class=\"accent\">greet</span> function to see it in action. Add <span class=\"info\">greet()</span> below the function definition.",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet():\n    print('Hello, world!')\ngreet()\n"
                    }
                ], (() => this.cursor = 5).bind(this), (() => this.cursor = -1).bind(this));
                break;
            case 5:
                Poppy.display({
                    message: "When you run the code, it should print: <span class=\"info\">Hello, world!</span> You can define functions to perform different tasks and reuse them throughout your code.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 6).bind(this)
                });
                break;
            case 6:
                Poppy.display({
                    message: "Functions can also take parameters. Let’s modify the <span class=\"accent\">greet</span> function to accept a name. Change it to: <span class=\"info\">def greet(name):</span>",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 7).bind(this)
                });
                break;
            case 7:
                Poppy.display({
                    message: "Now, update the print statement to use the name parameter: <span class=\"info\">    print('Hello, ' + name + '!')</span>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet(name):\n    print('Hello, ' + name + '!')\ngreet('Alice')\n"
                    }
                ], (() => this.cursor = 8).bind(this), (() => {}).bind(this));
                break;
            case 8:
                Poppy.display({
                    message: "When you call <span class=\"info\">greet('Alice')</span>, it should print: <span class=\"info\">Hello, Alice!</span> You can now pass different names to the function.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 9).bind(this)
                });
                break;
            case 9:
                Poppy.display({
                    message: "That's it for this lesson on functions! Experiment with creating and calling your own functions to strengthen your understanding.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 10).bind(this)
                });
                break;
            case -1:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct. Did you define the <span class=\"accent\">greet</span> function correctly?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 4).bind(this)
                });
                break;
            default:
                Poppy.tutorial = null;
                console.log("end of tutorial");
                break;
        }
    }
}