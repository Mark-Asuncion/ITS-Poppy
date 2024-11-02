import { Lint } from "../../scripts/lint";
import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial07 extends Tutorial {
    constructor() {
        super();
        this.name = "Class Inheritance";
        this.cursor = 9;
        Lint.autoOpen = false;
    }

    update() {
        switch (this.cursor) {
            case 0:
                Poppy.display({
                    message: "Welcome! In this lesson, we will learn about <span class=\"accent\">class inheritance</span> in Python.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 1).bind(this)
                });
                break;
            case 1:
                Poppy.display({
                    message: "Inheritance allows you to create a new class based on an existing class. The new class can inherit attributes and methods from the parent class.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 2).bind(this)
                });
                break;
            case 2:
                Poppy.display({
                    message: "Let’s define a parent class called <span class=\"info\">Animal</span>",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 21).bind(this)
                });
                break;
            case 21:
                Poppy.display({
                    message: `First drag a <span class="accent">Class Diagram</span> to the editor`,
                    dialogType: DialogType.NONE,
                    timeout: -1,
                    onDisplay: (() => {
                    const btn = document.querySelector("#btn-diagram-view")! as HTMLElement;
                        if ( !btn.classList.contains("active") ) {
                            btn.click();
                        }
                        const tname = btn.getAttribute("aria-target")!;
                        const target = document.querySelector("#" + tname)! as HTMLDivElement;
                        const diagram = document.querySelector("img[data-diagram-type=\"class\"]")! as HTMLElement;
                        target.scrollTo({
                            top: 600,
                            behavior: "instant",
                        });
                        this.highlight(diagram, (() => {}), true);
                        const rect = diagram.getBoundingClientRect();
                        const targetPos = {
                            x: rect.x + rect.width + 5,
                            y: rect.y + 40
                        };
                        const distance = {
                            x: Math.abs(Poppy.pos.x - targetPos.x),
                            y: Math.abs(Poppy.pos.y - targetPos.y)
                        };
                        if (distance.x != 0 && distance.y != 0)
                        Poppy.targetPos = targetPos;
                    }).bind(this),
                });
                Poppy.onDiagramDrop = (() => {
                    let dgs = window.mCvRootNode.getDiagramGroups();
                    if (dgs.length == 0) {
                        return;
                    }
                    if (dgs[0].nodes[0].name() == "Class") {
                        this.cursor = 3;
                        this.highlightRemove();
                        Poppy.qDialogRemoveFirst();
                        Poppy.update();
                        Poppy.onDiagramDrop = null;
                        return;
                    }
                }).bind(this);
                break;
            case 3:
                Poppy.display({
                    message: `Let me explain before we continue. <code>__init__(self)</code> is the Python's <span class="accent"> constructor</span>. Whenever we instance a class this constructor is automatically called. By the way a constructor is not required in a class its optional. A constructor is usually used to set initial values`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 31).bind(this)
                });
                // Poppy.addOnModified([
                // This is usually used to set initial values. Here’s how to define these classes:<pre><span class=\"info\">class Animal:<br>    def speak(self):<br>        return 'Animal speaks'<br><br>class Dog(Animal):<br>    def speak(self):<br>        return 'Woof!'</span></pre>
                //     {
                //         name: "main",
                //         content: "class Animal:\n\tdef speak(self):\n\t\treturn 'Animal speaks'\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn 'Woof!'\n"
                //     },
                //     {
                //         name: "main",
                //         content: "class Animal:\n\tdef speak(self):\n\t\treturn \"Animal speaks\"\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn \"Woof!\"\n"
                //     }
                // ], (() => this.cursor = 4).bind(this), (() => this.cursor = -1).bind(this));
                break;
            case 31:
                Poppy.display({
                    message: `<code>self</code> is also a required argument <code>self</code> is similar to the <code>this</code> in Java self means the current instance of the class. This is very helpful when you want to access attribute members of the class.`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 32).bind(this)
                });
                break;
            case 32:
                Poppy.display({
                    message: `Now that we got that out of the way. Let's edit the code. Edit the diagrams so that we have class called <span class="accent">Animal</span> and edit the <code>__init__</code> so that it is a <span class="accent">speak</span> function`,
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\t\n"
                    }
                ], (() => this.cursor = 33).bind(this));
                break;
            case 33:
                Poppy.display({
                    message: `Now on the body of <span class="accent">speak</span> function let's <span class="accent">return</span> a string<br><code>'Animal speaks</code>'`,
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn 'Animal speaks'\n"
                    },
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn \"Animal speaks\"\n"
                    }
                ], (() => this.cursor = 34).bind(this));
                break;
            case 34:
                Poppy.display({
                    message: `Now create another class called <span class="accent">Dog</span> with the same <span class="accent">speak</span> function and return a string <br><code>'Woof!'</code>`,
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn 'Animal speaks'\nclass Dog:\n\tdef speak(self):\n\t\treturn 'Woof!'\n"
                    },
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn \"Animal speaks\"\nclass Dog:\n\tdef speak(self):\n\t\treturn 'Woof!'\n"
                    }
                ], (() => this.cursor = 35).bind(this));
                break;
            case 35:
                Poppy.display({
                    message: `Class <span class="accent">Dog</span> and <span class="accent">Animal</span> may have the same members but the are actually still not related. Because <span class="accent">Dog</span> is not inheriting anything in <span class="accent">Animal</span> class. to inherit Animal we define the class <span class="accent">Dog</span> like this <br><code>class Dog(Animal):</code> anything inside the <span class="accent">parenthesis ( )</span> is a class we <span class="accent">inherit</span>`,
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 36).bind(this)
                });
                break;
            case 36:
                Poppy.display({
                    message: `Now that we know how to inherit edit class <span class="accent">Dog</span> so that it inherits <span class="accent">Animal</span>`,
                    onDisplay: () => {
                        Poppy.addHint({
                            message: `To inherit a class we use <span class="accent">parenthesis ( )</span> like this <code>ChildClass(ParentClass)</code>`,
                            dialogType: DialogType.NEXT
                        });
                    },
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn 'Animal speaks'\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn 'Woof!'\n"
                    },
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn \"Animal speaks\"\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn 'Woof!'\n"
                    }
                ], (() => {
                        this.cursor = 4;
                        Poppy.removeHint();
                    }).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: "Now, create an instance of the <span class=\"info\">Dog</span> class and call the <span class=\"info\">speak</span> method:<pre><span class=\"info\">my_dog = Dog()<br>print(my_dog.speak())</span></pre>Use <span class=\"accent\">Function Diagram</span> for the last statement.",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn 'Animal speaks'\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn 'Woof!'\nmy_dog = Dog()\nprint(my_dog.speak())\n"
                    },
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn \"Animal speaks\"\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn \"Woof!\"\nmy_dog = Dog()\nprint(my_dog.speak())\n"
                    }
                ], (() => this.cursor = 5).bind(this), (() => {}).bind(this));
                break;
            case 5:
                Poppy.display({
                    message: "Run this code to see the output. You should see <span class=\"info\">'Woof!'</span> as the result.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 6).bind(this)
                });
                break;
            case 6:
                Poppy.display({
                    message: "Great job! You now understand the basics of class inheritance in Python. Next, let’s explore how to use the <span class=\"info\">super()</span> function.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 7).bind(this)
                });
                break;
            case 7:
                Poppy.display({
                    message: "The <span class=\"info\">super()</span> function allows you to call methods from the parent class within the child class. This is useful for extending functionality.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 8).bind(this)
                });
                break;
            case 8:
                Poppy.display({
                    message: "Let’s modify the <span class=\"info\">Dog</span> class to use <span class=\"info\">super()</span> to call the parent class's <span class=\"info\">speak</span> method.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 9).bind(this)
                });
                break;
            case 9:
                Poppy.display({
                    message: "Here’s how you can define the <span class=\"info\">Dog</span> class with <span class=\"info\">super()</span>:<pre><span class=\"info\">class Dog(Animal):<br>    def speak(self):<br>        return super().speak() + ' and Woof!'</span></pre>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn 'Animal speaks'\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn super().speak() + ' and Woof!'\nmy_dog = Dog()\nprint(my_dog.speak())\n"
                    },
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn \"Animal speaks\"\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn super().speak() + \" and Woof!\"\nmy_dog = Dog()\nprint(my_dog.speak())\n"
                    }
                ], (() => this.cursor = 11).bind(this), (() => {}).bind(this));
                break;
            // case 10:
            //     Poppy.display({
            //         message: "Create an instance of <span class=\"info\">Dog</span> and call the <span class=\"info\">speak</span> method again:<pre><span class=\"info\">my_dog = Dog()<br>print(my_dog.speak())</span></pre>",
            //         dialogType: DialogType.NONE,
            //     });
            //     Poppy.addOnModified([
            //         {
            //             name: "main",
            //             content: "class Animal:\n\tdef speak(self):\n\t\treturn 'Animal speaks'\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn super().speak() + ' and Woof!'\nmy_dog = Dog()\nprint(my_dog.speak())\n"
            //         },
            //         {
            //             name: "main",
            //             content: "class Animal:\n\tdef speak(self):\n\t\treturn \"Animal speaks\"\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn super().speak() + \" and Woof!\"\nmy_dog = Dog()\nprint(my_dog.speak())\n"
            //         }
            //     ], (() => this.cursor = 11).bind(this), (() => {}).bind(this));
                // break;
            case 11:
                Poppy.display({
                    message: "Run this code to see the output. You should see <span class=\"info\">'Animal speaks and Woof!'</span> as the result.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 12).bind(this)
                });
                break;
            case 12:
                Poppy.display({
                    message: "Well done! You now understand both <span class=\"info\">class inheritance</span> and how to use <span class=\"info\">super()</span> in Python. Keep experimenting with these concepts!",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 13).bind(this)
                });
                break;
            case -1:
                Poppy.display({
                    message: "Hmm, it seems something went wrong. Did you type the class definition correctly?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 31).bind(this)
                });
                break;
            default:
                Poppy.tutorial = null;
                console.log("End of tutorial");
                break;
        }
    }

    highlightRemove() {
        const highlighters = document.querySelectorAll(".highlighter")
        highlighters.forEach((v) => v.remove());
    }

    highlight(el: HTMLElement, cb?: () => void, ignoreEvents = false) {
        this.highlightRemove();
        const div = document.createElement("div");
        const rect = el.getBoundingClientRect();
        div.classList.add("highlighter");
        div.style.left = `${rect.x}px`;
        div.style.top = `${rect.y}px`;
        div.style.width = `${rect.width}px`;
        div.style.height = `${rect.height}px`;
        if (ignoreEvents) {
            div.style.pointerEvents = "none";
        }
        let ref = this;
        div.addEventListener("click", (e) => {
            e.preventDefault();
            if (el instanceof HTMLButtonElement)
                el.click();
            ref.highlightRemove();
            if (cb)
                cb();
            Poppy.update();
        });
        document.body.appendChild(div);
    }
}
