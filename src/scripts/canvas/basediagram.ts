import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { ContainerConfig } from "konva/lib/Container";
import { DiagramGroup } from "./diagramgroup";
import { ArrowButton } from "./button";
import { OnStateEvent } from "./basegroup";
import { KonvaEventObject } from "konva/lib/Node";
import { Path } from "konva/lib/shapes/Path";
import { getSvgPathDimensions } from "./utils";

export interface OnResizeEvent extends KonvaEventObject<any> {
    size?: {
        width?: number,
        height?: number
    }
};

export interface BaseDiagramConfig extends ContainerConfig {
    theme?: any,
    diagramType?: "normal" | "block" | "indent2" | "indent3" | "endblock"
}

export class BaseDiagram extends Group {
    minWidth: number;
    strokeDef: string;
    dgType: "normal" | "block" | "indent2" | "indent3" | "endblock" = "normal";
    dgSVG: {
        prefix: string,
        hr: number,
        suffix: string
    };
    path: Path;
    button: {
        l: ArrowButton,
        r: ArrowButton
    };
    _indent: number = 0;
    _nsep = 5;

    constructor(config: BaseDiagramConfig) {
        let theme = config.theme;
        let type = config.diagramType;

        if (theme == undefined) {
            theme = {};
        }

        delete config.theme;
        delete config.diagramType;

        super(config);

        this.minWidth = (config.width)? config.width:Theme.BaseDiagram.width;

        this.button = {
            l: new ArrowButton({
                x: this.width() / 2,
                y: this.height() / 2,
                direction: "left"
            }),
            r: new ArrowButton({
                x: this.width() / 2,
                y: this.height() / 2
            })
        };

        this.dgType = ( type )? type:"normal";
        if (type == undefined || type == "normal") {
            this.dgSVG = Theme.SVG.Normal;
        }
        else if (type == "indent2") {
            this.dgSVG = Theme.SVG.Indent2;
        }
        else if (type == "indent3") {
            this.dgSVG = Theme.SVG.Indent3;
        }
        else if (type == "block") {
            this.dgSVG = Theme.SVG.Block;
        }
        else {
            this.dgSVG = Theme.SVG.EndBlock;
        }

        let dimension = getSvgPathDimensions(`${this.dgSVG.prefix}${this.dgSVG.hr}${this.dgSVG.suffix}`);
        let adj = this.minWidth - dimension.width;
        this.dgSVG.hr += adj;
        dimension = getSvgPathDimensions(`${this.dgSVG.prefix}${this.dgSVG.hr}${this.dgSVG.suffix}`);

        this.width(dimension.width);
        this.height(dimension.height);

        this.path = new Path({
            data : `${this.dgSVG.prefix}${this.dgSVG.hr}${this.dgSVG.suffix}`,
            strokeWidth: Theme.BaseDiagram.strokeWidth,
            ...theme
        });
        this.strokeDef = theme.stroke;

        // this.add(this.button.l);
        // this.add(this.button.r);
        this.add(this.path);

        this.registerEvents();
    }

    setActive() {
        this.path.stroke(this.strokeDef);
    }

    removeActive() {
        this.path.stroke(Theme.Diagram.Statement.stroke);
    }

    setBtnActive() {
        const attrs = {
            l: {
                x: -30,
            },
            r: {
                x: this.width() + 30,
            }
        };

        this.button.l.tween(attrs.l);
        this.button.r.tween(attrs.r);
    }

    removeBtnActive() {
        const attrs = {
            l: {
                x: this.width() / 2
            },
            r: {
                x: this.width() / 2
            }
        };

        this.button.l.tween(attrs.l);
        this.button.r.tween(attrs.r);
    }

    attachRectAbsolutePosition():
    { x: number, y: number, width: number, height: number } {
        const { x, y } = this.getAbsolutePosition();
        if (this.dgType == "endblock") {
            return {
                x, y, width: this.width(), height: this.height()
            };
        }

        return {
            x,
            y: y + this.height() / 2,
            width: this.width(),
            height: this.height() / 2
        };
    }

    attachPoint(): { x: number, y: number } {
        if (this.dgType == "block") {
            return {
                x: 19,
                y: this.height() - 14
            };
        }
        else if (this.dgType == "indent2") {
            return {
                x: 38,
                y: this.height() - 14
            };
        }
        else if (this.dgType == "indent3") {
            return {
                x: 57,
                y: this.height() - 14
            };
        }
        return {
            x: 0,
            y: this.height() - 14
        };
    }

    setIndentByPrevLine(prev: BaseDiagram) {
        const prevType = prev.dgType;
        switch (prevType) {
            case "normal":
                this._indent = prev._indent;
                break;
            case "block":
                this._indent = prev._indent + 1;
                break;
            case "indent2":
                this._indent = prev._indent + 2;
                break;
            case "indent3":
                this._indent = prev._indent + 3;
                break;
            default:
                this._indent = 0;
                break;
        }
    }

    setSize(size: {
        width?: number, height?: number
    }): this {
        let dimension = getSvgPathDimensions(`${this.dgSVG.prefix}${this.dgSVG.hr}${this.dgSVG.suffix}`);
        if (size.width) {
            this.width(size.width);
            let adj = size.width - dimension.width;
            this.dgSVG.hr += adj;
            this.path.data(`${this.dgSVG.prefix}${this.dgSVG.hr}${this.dgSVG.suffix}`);
        }
        if (size.height) {
            console.warn("setting height is not supported");
            // this.height(size.height);
            // dont really care for height at the moment
            // I dont think height resizability will be needed
        }
        // this.fire("onstateactive", {}, true);
        return this;
    }

    // recalculates positions
    refresh() {}

    indent(v?: number): number {
        if (v != undefined) {
            this._indent = v;
        }
        return this._indent;
    }

    leftIndent() {
        this.indent(-1);
        const parent = this.parent! as DiagramGroup;
        const pos = parent
            .getRootDiagram()?.getIndentPosition(this.indent());
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
            .getRootDiagram()?.getIndentPosition(this.indent());
        if (pos != undefined) {
            this.setPosition({ x: pos, y: this.y() });
        }
        parent.setNodesRelativePosition();
    }

    registerEvents() {
        // this.button.l.on("mousedown", (e) => {
        //     e.cancelBubble = true;
        //     if (e.evt.button !== 0) {
        //         return;
        //     }
        //     this.leftIndent();
        // });
        //
        // this.button.r.on("mousedown", (e) => {
        //     e.cancelBubble = true;
        //     if (e.evt.button !== 0) {
        //         return;
        //     }
        //     this.rightIndent();
        // });

        this.on("mouseup", (e) => {
            if (e.evt.button === 0) {
                this.fire("onstateselect", {
                    diagram: [ this ],
                    delete: e.evt.shiftKey
                }, true);
            }
        });

        this.on("textchanged", (_: any) => {
            // console.log("textchanged", e);
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
        const l = this.width() / this._nsep;
        if (level * ( l + 1 ) > this.width()) {
            this.setSize({
                width: this.width() + l
            });
            this._nsep++;
        }
        return  this.x() + level * l;
    }

    getContent() {
        return "";
    }
}
