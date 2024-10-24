import Konva from "konva";
import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../../themes/diagram";
import { TextBox } from "../text/textbox";
import { BaseText } from "../basetext";
import { BaseDiagram } from "../basediagram";

export class If extends BaseDiagram {
    constructor(content: string = "") {
        super({
            name: "If",
            diagramType: "block",
            theme: Theme.Diagram.Control,
        });

        this.components.push(new Text({
            text: "if",
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

        let tboxw = this.width() - (this.components[0].width() + this.components[2].width() + padding * 4)
        this.components[1].setSize({width: tboxw});
        (this.components[1] as TextBox).minWidth = tboxw;
    }

    getContent() {
        let i=0;
        let ind = "";
        while (i<this._indent) {
            ind += "\t";
            i++;
        }
        return ind + "if " + (this.components[1] as BaseText).getContent() + ":";
    }
}

export class Elif extends BaseDiagram {
    constructor(content: string = "") {
        super({
            name: "Elif",
            diagramType: "block",
            theme: Theme.Diagram.Control,
        });

        const padding = Theme.TextBox.padding;
        const pos = {
            x: padding,
            y: this.height() / 2
        };

        this.components.push(new Text({
            text: "elif",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize,
        }));

        this.components.push(new TextBox({
            text: content,
            width: this.width() * .6,
            fill: "#00",
            ...Theme.Text,
        }));
        this.components.push(new Text({
            ...pos,
            text: ":",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize,
        }));
        this.setInitialPos();

        this.add(...this.components);
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

        let tboxw = this.width() - (this.components[0].width() + this.components[2].width() + padding * 4)
        this.components[1].setSize({width: tboxw});
        (this.components[1] as TextBox).minWidth = tboxw;
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
    }

    getContent() {
        let i=0;
        let ind = "";
        while (i<this._indent) {
            ind += "\t";
            i++;
        }
        return ind + "elif " + (this.components[1] as BaseText).getContent() + ":";
    }
}

export class Else extends BaseDiagram {
    constructor() {
        super({
            name: "Else",
            diagramType: "block",
            theme: Theme.Diagram.Control,
        });

        this.components.push(new Text({
            x: Theme.TextBox.padding,
            y: this.height() / 2,
            text: "else:",
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
        return ind + "else:";
    }
}
