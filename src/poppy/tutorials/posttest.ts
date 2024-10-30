import { save_post_test_answers } from "../../scripts/backendconnector";
import { DiagramGroup } from "../../scripts/canvas/diagramgroup";
import { createDiagramFrom, getPlacementPos } from "../../scripts/canvas/utils";
import { Lint } from "../../scripts/lint";
import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class PostTest extends Tutorial {
    // true if correct
    questionsCorrect: boolean[] = [];
    answers: string[] = [];
    timer = 0;
    constructor() {
        super();
        this.name = "Post Test";
        this.cursor = 0;
        Lint.autoOpen = false;
    }

    update() {
        switch(this.cursor) {
            case 0:
                Poppy.display({
                    message: `Welcome! You’re about to start the <span class="accent">post-test</span>. This is a great opportunity to apply what you’ve learned so far. Take your time, and remember, this is just another step in your learning journey. Good luck!`,
                    dialogType: DialogType.NEXT,
                    onDisplay: () => {
                        Poppy.targetPos = {
                            x: window.innerWidth / 2 - (Poppy.frameSizeWxH * 2),
                            y: window.innerHeight / 2
                        };
                    },
                    cb: (() => this.cursor++).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: `Without further ado, let's start the <span class="accent">post-test</span>! Remember, take your time and do your best. Good luck!`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor++).bind(this)
                });
                break;
            case 2:
                Poppy.display({
                    message: `Let's start with some <span class="info">Basic Concepts</span>. Question #1<br><span class="accent">What type of typing system does Python use?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            ["Strong Typing", "Weak Typing", "Static Typing", "Dynamic Typing"],
                            3,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 3:
                Poppy.display({
                    message: `Question #2<br><span class="accent">What is an Algorithm?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            ["A programming language", "A step by step procedure", "A type of variable", "A Debugging Tool"],
                            1,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 4:
                Poppy.display({
                    message: `Question #3<br><span class="accent">What is the purpose of using loops in a program?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            ["To store data temporarily", "To repeat a block of code multiple times", "To stop the program", "To organize files"],
                            1,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 5:
                Poppy.display({
                    message: `Question #4<br><span class="accent">What is an array in Python?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [ "A collection of data items of same types only", "A collection of data items of different types",
                                "A type of function", "A method for sorting data" ],
                            1,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 6:
                Poppy.display({
                    message: `Good job you finished the <span class="info">Basic Concepts</span> part, Let's keep going. Question #5<br><span class="accent">What does the if statement do in Python?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [
                                "It defines a function.", "It creates a loop.",
                                "It checks a condition and executes code if the condition is True.", "It ends a program."
                            ],
                            2,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
           case 7:
                // do not add whitespace on the code it will mess with the indention
                Poppy.display({
                    message: `Question #6<br>
                    <span class="accent">What will the following code output if the score = 85?</span>
<code>
score = 85
if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
else:
    print("Grade: C")
</code>`,
                    onDisplay: (() => {
                        Poppy.targetPos = {
                            x: Poppy.pos.x,
                            y: Poppy.pos.y - (Poppy.frameSizeWxH * 2)
                        };

                        this.createChoices(
                            ["Grade A", "Grade B", "Grade C", "None of the Above"],
                            1,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 8:
                Poppy.display({
                    message: `Question #7<br><span class="accent">Which part of the if...elif...else statement is executed when none of the conditions are True?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [ "if block", "elif block", "else block", "No block is executed." ],
                            2,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 9:
                Poppy.display({
                    message: `Question #8<br><span class="accent">Which of the following is the correct way to write a while loop?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            ["<code>\nwhile x < 10:\n\tprint(x)</code>", "<code>\nwhile x < 10\n\tprint(x)</code>", "<code>\nwhile x < 10;\n\tprint(x)</code>"],
                            0,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 10:
                Poppy.display({
                    message: `Question #9<br><span class="accent">How can you exit a while loop prematurely?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [
                                `Using <span class="accent">break</span>.`,
                                `Using <span class="accent">continue</span>.`,
                                `Using <span class="accent">exit()</span>.`,
                                `It is not possible to exit a while loop prematurely`
                            ],
                            0,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 11:
                Poppy.display({
                    message: `Question #10<br><span class="accent">How do you define a function in Python?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [
                                `<code>function myFunction():</code>`,
                                `<code>def myFunction():</code>`,
                                `<code>fn myFunction():</code>`,
                                `<code>void myFunction():</code>`
                            ],
                            1,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 12:
                Poppy.display({
                    message: `Question #11<br><span class="accent">What is the primary purpose of a function in Python?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [
                                "To store data.",
                                "To create a loop.",
                                "To execute a block of code only when called.",
                                "To define a variable."
                            ],
                            2,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 13:
                Poppy.display({
                    message: `Question #12<br><span class="accent">What keyword is used to return a value from a function in Python?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [ "return", "output", "send", "yield" ],
                            0,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 14:
                Poppy.display({
                    message: `Question #13<br><span class="accent">How do you access the first element of an array named my_array?</span><br>
<code>
my_array = [0,1,2]
</code>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [
                                "<code>my_array[0]</code>",
                                "<code>my_array[1]</code>",
                                "<code>my_array.first()</code>",
                                "<code>my_array.get(0)</code>"
                            ],
                            0,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 15:
                Poppy.display({
                    message: `Question #14<br><span class="accent">You can only inherit from one parent class in Python</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [ "True", "False" ],
                            1,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 16:
                Poppy.display({
                    message: `Question #15<br><span class="accent">In Python, the _________ method is often used within a subclass to call methods of the parent class.</span><br><span class="info">Place your answer in the last diagram</span>`,
                    onDisplay: (() => {
                        let node = window.mCvRootNode.node;
                        if (node.getDiagramGroups().length == 0) {
                            let pos = getPlacementPos(window.mCvStage);
                            let dg = new DiagramGroup({
                                name: "main",
                                ...pos
                            });
                            dg.addDiagram(createDiagramFrom("class", "Parent"));
                            dg.addDiagram(createDiagramFrom("def", "__init__(self, msg)"));
                            dg.addDiagram(createDiagramFrom("statement", "self.x = msg"));
                            dg.addDiagram(createDiagramFrom("endblock"));
                            dg.addDiagram(createDiagramFrom("endblock"));
                            dg.addDiagram(createDiagramFrom("class", "Child(Parent)"));
                            dg.addDiagram(createDiagramFrom("def", "__init__(self, msg)"));
                            dg.addDiagram(createDiagramFrom("statement", ""));
                            dg.refresh();
                            node.add(dg);
                        }
                        this.createChoices(["Final Answer?"], 0,
                            (() => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                console.assert(nodes.length > 0);
                                let dg = nodes[0];
                                let st = dg.nodes[dg.nodes.length-1];
                                let ct = st.getContent();
                                this.questionsCorrect.push(ct == "super().__init__(msg)");
                                this.answers.push(ct);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove(); v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this));
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 17:
                Poppy.display({
                    message: `Question #16<br><span class="accent">A subclass in Python automatically inherits all attributes and methods from its parent class.</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [ "True", "False" ],
                            1,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 18:
                Poppy.display({
                    message: `Question #17<br><span class="accent">What is class inheritance in Python? </span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [
                                "A way to create a new class based on an existing class.",
                                "A method to store data in a class.",
                                "A technique to create a loop.",
                                "A way to define a function."
                            ],
                            0,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 19:
                Poppy.display({
                    message: `Question #18<br><span class="accent">In Python what function do you use to take inputs?</span><br><span class="info">Place your answer in the diagram</span> `,
                    onDisplay: (() => {
                        let node = window.mCvRootNode.node;
                        if (node.getDiagramGroups().length == 0) {
                            let pos = getPlacementPos(window.mCvStage);
                            let dg = new DiagramGroup({
                                name: "main",
                                ...pos
                            });
                            dg.addDiagram(createDiagramFrom("statement", ""));
                            dg.refresh();
                            node.add(dg);
                        }
                        this.createChoices(["Final Answer?"], 0,
                            (() => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                console.assert(nodes.length > 0);
                                let dg = nodes[0];
                                let st = dg.nodes[dg.nodes.length-1];
                                let ct = st.getContent();
                                this.questionsCorrect.push(ct == "input()");
                                this.answers.push(ct);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove(); v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 20:
                Poppy.display({
                    message: `Question #19<br><span class="accent">fix the following code, so that user_input is a type of int</span><br><span class="info">Place your answer in the diagram</span> `,
                    onDisplay: (() => {
                        let node = window.mCvRootNode.node;
                        if (node.getDiagramGroups().length == 0) {
                            let pos = getPlacementPos(window.mCvStage);
                            let dg = new DiagramGroup({
                                name: "main",
                                ...pos
                            });
                            dg.addDiagram(createDiagramFrom("statement", `user_input = input()`));
                            dg.refresh();
                            node.add(dg);
                        }
                        this.createChoices(["Final Answer?"], 0,
                            (() => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                console.assert(nodes.length > 0);
                                let dg = nodes[0];
                                let st = dg.nodes[dg.nodes.length-1];
                                let ct = st.getContent();
                                this.questionsCorrect.push(ct == "user_input = int(input())");
                                this.answers.push(ct);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 21:
                Poppy.display({
                    message: `Question #20<br><span class="accent">Fix this code to open the file in read mode</span><br><span class="info">Place your answer in the diagram</span> `,
                    onDisplay: (() => {
                        let node = window.mCvRootNode.node;
                        if (node.getDiagramGroups().length == 0) {
                            let pos = getPlacementPos(window.mCvStage);
                            let dg = new DiagramGroup({
                                name: "main",
                                ...pos
                            });
                            dg.addDiagram(createDiagramFrom("statement", `file_path = "path/to/file.txt"`));
                            dg.addDiagram(createDiagramFrom("statement", `open(file_path,"Read")`));
                            dg.refresh();
                            node.add(dg);
                        }
                        this.createChoices(["Final Answer?"], 0,
                            (() => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                console.assert(nodes.length > 0);
                                let dg = nodes[0];
                                let st = dg.nodes[dg.nodes.length-1];
                                let ct = st.getContent();
                                this.questionsCorrect.push(ct == `open(file_path,"r")`);
                                this.answers.push(ct);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 22:
                Poppy.display({
                    message: `Question #21<br><span class="accent">Now replace the read mode into write mode</span><br><span class="info">Place your answer in the diagram</span> `,
                    onDisplay: (() => {
                        let node = window.mCvRootNode.node;
                        if (node.getDiagramGroups().length == 0) {
                            let pos = getPlacementPos(window.mCvStage);
                            let dg = new DiagramGroup({
                                name: "main",
                                ...pos
                            });
                            dg.addDiagram(createDiagramFrom("statement", `file_path = "path/to/file.txt"`));
                            dg.addDiagram(createDiagramFrom("statement", `open(file_path,"r")`));
                            dg.refresh();
                            node.add(dg);
                        }
                        this.createChoices(["Final Answer?"], 0,
                            (() => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                console.assert(nodes.length > 0);
                                let dg = nodes[0];
                                let st = dg.nodes[dg.nodes.length-1];
                                let ct = st.getContent();
                                this.questionsCorrect.push(ct == `open(file_path,"w")`);
                                this.answers.push(ct);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 23:
                Poppy.display({
                    message: `Question #22<br><span class="accent">Is it possible to open a file with both read and write mode?</span>`,
                    onDisplay: (() => {
                        this.createChoices(
                            [ "True", "False" ],
                            0,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                Poppy.update();
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 24:
                Poppy.display({
                    message: `Question #23<br><span class="accent">Given the following pseudocode, what will the output be if ‘x = 15’</span>`,
                    onDisplay: (() => {
                        let node = window.mCvRootNode.node;
                        if (node.getDiagramGroups().length == 0) {
                            let pos = getPlacementPos(window.mCvStage);
                            let dg = new DiagramGroup({
                                name: "main",
                                ...pos
                            });
                            dg.addDiagram(createDiagramFrom("if", `x > 10`));
                            dg.addDiagram(createDiagramFrom("statement", `print("High")`));
                            dg.addDiagram(createDiagramFrom("endblock"));
                            dg.addDiagram(createDiagramFrom("else"));
                            dg.addDiagram(createDiagramFrom("statement", `print("Low")`));
                            dg.refresh();
                            node.add(dg);
                        }
                        this.createChoices(
                            [ "High", "Low" ],
                            0,
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                setTimeout(() => {
                                    let nodes = window.mCvRootNode.getDiagramGroups();
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                            ((i) => {
                                this.cursor++;
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                setTimeout(() => {
                                    let nodes = window.mCvRootNode.getDiagramGroups();
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this)
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 25:
                Poppy.display({
                    message: `Question #24<br><span class="accent">How would you fix the following code to correctly check if a number is even?</span>`,
                    onDisplay: (() => {
                        let node = window.mCvRootNode.node;
                        if (node.getDiagramGroups().length == 0) {
                            let pos = getPlacementPos(window.mCvStage);
                            let dg = new DiagramGroup({
                                name: "main",
                                ...pos
                            });
                            dg.addDiagram(createDiagramFrom("if", `number % 2 = 0`));
                            dg.addDiagram(createDiagramFrom("statement", `print("Even")`));
                            dg.addDiagram(createDiagramFrom("endblock"));
                            dg.addDiagram(createDiagramFrom("else"));
                            dg.addDiagram(createDiagramFrom("statement", `print("Odd")`));
                            dg.refresh();
                            node.add(dg);
                        }
                        this.createChoices(
                            [ "Final Answer?" ],
                            0,
                            (() => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                console.assert(nodes.length > 0);
                                let dg = nodes[0];
                                let st = dg.nodes[0];
                                let ct = st.getContent();
                                this.questionsCorrect.push(ct == `if number % 2 == 0:`);
                                this.answers.push(ct);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 26:
                Poppy.display({
                    message: `Question #25<br><span class="accent">What will be the output of the following code?</span>`,
                    onDisplay: (() => {
                        let node = window.mCvRootNode.node;
                        if (node.getDiagramGroups().length == 0) {
                            let pos = getPlacementPos(window.mCvStage);
                            let dg = new DiagramGroup({
                                name: "main",
                                ...pos
                            });
                            dg.addDiagram(createDiagramFrom("statement", `nums = [1, 2, 3, 4, 5]`));
                            dg.addDiagram(createDiagramFrom("statement", `print(nums[2:4])`));
                            dg.refresh();
                            node.add(dg);
                        }
                        this.createChoices(
                            [
                                "[2, 3]",
                                "[3, 4]",
                                "[3, 4, 5]",
                                "[2, 3, 4]",
                            ],
                            1,
                            ((i) => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                            ((i) => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 27:
                Poppy.display({
                    message: `Question #26<br><span class="accent">What is the output of the following code if <span class="info">count = 3</span>?</span>`,
                    onDisplay: (() => {
                        let node = window.mCvRootNode.node;
                        if (node.getDiagramGroups().length == 0) {
                            let pos = getPlacementPos(window.mCvStage);
                            let dg = new DiagramGroup({
                                name: "main",
                                ...pos
                            });
                            dg.addDiagram(createDiagramFrom("for", `for i in range(count):`));
                            dg.addDiagram(createDiagramFrom("statement", `print(i)`));
                            dg.refresh();
                            node.add(dg);
                        }
                        this.createChoices(
                            [
                                "0 1 2",
                                "1 2 3",
                                "1 2",
                                "0 1 2 3"
                            ],
                            0,
                            ((i) => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                this.questionsCorrect.push(true);
                                this.answers.push(`${i}`);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                            ((i) => {
                                let nodes = window.mCvRootNode.getDiagramGroups();
                                this.questionsCorrect.push(false);
                                this.answers.push(`${i}`);
                                this.cursor++;
                                setTimeout(() => {
                                    nodes.forEach((v) => {
                                        v.remove();
                                        v.destroy();
                                    });
                                    Poppy.update();
                                }, 300);
                            }).bind(this),
                        );
                    }).bind(this),
                    timeout: -1,
                    dialogType: DialogType.NONE
                });
                break;
            case 28:
                Poppy.display({
                    message: `Good job finishing the exam. Thank you for answering.`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor++).bind(this)
                });
                save_post_test_answers(this.answers);
                break;
            default:
                Poppy.tutorial = null;
                console.log("end of tutorial");
                break;
        }
    }

    createChoices(choices: string[], correctAnswerIndex: number,
        onCorrect: (i?: number) => void, onWrong?: (i?: number) => void) {
        // console.assert(choices.length <= 4);
        if (document.querySelector("#choices") != null)  {
            return;
        }
        const div = document.createElement("div");
        div.classList.add("d-flex", "dialog-multiple-choices-container");
        div.id = "choices";
        // const prefix = ["A.", "B.", "C.", "D."];
        for (let i=0;i<choices.length;i++) {
            const btn = document.createElement("button");
            btn.innerHTML = `${choices[i]}`;
            btn.classList.add("bg-white", "br-none", "self-align-center", "self-align-end")
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                if (i == correctAnswerIndex) {
                    onCorrect(i);
                }
                else {
                    if (onWrong)
                        onWrong(i);
                }
                div.remove();
            });

            div.appendChild(btn);
        }

        document.body.appendChild(div);
    }
}
