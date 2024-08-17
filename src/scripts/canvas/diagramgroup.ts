import Konva from "konva";
import { isPointIntersectRect } from "./utils";
import { BaseGroup, OnStateEvent } from "./basegroup";
import { BaseDiagram } from "./basediagram";
import { Module } from "../backendconnector";
import { Statement } from "./blocks/statement";
import { If, Elif, Else } from "./blocks/control";
import { For } from "./blocks/loop";
import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { EndBlock } from "./blocks/endblock";

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
        this.on("onstateremove", () => {
            this.removeActive();
        });

        this.on("onstateactive", () => {
            this.setActive();
        });

        this.on("onstateselect", (e: OnStateEvent) => {
            e.diagramGroup = [ this ];
            if (e.diagram && e.diagram[0] === this.nodes[0]) {
                e.select = "diagramgroup";
            }
            else {
                e.diagram?.forEach((v) => v.draggable(true) );
            }
        });

        this.on("dragstart", (e) => {
            e.cancelBubble = true;
            e.target.moveToTop();
            this.fire("onstateselect", {
                diagramGroup: [ this ],
                select: "diagramgroup"
            }, true);
        });

        this.on("dragmove", (e) => {
            e.cancelBubble = true;
        })

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
        this.setNodesRelativePosition();
        diagrams.remove();

        const dg = new DiagramGroup();
        diagrams.setPosition({ x: 0, y: 0 });
        diagrams.indent(0);
        dg.addDiagram(diagrams);
        return dg;
    }

    setNodesRelativePosition() {
        let prev = this.nodes[0];

        for (let i=1;i<this.nodes.length;i++) {
            const curr = this.nodes[i];
            const atP = prev.attachPoint();
            curr.setPosition({
                x: atP.x + prev.x(),
                y: prev.y() + atP.y
            });
            curr.setIndentByPrevLine(prev);
            if (curr.dgType == "endblock") {
                curr.x(0);
                curr.moveToTop();
            }
            prev = curr;
        }
    }

    attach(attachTo: AttachTo) {
        const { v, i } = attachTo;
        const otherNodes = this.nodes;
        v.nodes.splice(i+1, 0, ...otherNodes);
        v.add(...otherNodes);
        v.setNodesRelativePosition();

        this.fire("onstateremove", {
            diagramGroup: [ this ],
        }, true);
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
            v.setActive();
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
            const c = v.getContent();
            if (c.length == 0) 
                return;
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

    static _BDDeserialize(data: string, prev: BaseDiagram | null): BaseDiagram | null {
        if (data.length == 0 || data.trim().length == 0) {
            return null;
        }

        let indent = 0;
        for (let i=0;i<data.length;i++) {
            if (data[i] == '\t') {
                indent++;
            }
        }

        if (prev && (prev._indent != 0 && indent == 0)) {
            return new EndBlock();
        }

        let dStr = "";
        let dg: BaseDiagram;
        let d = data.trim().split(' ');
        if (d[0] == "if") {
            dStr = d.join(' ');
            dStr = dStr.replace(/if|:/g,'').trim();
            dg = new If(dStr);
            dg.indent(indent);
            return dg;
        }
        else if (d[0] == "elif") {
            dStr = d.join(' ');
            dStr = dStr.replace(/elif|:/g,'').trim();
            dg = new Elif(dStr);
            dg.indent(indent);
            return dg;
    }
        else if (d[0] == "else" || d[0] == "else:") {
            dg = new Else();
            dg.indent(indent);
            return dg;
        }
        else if (d[0] == "for") {
            dStr = d.join(' ');
            dStr = dStr.replace(/for|in\s|:/g,'').trim();
            dg = new For(dStr);
            dg.indent(indent);
            return dg;
            }
        else {
            dg = new Statement(data.trim());
            dg.indent(indent);
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

        let prev: null | BaseDiagram = null;
        for (let i=0;i<d.length;i++) {
            const v = d[i];
            const bd = this._BDDeserialize(v, prev);
            if (bd) {
                dg.addDiagram(bd);
                prev = bd;
                if (bd.dgType == "endblock") {
                    i--;
                }
            }
        };
        dg.setNodesRelativePosition();
        return dg;
    }
}
