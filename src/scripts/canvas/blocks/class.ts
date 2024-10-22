
import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../../themes/diagram";
import { TextBox } from "../text/textbox";
import { BaseText } from "../basetext";
import { BaseDiagram } from "../basediagram";

export class Class extends BaseDiagram {
    constructor(className: string = "") {
        super({
            name: "Class",
            diagramType: "block",
            theme: Theme.Diagram.Function,
        });

        this.components.push(new Text({
            text: "class",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize,
        }))

        this.components.push(new TextBox({
            text: className,
            width: this.width() * .7,
            fill: "#00",
            ...Theme.Text,
        }));

        this.components.push(new Text({
            text: ":",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize,
        }))

        this.setInitialPos();
        this.registerEvents();

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

        return ind + "class " + (this.components[1] as BaseText).getContent() + ":";
    }
}
