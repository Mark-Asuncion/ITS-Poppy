import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { ContainerConfig } from "konva/lib/Container";
import { DiagramGroup } from "./diagramgroup";
import { KonvaEventObject } from "konva/lib/Node";
import { Path } from "konva/lib/shapes/Path";
import { getSvgPathDimensions } from "./utils";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { BaseText, TextChangedEvent, TextKeyUpEvent } from "./basetext";
import { clipboard } from "@tauri-apps/api";
import { notifyPush } from "../notify";
import { Text } from "konva/lib/shapes/Text";

export type DiagramType = "normal" | "block" | "indent0" | "indent1" | "indent2" | "indent3" | "endblock";
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
    _indent: number = 0;
    _nsep = 5;
    components: (BaseText | Text)[] = []

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

        this.dgType = ( type )? type:"normal";
        if (type == undefined || type == "normal") {
            this.dgSVG = Theme.SVG.Normal;
        }
        else if (type == "indent0") {
            this.dgSVG = Theme.SVG.Indent0;
        }
        else if (type == "indent1") {
            this.dgSVG = Theme.SVG.Indent1;
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
        // this.path.stroke(Theme.Diagram.Active.stroke);
        this.path.shadowEnabled(true);
        this.path.shadowColor("black");
        this.path.shadowBlur(5);
        if (withDrag) {
            this.draggable(true);
        }
    }

    removeActive() {
        // this.path.stroke(this.strokeDef);
        this.path.shadowEnabled(false);
        this.draggable(false);
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
        if (this.dgType == "block" || this.dgType == "indent1") {
            x = 19;
        }
        else if (this.dgType == "indent2") {
            x = 38;
        }
        else if (this.dgType == "indent3") {
            x = 59;
        }

        return { x, y };
    }

    setIndentByPrevNodes(nodes: BaseDiagram[]) {
        if (nodes.length === 0) {
            return;
        }

        if (this.dgType !== "endblock") {
            const prev = nodes[nodes.length-1];
            const prevType = prev.dgType;
            switch (prevType) {
                case "endblock":
                case "indent0":
                case "normal":
                    this._indent = prev._indent;
                    break;
                case "indent1":
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
        else {
            let seenEB = 0;
            for (let i=nodes.length-1;i>=0;i--) {
                if (nodes[i].dgType === "endblock") {
                    seenEB++;
                }

                if (nodes[i].isBlock()) {
                    this.x(nodes[i].x());
                    this._indent = nodes[i]._indent;
                    if (seenEB == 0)
                        break;
                    seenEB--;
                }
            }
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
    refresh() {
        const type = this.dgType;
        if (type == "endblock" || type == "indent0" || type == "indent1" || type == "indent2" || type == "indent3") {
            const p = (this.parent! as DiagramGroup);
            let maxWidth = 0;
            for (let i=0;i<p.nodes.length; i++) {
                let v = p.nodes[i];
                if (v == this)
                break;
                maxWidth = Math.max(maxWidth, v.x() + v.width() - this.x());
            }

            this.setSize({ width: maxWidth });
        }
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
                if (parent.nodes.length === 0) {
                    parent.remove();
                    parent.destroy();
                }
                notifyPush("Deleted a Diagram", "info", 1000);
            }
        });
    }

    onKeyUp(e: TextKeyUpEvent) {
        if (e.key !== "Tab") {
            return;
        }

        const parent = this.parent! as DiagramGroup;
        const index = this.getIndexPos();
        console.assert(index !== -1);
        if (index === 0) {
            notifyPush("First Line Cannot Be Indented", "info", 3000);
            return;
        }

        const prevNode = parent.nodes[index-1];
        let node: BaseDiagram | null = null;

        if (!e.shiftKey) {
            switch (prevNode.dgType) {
                case "endblock":
                    prevNode.swapSVG("indent1");
                    parent.refresh();
                    break;
                case "normal":
                    node = new BaseDiagram({
                        theme: Theme.Diagram.Statement,
                        diagramType: "indent1"
                    });
                    break;
                case "block":
                    node = new BaseDiagram({
                        theme: Theme.Diagram.Statement,
                        diagramType: "indent1"
                    });
                    break;
                case "indent0":
                    prevNode.swapSVG("indent1");
                    parent.refresh();
                    break;
                case "indent1":
                    prevNode.swapSVG("indent2");
                    parent.refresh();
                    break;
                case "indent2":
                    prevNode.swapSVG("indent3");
                    parent.refresh();
                    break;
                case "indent3":
                    break;
                default:
                    console.warn("Should Not Happen");
                    break;
            }
            if (!node) {
                return;
            }

            parent.nodes.splice(index,0, node);
            parent.add(node);
            parent.refresh();
        }
        else if (e.shiftKey) {
            switch (prevNode.dgType) {
                case "endblock":
                case "normal":
                    break;
                case "block":
                    node = new BaseDiagram({
                        theme: Theme.Diagram.Statement,
                        diagramType: "endblock"
                    });
                    break;
                case "indent0":
                    prevNode.swapSVG("endblock");
                    parent.refresh();
                    break;
                case "indent1":
                    prevNode.swapSVG("indent0");
                    parent.refresh();
                    break;
                case "indent2":
                    prevNode.swapSVG("indent1");
                    parent.refresh();
                    break;
                case "indent3":
                    prevNode.swapSVG("indent2");
                    parent.refresh();
                    break;
                default:
                    console.warn("Should Not Happen");
                    break;
            }
            if (!node) {
                return;
            }

            parent.nodes.splice(index,0, node);
            parent.add(node);
            parent.refresh();
        }
    }

    onTextChanged(e: TextChangedEvent) { e }

    registerEvents() {
        this.on("KeyUp", (e: TextKeyUpEvent) => {
            e.cancelBubble = true;
            this.onKeyUp(e);
        });

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
            this.onTextChanged(e);
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

    }

    getContent() {
        return "";
    }

    getInputContent() {
        return "";
    }

    isBlock() {
        return this.dgType == "block" || this.dgType == "indent1" || this.dgType == "indent2" || this.dgType == "indent3";
    }

    getIndexPos() {
        const parent = this.parent as DiagramGroup
        for (let i=0;i<parent.nodes.length;i++) {
            if (parent.nodes[i] === this) {
                return i;
            }
        }
        return -1;
    }

    focus() {
        for (let i=0;i<this.components.length;i++) {
            if (this.components[i] instanceof BaseText) {
                (this.components[i] as BaseText).focus();
                break;
            }
        }
    }

    removeFocus() {
        for (let i=0;i<this.components.length;i++) {
            if (this.components[i] instanceof BaseText) {
                (this.components[i] as BaseText).removeFocus();
                break;
            }
        }
    }

    swapSVG(type: DiagramType) {
        let width = this.width();
        this.dgType = type;
        switch (type) {
            case "normal":
                this.dgSVG = Theme.SVG.Normal;
                break;
            case "block":
                this.dgSVG = Theme.SVG.Block;
                break;
            case "indent0":
                this.dgSVG = Theme.SVG.Indent0;
                break;
            case "indent1":
                this.dgSVG = Theme.SVG.Indent1;
                break;
            case "indent2":
                this.dgSVG = Theme.SVG.Indent2;
                break;
            case "indent3":
                this.dgSVG = Theme.SVG.Indent3;
                break;
            case "endblock":
                this.dgSVG = Theme.SVG.EndBlock;
                break;
            default:
                console.warn("Should Not Happen");
                break;
        }

        this.path.data(`${this.dgSVG.prefix}${this.dgSVG.hr}${this.dgSVG.suffix}`);
        this.setSize({ width });

        const dimension = getSvgPathDimensions(`${this.dgSVG.prefix}${this.dgSVG.hr}${this.dgSVG.suffix}`);
        this.height(dimension.height);
    }

}
