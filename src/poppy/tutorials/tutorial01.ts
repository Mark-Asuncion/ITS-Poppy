import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial01 extends Tutorial {
    // cursorErrReturn: number = 1;
    constructor() {
        super();
        this.name = "Hello World";
        this.cursor = 0;
    }

    onNext() {
        this.cursor++;
    }

    onFail() {
        this.cursor = -1;
    }

    update() {
        switch(this.cursor) {
            case 0: {
                Poppy.display({
                    message: "Welcome! Today, we're going to learn how to write your first Python program.",
                    dialogType: DialogType.NEXT,
                    cb: this.onNext.bind(this)
                });
                break;
            }
            case 1: {
                Poppy.display({
                    message: "The goal is to print 'Hello, World!' on the screen. This is the classic first program in any language.",
                    dialogType: DialogType.NEXT,
                    cb: this.onNext.bind(this)
                });
                break;
            }
            case 2: {
                Poppy.display({
                    message: "In Python, printing something is very simple. We use the `print()` function. It's a built-in function, so you don’t need to import any special library.",
                    dialogType: DialogType.NEXT,
                    cb: this.onNext.bind(this)
                });
                break;
            }
            case 3: {
                Poppy.display({
                    message: "Now, let's write the Python code to print 'Hello, World!'",
                    dialogType: DialogType.NONE,
                });
                Poppy.addOnModified([
                    {
                        name: "main",
                        content: "print('Hello, World!')\n"
                    },
                    {
                        name: "main",
                        content: "print(\"Hello, World!\")\n"
                    }
                ], ( () => this.cursor++ ).bind(this), this.onFail.bind(this));
                break;
            }
            case 4: {
                Poppy.display({
                    message: "Great! When you run this, Python will output 'Hello, World!' to the screen.\n Try running It by clicking the green play button on the top right.",
                    dialogType: DialogType.NEXT,
                    cb: this.onNext.bind(this)
                });
                break;
            }
            case 5: {
                Poppy.display({
                    message: "That's it for this lesson! You've written your first Python program. Ready for the next step?",
                    dialogType: DialogType.NONE,
                });
                break;
            }
            case -1: {
                Poppy.display({
                    message: "In Python, printing something is very simple. We use the `print()` function. It's a built-in function, now try printing \"Hello, World!\"",
                    dialogType: DialogType.NONE,
                    // cb: (() => this.cursor = 3).bind(this)
                });
                this.cursor = 3;
                break;
            }
            default:
                Poppy.tutorial = null;
                console.log("end of tutorial");
            break;
        }
    }
}
