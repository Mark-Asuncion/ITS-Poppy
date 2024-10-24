import { Rect } from "konva/lib/shapes/Rect";
import { TextConfig, Text } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { Group } from "konva/lib/Group";
import { KonvaEventObject } from "konva/lib/Node";

export interface BaseTextConfig extends TextConfig {
    noBG?: boolean,
    autoFill?: boolean
}

export interface TextChangedEvent extends KonvaEventObject<any> {
    value?: string
}

export interface TextKeyUpEvent extends KonvaEventObject<any> {
    value?: string,
    key?: string,
    shiftKey?: boolean,
};

export class BaseText extends Group {
    text?: Text;
    bg: Rect;
    isEditing = false;
    input: HTMLTextAreaElement | null = null;
    autoFill = true;
    constructor(textConfig: BaseTextConfig) {
        const noBG = textConfig.noBG;
        delete textConfig.noBG;

        super({
            ...textConfig
        });

        this.bg = new Rect({
            cornerRadius: Theme.TextBox.cornerRadius,
            fill: Theme.TextBox.fill,
            stroke: Theme.TextBox.stroke,
            strokeWidth: 1,
            x: 0,
            y: 0,
        });

        if (!noBG) {
            this.add(this.bg);
        }
    }

    setSize(size: any): this {
        if (size.width) {
            this.width(size.width);
            this.bg.width(size.width);
        }
        if (size.height) {
            this.height(size.height);
            this.bg.height(size.height);
        }
        return this;
    }

    createInput() {
        return;
    }

    padding(): number {
        return 0;
    }

    removeFocus() {
        if (this.input) {
            this.input.blur();
        }
        this.fire("OnStateClear", {}, true);
    }

    focus() {
        this.createInput();
        this.fire("OnStateSelect", {}, true);
    }

    registerEvents() {
        this.on("mousedown", (e) => {
            e.cancelBubble = true;
            if (this.isEditing) {
                return;
            }
            this.createInput();
        });
    }

    getContent(): string {
        return "";
    }

    adjustWidth(v: string) { return v.length; }
    setColors() { }
}
