import Konva from "konva";
import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../../themes/diagram";
import { BaseDiagram } from "../basediagram";
import { TextBox } from "../text/textbox";
import { BaseText } from "../basetext";

export class Try extends BaseDiagram {
    constructor() {
        super({
            name: "Try",
            diagramType: "block",
            theme: Theme.Diagram.TryExcept,
        });

        this.components.push(new Text({
            x: Theme.TextBox.padding,
            y: this.height() / 2,
            text: "try:",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize,
        }));
        this.components[0].y(this.components[0].y() - this.components[0].height() / 2);

        this.add(...this.components);
    }

    setPosition(pos: Konva.Vector2d): this {
        super.setPosition(pos);
        return this;
    }

    getContent() {
        let i=0;
        let ind = "";
        while (i<this._indent) {
            ind += "\t";
            i++;
        }
        return ind + "try:";
    }
}

export class Except extends BaseDiagram {
    constructor(content: string = "") {
        super({
            name: "Except",
            diagramType: "block",
            theme: Theme.Diagram.TryExcept,
        });

        this.components.push(new Text({
            text: "except",
            fill: "#ffffff",
            ...Theme.Text
        }));
        this.components.push(new TextBox({
            text: content,
            width: this.width() * .7,
            fill: "#00",
            ...Theme.Text,
        }));

        this.components.push(new Text({
            text: ":",
            fill: "#ffffff",
            ...Theme.Text
        }))
        this.setInitialPos();

        this.add(...this.components);
    }

    refresh() {
        const padding = Theme.TextBox.padding;
        const pos = {
            x: padding,
            y: this.height() / 2
        };

        this.components[0].y(pos.y);
        pos.y = (this.components[0].y() - this.components[0].height() / 2);
        this.components[0].setPosition(pos);
        pos.x += this.components[0].width() + padding;
        this.components[1].setPosition(pos);

        let nwidth = this.components[1].x() + this.components[1].width() + padding
            + this.components[2].width() + padding;
        this.setSize({ width: nwidth });

        this.components[2].x(
            this.width() - padding - this.components[2].width()
        );
        this.components[2].y(pos.y);
        // let tboxw = this.width() - (this.components[0].width() + this.components[2].width() + padding * 4)
        // this.components[1].setSize({width: tboxw});
    }

    setInitialPos() {
        const padding = Theme.TextBox.padding;
        const pos = {
            x: padding,
            y: this.height() / 2
        };

        this.components[0].y(pos.y);
        pos.y = (this.components[0].y() - this.components[0].height() / 2);
        this.components[0].setPosition(pos);
        pos.x += this.components[0].width() + padding;
        this.components[1].setPosition(pos);

        this.components[2].x(
            this.width() - padding - this.components[2].width()
        );
        this.components[2].y(pos.y);

        let tb = this.components[1] as TextBox;
        if (tb.text.text().length == 0) {
            let tboxw = this.width() - (this.components[0].width() + this.components[2].width() + padding * 4)
            this.components[1].setSize({width: tboxw});
            (this.components[1] as TextBox).minWidth = tboxw;
        }
        else {
            let nwidth = this.components[1].x() + this.components[1].width() + padding
                + this.components[2].width() + padding;
            this.setSize({ width: nwidth });
            this.components[2].x(
                this.width() - padding - this.components[2].width()
            );
        }
    }

    getContent() {
        let i=0;
        let ind = "";
        while (i<this._indent) {
            ind += "\t";
            i++;
        }
        return ind + "except " + (this.components[1] as BaseText).getContent() + ":";
    }
}
