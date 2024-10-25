
import { PoppyAnimation } from "../interface";
import { Poppy } from "../poppy";

export class Walk extends PoppyAnimation {
    // 0 - left
    // 1 - right
    direction = 0;
    constructor() {
        super();
        this.name = "walk";
        this.frames = 4;
        this.ms = 300;
    }

    update(elapsed: number) {
        super.update(elapsed);
        let yOffset = 1;
        if (this.direction == 1) {
            yOffset = 2;
        }

        Poppy.source.style.backgroundPosition =
            `-${this.currFrame * Poppy.frameSizeWxH}px -${Poppy.frameSizeWxH * yOffset}px`;
    }
}
