import { PoppyAnimation } from "../interface";
import { Poppy } from "../poppy";

export class Idle extends PoppyAnimation {
    constructor() {
        super();
        this.frames = 2;
        this.ms = 300;
    }

    update(elapsed: number) {
        this.accumulator += elapsed;
        if (this.accumulator > this.ms) {
            this.accumulator -= this.ms;
            this.currFrame++;
        }

        if (this.currFrame >= this.frames) {
            this.currFrame = 0;
        }

        Poppy.source.style.backgroundPosition =
            `-${this.currFrame * Poppy.frameSizeWxH}px 0px`;
    }
}
