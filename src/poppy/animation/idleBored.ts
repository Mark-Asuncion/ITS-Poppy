import { PoppyAnimation } from "../interface";
import { Poppy } from "../poppy";

export class JumpingRope extends PoppyAnimation {
    justStarted = true;
    constructor() {
        super();
        // # of columns = 7
        // # of rows = 2
        this.name = "idle-jumping rope"
        this.frames = 14;
        this.ms = 200;
    }

    update(elapsed: number) {
        super.update(elapsed);
        let col = this.currFrame % 7;
        let row = Math.floor(this.currFrame / 7);
        if (this.currFrame == 3 && this.justStarted) {
            this.justStarted = false;
        }
        if (this.justStarted == false && row == 0 && col <= 3) {
            col = 4;
        }

        Poppy.source.style.backgroundPosition =
            `-${col * Poppy.frameSizeWxH}px -${Poppy.frameSizeWxH*(8+row)}px`;
    }
}

export class Pokeball extends PoppyAnimation {
    currLoop = 0;
    loopTimes = 3;
    constructor() {
        super();
        this.name = "idle-pokeball"
        this.frames = 6;
        this.ms = 400;

        this.onFrameChanged = (() => {
            if (this.currFrame >= this.frames) {
                this.currLoop++;
                if (this.currLoop >= this.loopTimes) {
                    Poppy.resetBoredTimer(true);
                }
            }
        }).bind(this);
    }

    update(elapsed: number) {
        super.update(elapsed);

        Poppy.source.style.backgroundPosition =
            `-${this.currFrame * Poppy.frameSizeWxH}px -${Poppy.frameSizeWxH*3}px`;

    }
}

export class SwattingFly extends PoppyAnimation {
    constructor() {
        super();
        this.name = "idle-swatting fly"
        // # of columns = 7
        // # of rows = 4
        this.frames = 28;
        this.ms = 600;
        this.onFrameChanged = (() => {
            if (this.currFrame >= this.frames) {
                Poppy.resetBoredTimer(true);
            }
        }).bind(this);
    }

    update(elapsed: number) {
        super.update(elapsed);

        let col = this.currFrame % 7;
        let row = Math.floor(this.currFrame / 7);
        if (this.currFrame == 0) {
            this.ms = 600;
        }
        else if (this.currFrame == 11) {
            this.ms = 200;
        }
        else if (this.currFrame == 19) {
            this.ms = 500;
        }

        Poppy.source.style.backgroundPosition =
            `-${col * Poppy.frameSizeWxH}px -${Poppy.frameSizeWxH*(4+row)}px`;
    }
}
