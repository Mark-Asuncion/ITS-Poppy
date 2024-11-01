import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial04 extends Tutorial {
    constructor() {
        super();
        this.name = "Functions";
        this.cursor = 0;
    }

    update() {
        switch (this.cursor) {
            case 0:
                Poppy.display({
                    message: "Welcome! In this tutorial, we’ll learn about <span class=\"accent\">functions</span> in Python. A function is a block of code that performs a specific task and can be reused in your programs.",
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
                    message: "Drag a <span class=\"info\">DefFunction Diagram</span> into the editor and define the function like this: <span class=\"info\">def greet():</span>",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 3).bind(this)
                });
                break;
            case 3:
                Poppy.display({
                    message: "Inside the function, add a print statement to greet the user: <pre><span class=\"info\">    print('Hello, world!')</span></pre>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint('Hello, world!')\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint(\"Hello, world!\")\n"
                    }
                ], (() => this.cursor = 4).bind(this), (() => {}).bind(this));
                break;
            case 4:
                Poppy.display({
                    message: "Great! Now let’s call the <span class=\"accent\">greet</span> function to see it in action. Add <span class=\"info\">greet()</span> below the function definition:<pre><span class=\"info\">def greet():<br>   print('Hello, world!')<br><br>greet()</span></pre>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint('Hello, world!')\ngreet( )\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\tprint(\"Hello, world!\")\ngreet( )\n"
                    }
                ], (() => this.cursor = 5).bind(this), (() => this.cursor = -1).bind(this));
                break;
            case 5:
                Poppy.display({
                    message: "When you run the code, it should print: <span class=\"info\">Hello, world!</span> Now you can define functions to perform different tasks.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 6).bind(this)
                });
                break;

            // Separate section for return statements
            case 6:
                Poppy.display({
                    message: "Now, let’s learn how to return values from functions. We'll modify the <span class=\"accent\">greet</span> function to return a greeting message.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 7).bind(this)
                });
                break;
            case 7:
                Poppy.display({
                    message: "Update the <span class=\"accent\">greet</span> function to use the return statement like this:<pre><span class=\"info\">def greet():<br>    return 'Hello, world!'</span></pre>",
                    dialogType: DialogType.NONE
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet( ):\n\treturn 'Hello, world!'\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\treturn \"Hello, world!\"\n"
                    }
                ], (() => this.cursor = 8).bind(this), (() => {}).bind(this));
                break;
            case 8:
                Poppy.display({
                    message: "Now let’s call the <span class=\"accent\">greet</span> function and store the returned value in a variable. Add the following code:<pre><span class=\"info\">message = greet()<br>print(message)</span></pre>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet( ):\n\treturn 'Hello, world!'\nmessage = greet()\nprint(message)\n"
                    },
                    {
                        name: "main",
                        content: "def greet( ):\n\treturn \"Hello, world!\"\nmessage = greet()\nprint(message)\n"
                    }
                ], (() => this.cursor = 9).bind(this), (() => this.cursor = -2).bind(this));
                break;
            case 9:
                Poppy.display({
                    message: "When you run the code, it should print: <span class=\"info\">Hello, world!</span> This demonstrates how to use return values in functions.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 10).bind(this)
                });
                break;

            // Back to modifying greet to take a name
            case 10:
                Poppy.display({
                    message: "Now, let’s modify the <span class=\"accent\">greet</span> function to accept a name. Change it to: <pre><span class=\"info\">def greet(name):</span></pre>",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 11).bind(this)
                });
                break;
            case 11:
                Poppy.display({
                    message: "Update the return statement to include the <span class=\"info\">name</span> parameter. Change it to: <pre><span class=\"info\">return 'Hello, ' + name + '!'</span></pre>Delete the unnecessary diagrams.",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet(name):\n\treturn 'Hello, ' + name + '!'\n"
                    },
                    {
                        name: "main",
                        content: "def greet(name):\n\treturn \"Hello, \" + name + \"!\"\n"
                    }
                ], (() => this.cursor = 12).bind(this), (() => {}).bind(this));
                break;
            case 12:
                Poppy.display({
                    message: "When you call <span class=\"info\">greet('Poppy')</span>, it will return the greeting message. Print it like this:<pre><span class=\"info\">print(greet('Poppy'))</span></pre>",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "def greet(name):\n\treturn 'Hello, ' + name + '!'\nprint(greet('Poppy'))\n"
                    },
                    {
                        name: "main",
                        content: "def greet(name):\n\treturn \"Hello, \" + name + \"!\"\nprint(greet(\"Poppy\"))\n"
                    }
                ], (() => this.cursor = 13).bind(this), (() => {}).bind(this));
                break;
            case 13:
                Poppy.display({
                    message: "When you call <span class=\"info\">greet('Poppy')</span>, it should print: <span class=\"info\">Hello, Poppy!</span> You can now pass different names to the function.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 14).bind(this)
                });
                break;
            case 14:
                Poppy.display({
                    message: "That's it for this lesson on functions! Experiment with creating and calling your own functions to strengthen your understanding.",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 15).bind(this)
                });
                break;
            case -1:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct. Did you define the <span class=\"accent\">greet</span> function correctly?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 4).bind(this)
                });
                break;
            case -2:
                Poppy.display({
                    message: "Hmm, that doesn't seem correct. Did you type them correctly?",
                    dialogType: DialogType.NEXT,
                    cb: (() => this.cursor = 8).bind(this)
                });
                break;
            default:
                Poppy.tutorial = null;
                console.log("End of tutorial");
                break;
        }
    }
}