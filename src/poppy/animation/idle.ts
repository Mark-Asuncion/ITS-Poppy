import { PoppyAnimation } from "../interface";
import { Poppy } from "../poppy";

export class Idle extends PoppyAnimation {
    constructor() {
        super();
        this.frames = 2;
        this.ms = 600;
    }

    update(elapsed: number) {
        super.update(elapsed);
        Poppy.source.style.backgroundPosition =
            `-${this.currFrame * Poppy.frameSizeWxH}px 0px`;
    }
}
