import Konva from "konva";
import { Rect, RectConfig } from "konva/lib/shapes/Rect";
import { TextConfig } from "konva/lib/shapes/Text";
import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { TextBox } from "./textbox";
import { isPointIntersectRect } from "./utils";
import { BaseGroup, OnStateEvent } from "./basegroup";

interface AttachRect {
    x: number,
    y: number,
    width: number,
    height: number
};

interface AttachedTo {
    v: DiagramGroup,
    i: number
};

export class Diagram extends Group {
    rect: Rect;
    text: TextBox;
    indent: number = 0;
    constructor(rectConfig: RectConfig = {}, textConfig: TextConfig = {}) {
        super({
            name: "Diagram",
            // draggable: true,
            x: rectConfig.x,
            y: rectConfig.y
        });
        delete rectConfig.x;
        delete rectConfig.y;

        this.rect = new Rect({
            width: 180,
            height: 80,
            fill: Theme.Diagram.fill,
            stroke: Theme.Diagram.stroke,
            cornerRadius: Theme.Diagram.cornerRadius,
            strokeWidth: 1,
            ...rectConfig
        })

        const textPos = {
            x: this.rect.x() + this.rect.width() / 2,
            y: this.rect.y() + this.rect.height() / 2
        };
        this.text = new TextBox({
            text: "Hello World",
            fontSize: Theme.Diagram.fontSize,
            width: this.rect.width() - 20,
            fill: "#00",
            ...textPos,
            ...textConfig
        });

        this.add(this.rect);
        this.add(this.text);
        this.registerEvents();
    }

    registerEvents() {
        this.on("onstateactive", (e: OnStateEvent) => {
            e.diagram = [ this ];
        });

        this.on("mouseup", (e) => {
            // TODO
            // console.log("Show Arrow Button", e.target);
            if (e.evt.button === 0) {
                this.fire("onstateactive", {
                    diagram: [ this ],
                    // for now there is only single select
                    // append: e.evt.shiftKey
                }, true);
            }
        });

        this.on("textchanged", (e: any) => {
            console.log("textchanged", e);
        });

        this.on("dragend", (e) => {
            e.cancelBubble = true;
            console.log("dragend");
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

    getWidth() {
        return this.rect.width();
    }

    getHeight() {
        return this.rect.height();
    }

}

export class DiagramGroup extends Konva.Group {
    nodes: Diagram[] = [];
    // attachedTo: { v: DiagramGroup, i: number } | null = null;
    constructor(opts: Konva.ContainerConfig = {}) {
        super({
            name: "DiagramGroup",
            draggable: true,
            ...opts
        });
        this.registerEvents();
    }

    registerEvents() {
        this.on("onstateactive", (e: OnStateEvent) => {
            e.diagramGroup = [ this ];
            if (e.diagram![0] === this.nodes[0]) {
                e.select = "diagramgroup";
            }
            else {
                e.diagram?.forEach((v) => v.draggable(true) );
            }
        });

        // this.on("mouseup", () => {
        //     this.stopDrag();
        // });

        // this.on("mousedown", (e) => {
        //     function intersectNode(mousePos: { x: number, y: number }, diagram: Diagram[]) {
        //         for (let i=0;i<diagram.length;i++) {
        //             const nodeR = diagram[i].getRect();
        //             const rect = {
        //                 x: nodeR.getAbsolutePosition().x,
        //                 y: nodeR.getAbsolutePosition().y,
        //                 width: nodeR.width(),
        //                 height: nodeR.height()
        //             };
        //             if ( isPointIntersectRect(mousePos, rect) ) {
        //                 return diagram[i];
        //             }
        //         }
        //         return null;
        //     }
        //     const mousePos = { x: e.evt.x, y: e.evt.y };
        //     if (e.evt.button === 0){
        //         const node = intersectNode(mousePos, this.nodes);
        //         const append = e.evt.shiftKey;
        //         if (node == null) {
        //             this.fire("stateactivenode", {
        //                 diagramGroup: this,
        //                 append
        //             }, true);
        //             return;
        //         }
        //         if (node === this.nodes[0] && !append) {
        //             this.startDrag();
        //         }
        //         this.fire("stateactivenode", {
        //             diagramGroup: this,
        //             diagram: node,
        //             append
        //         }, true);
        //     }
        // });

        this.on("dragstart", (e) => {
            e.cancelBubble = true;
            e.target.moveToTop();
        })
        this.on("dragmove", (e) => {
            e.cancelBubble = true;
            // console.log(e.target.name(), e.target.position());
            // console.log(this.name(), this.position());
            // console.log(e.target.name(), e.target._id);
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

    detach(diagrams: Diagram | Diagram[]) {
        if (Array.isArray(diagrams)) {
            console.assert(false, "detaching multiple diagrams NOT IMPLEMENT");
            return;
            // let idxDiagrams = 0;
            // const included: Diagram[] = [];
            // let delRangeS = -1;
            // for (let i=0;i<this.nodes.length;i++) {
            //     if (this.nodes[i] === diagrams[idxDiagrams]) {
            //         if (delRangeS === -1) {
            //             delRangeS = i;
            //         }
            //         included.push(this.nodes[i]);
            //     }
            //     else {
            //         if (included.length !== 0) {
            //             break;
            //         }
            //     }
            //     idxDiagrams++;
            // }
        }
        let idx = -1;
        this.nodes = this.nodes.filter((v, i) => {
            if (v === diagrams) {
                idx = i - 1;
                return false;
            }
            return true;
        });
        if (idx <= this.nodes.length - 1) {
            const ref = this.nodes[idx];
            const refPos = {
                x: ref.x(),
                y: ref.y(),
                height: ref.getHeight(),
                width: 0
            };
            this.setNodesRelativePosition(refPos, this.nodes.slice(idx+1));
        }
        diagrams.remove();

        const { x, y } = diagrams.position();
        // console.log(x, y, this.getRelativePointerPosition());
        const dg = new DiagramGroup({ x, y });
        diagrams.setPosition({ x: 0, y: 0 });
        dg.addDiagram(diagrams);
        // console.log(dg.name(), dg._id, dg.children);
        this.parent!.add(dg);
    }

    // removeNode(diagram: Diagram) {
    //     // console.log("newnodes", this.nodes, this.children);
    //     let idx = 0;
    //     this.nodes = this.nodes.filter((v, i) => {
    //         if (v !== diagram) {
    //             return true;
    //         }
    //         idx = i - 1;
    //         return false;
    //     });
    //     // console.log("newnodes", this.nodes, this.nodes.length);
    //     if (idx < this.nodes.length && idx >= 0) {
    //         const nodeRef = this.nodes[idx];
    //         const slice = this.nodes.slice(idx+1);
    //         if (nodeRef != null && slice != null) {
    //             const rInfo = {
    //                 x: nodeRef.x(),
    //                 y: nodeRef.y(),
    //                 width: 0,
    //                 height: nodeRef.getHeight(),
    //             }
    //             this.setNodesRelativePosition(rInfo, slice);
    //         }
    //     }
    //     if (this.nodes.length === 0) {
    //         this.remove();
    //         this.destroy();
    //     }
    // }

    setNodesRelativePosition(startPos: AttachRect, nodes: Diagram[]) {
        const { x, y, height } = startPos;
        let ypos = y + height;
        nodes.forEach((v) => {
            v.setPosition({x, y: ypos });
            ypos += height;
        })
        // for (let i=0;i<nodes.length;i++) {
        //     const child = nodes[i];
        //     child.setPosition({x, y: ypos});
        //     ypos += height;
        // }
    }

    attach(attachTo: AttachedTo) {
        const { v, i } = attachTo;
        const refNode = v.nodes[i];
        const otherNodes = this.nodes;
        const rectInfo = {
            x: refNode.x(),
            y: refNode.y(),
            width: 0,
            height: refNode.getHeight()
        };
        v.setNodesRelativePosition(rectInfo, otherNodes);
        if (i !== v.nodes.length - 1) {
            const ref = otherNodes[otherNodes.length-1];
            rectInfo.x = ref.x();
            rectInfo.y = ref.y();
            rectInfo.height = ref.getHeight();
            v.setNodesRelativePosition(rectInfo, v.nodes.slice(i+1));
        }
        v.nodes.splice(i+1, 0, ...otherNodes);
        v.add(...otherNodes);

        this.fire("onstateremove", {
            diagramGroup: [ this ],
        }, true);
        this.remove();
        this.destroy();
    }

    canAttachTo(other: DiagramGroup): AttachedTo | null {
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

    addDiagram(child: Diagram) {
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
}
