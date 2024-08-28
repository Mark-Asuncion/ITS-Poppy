import { Theme } from "../../../themes/diagram";
import { TextBox } from "../text/textbox";
import { BaseDiagram } from "../basediagram";

export class Statement extends BaseDiagram {
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
        this.components.push(new TextBox({
            text: content,
            width: w,
            fill: "#00",
            ...Theme.Text,
            ...textPos,
        }));
        let tb = this.components[0];
        tb.y(tb.y() - tb.height() / 2);
        this.add(tb);
    }

    refresh() {
        let tb = this.components[0];
        this.setSize({
            width: tb.x() + tb.width() + tb.padding(),
        });
    }

    getContent() {
        let i=0;
        let ind = "";
        while (i<this._indent) {
            ind += "\t";
            i++;
        }
        return ind + (this.components[0] as TextBox).getContent();
    }

    // getInputContent() {
    //     return this.text.getContent();
    // }

    // onContextMenu() {
    //     super.onContextMenu();
    //     const ct = this.getContent().trim().split(' ');
    //
    //     window.mContextMenu.push({
    //         name: "To Control",
    //         callback: () => {
    //             if (ct[0] !== "if" &&
    //                 ct[0] !== "elif" &&
    //                 ct[0] !== "else") {
    //                 return;
    //             }
    //             toDiagram(this, ct[0], this.parent!);
    //         }
    //     });
    // }
}
