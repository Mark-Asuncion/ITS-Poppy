import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../../themes/diagram";
import { TextBox } from "../text/textbox";
import { BaseText } from "../basetext";
import { BaseDiagram } from "../basediagram";
import { TextKeyUpEvent } from "../utils";

export class Function extends BaseDiagram {
    // prevent adding twice cause for some reason keyup is called twice
    // so the KeyUp is also called twice
    creatingComponent = false;
    constructor(content: string = "", param: string = "") {
        super({
            name: "Function",
            theme: Theme.Diagram.Function,
        });

        this.components.push(new TextBox({
            text: content,
            width: this.width() * .7,
            fill: "#00",
            ...Theme.Text,
        }));

        this.components.push(new Text({
            text: "(",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }))

        let commaOpt = {
            text: ",",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6
        };
        let splitParams = param.split(",");
        for (let i=0;i<splitParams.length;i++) {
            let v = splitParams[i].trim();
            if (i !== 0) {
                this.components.push(new Text(commaOpt));
            }
            this.components.push(new TextBox({
                text: v.trim(),
                width: 30,
                fill: "#00",
                ...Theme.Text,
            }));
        }

        this.components.push(new Text({
            text: ")",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }))

        this.setInitialPos();
        this.registerEvents();

        this.add(...this.components);
    }

    onKeyUp(e: TextKeyUpEvent) {
        super.onKeyUp(e);

        let tb = (e.target as unknown as TextBox);
        if (tb === this.components[0]) {
            return;
        }

        if (this.creatingComponent) {
            return;
        }

        if (e.value != undefined && e.value[e.value.length-1] == ",") {
            this.creatingComponent = true;
            let rmComma = e.value;
            rmComma = e.value.substring(0, e.value.length-1);
            tb.removeFocus();
            tb.text.text(rmComma);
            tb.adjustWidth(rmComma);

            let newComponent = [
                new Text({
                    text: ",",
                    fill: "#ffffff",
                    fontSize: Theme.Text.fontSize + 6,
                }),
                new TextBox({
                    text: "",
                    width: (this.components[2] as TextBox).minWidth,
                    fill: "#00",
                    ...Theme.Text,
                })
            ];
            this.add(...newComponent);
            let insertIndex = this.components.length - 1;
            for (let i=2;i<this.components.length-1;i++) {
                if ( !(this.components[i] instanceof TextBox) ) {
                    continue;
                }
                if (this.components[i] == tb) {
                    insertIndex = i+1;
                }
            }
            this.components.splice(insertIndex, 0, ...newComponent);
            this.refresh();
            (newComponent[1] as BaseText).focus()
        }
        else if (e.key == "Backspace" && (e.value != undefined && e.value.length === 0)) {
            if (tb === this.components[2]) {
                return;
            }
            this.creatingComponent = true;
            let componentIndex = this.components.length - 1;
            for (let i=2;i<this.components.length-1;i++) {
                if ( !(this.components[i] instanceof TextBox) ) {
                    continue;
                }
                if (this.components[i] == tb) {
                    componentIndex = i;
                }
            }

            let removed = this.components.splice(componentIndex-1, 2);
            tb.removeFocus();
            removed[0].remove();
            removed[0].destroy();
            removed[1].remove();
            removed[1].destroy();
            this.refresh();
        }
        setTimeout(() => this.creatingComponent = false, 300);
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

        for (let i=2;i<this.components.length-1;i++) {
            this.components[i].setPosition(pos);
            pos.x += this.components[i].width() + padding;
        }

        this.components[this.components.length-1].setPosition(pos);
        pos.x += this.components[this.components.length-1].width() + padding;
        this.setSize({ width: pos.x });
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
        pos.x += this.components[1].width() + padding;

        const totalWidths = this.components[0].width() + this.components[1].width() +
            this.components[this.components.length-1].width();
        let remainSpace = this.width() - (totalWidths + padding * 5);
        for (let i=2;i<this.components.length-1;i++) {
            if ( !(this.components[i] instanceof BaseText) ) {
                this.components[i].setPosition(pos);
                pos.x += this.components[i].width() + padding;
                continue;
            }

            this.components[i].setPosition(pos);
            (this.components[i] as TextBox).minWidth = remainSpace;
            let content = (this.components[i] as BaseText).getContent();
            if (content.length == 0) {
                this.components[i].setSize({ width: remainSpace });
            }
            else {
                (this.components[i] as BaseText).adjustWidth(content);
            }
            pos.x += this.components[i].width() + padding;
        }
        this.components[this.components.length-1].setPosition(pos);
        pos.x += this.components[this.components.length-1].width() + padding;
        this.setSize({ width: pos.x });
    }

    getContent() {
        let i=0;
        let ind = "";
        while (i<this._indent) {
            ind += "\t";
            i++;
        }

        let params = "";
        for (let i=2;i<this.components.length-1;i++) {
            if ( !(this.components[i] instanceof BaseText) ) {
                params += ", ";
                continue;
            }

            params += (this.components[i] as BaseText).getContent();
        }
        return ind + (this.components[0] as BaseText).getContent() + "(" + params + ")";
    }
}
