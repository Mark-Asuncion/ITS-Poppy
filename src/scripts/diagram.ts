import Konva from "konva";
import diagramBackground from "/assets/diagram-background.png";
import { Rect, RectConfig } from "konva/lib/shapes/Rect";
import { TextConfig } from "konva/lib/shapes/Text";
import { Group } from "konva/lib/Group";
import { Theme } from "../themes/diagram";

function isPointIntersectRect(
    point: { x: number, y: number },
    rect: { x: number, y: number, width: number, height: number }
) {
    return point.x > rect.x && point.x < ( rect.x + rect.width )
        && point.y > rect.y && point.y < ( rect.y + rect.height );
}

class TextBox extends Group {
    text: Konva.Text;
    bg: Rect;
    constructor(textConfig: TextConfig) {
        super();

        this.text = new Konva.Text({
            padding: Theme.Diagram.textPadding,
            wrap: "none",
            ...textConfig
        });

        this.text.x(this.text.x() - (this.text.width() / 2));
        this.text.y(this.text.y() - (this.text.height() / 2));
        this.text.height(this.text.fontSize() + this.text.padding())

        this.bg = new Rect({
            cornerRadius: Theme.Diagram.cornerRadius,
            fill: Theme.Diagram.textBg,
            stroke: Theme.Diagram.textStroke,
            strokeWidth: 1,
            x: this.text.x(),
            y: this.text.y(),
            width: this.text.width(),
            height: this.text.height() + this.text.padding(),
        });
        this.handleEdit();
        this.add(this.bg);
        this.add(this.text);
    }

    handleEdit() {
        // TODO: Change to click instead
        this.on("mousedown", (e) => {
            e.cancelBubble = true;
            this.text.hide();
            const input = document.createElement("textarea");
            input.classList.add("canvas-edit");
            input.style.left = `${ this.text.getAbsolutePosition().x + this.text.padding() }px`;
            input.style.top = `${ this.text.getAbsolutePosition().y + this.text.padding() }px`;
            input.style.width = `${ this.text.width() }px`;
            input.style.height = `${ this.text.height() }px`;
            input.style.fontSize = `${ this.text.fontSize() }px`;
            input.style.lineHeight = `${ this.text.lineHeight() }`;
            input.style.fontFamily = `${ this.text.fontFamily() }`;
            input.style.textAlign = `${ this.text.align() }`;
            input.style.color = `${ this.text.fill() }`;
            input.value = this.text.text();
            const ref = this;
            input.addEventListener("focusin", () => {
                input.addEventListener("focusout", () => {
                    ref.text.text(input.value);
                    input.remove();
                    ref.text.show();
                    ref.fire("texteditdone", {}, true);
                });
            })
            input.addEventListener("keydown", (e) => {
                if (e.key == "Enter") {
                    input.blur();
                }
                else if (e.key == "Escape") {
                    // FIX: don't update content
                    input.remove();
                }
                // ref.fire("textchanged", { value: input.value },true);
                ref.fire("textedit", {}, true);
            });
            document.body.appendChild(input);
            // tmp
            setTimeout(() => input.focus(), 300);
        });
    }

    setPosition(pos: Konva.Vector2d): this {
        console.log("TextBox", this.text.position(),this.text.size());
        const posX = pos.x - (this.text.width() / 2);
        const posY = (pos.y - (this.text.height() / 2))
                    - (this.text.padding() / 2);
        this.text.x(posX);
        this.text.y(posY);
        console.log("TextBox", this.text.position(),this.text.size());
        this.bg.setPosition({
            x: posX,
            y: posY
        });
        return this;
    }

    getContent() {
        return this.text.text();
    }
}

class Diagram extends Group {
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
class DiagramGroup extends Konva.Group {
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

class BaseGroup extends Group {
    selecting: {
        isSelecting: boolean,
        rect: Rect | null
    } = {
        isSelecting: false,
        rect: null
    };
    activeNode: {
        diagramGroup: DiagramGroup[],
        diagram: Diagram[],
        clear: () => void,
        empty: () => boolean
    } = {
        diagramGroup: [],
        diagram: [],
        clear: function() {
            this.diagram = [];
            this.diagramGroup = [];
        },
        empty: function() {
            return ( this.diagram.length + this.diagram.length ) === 0;
        }
    };
    constructor(opts: Konva.ContainerConfig, size: number = 5) {
        super(opts);

        const backgroundRect = new Rect({
            id: "background",
            width: this.width() * size,
            height: this.height() * size,
        });
        const { width, height } = backgroundRect.size();
        this.setPosition({
            x: -( width / 2 ),
            y: -( height / 2)
        });

        const im = new Image();
        im.onload = () => backgroundRect.fillPatternImage(im);
        im.src = diagramBackground;
        this.add(backgroundRect);

        this.on("dragmove", (e) => {
            // console.log("move");
            const maxLeftX = -(this.width() * size - this.width());
            const maxUpY = -(this.height() * size - this.height());
            e.target.x( Math.max( Math.min(0, e.target.x()), maxLeftX ) );
            e.target.y( Math.max( Math.min(0, e.target.y()), maxUpY ) );
        })
        this.selection();
    }

    selection() {
        this.on("stateactivenode", (e: any) => {
            if (e.append) {
                let append = true;
                if (e.diagramGroup != null) {
                    this.activeNode.diagramGroup.forEach((v) => {
                        if (v === e.diagramGroup) {
                            append = false;
                        }
                    });
                    if (append) {
                        this.activeNode.diagramGroup.push(e.diagramGroup);
                    }
                }
                append = true;
                if (e.diagram != null) {
                    this.activeNode.diagram.forEach((v) => {
                        if (v === e.diagram) {
                            append = false;
                        }
                    });
                    if (append) {
                        this.activeNode.diagram.push(e.diagram);
                    }
                }
            }
            else {
                if (e.diagramGroup != null) {
                    this.activeNode.diagramGroup = [e.diagramGroup];
                }
                if (e.diagram != null) {
                    this.activeNode.diagram = [e.diagram];
                }
            }
            console.log("changed active node", this.activeNode);
        });

        this.on("mousedown", (e) => {
            if (e.evt.button === 1) {
                this.startDrag();
            }
            if (e.target !== this.children[0]) {
                return;
            }
            this.activeNode.clear();
            if (e.evt.button === 0) {
                this.selecting.isSelecting = true
                const stPos = this.getRelativePointerPosition();
                if (stPos === null) {
                    this.selecting.isSelecting = false;
                    return;
                }
                // console.log("down", this.selecting);
                if (this.selecting.rect === null) {
                    this.selecting.rect = new Rect({
                        id: "selector",
                        x: stPos.x,
                        y: stPos.y,
                        width: 0,
                        height: 0,
                        ...Theme.Selection
                    });
                }
                else {
                    this.selecting.rect.x(stPos.x);
                    this.selecting.rect.y(stPos.y);
                    this.selecting.rect.width(0);
                    this.selecting.rect.height(0);
                }
                this.add(this.selecting.rect);
            }
        });
        this.on("mousemove", (e) => {
            if (this.selecting.isSelecting && this.selecting.rect !== null) {
                const cPos = this.getRelativePointerPosition();
                if (cPos === null) {
                    this.selecting.isSelecting = false;
                    return;
                }
                const diffx =  cPos.x - this.selecting.rect.x();
                const diffy =  cPos.y - this.selecting.rect.y();
                this.selecting.rect.width(diffx);
                this.selecting.rect.height(diffy);
            }

            // detaching logic
            if (e.evt.button === 0 && !this.activeNode.empty()) {
                // take the first diagramGroup and detach nodes in the diagram[]
                // do not include nodes that are not next to each other
                // for example
                // 1 -> 2 -> 5 -> 6
                // 1 and 2 will be included but 5 and 6 will not
                this.activeNode.diagramGroup[0].detachNodes(this.activeNode.diagram);
            }

        });
        this.on("mouseup", (_) => {
            if (this.selecting.isSelecting) {
                this.selecting.isSelecting = false
                this.selecting.rect?.remove();
                // console.log("up", this.selecting);
                // TODO select inside box and transform them
            }
        });
    }

    cGetChildren() {
        let ret: any[] = [];
        for (let i = 0; i<this.children.length;i++) {
            if (this.children[i].id() === "background")
            continue;
            ret.push(this.children[i]);
        }
        return ret;
    }
}

function createDiagramAt(rect: RectConfig): DiagramGroup {
    const diagGroup = new DiagramGroup();
    const diagram = new Diagram(rect);
    diagGroup.addDiagram(diagram);
    return diagGroup;
}

export function init() {
    const domContainer = document.querySelector("#diagram-container")!;
    const stage = new Konva.Stage({
        container: "diagram-container",
        width: domContainer.clientWidth,
        height: domContainer.clientHeight,
    });

    stage.on("mousedown", (e) => {
        if (e.evt.button === 0 && e.evt.ctrlKey) {
            const bg = (stage.children[0].children[0] as BaseGroup)
            const pos = bg.getRelativePointerPosition()
            if (pos === null) {
                return;
            }
            const diagram = createDiagramAt(pos);
            bg.add(diagram);
        }
        else if (e.evt.button === 0 && e.evt.shiftKey && e.evt.ctrlKey) {

            console.log(e.target.parent instanceof Diagram);
            if (e.target.parent instanceof Diagram) {
                e.target.parent.removeNodeFromParent();
            }
        }
    })

    const layer = new Konva.Layer();
    const baseGroup = new BaseGroup({
        width: stage.width(),
        height: stage.height(),
    });

    const diagGroup = new DiagramGroup();
    const diagGroup2 = new DiagramGroup();
    const diagGroup3 = new DiagramGroup();
    const diagram = new Diagram({
        x: 70,
        y: 70,
    });
    const diagram2 = new Diagram( {
        x: 600,
        y: 70,
    });

    diagGroup.addDiagram(diagram);
    diagGroup2.addDiagram(diagram2);
    diagGroup3.addDiagram(new Diagram({
        x: 800,
        y: 100
    }))

    baseGroup.add(diagGroup);
    baseGroup.add(diagGroup2);
    baseGroup.add(diagGroup3);
    layer.add(baseGroup);
    stage.add(layer);
}
