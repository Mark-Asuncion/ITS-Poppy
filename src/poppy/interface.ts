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
