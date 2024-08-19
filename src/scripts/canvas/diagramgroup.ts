import Konva from "konva";
import { isPointIntersectRect } from "./utils";
import { BaseGroup } from "./basegroup";
import { BaseDiagram } from "./basediagram";
import { Module } from "../backendconnector";
import { Statement } from "./blocks/statement";
import { If, Elif, Else } from "./blocks/control";
import { For } from "./blocks/loop";
import { Theme } from "../../themes/diagram";
import { EndBlock } from "./blocks/endblock";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { TextBox } from "./text/textbox";
import { BaseText, TextChangedEvent } from "./basetext";

export interface AttachTo {
    v: DiagramGroup,
    i: number
};

export class DiagramGroup extends Konva.Group {
    _moduleName: BaseText;
    nodes: BaseDiagram[] = [];
    constructor(opts: Konva.ContainerConfig = {}) {
        super({
            name: "",
            draggable: true,
            ...opts
        });

        this.setModuleName("main");

        this._moduleName = new TextBox({
            text: this.name(),
            x: 0,
            fontSize: Theme.Text.fontSize,
            padding: Theme.TextBox.padding,
            noBG: true
        });


        this._moduleName.y(
            this._moduleName.y()
            - this._moduleName.height()
        );

        this.add(this._moduleName);
        this.registerEvents();
    }

    setModuleName(name: string) {
        let nodes = window.mCvRootNode.getDiagramGroups();
        let m = {};
        let ascii0 = '0'.charCodeAt(0);
        let ascii9 = '9'.charCodeAt(0);

        for (let i=0;i<nodes.length;i++) {
            if (nodes[i] == this)
                continue;

            let n = nodes[i].name();

            let substrEnd = 0;
            for (let ni=n.length-1;ni>=0;ni--) {
                if (n.charCodeAt(ni) < ascii0 || n.charCodeAt(ni) > ascii9) {
                    substrEnd = ni;
                    break;
                }
            }

            // console.log(`${n} ${nodes[i]._moduleName.text!.text()}`);
            // store both then name without number at the end and with
            // the map
            if (substrEnd > 0 && substrEnd < n.length-1) {
                let substr = n.substring(0,substrEnd+1);
                // console.log(substr);
                if (m[substr]) {
                    m[substr]++;
                }
                else {
                    m[substr] = 1;
                }
            }

            if (m[n]) {
                m[n]++;
            }
            else {
                m[n] = 1;
            }
        }

        for (let ni=name.length-1;ni>=0;ni--) {
            if (name.charCodeAt(ni) < ascii0 || name.charCodeAt(ni) > ascii9) {
                name = name.substring(0, ni+1);
                break;
            }
        }
        // console.log(m, m[name]);
        const n = `${name}${( m[name] == 0 || m[name] == undefined)? "":m[name]}`;
        // console.log(n);
        this.name(n);
    }

    registerEvents() {
        this.on("TextChanged", (e: TextChangedEvent) => {
            if (e.value) {
                this.setModuleName(e.value.trim());
                this._moduleName.text!.text(this.name());
                this._moduleName.adjustWidth(this.name());
                console.log(`${this.name()} ${this._moduleName.text!.text()}`);
            }
        });

        this.on("OnStateSelect", (e: KonvaEventObject<any>) => {
            const p = this.nodes[0] as unknown as Shape<ShapeConfig>;
            if (e.target == p || e.target instanceof BaseText) {
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

        // console.log(prev._indent, prev.dgType);
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
