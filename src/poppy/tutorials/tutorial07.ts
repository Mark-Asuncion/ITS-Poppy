import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial07 extends Tutorial {
    constructor() {
        super();
        this.name = "Class Inheritance";
        this.cursor = 0;
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
                    message: "Let’s define a parent class called <span class=\"info\">Animal</span> and a child class called <span class=\"info\">Dog</span>.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 3).bind(this)
                });
                break;
            case 3:
                Poppy.display({
                    message: "Here’s how to define these classes:<pre><span class=\"info\">class Animal:<br>    def speak(self):<br>        return 'Animal speaks'<br><br>class Dog(Animal):<br>    def speak(self):<br>        return 'Woof!'</span></pre>",
                    dialogType: DialogType.NONE,
					onDisplay: (() => {
						const currentPos = Poppy.pos;
						Poppy.targetPos = {
							x: currentPos.x,
							y: currentPos.y - 50
						};
					})
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn 'Animal speaks'\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn 'Woof!'\n"
                    },
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn \"Animal speaks\"\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn \"Woof!\"\n"
                    }
                ], (() => this.cursor = 4).bind(this), (() => this.cursor = -1).bind(this));
                break;
            case 31:
                Poppy.display({
                    message: "Here’s how to define these classes:<pre><span class=\"info\">class Animal:<br>    def speak(self):<br>        return 'Animal speaks'<br><br>class Dog(Animal):<br>    def speak(self):<br>        return 'Woof!'</span></pre>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn 'Animal speaks'\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn 'Woof!'\n"
                    },
                    {
                        name: "main",
                        content: "class Animal:\n\tdef speak(self):\n\t\treturn \"Animal speaks\"\nclass Dog(Animal):\n\tdef speak(self):\n\t\treturn \"Woof!\"\n"
                    }
                ], (() => this.cursor = 4).bind(this), (() => this.cursor = -1).bind(this));
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
                ], (() => this.cursor = 10).bind(this), (() => {}).bind(this));
                break;
            case 10:
                Poppy.display({
                    message: "Create an instance of <span class=\"info\">Dog</span> and call the <span class=\"info\">speak</span> method again:<pre><span class=\"info\">my_dog = Dog()<br>print(my_dog.speak())</span></pre>",
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
}
