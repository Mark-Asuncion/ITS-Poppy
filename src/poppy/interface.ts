export enum State {
    NONE,
    WAIT,
    WAIT_MODIFY,
}

export enum DialogType {
    NONE,
    NEXT,
}

export interface PoppyDialog {
    message: string,
    dialogType: DialogType,
    timeout?: number, // only used if type is NONE
    cb?: () => void,
    onDisplay?: () => void,
    notif?: boolean
}

export class Tutorial {
    name: string = "";
    cursor: number = 0;
    update() { }
}

export enum PoppyState {
    IDLE,
    WALKING,
}

export class PoppyAnimation {
    name = "";
    frames: number = 0;
    currFrame: number = 0;
    ms: number = 0; // how many milliseconds when changing frame
    accumulator: number = 0;
    onFrameChanged: (() => void) | null = null;
    update(elapsed: number) { // called once per frame
        this.accumulator += elapsed;
        if (this.accumulator > this.ms) {
            this.accumulator -= this.ms;
            this.currFrame++;
            if (this.onFrameChanged)
                this.onFrameChanged();
        }

        if (this.currFrame >= this.frames) {
            this.currFrame = 0;
        }
    }
}
