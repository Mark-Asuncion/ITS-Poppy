
import { PoppyAnimation } from "../interface";
import { Poppy } from "../poppy";

export class Walk extends PoppyAnimation {
    // 0 - left
    // 1 - right
    direction = 0;
    constructor() {
        super();
        this.frames = 4;
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

        let yOffset = 1;
        if (this.direction == 1) {
            yOffset = 2;
        }

        Poppy.source.style.backgroundPosition =
            `-${this.currFrame * Poppy.frameSizeWxH}px -${Poppy.frameSizeWxH * yOffset}px`;
    }
}
