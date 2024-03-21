import Konva from "konva";
import { RectConfig } from "konva/lib/shapes/Rect";
import { TextConfig } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { TextBox } from "./textbox";
import { OnStateEvent } from "./basegroup";
import { BaseText } from "./basetext";
import { ArrowButton } from "./button";
import { AttachRect, BaseDiagram } from "./basediagram";
import { DiagramGroup } from "./diagramgroup";

export class Statement extends BaseDiagram {
    text: BaseText;
    button: {
        l: ArrowButton,
        r: ArrowButton
    };
    constructor(rectConfig: RectConfig = {}, textConfig: TextConfig = {}) {
        super({
            name: "Statement",
            // draggable: true,
            width: 200,
            height: 100,
            x: rectConfig.x,
            y: rectConfig.y
        }, rectConfig);

        const textPos = {
            x: this.rect.x() + this.rect.width() / 2,
            y: this.rect.y() + this.rect.height() / 2
        };
        this.text = new TextBox({
            text: "",
            fontSize: Theme.Diagram.fontSize,
            width: this.rect.width() - 20,
            fill: "#00",
            ...textPos,
            ...textConfig
        });

        this.button = {
            l: new ArrowButton({
                x: this.rect.width() / 2,
                y: this.rect.height() / 2,
                direction: "left"
            }),
            r: new ArrowButton({
                x: this.rect.width() / 2,
                y: this.rect.height() / 2
            })
        };

        this.add(this.button.l);
        this.add(this.button.r);
        this.button.l.moveToBottom();
        this.button.r.moveToBottom();
        this.add(this.text);
        this.registerEvents();
    }

    leftIndent() {
        this.indent(-1);
        const parent = this.parent! as DiagramGroup;
        const pos = parent
            .getRootDiagram(this)?.getIndentPosition(this.indent());
        if (pos) {
            this.setPosition({ x: pos, y: this.y() });
        }
    }

    rightIndent() {
        this.indent(1);
        const parent = this.parent! as DiagramGroup;
        const pos = parent
            .getRootDiagram(this)?.getIndentPosition(this.indent());
        if (pos) {
            this.setPosition({ x: pos, y: this.y() });
        }
    }

    registerEvents() {
        this.button.l.on("mousedown", (e) => {
            e.cancelBubble = true;
            if (e.evt.button !== 0) {
                return;
            }
            this.leftIndent();
        });

        this.button.r.on("mousedown", (e) => {
            e.cancelBubble = true;
            if (e.evt.button !== 0) {
                return;
            }
            this.rightIndent();
        });

        this.on("onstateactive", (e: OnStateEvent) => {
            e.diagram = [ this ];
            if (this.parent instanceof DiagramGroup
                && this.parent.nodes[0] !== this) {
                this.setActive();
                this.setBtnActive();
            }
        });

        this.on("onstateremove", () => {
            this.removeActive();
            this.removeBtnActive();
        });

        this.on("mouseup", (e) => {
            if (e.evt.button === 0) {
                this.fire("onstateselect", {
                    diagram: [ this ]
                }, true);
            }
        });

        this.on("textchanged", (e: any) => {
            console.log("textchanged", e);
        });

        this.on("dragend", (e) => {
            e.cancelBubble = true;
            // console.log("dragend");
            ( this.parent! as DiagramGroup ).detach(this);
            this.draggable(false);
        });
    }

    setPosition(pos: Konva.Vector2d): this {
        // set position of text and other elements
        super.setPosition(pos);
        // this.rect.setPosition({
        //     x: 0,
        //     y: 0
        // });
        // console.log("Diagram", this.rect.position(), this.rect.size());
        this.text.setPosition({
            x: this.rect.width() / 2,
            y: this.rect.height() / 2
        });
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

    setBtnActive() {
        const attrs = {
            l: {
                x: -30,
            },
            r: {
                x: this.rect.width() + 30,
            }
        };

        this.button.l.tween(attrs.l);
        this.button.r.tween(attrs.r);
    }

    removeBtnActive() {
        const attrs = {
            l: {
                x: this.rect.width() / 2
            },
            r: {
                x: this.rect.width() / 2
            }
        };

        this.button.l.tween(attrs.l);
        this.button.r.tween(attrs.r);
    }

    resize(size: {
        width?: number,
        height?: number
    }) {
        super.resize(size);
        if (size.width) {
            const t = this.text as TextBox;
            size.width -= t.padding() * 2;
            t.resize(size);
        }
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
