import { RectConfig } from "konva/lib/shapes/Rect";
import { Theme } from "../../../themes/diagram";
import { TextBox } from "../textbox";
import { BaseText } from "../basetext";
import { AttachRect, BaseDiagram, OnResizeEvent } from "../basediagram";

export class Statement extends BaseDiagram {
    text: BaseText;
    constructor(rectConfig: RectConfig = {}) {
        super({
            name: "Statement",
            // draggable: true,
            width: 200,
            height: 100,
            x: rectConfig.x,
            y: rectConfig.y
        }, rectConfig, Theme.Diagram.Statement);

        const padding = Theme.TextBox.padding;
        const w = this.rect.width() - padding * 2;
        const textPos = {
            x: this.width() / 2 - w / 2,
            y: this.height() / 2
        };
        this.text = new TextBox({
            text: "",
            width: w,
            fill: "#00",
            ...Theme.Text,
            ...textPos,
        });
        this.text.y(this.text.y() - this.text.height() / 2);
        this.add(this.text);
        this._registerCustomEvents();
    }

    _registerCustomEvents() {
        this.on("textresize", (e: OnResizeEvent) => {
            e.cancelBubble = true;
            this.setSize({
                width: this.text.x() + this.text.width() + this.text.padding(),
            });
        });
    }

    resize(size: {
        width?: number, height?: number
    }) {
        super.resize(size);
        const padding = Theme.TextBox.padding;
        const w = this.rect.width() - padding * 2;
        const textPos = {
            x: this.width() / 2 - w / 2,
            y: this.height() / 2 - this.text.height() / 2
        };
        this.text.resize({
            width: w,
        });
        this.text.setPosition(textPos);
    }

    attachRect(): AttachRect {
        return {
            x: this.x(),
            y: this.y() + this.rect.height() / 2,
            width: this.rect.width(),
            height: this.rect.height() / 2
        };
    }

    attachRectAbsolutePosition(): AttachRect {
        const { x, y } = this.getAbsolutePosition();
        return {
            x,
            y: y + this.rect.height() / 2,
            width: this.rect.width(),
            height: this.rect.height() / 2
        };
    }

    getContent() {
        let i=0;
        let ind = "";
        while (i<this._indent) {
            ind += "\t";
            i++;
        }
        return ind + this.text.getContent();
    }
}
