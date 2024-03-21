import Konva from "konva";
import { isPointIntersectRect } from "./utils";
import { BaseGroup, OnStateEvent } from "./basegroup";
import { AttachRect, BaseDiagram } from "./basediagram";
import { Module } from "../backendconnector";

export interface AttachedTo {
    v: DiagramGroup,
    i: number
};

export class DiagramGroup extends Konva.Group {
    nodes: BaseDiagram[] = [];
    constructor(opts: Konva.ContainerConfig = {}) {
        super({
            name: "DiagramGroup",
            draggable: true,
            ...opts
        });
        this.registerEvents();
    }

    registerEvents() {
        this.on("onstateremove", () => {
            this.nodes[0].removeActive();
            this.removeActive();
        });

        this.on("onstateactive", () => {
            this.setActive();
        });

        this.on("onstateselect", (e: OnStateEvent) => {
            e.diagramGroup = [ this ];
            if (e.diagram![0] === this.nodes[0]) {
                e.select = "diagramgroup";
            }
            else {
                e.diagram?.forEach((v) => v.draggable(true) );
            }
        });

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

    detach(diagrams: BaseDiagram | BaseDiagram[]) {
        if (Array.isArray(diagrams)) {
            console.assert(false, "detaching multiple diagrams NOT IMPLEMENTED");
            return;
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
                height: ref.height(),
                width: 0
            };
            this.setNodesRelativePosition(refPos, this.nodes.slice(idx+1));
        }
        diagrams.remove();
        diagrams.indent(0);

        const { x, y } = this.parent!.getRelativePointerPosition()!;
        // console.log(x, y, this.getRelativePointerPosition());
        const dg = new DiagramGroup({ x, y });
        diagrams.setPosition({ x: 0, y: 0 });
        dg.addDiagram(diagrams);
        // console.log(dg.name(), dg._id, dg.children);
        this.parent!.add(dg);
    }

    setNodesRelativePosition(startPos: AttachRect, nodes: BaseDiagram[]) {
        const { x, y, height } = startPos;
        let ypos = y + height;
        nodes.forEach((v) => {
            v.setPosition({x, y: ypos });
            ypos += height;
        })
    }

    attach(attachTo: AttachedTo) {
        const { v, i } = attachTo;
        const refNode = v.nodes[i];
        const otherNodes = this.nodes;
        const rectInfo = {
            x: refNode.x(),
            y: refNode.y(),
            width: 0,
            height: refNode.height()
        };
        v.setNodesRelativePosition(rectInfo, otherNodes);
        if (i !== v.nodes.length - 1) {
            const ref = otherNodes[otherNodes.length-1];
            rectInfo.x = ref.x();
            rectInfo.y = ref.y();
            rectInfo.height = ref.height();
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

    getRootDiagram(diagram: BaseDiagram) {
        if (diagram === this.nodes[0]) {
            return null;
        }

        // for (let i=0;i<this.nodes.length;i++) {
        //     if (this.nodes[i] === diagram) {
        //         return this.nodes[i-1];
        //     }
        // }
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
            content += v.getContent() + "\n";
        });

        return {
            name: this.name(),
            content
        };
    }
}
