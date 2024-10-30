import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial02 extends Tutorial {
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
                    message: "Welcome! Now we’re going to learn about <span class=\"accent\">arrays</span> in Python. An array is a data structure that allows you to store a collection of items of the same type in a single variable.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=1).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: "In Python, you can create an array by assigning values inside square brackets <span class=\"accent\">([])</span>, separating them with commas <span class=\"accent\">(,)</span>. Let’s start by creating an array that holds subjects.",
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
                    message: "Here’s how you can define an array that holds subjects: <span class=\"info\">subjects = ['Math', 'English', 'Science', 'Filipino']</span>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "subjects = ['Math', 'English', 'Science', 'Filipino']\n"
                    }
                ], (() => this.cursor = 4).bind(this), (() => {} ).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: "Great! Now, you can try to print the array named 'subjects' to see its values",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "subjects = ['Math', 'English', 'Science', 'Filipino']\nprint(subjects)\n"
                    }
                ], (() => this.cursor = 5).bind(this), (() => this.cursor = -1 ).bind(this));
                break;
            case 5:
                Poppy.display({
                    message: " You can access elements in a Python list (which functions like an array) using indexing. Here's how you can do it: drag a statement diagaram and put <span class=\"accent\">print(subjects[0])</span>.",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "subjects = ['Math', 'English', 'Science', 'Filipino']\nprint(subjects)\nprint(subjects[0])\n"
                    },
                ], (() => this.cursor = 6).bind(this), (() => this.cursor = -2 ).bind(this));
                break;
            case 6:
                Poppy.display({
                    message: "In Python, indexing starts at 0, so the first element of a list is accessed with index 0.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 7).bind(this)
                });
                break;
            case 7:
                Poppy.display({
                    message: "Now, let's try to print the last element.",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "subjects = ['Math', 'English', 'Science', 'Filipino']\nprint(subjects)\nprint(subjects[0])\nprint(subjects[3])\n"
                    },
                ], (() => this.cursor = 8).bind(this), (() => this.cursor = -3 ).bind(this));
                break;
            case 8:
                Poppy.display({
                    message: "That’s it for this lesson! You now know how to create an array and access an index. Feel free to experiment with different lists and indices to deepen your understanding.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 9).bind(this)
                });
                break;
            case -1:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct did you type the <span class=\"accent\">print</span> or <span class=\"accent\">array name</span> correctly",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=4).bind(this)
                });
                break;
            case -2:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct did you type the <span class=\"accent\">print</span> or <span class=\"accent\">array name</span> correctly",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=5).bind(this)
                });
                break;
            case -3:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct did you type the <span class=\"accent\">print</span> or <span class=\"accent\">index</span> correctly",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=7).bind(this)
                });
                break;
            default:
                Poppy.tutorial = null;
                console.log("end of tutorial");
            break;
        }
    }
}