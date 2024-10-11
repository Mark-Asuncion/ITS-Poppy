import { DialogType, Tutorial } from "../interface";
import { Poppy } from "../poppy";

export class Tutorial01 extends Tutorial {
    // cursorErrReturn: number = 1;
    constructor() {
        super();
        this.name = "Variables";
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
            case 0:
                break;
            case -1: 
                break;
            default:
                Poppy.tutorial = null;
                console.log("end of tutorial");
            break;
        }
    }
}
