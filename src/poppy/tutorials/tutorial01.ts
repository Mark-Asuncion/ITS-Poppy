import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial01 extends Tutorial {
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
                    message: "Welcome! Now we’re going to learn about <span class=\"accent\">variables</span> in Python. A variable is like a container that holds data, which you can use later in your code.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=1).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: "In Python, you can create a variable just by assigning a value to a name. Let’s start by creating a variable that holds a number.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=2).bind(this)
                });
                break;
            case 2:
                Poppy.display({
                    message: "<span class=\"accent\">Drag</span> a <span class=\"info\">Statement Diagram</span> into the editor",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=3).bind(this)
                });
                break;
            case 3:
                Poppy.display({
                    message: "Here’s how you can define a variable that holds your age. <span class=\"info\">age = 20</span>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "age = 20\n"
                    }
                ], (() => this.cursor = 4).bind(this), (() => {} ).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: "Great! Now, you can use this variable anywhere in your code. Try printing the variable to see its value.",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "age = 20\nprint(age)\n"
                    }
                ], (() => this.cursor = 5).bind(this), (() => this.cursor = -2 ).bind(this));
                break;
            case 5:
                Poppy.display({
                    message: "Variables can store different types of data, like numbers, text, or lists. Let’s define a variable called <span class=\"info\">name</span> and it will hold a <span class=\"info\">string value</span> called Alice",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "age = 20\nprint(age)\nname = 'Alice'\n"
                    },
                    {
                        name: "main",
                        content: "age = 20\nprint(age)\nname = \"Alice\"\n"
                    },
                ], (() => this.cursor = 6).bind(this), (() => this.cursor = -1 ).bind(this));
                break;
            case 6:
                Poppy.display({
                    message: "Now, <span class=\"accent\">print</span> the <span class=\"info\">name</span> variable just like we did with the age variable.",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "age = 20\nprint(age)\nname = 'Alice'\nprint(name)\n"
                    },
                    {
                        name: "main",
                        content: "age = 20\nprint(age)\nname = \"Alice\"\nprint(name)\n"
                    },
                ], (() => this.cursor = 7).bind(this), (() => {} ).bind(this));
                break;
            case 7:
                Poppy.display({
                    message: "Good job! You just created variables that store a number and a string. By the way, in Python, you don't need to specify the type of data your variable holds—Python figures that out automatically!",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 8).bind(this)
                });
                break;
            case 8:
                Poppy.display({
                    message: "That’s it for this lesson! You now know how to create and use variables in Python. Try running the program to see the results of your program.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 9).bind(this)
                });
                break
            case -1:
                Poppy.display({
                    message: "To create a string you can either enclose it with single quotes (<span class=\"info\">' ... '</span>) or double quotes (<span class=\"info\">\" ... \"</span>)",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=5).bind(this)
                });
                break;
            case -2:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct did you type the <span class=\"accent\">print</span> or <span class=\"accent\">variable name</span> correctly",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=4).bind(this)
                });
                break;
            default:
                Poppy.tutorial = null;
                console.log("end of tutorial");
            break;
        }
    }
}
