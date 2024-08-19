import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../../themes/diagram";
import { TextBox } from "../text/textbox";
import { BaseText } from "../basetext";
import { BaseDiagram } from "../basediagram";

export class For extends BaseDiagram {
    // 0 text - for
    // 1 textbox 
    // 2 text - in
    // 3 textbox
    // 4 text :
    components: ( BaseText | Text )[] = [];
    text: BaseText[] = [];
    _ifT: Text[] = [];
    constructor(content: string = "") {
        super({
            name: "for",
            width: 230,
            diagramType: "block",
            theme: Theme.Diagram.Loop
        });

        this.components.push(new Text({
            text: "for",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }));
        this.components.push(
            new TextBox({
                text: (content)? content[0]:'',
                width: this.width() * .2,
                fill: "#00",
                ...Theme.Text,
            })
        );
        this.components.push(new Text({
            text: "in",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }));

        this.components.push(
            new TextBox({
                text: (content)? content[1]:'',
                width: this.width() * .3,
                fill: "#00",
                ...Theme.Text,
            })
        );

        this.components.push(new Text({
            text: ":",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
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

        this.components[4].x(
            this.width() - padding - this.components[4].width()
        );
        this.components[4].y(pos.y);

        // placed 0 .... 4
        // get the remaining space assuming 2 is placed
        const totalWidths = this.components[0].width() + this.components[2].width() 
            + this.components[4].width();
        let remainSpace = this.width() - (totalWidths + padding * 6)

        this.components[1].setPosition(pos);
        this.components[1].setSize({width: remainSpace * .2});
        (this.components[1] as TextBox).minWidth = remainSpace * .2;

        pos.x += this.components[1].width() + padding;
        this.components[2].setPosition(pos);
        pos.x += this.components[2].width() + padding;
        this.components[3].setPosition(pos);
        this.components[3].setSize({width: remainSpace * .8});
        (this.components[3] as TextBox).minWidth = remainSpace * .8;
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
        pos.x += this.components[1].width() + padding;
        this.components[2].setPosition(pos);
        pos.x += this.components[2].width() + padding;
        this.components[3].setPosition(pos);
        pos.x += this.components[3].width() + padding;
        this.components[4].setPosition(pos);
        pos.x += this.components[4].width() + padding;
        this.setSize({ width: pos.x });
    }

    getContent() {
        let i=0;
        let ind = "";
        while (i<this._indent) {
            ind += "\t";
            i++;
        }
        return ind + "for " + (this.components[1] as BaseText).getContent()
            + " in " + (this.components[3] as BaseText).getContent() + ":";
    }
}
