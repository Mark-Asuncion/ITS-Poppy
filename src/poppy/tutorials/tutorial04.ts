import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial04 extends Tutorial {
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
                    message: "Welcome! In this lesson, we will learn about <span class=\"accent\">loops</span> in Python. Loops allow you to execute a block of code multiple times.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 1).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: "First, let's explore the <span class=\"info\">for loop</span>. A for loop lets you iterate over a sequence, like a list or a range of numbers.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 2).bind(this)
                });
                break;
            case 2:
                Poppy.display({
                    message: "Here’s how you can use a for loop to print numbers from 0 to 4 using <span class=\"accent\">Loop Diagram</span>: <span class=\"info\">for i in range(5): print(i)</span>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "for i in range(5):\n\tprint(i)\n"
                    }
                ], (() => this.cursor = 3).bind(this), (() => {}).bind(this));
                break;
            case 3:
                Poppy.display({
                    message: "Try running this code to see the numbers printed. The <span class=\"info\">range(5)</span> function generates numbers from 0 to 4.",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "for i in range(5):\n\tprint(i)\n"
                    }
                ], (() => this.cursor = 4).bind(this), (() => this.cursor = -1).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: "Awesome! Now let’s learn about the <span class=\"info\">while loop</span>. A while loop continues to execute as long as a given condition is true. Delete the first module and drag a new <span class=\"accent\">Loop Diagram.</span>",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 5).bind(this)
                });
                break;
            case 5:
                Poppy.display({
                    message: "Here’s an example of a while loop that prints numbers from 0 to 4:<br> <span class=\"info\">i = 0<br>while i < 5:<br> print(i)<br> i += 1</span>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "i = 0\nwhile i < 5:\n\tprint(i)\n\ti + = 1\n"
                    }
                ], (() => this.cursor = 6).bind(this), (() => {}).bind(this));
                break;
            case 6:
                Poppy.display({
                    message: "Try running this code to see how the while loop works. It keeps printing as long as <span class=\"info\">i</span> is less than 5.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 7).bind(this)
                });
                break;
            case 7:
                Poppy.display({
                    message: "Great job! You can use loops to automate repetitive tasks. Try experimenting with different ranges or conditions!",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 8).bind(this)
                });
                break;
            case -1:
                Poppy.display({
                    message: "Hmm, it seems something went wrong. Did you type the for loop correctly?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 3).bind(this)
                });
                break;
            case -2:
                Poppy.display({
                    message: "Hmm, it seems something went wrong. Did you type the while loop correctly?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 6).bind(this)
                });
                break;
            default:
                Poppy.tutorial = null;
                console.log("End of tutorial");
                break;
        }
    }    
}