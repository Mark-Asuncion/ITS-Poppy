import { RectConfig } from "konva/lib/shapes/Rect";
import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../../themes/diagram";
import { TextBox } from "../textbox";
import { BaseText } from "../basetext";
import { AttachRect, BaseDiagram, OnResizeEvent } from "../basediagram";

export class For extends BaseDiagram {
    text: BaseText[] = [];
    _ifT: Text[] = [];
    constructor(rectConfig: RectConfig = {}) {
        super({
            name: "for",
            width: 220,
            height: 95,
            x: rectConfig.x,
            y: rectConfig.y
        }, rectConfig, Theme.Diagram.Loop);

        const padding = Theme.TextBox.padding;
        const pos = {
            x: Theme.TextBox.padding,
            y: this.rect.height() / 2,
        };

        this._ifT.push(new Text({
            ...pos,
            text: "for",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }));
        let n: Text | BaseText = this._ifT[0];
        n.y(n.y() - n.height() / 2);

        pos.x += this._ifT[0].width() + padding;
        this.text.push(
            new TextBox({
                text: "",
                width: this.width() * .2,
                fill: "#00",
                ...Theme.Text,
                ...pos
            })
        );
        n = this.text[0];
        n.y(n.y() - n.height() / 2);

        pos.x += this.text[0].width() + padding;
        this._ifT.push(new Text({
            x: pos.x,
            y: pos.y,
            text: "in",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }));
        n = this._ifT[1];
        n.y(n.y() - n.height() / 2);

        pos.x += this._ifT[1].width() + padding;
        this.text.push(
            new TextBox({
                text: "",
                width: this.width() * .3,
                fill: "#00",
                ...Theme.Text,
                ...pos
            })
        );
        n = this.text[1];
        n.y(n.y() - n.height() / 2);

        pos.x += this.text[1].width() + padding;
        this._ifT.push(new Text({
            x: pos.x,
            y: pos.y,
            text: ":",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }));
        n = this._ifT[2];
        n.y(n.y() - n.height() / 2);

        this.add(this._ifT[0]);
        this.add(this.text[0]);
        this.add(this._ifT[1]);
        this.add(this.text[1]);
        this.add(this._ifT[2]);
        this._registerCustomEvents();
    }

    _registerCustomEvents() {
        this.on("textresize", (e: OnResizeEvent) => {
            e.cancelBubble = true;
            const target = e.target as unknown as BaseText;
            const padding = Theme.TextBox.padding;
            let posx = target.x() + target.width() + padding;
            console.log(posx);

            if (target == this.text[0]) {
                this._ifT[1].x(posx);
                posx += this._ifT[1].width() + padding;
                this.text[1].x(posx);
                posx += this.text[1].width() + padding;
                this._ifT[2].x(posx);

                this.setSize({
                    width: this._ifT[2].x() + this._ifT[2].width() + padding
                });
            }
            else {
                this._ifT[2].x(posx);

                this.setSize({
                    width: this._ifT[2].x() + this._ifT[2].width() + padding
                });
            }
        });
    }


    resize(size: {
        width?: number, height?: number
    }) {
        super.resize(size);
        const padding = Theme.TextBox.padding;
        const pos = {
            x: padding,
            y: this.rect.height() / 2,
        };

        this._ifT[0].setPosition({
            x: pos.x, y: pos.y - this._ifT[0].height() / 2
        });
        pos.x += this._ifT[0].width() + padding;
        let diff = 220 - 220 * .2;

        this.text[0].resize({
            width: this.width() - diff,
        });
        this.text[0].setPosition({
            x: pos.x, y: pos.y - this.text[0].height() / 2
        });
        pos.x += this.text[0].width() + padding;

        this._ifT[1].setPosition({
            x: pos.x, y: pos.y - this._ifT[1].height() / 2
        });
        pos.x += this._ifT[1].width() + padding;

        diff = 220 - 220 * .3;
        this.text[1].resize({
            width: this.width() - diff,
        });
        this.text[1].setPosition({
            x: pos.x, y: pos.y - this.text[1].height() / 2
        });
        pos.x += this.text[1].width() + padding;
        this._ifT[2].setPosition({
            x: pos.x, y: pos.y - this._ifT[2].height() / 2
        });

        this.setSize({
            width: this._ifT[2].x() + this._ifT[2].width() + padding
        });
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
        return ind + "for " + this.text[0].getContent() + " in " + this.text[1].getContent() + ":";
    }
}
