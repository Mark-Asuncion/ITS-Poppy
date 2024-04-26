import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { ContainerConfig } from "konva/lib/Container";
import { Rect, RectConfig } from "konva/lib/shapes/Rect";
import { DiagramGroup } from "./diagramgroup";
import { ArrowButton } from "./button";
import { OnStateEvent } from "./basegroup";
import { KonvaEventObject } from "konva/lib/Node";

export interface OnResizeEvent extends KonvaEventObject<any> {
    size?: {
        width?: number,
        height?: number
    }
};

export interface BaseDiagramConfig extends ContainerConfig {
    theme?: any,
    rect?: RectConfig
}

export interface AttachRect {
    x: number,
    y: number,
    width: number,
    height: number
};

export class BaseDiagram extends Group {
    rect: Rect;
    _indent: number = 0;
    button: {
        l: ArrowButton,
        r: ArrowButton
    };
    _nsep = 5;
    constructor(config: BaseDiagramConfig) {
        let rectConfig = config.rect;
        if (rectConfig == undefined) {
            rectConfig = {};
        }
        let theme = config.theme;
        if (theme == undefined) {
            theme = {};
        }

        delete config.theme;
        delete config.rect;
        super(config);

        this.rect = new Rect({
            width: this.width(),
            height: this.height(),
            ...Theme.BaseDiagram,
            ...theme,
            ...rectConfig,
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
        this.add(this.rect);
        // this.button.l.moveToBottom();
        // this.button.r.moveToBottom();
        this.registerEvents();
    }
    setActive() {
        this.rect.stroke(Theme.Diagram.Active.stroke);
    }
    removeActive() {
        this.rect.stroke(Theme.Diagram.Statement.stroke);
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
    attachRect(): AttachRect {
        return  {
            x: 0, y: 0, width: 0, height: 0
        }
    }
    attachRectAbsolutePosition(): AttachRect{
        return  {
            x: 0, y: 0, width: 0, height: 0
        }
    }

    setSize(size: any): this {
        if (size.width) {
            this.width(size.width);
            this.rect.width(size.width);
        }
        if (size.height) {
            this.height(size.height);
            this.rect.height(size.height);
        }
        this.fire("onstateactive", {}, true);
        return this;
    }

    resize(size: {
        width?: number, height?: number
    }) {
        this.setSize(size);
    }

    indent(v?: number): number {
        if (v != undefined) {
            if (v === 0) {
                this._indent = 0;
            }
            else {
                this._indent += v;
            }
        }
        this._indent = (this._indent < 0)? 0:this._indent;
        return this._indent;
    }

    leftIndent() {
        this.indent(-1);
        const parent = this.parent! as DiagramGroup;
        const pos = parent
            .getRootDiagram(this)?.getIndentPosition(this.indent());
        console.log(parent.position(), this.position(), pos);
        if (pos != undefined) {
            this.setPosition({ x: pos, y: this.y() });
        }
        parent.setNodesRelativePosition();
    }

    rightIndent() {
        this.indent(1);
        const parent = this.parent! as DiagramGroup;
        const pos = parent
            .getRootDiagram(this)?.getIndentPosition(this.indent());
        if (pos != undefined) {
            this.setPosition({ x: pos, y: this.y() });
        }
        parent.setNodesRelativePosition();
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


        this.on("dragstart", (e) => {
            e.cancelBubble = true;
            this.fire("onstateselect", {
                diagram: [ this ]
            }, true);
        });

        this.on("dragend", (e) => {
            e.cancelBubble = true;
            // console.log("dragend");
            const parent = this.parent! as DiagramGroup;
            const relPoinPos = this.getRelativePointerPosition()!;
            const dg = parent.detach(this);
            const at = parent.parent!.getRelativePointerPosition();
            if (at && dg) {
                dg.setPosition({
                    x: at.x - relPoinPos.x,
                    y: at.y - relPoinPos.y,
                });
                parent.parent!.add(dg);
                this.draggable(false);
            }
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
    }

    getIndentPosition(level: number): number {
        if (level === 0) {
            return this.x();
        }
        const l = this.rect.width() / this._nsep;
        if (level * ( l + 1 ) > this.width()) {
            this.resize({
                width: this.width() + l
            });
            this._nsep++;
        }
        return  this.x() + level * l;
    }

    getContent() {
        return "";
    }

    static deserialize(_data: string): BaseDiagram {
        return new BaseDiagram({});
    }
}
