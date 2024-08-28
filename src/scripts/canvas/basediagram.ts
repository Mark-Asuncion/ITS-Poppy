import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { ContainerConfig } from "konva/lib/Container";
import { DiagramGroup } from "./diagramgroup";
import { ArrowButton } from "./button";
import { KonvaEventObject } from "konva/lib/Node";
import { Path } from "konva/lib/shapes/Path";
import { getSvgPathDimensions } from "./utils";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { TextChangedEvent } from "./basetext";
import { clipboard } from "@tauri-apps/api";
import { notifyPush } from "../notify";

type DiagramType = "normal" | "block" | "indent2" | "indent3" | "endblock";
export interface BaseDiagramConfig extends ContainerConfig {
    theme?: any,
    diagramType?: DiagramType,
}

export class BaseDiagram extends Group {
    minWidth: number;
    strokeDef: string;
    dgType: DiagramType = "normal";
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

    setActive(withDrag: boolean = true) {
        this.path.stroke(Theme.Diagram.Active.stroke);
        this.path.shadowEnabled(true);
        this.path.shadowColor("black");
        this.path.shadowBlur(5);
        if (withDrag) {
            this.draggable(true);
        }
    }

    removeActive() {
        this.path.stroke(this.strokeDef);
        this.path.shadowEnabled(false);
        this.draggable(false);
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
        let x = 0;
        let y = this.height() - 14;
        if (this.dgType == "block") {
            x = 19;
        }
        else if (this.dgType == "indent2") {
            x = 38;
        }
        else if (this.dgType == "indent3") {
            x = 57;
        }

        return { x, y };
    }

    setIndentByPrevLine(prev: BaseDiagram) {
        const prevType = prev.dgType;
        switch (prevType) {
            case "endblock":
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
                console.warn("SHOULD NEVER HAPPEN");
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
        return this;
    }

    // recalculates positions
    refresh() {}

    leftIndent() {
        this._indent--;
        if (this._indent < 0) {
            this._indent = 0;
        }
        const parent = this.parent! as DiagramGroup;
        const pos = parent
            .getRootDiagram()?.getIndentPosition(this._indent);
        console.log(parent.position(), this.position(), pos);
        if (pos != undefined) {
            this.setPosition({ x: pos, y: this.y() });
        }
        parent.refresh();
    }

    rightIndent() {
        this._indent++;
        const parent = this.parent! as DiagramGroup;
        const pos = parent
            .getRootDiagram()?.getIndentPosition(this._indent);
        if (pos != undefined) {
            this.setPosition({ x: pos, y: this.y() });
        }
        parent.refresh();
    }

    onContextMenu() {
        window.mContextMenu = [];
        window.mContextMenu.push({ name: "Copy Diagram",
            callback: () => {
                if (this.getContent().length != 0)
                clipboard.writeText(this.getContent());
            }
        });
        window.mContextMenu.push({
            name: "Delete",
            callback: () => {
                const parent = (this.parent! as DiagramGroup);
                parent.detach(this);
                parent.refresh();
                notifyPush("Deleted a Diagram", "info", 1000);
            }
        });
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

        this.on("OnStateSelect", (e: KonvaEventObject<any>) => {
            e.target = this as unknown as Shape<ShapeConfig>;
        });

        this.on("mouseup", (e) => {
            if (e.evt.button === 0) {
                this.fire("OnStateSelect", {}, true);
            }
            else if (e.evt.button === 2) {
                this.onContextMenu();
            }
        });

        this.on("TextChanged", (e: TextChangedEvent) => {
            e.cancelBubble = true;
            // console.log("textchanged", e);
        });


        this.on("dragstart", (e) => {
            e.cancelBubble = true;
            // this.fire("OnStateSelect", {}, true);
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

        // this.on("onstateactive", (e: OnStateEvent) => {
        //     e.diagram = [ this ];
        //     if (this.parent instanceof DiagramGroup
        //         && this.parent.nodes[0] !== this) {
        //         this.setActive();
        //         this.setBtnActive();
        //     }
        // });

        // this.on("onstateremove", () => {
        //     this.removeActive();
        //     this.removeBtnActive();
        // });
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

    getInputContent() {
        return "";
    }

    isBlock() {
        return this.dgType == "block" || this.dgType == "indent2" || this.dgType == "indent3";
    }
}
