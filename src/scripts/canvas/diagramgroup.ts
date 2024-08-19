import Konva from "konva";
import { isPointIntersectRect } from "./utils";
import { BaseGroup } from "./basegroup";
import { BaseDiagram } from "./basediagram";
import { Module } from "../backendconnector";
import { Statement } from "./blocks/statement";
import { If, Elif, Else } from "./blocks/control";
import { For } from "./blocks/loop";
import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { EndBlock } from "./blocks/endblock";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape, ShapeConfig } from "konva/lib/Shape";

export interface AttachTo {
    v: DiagramGroup,
    i: number
};

export class DiagramGroup extends Konva.Group {
    _textName: Text;
    nodes: BaseDiagram[] = [];
    constructor(opts: Konva.ContainerConfig = {}) {
        super({
            name: "main",
            draggable: true,
            ...opts
        });

        this._textName = new Text({
            text: this.name(),
            x: 0,
            fontSize: Theme.Text.fontSize,
            padding: Theme.TextBox.padding
        });
        this._textName.y(
            this._textName.y()
            - this._textName.height()
        );

        this.add(this._textName);
        this.registerEvents();
    }

    registerEvents() {
        this.on("OnStateSelect", (e: KonvaEventObject<any>) => {
            const p = this.nodes[0] as unknown as Shape<ShapeConfig>;
            if (e.target == p) {
                e.target = this as unknown as Shape<ShapeConfig>;
            }
        });

        this.on("dragstart", (e) => {
            e.cancelBubble = true;
            e.target.moveToTop();
            this.fire("OnStateSelect", {}, true);
        });

        this.on("dragmove", (e) => {
            e.cancelBubble = true;
        })

        // this.on("mousedown", (e) => {
        // });

        this.on("dragend", (e) => {
            e.cancelBubble = true;
            const children = ( this.parent as BaseGroup ).getDiagramGroups();
            for (let i=0;i<children.length;i++) {
                if (children[i] === this) {
                    continue;
                }
                const child = children[i];
                const attachedTo = this.canAttachTo(child);
                if (attachedTo) {
                    this.attach(attachedTo);
                    break;
                }
            }
        })
    }

    detach(diagrams: BaseDiagram | BaseDiagram[]): DiagramGroup | null {
        if (Array.isArray(diagrams)) {
            console.assert(false, "detaching multiple diagrams NOT IMPLEMENTED");
            return null;
        }
        // @ts-ignore
        let idx = -1;
        this.nodes = this.nodes.filter((v, i) => {
            if (v === diagrams) {
                idx = i - 1;
                return false;
            }
            return true;
        });
        this.refresh();
        diagrams.remove();

        const dg = new DiagramGroup();
        diagrams.setPosition({ x: 0, y: 0 });
        diagrams._indent = 0;
        dg.addDiagram(diagrams);
        return dg;
    }

    // repositions nodes and adjust widths
    refresh() {
        let prev = this.nodes[0];

        console.log(prev._indent, prev.dgType);
        for (let i=1;i<this.nodes.length;i++) {
            const curr = this.nodes[i];
            const atP = prev.attachPoint();
            curr.setPosition({
                x: atP.x + prev.x(),
                y: prev.y() + atP.y
            });
            curr.setIndentByPrevLine(prev);
            if (curr.dgType == "endblock") {
                let nx = 0;
                for (let j=i-1;j>=0;j--) {
                    if (this.nodes[j].isBlock()) {
                        nx = this.nodes[j].x();
                        curr._indent = this.nodes[j]._indent;
                        break;
                    }
                }
                curr.x(nx);

                curr.moveToTop();
            }
            curr.refresh();
            prev = curr;

            // console.log(curr._indent, curr.dgType);
        }
    }

    attach(attachTo: AttachTo) {
        const { v, i } = attachTo;
        const otherNodes = this.nodes;
        v.nodes.splice(i+1, 0, ...otherNodes);
        v.add(...otherNodes);
        v.refresh();
        this.remove();
        this.destroy();
    }

    canAttachTo(other: DiagramGroup): AttachTo | null {
        // console.log(this.nodes);
        const { x, y } = this.nodes[0].getAbsolutePosition();
        const len = other.nodes.length;
        for (let i=0;i<len;i++) {
            const oAttachRect = other.nodes[i].attachRectAbsolutePosition();
            // console.log("canAttachTo", { x, y}, oAttachRect,
            //     isPointIntersectRect({x,y}, oAttachRect) );
            if ( isPointIntersectRect({x,y}, oAttachRect) ) {
                const attachedTo = {
                    v: other,
                    i: i
                };
                // console.log("attachedTo", attachedTo);
                return attachedTo;
            }
        }
        return null;
    }

    addDiagram(child: BaseDiagram) {
        this.add(child);
        this.nodes.push(child);
    }

    // unused
    removeDiagram(i: number) {
        const node = this.nodes[i];
        this.nodes = this.nodes.filter((v) => {
            return v !== node;
        });
        node.remove();
        node.destroy();
    }

    getRootDiagram() {
        return this.nodes[0];
    }

    setActive() {
        this.nodes.forEach((v) => {
            v.setActive(false);
        });
    }

    removeActive() {
        this.nodes.forEach((v) => {
            v.removeActive();
        });
    }

    getContent(): Module {
        let content = "";
        this.nodes.forEach((v) => {
            if (v.dgType == "endblock")
                return;
            const c = v.getContent();
            content += c + "\n";
        });

        return {
            name: this.name(),
            content,
            position: [this.x(), this.y()]
        };
    }

    serialize(): string {
        let res = "";
        this.nodes.forEach((v) => {
            res += v.getContent();
        })
        return res;
    }

    static _BDDeserialize(data: string, lastBlock: BaseDiagram | null): BaseDiagram | null {
        if (data.length == 0 || data.trim().length == 0) {
            return null;
        }

        let indent = 0;
        for (let i=0;i<data.length;i++) {
            if (data[i] == '\t') {
                indent++;
            }
        }

        if (lastBlock && (indent <= lastBlock._indent)) {
            const eb = new EndBlock();
            eb._indent = lastBlock._indent;
            return eb;
        }
        // check if indent is more than lastblock
        // if true then use indent2 or 3
        // if more than lastblock._indent + 3
        // then clamp indent to lastblock._indent + 3

        let dStr = "";
        let dg: BaseDiagram;
        let d = data.trim().split(' ');
        if (d[0] == "if") {
            dStr = d.join(' ');
            dStr = dStr.replace(/if|:/g,'').trim();
            dg = new If(dStr);
            dg._indent = indent;
            return dg;
        }
        else if (d[0] == "elif") {
            dStr = d.join(' ');
            dStr = dStr.replace(/elif|:/g,'').trim();
            dg = new Elif(dStr);
            dg._indent = indent;
            return dg;
    }
        else if (d[0] == "else" || d[0] == "else:") {
            dg = new Else();
            dg._indent = indent;
            return dg;
        }
        else if (d[0] == "for") {
            dStr = d.join(' ');
            dStr = dStr.replace(/for|in\s|:/g,'').trim();
            dg = new For(dStr);
            dg._indent = indent;
            return dg;
            }
        else {
            dg = new Statement(data.trim());
            dg._indent = indent;
            return dg;
        }
    }

    static deserialize(data: Module): DiagramGroup {
        const dg = new DiagramGroup({
            name: data.name
        });
        let d = data.content
            .split('\r')
            .join()
            .split('\n');

        let lastblock: null | BaseDiagram = null;
        for (let i=0;i<d.length;i++) {
            const v = d[i];
            const bd = this._BDDeserialize(v, lastblock);
            if (bd) {
                dg.addDiagram(bd);

                if (bd.isBlock()) {
                    lastblock = bd;
                }
                if (bd.dgType == "endblock") {
                    lastblock = null;
                    i--;
                }
            }
        };
        dg.refresh();
        return dg;
    }
}
