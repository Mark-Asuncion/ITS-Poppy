import Konva from "konva";
import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../../themes/diagram";
import { TextBox } from "../textbox";
import { BaseText } from "../basetext";
import { AttachRect, BaseDiagram, BaseDiagramConfig, OnResizeEvent } from "../basediagram";

export class If extends BaseDiagram {
    text: BaseText;
    _ifT: Text[] = [];
    constructor(config: BaseDiagramConfig = {}) {
        let content = (config.content)? config.content:"";
        delete config.content;
        super({
            name: "If",
            width: 200,
            height: 95,
            ...config,
            theme: Theme.Diagram.Control,
        });

        const padding = Theme.TextBox.padding;
        const pos = {
            x: padding,
            y: this.height() / 2
        };

        this._ifT.push(new Text({
            ...pos,
            text: "if",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }));
        let n: Text | BaseText = this._ifT[0];
        n.y(n.y() - n.height() / 2);

        pos.x += n.width() + padding;
        this.text = new TextBox({
            text: content,
            width: this.width() * .7,
            fill: "#00",
            ...Theme.Text,
            ...pos,
        });
        n = this.text;
        n.y(n.y() - n.height() / 2);

        pos.x += this.text.width() + padding;
        this._ifT.push(new Text({
            ...pos,
            text: ":",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }));
        n = this._ifT[1];
        n.y(n.y() - n.height() / 2);

        pos.x += this._ifT[1].width() + padding;
        this.setSize({
            width: pos.x,
        });

        this.add(this._ifT[0]);
        this.add(this.text);
        this.add(this._ifT[1]);
    }

    resize(size: {
        width?: number, height?: number
    }) {
        super.resize(size);
        const padding = Theme.TextBox.padding;
        const pos = {
            x: padding,
            y: this.height() / 2
        };
        this._ifT[0].setPosition({
            x: pos.x, y: pos.y - this._ifT[0].height() / 2
        });
        pos.x += this._ifT[0].width() + padding;
        const diff = 200 - ( 200 * .7 );
        this.text.resize({
            width: this.width() - diff
        });
        this.text.setPosition({
            x: pos.x, y: pos.y - this.text.height() / 2
        })
        pos.x += this.text.width() + padding;
        this._ifT[1].setPosition({
            x: pos.x, y: pos.y - this._ifT[1].height() / 2
        });

        pos.x += this._ifT[1].width() + padding;
        this.setSize({
            width: pos.x,
        });
    }

    refresh() {
        const padding = Theme.TextBox.padding;
        this.resize({
            width: this.text.x() + this.text.width()
                + this._ifT[1].width()
                + ( padding * 2 )
        });
    }

    setPosition(pos: Konva.Vector2d): this {
        super.setPosition(pos);
        return this;
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
        return ind + "if " + this.text.getContent() + ":";
    }
}

export class Elif extends BaseDiagram {
    text: BaseText;
    _ifT: Text[] = [];
    constructor(config: BaseDiagramConfig = {}) {
        let content = (config.content)? config.content:"";
        delete config.content;
        super({
            name: "Elif",
            width: 200,
            height: 95,
            ...config,
            theme: Theme.Diagram.Control,
        });

        const padding = Theme.TextBox.padding;
        const pos = {
            x: padding,
            y: this.height() / 2
        };

        this._ifT.push(new Text({
            ...pos,
            text: "elif",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }));
        let n: Text | BaseText = this._ifT[0];
        n.y(n.y() - n.height() / 2);

        pos.x += this._ifT[0].width() + padding;
        this.text = new TextBox({
            text: content,
            width: this.width() * .6,
            fill: "#00",
            ...Theme.Text,
            ...pos,
        });
        n = this.text;
        n.y(n.y() - n.height() / 2);

        pos.x += this.text.width() + padding;
        this._ifT.push(new Text({
            ...pos,
            text: ":",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        }));
        n = this._ifT[1];
        n.y(n.y() - n.height() / 2);

        pos.x += this._ifT[1].width() + padding;
        this.setSize({
            width: pos.x,
        });

        this.add(this._ifT[0]);
        this.add(this.text);
        this.add(this._ifT[1]);
    }

    resize(size: {
        width?: number, height?: number
    }) {
        super.resize(size);
        const padding = Theme.TextBox.padding;
        const pos = {
            x: padding,
            y: this.height() / 2
        };

        this._ifT[0].setPosition({
            x: pos.x, y: pos.y - this._ifT[0].height() / 2
        });

        pos.x += this._ifT[0].width() + padding;
        const diff = 200 - ( 200 * .6 );
        this.text.resize({
            width: this.width() - diff
        });
        this.text.setPosition({
            x: pos.x, y: pos.y - this.text.height() / 2
        })

        pos.x += this.text.width() + padding;
        this._ifT[1].setPosition({
            x: pos.x, y: pos.y - this._ifT[1].height() / 2
        });

        pos.x += this._ifT[1].width() + padding;
        this.setSize({
            width: pos.x,
        });
    }

    refresh() {
        const padding = Theme.TextBox.padding;
        this.resize({
            width: this.text.x() + this.text.width()
                + this._ifT[1].width()
                + ( padding * 2 )
        });
    }

    setPosition(pos: Konva.Vector2d): this {
        super.setPosition(pos);
        // this.text.setPosition({
        //     x: this.rect.width() / 2,
        //     y: this.rect.height() / 2
        // });
        return this;
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
        return ind + "elif " + this.text.getContent() + ":";
    }
}

export class Else extends BaseDiagram {
    _ifT: Text;
    constructor(config: BaseDiagramConfig = {}) {
        delete config.content;
        super({
            name: "Else",
            width: 200,
            height: 80,
            ...config,
            theme: Theme.Diagram.Control,
        });

        this._ifT = new Text({
            x: Theme.TextBox.padding,
            y: this.height() / 2,
            text: "else:",
            fill: "#ffffff",
            fontSize: Theme.Text.fontSize + 6,
        });
        this._ifT.y(this._ifT.y() - this._ifT.height() / 2);

        this.add(this._ifT);
    }

    setPosition(pos: Konva.Vector2d): this {
        super.setPosition(pos);
        return this;
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
        return ind + "else:";
    }
}
