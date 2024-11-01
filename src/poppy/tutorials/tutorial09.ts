import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial09 extends Tutorial {
    constructor() {
        super();
        this.name = "File Handling";
        this.cursor = 0;
    }

    update() {
        switch (this.cursor) {
            case 0:
                Poppy.display({
                    message: "Welcome! In this tutorial, we’ll learn about <span class=\"accent\">file handling</span> in Python. This allows you to read from and write to files.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 1).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: "To write to a file, you need to open it in write mode. Use the <span class=\"accent\">open</span> function with the mode <span class=\"info\">'w'</span>. Let's create a new file named <span class=\"info\">'example.txt'</span>.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 2).bind(this)
                });
                break;
            case 2:
                Poppy.display({
                    message: "Drag a <span class=\"info\">Statement Diagram</span> into the editor and write the following code: <span class=\"info\">file = open('example.txt', 'w')</span>",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 3).bind(this)
                });
                break;
            case 3:
                Poppy.display({
                    message: "Now, let’s write some text to the file. Use the <span class=\"accent\">write</span> method: <span class=\"info\">file.write('Hello, World!')</span>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "file = open('example.txt', 'w')\nfile.write('Hello, World!')\n"
                    }
                ], (() => this.cursor = 4).bind(this), (() => {}).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: "Finally, don’t forget to close the file after writing: <span class=\"info\">file.close()</span>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "file = open('example.txt', 'w')\nfile.write('Hello, World!')\nfile.close()\n"
                    }
                ], (() => this.cursor = 5).bind(this), (() => this.cursor = -1).bind(this));
                break;
            case 5:
                Poppy.display({
                    message: "You’ve now created a file named <span class=\"info\">'example.txt'</span> with the content <span class=\"info\">'Hello, World!'</span>. Next, let’s learn how to read from a file.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 6).bind(this)
                });
                break;
            case 6:
                Poppy.display({
                    message: "To read from a file, open it in read mode using the mode <span class=\"info\">'r'</span>. Let’s read from <span class=\"info\">'example.txt'</span>.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 7).bind(this)
                });
                break;
            case 7:
                Poppy.display({
                    message: "Use the following code to open the file and read its content: <span class=\"info\">file = open('example.txt', 'r')</span>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "file = open('example.txt', 'r')\ncontent = file.read()\n"
                    }
                ], (() => this.cursor = 8).bind(this), (() => {}).bind(this));
                break;
            case 8:
                Poppy.display({
                    message: "Now, let’s print the content we just read: <span class=\"info\">print(content)</span>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "file = open('example.txt', 'r')\ncontent = file.read()\nprint(content)\n"
                    }
                ], (() => this.cursor = 9).bind(this), (() => this.cursor = -2).bind(this));
                break;
            case 9:
                Poppy.display({
                    message: "When you run the code, it should print: <span class=\"info\">Hello, World!</span> You’ve successfully read the content from the file!",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 10).bind(this)
                });
                break;
            case -1:
                Poppy.display({
                    message: "Hmm, it seems you didn’t close the file. Ensure you call <span class=\"info\">file.close()</span> after writing.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 4).bind(this)
                });
                break;
            case -2:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct. Did you ensure that the file is opened in read mode and call <span class=\"info\">file.read()</span>?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 8).bind(this)
                });
                break;
            default:
                Poppy.tutorial = null;
                console.log("end of tutorial");
                break;
        }
    }
}