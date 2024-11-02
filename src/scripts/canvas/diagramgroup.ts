import Konva from "konva";
import { createDiagramFrom, findNodeType, isPointIntersectRect } from "./utils";
import { BaseGroup } from "./basegroup";
import { BaseDiagram } from "./basediagram";
import { Module } from "../backendconnector";
import { Theme } from "../../themes/diagram";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { TextBox } from "./text/textbox";
import { BaseText, TextChangedEvent } from "./basetext";
import { Poppy } from "../../poppy/poppy";

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

        if (this.name() == "")
            this.setModuleName("main");

        this._moduleName = new TextBox({
            text: this.name(),
            x: 0,
            fontSize: Theme.Text.fontSize,
            padding: Theme.TextBox.padding,
            noBG: true,
            autoFill: false
        });


        this._moduleName.y(
            this._moduleName.y()
            - this._moduleName.height()
        );

        this.add(this._moduleName);
        this.registerEvents();
    }

    setModuleName(name: string) {
        // BUG: when name is changed from main -> main2 reverts back to main
        // even though there isn't main2
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
                this._moduleName.setColors();
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
            this.onDragEnd();
        })
    }

    onDragEnd() {
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
        diagrams.remove();
        this.refresh();

        const dg = new DiagramGroup();
        diagrams.setPosition({ x: 0, y: 0 });
        diagrams._indent = 0;
        console.log(diagrams, Date.now());
        dg.addDiagram(diagrams);
        return dg;
    }

    // repositions nodes and adjust widths
    refresh() {
        if (this.nodes.length === 0)
            return;
        let prev = this.nodes[0];
        prev.x(0);
        prev.y(0);
        prev._indent = 0;

        // console.log(prev._indent, prev.dgType);
        for (let i=1;i<this.nodes.length;i++) {
            const curr = this.nodes[i];
            const atP = prev.attachPoint();
            curr.setPosition({
                x: atP.x + prev.x(),
                y: prev.y() + atP.y
            });
            curr.setIndentByPrevNodes(this.nodes.slice(0, i));
            if (curr.dgType == "endblock") {
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
        if (Poppy.onDiagramDrop)
            Poppy.onDiagramDrop();
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
            const c = v.getContent();
            if (c.length === 0) {
                return;
            }
            content += c + "\n";
        });

        return {
            name: this.name(),
            content,
            position: [this.x(), this.y()]
        };
    }

    // REMOVE
    serialize(): string {
        let res = "";
        this.nodes.forEach((v) => {
            res += v.getContent();
        })
        return res;
    }

    static deserialize(data: Module): DiagramGroup | null {
        const dg = new DiagramGroup({
            name: data.name
        });
        if (data.content.length == 0) {
            return null;
        }

        let d = data.content
            .split('\r')
            .join()
            .split('\n');

        interface NodeInfo {
            text: string,
            tabCount: number,
            type: string,
        };

        let nodeInfos: NodeInfo[] = [];

        function countTabChars(line: string) {
            let count = 0;
            for (let i=0;i<line.length;i++) {
                if (line[i] == "\t") {
                    count++;
                }
                else {
                    break;
                }
            }
            return count;
        }

        for (let i=0;i<d.length;i++) {
            let prevNodeInfo: NodeInfo | null = null;
            if (nodeInfos.length > 0)
                 prevNodeInfo = nodeInfos[nodeInfos.length-1];

            let line = d[i];
            if (line.length == 0) {
                continue;
            }
            let tabCount = countTabChars(line);

            let nodeInfo: NodeInfo = {
                text: "",
                tabCount: tabCount,
                type: "",
            };

            nodeInfo.text = line.trim();
            nodeInfo.type = findNodeType(line);
            // console.log(nodeInfo, prevNodeInfo);

            if (prevNodeInfo && tabCount === prevNodeInfo.tabCount) {
                if (prevNodeInfo.type !== "statement" &&
                    prevNodeInfo.type !== "function") {
                    nodeInfos.push({
                        text: "",
                        tabCount: tabCount,
                        type: "endblock"
                    });
                }
            }
            else if (prevNodeInfo && tabCount < prevNodeInfo.tabCount) {
                // endblock
                let tbCount = prevNodeInfo.tabCount;
                while (tabCount < tbCount) {
                    nodeInfos.push({
                        text: "",
                        tabCount: tabCount,
                        type: "endblock"
                    });
                    tbCount--;
                }
            }
            else if (prevNodeInfo && tabCount > prevNodeInfo.tabCount) {
                let diff = Math.min(tabCount - prevNodeInfo.tabCount, 3);
                // console.log(diff);
                if (diff > 1 && prevNodeInfo.type !== "statement") {
                    nodeInfos.push({
                        text: "",
                        tabCount: tabCount,
                        type: `indent${diff-1}`
                    });
                }
                else if (diff >= 1 && prevNodeInfo.type === "statement") {
                    nodeInfos.push({
                        text: "",
                        tabCount: tabCount,
                        type: `indent${diff}`
                    });
                }
            }

            nodeInfos.push(nodeInfo);
        };

        for (let i=0;i<nodeInfos.length;i++) {
            const info = nodeInfos[i];
            dg.addDiagram(createDiagramFrom(info.type, info.text));
        }
        dg.refresh();
        return dg;
    }

    getNodeByLineN(linen: number): BaseDiagram | null {
        let curr_line = 0;
        for (let i=0;i<this.nodes.length;i++) {
            if (this.nodes[i].isNonPrintableBlock()) {
                continue;
            }
            curr_line++;
            if (linen == curr_line) {
                return this.nodes[i];
            }
        }
        return null;
    }

    highlightRemove() {
        let rect = this.getChildren((item) => item.name() == "highlight");
        rect.forEach((r) => {
            r.remove();
            r.destroy();
        });
    }

    highlight(opt: {x:number,y:number,width:number,height:number}) {
        let rect = new Konva.Rect({
            name: "highlight",
            ...opt,
            stroke: "red",
            strokeWidth: 2,
            fillEnabled: false
        });
        this.add(rect);
    }
    //
    // focus(n: number) {
    //     if (this.nodes.length == 0 || this.nodes[n] == undefined) {
    //         return;
    //     }
    //     const ch = this.nodes[n];
    //
    //     let chpos = {
    //         x: this.x() + ch.x(),
    //         y: this.y() + ch.y()
    //     };
    //
    //     const stage = this.getStage()!;
    //     const container = stage.container().getBoundingClientRect();
    //     const bg = window.mCvRootNode.node;
    //     const pos = {
    //         x: clamp( container.width * .5 - chpos.x, -bg.width(), bg.width() - container.width ),
    //         y: clamp( container.height * .5 - chpos.y, -bg.height(), bg.height() - container.height )
    //     };
    //
    //     // console.log("focus: ", pos);
    //     bg.setPosition(pos);
    //     bg.clamp();
    //
    // }
}
