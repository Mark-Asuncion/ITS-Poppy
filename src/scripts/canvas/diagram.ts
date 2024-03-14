import Konva from "konva";
import { Rect, RectConfig } from "konva/lib/shapes/Rect";
import { TextConfig } from "konva/lib/shapes/Text";
import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { TextBox } from "./textbox";
import { isPointIntersectRect } from "./utils";
import { BaseGroup } from "./basegroup";

export class Diagram extends Group {
    attachRect: Rect;
    indent: number = 0;
    constructor(rectConfig: RectConfig = {}, textConfig: TextConfig = {}) {
        super();
        const rect = new Rect({
            width: 180,
            height: 80,
            fill: Theme.Diagram.fill,
            stroke: Theme.Diagram.stroke,
            cornerRadius: Theme.Diagram.cornerRadius,
            strokeWidth: 1,
            ...rectConfig
        })

        const textPos = {
            x: rect.x() + rect.width() / 2,
            y: rect.y() + rect.height() / 2
        };
        const text = new TextBox({
            text: "Hello World",
            fontSize: Theme.Diagram.fontSize,
            width: rect.width() - 20,
            fill: "#00",
            ...textPos,
            ...textConfig
        });

        this.attachRect = new Rect({
            id: "attach",
            x: rect.x(),
            y: rect.y() + rect.height() / 2,
            width: 130,
            height: rect.height() / 2,
            // fill: "white",
        });

        this.add(rect);
        this.add(text);
        this.add(this.attachRect);
        this.handleClick();
        this.on("textchanged", (e: any) => {
            console.log("textchanged", e);
        });
    }

    handleClick() {
        this.getRect().on("mousedown", (e) => {
            console.log("Show Arrow Button", e.target);
        });
    }

    getRect() {
        return this.children[0] as Rect;
    }

    getText() {
        return this.children[1] as TextBox;
    }

    removeNodeFromParent() {
        if(this.parent instanceof DiagramGroup) {
            this.parent.removeNode(this);
        }
        this.remove();
        this.destroy();
    }

    removeNode() {
        this.remove();
        this.destroy();
    }

    setPos(x: number, y: number) {
        // set position of text and other elements
        this.getRect().setPosition({
            x,
            y
        });
        console.log("Diagram", this.getRect().position(), this.getRect().size());
        this.getText().setPosition({
            x: x + this.getRect().width() / 2,
            y: y + this.getRect().height() / 2
        });
        this.attachRect.setPosition({
            x,
            y: y + this.getRect().height() / 2
        });
    }
}
// group of text rects dropdown etc
export class DiagramGroup extends Konva.Group {
    nodes: Diagram[] = [];
    attachedTo: { v: DiagramGroup, i: number } | null = null;
    constructor(opts: Konva.ContainerConfig = {}) {
        super(opts);
        this.handleDragEvent();
        this.handleSelect();
    }

    handleSelect() {
        this.on("mouseup", () => {
            this.stopDrag();
        });

        this.on("mousedown", (e) => {
            function intersectNode(mousePos: { x: number, y: number }, diagram: Diagram[]) {
                for (let i=0;i<diagram.length;i++) {
                    const nodeR = diagram[i].getRect();
                    const rect = {
                        x: nodeR.getAbsolutePosition().x,
                        y: nodeR.getAbsolutePosition().y,
                        width: nodeR.width(),
                        height: nodeR.height()
                    };
                    if ( isPointIntersectRect(mousePos, rect) ) {
                        return diagram[i];
                    }
                }
                return null;
            }
            const mousePos = { x: e.evt.x, y: e.evt.y };
            if (e.evt.button === 0){
                const node = intersectNode(mousePos, this.nodes);
                const append = e.evt.shiftKey;
                if (node == null) {
                    this.fire("stateactivenode", {
                        diagramGroup: this,
                        append
                    }, true);
                    return;
                }
                if (node === this.nodes[0] && !append) {
                    this.startDrag();
                }
                this.fire("stateactivenode", {
                    diagramGroup: this,
                    diagram: node,
                    append
                }, true);
            }
        });
    }

    detachNodes(diagrams: Diagram[]) {
        let idxDiagrams = 0;
        const included: Diagram[] = [];
        let delRangeS = -1;
        for (let i=0;i<this.nodes.length;i++) {
            if (this.nodes[i] === diagrams[idxDiagrams]) {
                if (delRangeS === -1) {
                    delRangeS = i;
                }
                included.push(this.nodes[i]);
            }
            else {
                if (included.length !== 0) {
                    break;
                }
            }
            idxDiagrams++;
        }
        // let idx = 0;
        // this.nodes = this.nodes.filter((v, i) => {
        //     if (v !== diagram) {
        //         return true;
        //     }
        //     idx = i - 1;
        //     return false;
        // });
        // if (idx < this.nodes.length && idx >= 0) {
        //     const nodeRef = this.nodes[idx];
        //     const slice = this.nodes.slice(idx+1);
        //     if (nodeRef != null && slice != null) {
        //         const rectRef = nodeRef.getRect();
        //         this.setNodesRelativePosition(
        //             rectRef.x(),
        //             rectRef.y(),
        //             rectRef.height(),
        //             slice
        //         );
        //     }
        // }
        // diagram.remove();
        // if (this.parent != null) {
        //     const dg = new DiagramGroup();
        //     const on = this.parent.getRelativePointerPosition();
        //     if (on == null) {
        //         return;
        //     }
        //     diagram.setPos(on.x, on.y);
        //     dg.addDiagram(diagram);
        //     console.log("detach:parent", this.parent);
        //     this.parent.add(dg);
        // }
    }

    handleDragEvent() {
        function tryAttach(ctx: DiagramGroup) {
            if (ctx.attachedTo === null) {
                return;
            }
            ctx.attachedTo.v.insert(ctx.attachedTo.i, ctx);
            ctx.removeChildren();
            ctx.attachedTo = null;
            ctx.destroy();
        }

        this.on("dragstart", (e) => {
            e.cancelBubble = true;
            e.target.moveToTop();
            // console.log("target: ", (e.target as unknown as DiagramGroup).nodes);
        })
        this.on("dragmove", (e) => {
            // console.log("moving", this.children[0].getAbsolutePosition());
            e.cancelBubble = true;
        })
        this.on("dragend", (e) => {
            e.cancelBubble = true;
            const parent = this.parent as BaseGroup;
            const children = parent.cGetChildren();
            for (let i=0;i<children.length;i++) {
                if (!( children[i] instanceof DiagramGroup ))
                continue;
                if (children[i] === this)
                continue;
                const child = children[i] as DiagramGroup;
                if (this.isAttachedTo(child)) {
                    tryAttach(this);
                    break;
                }
            }
        })
    }

    removeNode(diagram: Diagram) {
        // console.log("newnodes", this.nodes, this.children);
        let idx = 0;
        this.nodes = this.nodes.filter((v, i) => {
            if (v !== diagram) {
                return true;
            }
            idx = i - 1;
            return false;
        });
        // console.log("newnodes", this.nodes, this.nodes.length);
        if (idx < this.nodes.length && idx >= 0) {
            const nodeRef = this.nodes[idx];
            const slice = this.nodes.slice(idx+1);
            if (nodeRef != null && slice != null) {
                const rectRef = nodeRef.getRect();
                this.setNodesRelativePosition(
                    rectRef.x(),
                    rectRef.y(),
                    rectRef.height(),
                    slice
                );
            }
        }
        if (this.nodes.length === 0) {
            this.remove();
            this.destroy();
        }
    }

    setNodesRelativePosition(x: number, y: number, height: number, nodes: Diagram[]) {
        let ypos = y + height;
        // console.log("setpos[]", nodes, x, y);
        for (let i=0;i<nodes.length;i++) {
            const child = nodes[i];
            child.setPos(x, ypos);
            ypos += height;
        }
    }

    insert(index: number, other: DiagramGroup) {
        const node = this.nodes[index].getRect();
        this.setNodesRelativePosition(node.x(),node.y(),node.height()+1, other.nodes);
        if (index !== this.nodes.length - 1) {
            const otherNode = other.nodes[ other.nodes.length-1 ].getRect();
            this.setNodesRelativePosition(otherNode.x(), otherNode.y(), otherNode.height()+1, this.nodes.slice(index+1))
        }
        this.nodes.splice(index+1,0,...other.nodes);

        this.add(...other.nodes);
        // console.log("this.nodes",  this.nodes.length);
        // console.log("this.nodes", this.nodes);
    }

    isAttachedTo(other: DiagramGroup) {
        // console.log(this.nodes);
        const { x, y } = this.nodes[0].getRect().getAbsolutePosition();
        const len = other.nodes.length;
        for (let i=0;i<len;i++) {
            const orect = other.nodes[i].attachRect;
            const otherPos = orect.getAbsolutePosition();
            // console.log(x, y, otherPos.x, otherPos.y);
            const r = {
                x: otherPos.x,
                y: otherPos.y,
                width: orect.width(),
                height: orect. height()
            };
            if ( isPointIntersectRect({x,y}, r) ) {
                this.attachedTo = {
                    v: other,
                    i: i
                };
                console.log("attachedTo", this.attachedTo);
                return true;
            }
        }
        return false;
    }

    addDiagram(child: Diagram): this {
        this.add(child);
        this.nodes.push(child);
        return this;
    }
}

