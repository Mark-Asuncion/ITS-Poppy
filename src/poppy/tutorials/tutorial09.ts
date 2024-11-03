import { createErrorModal } from "../../scripts/error";
import { Lint } from "../../scripts/lint";
import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";
import { desktopDir } from '@tauri-apps/api/path';


export class Tutorial09 extends Tutorial {
    dpath = "";
    constructor() {
        super();
        this.name = "File Handling";
        this.cursor = 0;
        Lint.autoOpen = false;
        desktopDir()
            .then(((p: string) =>  this.dpath = p).bind(this))
            .catch((e) => createErrorModal(e));
    }

    update() {
        let p = this.dpath.replace(/\\/g, "\\\\");
        p += "example.txt"
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
                    cb: (() => this.cursor = 11).bind(this)
                });
                break;
            case 11:
                Poppy.display({
                    message: `Drag a <span class=\"info\">Statement Diagram</span> into the editor and write the following code:<br> <code>file_path = '${p}'</code><br> We will save a file in the desktop folder so we can easily see the results`,
                    dialogType: DialogType.NONE,
                    timeout: -1
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `file_path = '${p}'\n`
                    },
                    {
                        name: "main",
                        content: `file_path = \"${p}\"\n`
                    }
                ], (() => this.cursor = 2).bind(this))
                break;
            case 2:
                Poppy.display({
                    message: "Then drag a <span class=\"info\">Statement Diagram</span> into the editor and connect it<br> Write the following code: <span class=\"info\">file = open(file_path, 'w')</span>",
                    dialogType: DialogType.NONE,
                    timeout: -1
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `file_path = '${p}'\nfile = open(file_path, 'w')\n`
                    },
                    {
                        name: "main",
                        content: `file_path = "${p}"\nfile = open(file_path, "w")\n`
                    }
                ], (() => this.cursor = 3).bind(this))
                break;
            case 3:
                Poppy.display({
                    message: `Now, let’s write some text to the file. Add another  <span class="accent">Statement diagram</span> and Use the <span class=\"accent\">write</span> method: <span class=\"info\">file.write('Hello, World!')</span>`,
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `file_path = '${p}'\nfile = open(file_path, 'w')\nfile.write('Hello, World!')\n`
                    },
                    {
                        name: "main",
                        content: `file_path = "${p}"\nfile = open(file_path, "w")\nfile.write("Hello, World!")\n`
                    }
                ], (() => this.cursor = 4).bind(this), (() => {}).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: "Finally, don’t forget to close the file after writing: <span class=\"info\">file.close()</span>. While the OS will automatically close it after the program ends. It is good practice to close it when your program doesn't need it anymore",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `file_path = '${p}'\nfile = open(file_path, 'w')\nfile.write('Hello, World!')\nfile.close()\n`
                    },
                    {
                        name: "main",
                        content: `file_path = "${p}"\nfile = open(file_path, "w")\nfile.write("Hello, World!")\nfile.close()\n`
                    },
                ], (() => this.cursor = 5).bind(this), (() => this.cursor = -1).bind(this));
                break;
            case 5:
                Poppy.display({
                    message: "You’ve now created a file named <span class=\"info\">'example.txt'</span> with the content <span class=\"info\">'Hello, World!'</span>. Next, let’s learn how to read from a file.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 51).bind(this)
                });
                break;
            case 51:
                Poppy.display({
                    message: `Before we continue run the program and check if there is a file in desktop folder <code>${p}</code>`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 6).bind(this)
                });
                break;
            case 6:
                Poppy.display({
                    message: `To read from a file, open it in read mode using the mode <span class=\"info\">'r'</span>. Let’s read from <span class=\"info\">'${p}'</span>.`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 7).bind(this)
                });
                break;
            case 7:
                Poppy.display({
                    message: "Use the following code to open the file and read its content: <span class=\"info\">file = open(file_path, 'r')</span>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `file_path = '${p}'\nfile = open(file_path, 'r')\nfile.write('Hello, World!')\nfile.close()\n`
                    },
                    {
                        name: "main",
                        content: `file_path = "${p}"\nfile = open(file_path, "r")\nfile.write("Hello, World!")\nfile.close()\n`
                    },
                ], (() => this.cursor = 71).bind(this), (() => {}).bind(this));
                break;
            case 71:
                Poppy.display({
                    message: `Try <span class="secondary">running</span> the program now. It should return an <span class="accent">error</span>`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 72).bind(this)
                });
                break;
            case 72:
                Poppy.display({
                    message: `The program returned an <span class="accent">error</span> because we are writing to a file that dont have a  <span class="accent">write permission</span> for it`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 8).bind(this)
                });
                break;
            case 8:
                Poppy.display({
                    message: `Now, instead of writing to it let’s <span class="accent">read</span> and <span class="accent">print</span> the content of the file. modify the <code>file.write(...)</code> line`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 81).bind(this)
                });
                break;
            case 81:
                Poppy.display({
                    message: `To read a file we can use the <span class="accent">read</span> function. create a variable called <span class="accent">content</span> and assign the returned value of the <span class="accent">read</span> function to it`,
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `file_path = '${p}'\nfile = open(file_path, 'r')\ncontent = file.read()\nfile.close()\n`
                    },
                    {
                        name: "main",
                        content: `file_path = "${p}"\nfile = open(file_path, "r")\ncontent = file.read()\nfile.close()\n`
                    },
                ], (() => this.cursor = 82).bind(this))
                break;
            case 82:
                Poppy.display({
                    message: `Now add a another <span class="accent">statement</span> in the highlighted area`,
                    onDisplay: () => {
                        let dgs = window.mCvRootNode.getDiagramGroups();
                        if (dgs.length == 0) {
                            return;
                        }
                        let nodes = dgs[0].nodes;
                        if (nodes.length == 0) {
                            return;
                        }
                        let n = nodes[nodes.length-2]
                        let pos = n.position();
                        let size = n.size();
                        pos.y += size.height / 2;
                        size.height /= 2;
                        dgs[0].highlight({ ...pos,...size });
                    },
                    dialogType: DialogType.NONE,
                });
                Poppy.onDiagramDrop = (() => {
                    let dgs = window.mCvRootNode.getDiagramGroups();
                    if (dgs.length == 0) {
                        return;
                    }
                    let nodes = dgs[0].nodes;
                    if (nodes.length == 0) {
                        return;
                    }
                    if (nodes.length >= 5) {
                        this.cursor = 83;
                        dgs[0].highlightRemove();
                        Poppy.onDiagramDrop = null;
                        Poppy.qDialogRemoveFirst();
                        Poppy.update();
                    }
                }).bind(this)
                break;
            case 83:
                Poppy.display({
                    message: `<span class="accent">print</span> the variable <span class="accent">content</span> <span class="accent">before closing</span> the file`,
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: `file_path = '${p}'\nfile = open(file_path, 'r')\ncontent = file.read()\nprint(content)\nfile.close()\n`
                    },
                    {
                        name: "main",
                        content: `file_path = "${p}"\nfile = open(file_path, "r")\ncontent = file.read()\nnprint(content)\nfile.close()\n`
                    },
                ], (() => this.cursor = 9).bind(this))
                break;
            case 9:
                Poppy.display({
                    message: "When you run the code, it should print: <span class=\"info\">Hello, World!</span> You’ve successfully read the content from the file!",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 10).bind(this)
                });
                break;
            case 10:
                Poppy.display({
                    message: `By the way opening file can be both opened with <span class="accent">read and write</span> mode. Now you know how to save information into the storage of the user. This is very handy in creating applications.`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 99).bind(this)
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
