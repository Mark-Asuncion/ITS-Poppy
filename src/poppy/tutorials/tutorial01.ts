import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial01 extends Tutorial {
    content: string[] = [];
    constructor() {
        super();
        this.name = "Variables";
        this.cursor = 0;
    }

    update() {
        switch(this.cursor) {
            case 0:
                Poppy.display({
                    message: "Welcome! Now we’re going to learn about <span class=\"accent\">variables</span> in Python. Variables can store data of different types, and different types can do different things.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=1).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: `Python has the following data types built-in
                        <ul>
                            <li>str</li>
                            <li>int, float, complex</li>
                            <li>bool</li>
                            <li>None</li>
                        </ul>`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=2).bind(this)
                });
                break;
            case 2:
                Poppy.display({
                    message: `In python we don't have to specify what type a variable holds, we can just assign any type of value and python will handle it`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=3).bind(this)
                });
                break;
            case 3:
                Poppy.display({
                    message: `Now that we know what the data types are available, let's try to create a variable named <span class="accent">year</span>. let's assign a number <span class="accent">2024</span>`,
                    dialogType: DialogType.NONE
                });
                this.content = [
                    "year = 2024\n"
                ];
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: this.content[0]
                    }
                ], (() => this.cursor = 4).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: `Good job! now to showcase Pythons dynamic typing. let's <span class="info">add a new statement</span> and assign a new value to <span class="accent">year</span>`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 5).bind(this)

                });
                break;
            case 5:
                let tm = 0;
                Poppy.display({
                    message: `To <span class="info">add a new statement</span>. You can drag another diagram to the bottom of this diagram`,
                    onDisplay: (() => {
                        let dg = window.mCvRootNode.getDiagramGroups();
                        console.assert(dg.length > 0);
                        let firstNode = dg[0].nodes[0];

                        let pos = firstNode.getAbsolutePosition();
                        if (pos) {
                            pos.y += firstNode.height();
                            Poppy.focusedInDiagram = true;
                            Poppy.targetPos = pos;
                        }


                        let opt = { ...firstNode.position(), width: 0, height: 0 };
                        opt.y += firstNode.height() / 2;
                        opt.width = firstNode.width();
                        opt.height = firstNode.height() / 2;
                        dg[0].highlight(opt);

                        Poppy.frameListener = (elapsed) => {
                            tm += elapsed;
                            if (tm > 500) {
                                tm -= 500;
                                if (dg[0].nodes.length == 2) {
                                    this.cursor = 6;
                                    dg[0].highlightRemove();
                                    Poppy.focusedInDiagram = false;
                                    Poppy.update();
                                    Poppy.frameListener = null;
                                }
                            }
                        };
                    }).bind(this),
                    dialogType: DialogType.NONE,
                    timeout: 20_000
                });
                break;
            case 6:
                Poppy.display({
                    message: `Now lets assign a new value to <span class="accent">year</span> instead of an int type lets assign a string 2024. String are values enclosed with <span class="accent">""</span> or <span class="accent">''</span>`,
                    dialogType: DialogType.NONE,
                });
                if (this.content.length == 1) {
                    this.content.push(this.content[0]);
                    this.content[0] += `year = "2024"\n`;
                    this.content[1] += `year = '2024'\n`;
                }
                console.log(this.content);
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: this.content[0]
                    },
                    {
                        name: "main",
                        content: this.content[1]
                    }
                ], (() => this.cursor = 7).bind(this));
                break
            case 7:
                Poppy.display({
                    message: "Now try running the program. You will notice that there is <span class=\"accent\">no error</span>. This is because Python is <span class=\"accent\">dynamically typed</span>, this means a variable can hold any kind of type",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor=8).bind(this)
                });
                break;
            case 8:
                Poppy.display({
                    message: "To really make sure there is no error. lets try printing the <span class=\"accent\">year variable</span>",
                    dialogType: DialogType.NONE,
                });
                this.content[0] += `print(year)\n`;
                this.content[1] += `print(year)\n`;
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: this.content[0]
                    },
                    {
                        name: "main",
                        content: this.content[1]
                    }
                ], (() => this.cursor = 9).bind(this), (() => this.cursor = -1).bind(this));
                break;
            case 9:
                Poppy.display({
                    message: "Good job! you finish the lesson about variables. Try running your program to see the results",
                    dialogType: DialogType.NONE,
                });
                break;
            case -1:
                Poppy.display({
                    message: `To print something in python we use the <span class="accent">print()</span> function`,
                    dialogType: DialogType.NONE,
                });
                this.cursor = 8;
                break;
            default:
                Poppy.tutorial = null;
                console.log("end of tutorial");
            break;
        }
    }
}
