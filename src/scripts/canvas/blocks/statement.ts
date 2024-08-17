import { Theme } from "../../../themes/diagram";
import { TextBox } from "../textbox";
import { BaseText } from "../basetext";
import { AttachRect, BaseDiagram } from "../basediagram";

export class Statement extends BaseDiagram {
    text: BaseText;
    constructor(content: string = "") {
        super({
            name: "Statement",
            theme: Theme.Diagram.Statement
        });

        const padding = Theme.TextBox.padding;
        const w = this.width() - padding * 2;
        const textPos = {
            x: this.width() / 2 - w / 2,
            y: this.height() / 2
        };
        this.text = new TextBox({
            text: content,
            width: w,
            fill: "#00",
            ...Theme.Text,
            ...textPos,
        });
        this.text.y(this.text.y() - this.text.height() / 2);
        this.add(this.text);
    }

    refresh() {
        this.setSize({
            width: this.text.x() + this.text.width() + this.text.padding(),
        });
    }

    attachRect(): AttachRect {
        return {
            x: this.x(),
            y: this.y() + this.height() / 2,
            width: this.width(),
            height: this.height() / 2
        };
    }

    attachRectAbsolutePosition(): AttachRect {
        const { x, y } = this.getAbsolutePosition();
        return {
            x,
            y: y + this.height() / 2,
            width: this.width(),
            height: this.height() / 2
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
