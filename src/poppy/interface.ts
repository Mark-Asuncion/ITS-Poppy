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
    cb?: () => void
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
    frames: number = 0;
    currFrame: number = 0;
    ms: number = 0; // how many milliseconds when changing frame
    accumulator: number = 0;
    update(elapsed: number) {} // called once per frame
}
