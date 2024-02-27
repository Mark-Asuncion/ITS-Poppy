import Konva from "konva";
import diagramBackground from "/assets/diagram-background.png";

class Diagram extends Konva.Group {
    attachRect: Konva.Rect;
    constructor(pos: { x: number, y: number }) {
        super();
        const rect = new Konva.Rect({
            ...pos,
            width: 130,
            height: 70,
            fill: "#00",
            strokeEnabled: true,
            stroke: "#00ff00",
            strokeWidth: 1,
        })
        this.attachRect = new Konva.Rect({
            id: "attach",
            x: rect.x(),
            y: rect.y() + rect.height() / 2,
            width: 130,
            height: 70,
            fill: "white",
        });

        this.handleDragEvent();
        this.add(rect);
        // this.add(this.attachRect);
    }

    handleDragEvent() {
        this.on("dragstart", (e) => {
            e.cancelBubble = true;
        })
        this.on("dragmove", (e) => {
            e.cancelBubble = true;
            e.target.moveToTop();
        })
        this.on("dragend", (e) => {
            e.cancelBubble = true;
        })
    }

    getRect() {
        return this.children[0] as Konva.Rect;
    }

    setPos(x: number, y: number) {
        this.getRect().setPosition({
            x,
            y
        });
        this.attachRect.setPosition({
            x,
            y: y + this.children[0].height() / 2
        });
    }
}
// group of text rects dropdown etc
class DiagramGroup extends Konva.Group {
    nodes: Diagram[] = [];
    attachedTo: { v: DiagramGroup, i: number } | null = null;
    constructor(opts: Konva.ContainerConfig = {}) {
        super({
            ...opts,
            draggable: true
        });
        this.handleDragEvent();
    }

    handleDragEvent() {
        this.on("dragstart", (e) => {
            e.cancelBubble = true;
            console.log("target: ", (e.target as unknown as DiagramGroup).nodes);
        })
        this.on("dragmove", (e) => {
            // console.log("moving", this.children[0].getAbsolutePosition());
            e.cancelBubble = true;
            e.target.moveToTop();
            const parent = this.parent as CGroup;
            const children = parent.cGetChildren();
            for (let i=0;i<children.length;i++) {
                if (!( children[i] instanceof DiagramGroup ))
                    continue;
                if (children[i] === this)
                    continue;
                const child = children[i] as DiagramGroup;
                if (this.isAttachedTo(child))
                    break;
            }
        })
        this.on("dragend", (e) => {
            e.cancelBubble = true;
            this.tryAttach();
        })
    }

    insert(index: number, other: DiagramGroup) {
        function setPos(x: number, y: number, height: number, nodes: Diagram[]) {
            let ypos = y + height;
            for (let i=0;i<nodes.length;i++) {
                const child = nodes[i];
                child.setPos(x, ypos);
                ypos += height;
            }
        }
        const node = this.nodes[index]
            .children[0];
        setPos(node.x(),node.y(),node.height(), other.nodes.slice());
        if (index !== this.nodes.length - 1) {
            const otherNode = other.nodes[0].getRect();
            setPos(otherNode.x(), otherNode.y(), otherNode.height(), this.nodes.slice(index+1))
        }

        this.nodes.splice(index+1,0, ...other.nodes);
        for (const node in this.nodes) {
            console.log("insert", node, this.nodes[node].getRect().position());
        }
        this.add(...other.nodes);
    }

    isAttachedTo(other: DiagramGroup) {
        const { x, y } = this.nodes[0]
            .getRect().getAbsolutePosition();
        const len = other.nodes.length;
        for (let i=0;i<len;i++) {
            const orect = other.nodes[i].attachRect;
            const otherPos = orect.getAbsolutePosition();
            // console.log(x, y, otherPos.x, otherPos.y);
            if (x > otherPos.x && x < otherPos.x + orect.width()
                && y > otherPos.y && y < otherPos.y + orect.height()) {
                // console.log("attached to", orect);
                this.attachedTo = {
                    v: other,
                    i: i
                };
                return true;
            }
        }
        return false;
    }

    tryAttach() {
        if (this.attachedTo === null)
        return;
        this.attachedTo.v.insert(this.attachedTo.i, this);
        this.removeChildren();
        this.destroy();
        this.getLayer()?.draw();
        this.attachedTo = null;
    }

    addChild(v: Diagram) {
        super.add(v);
        this.nodes.push(v);
    }
}

class CGroup extends Konva.Group {
    constructor(opts: Konva.ContainerConfig, size: number = 5) {
        super(opts);

        const backgroundRect = new Konva.Rect({
            id: "background",
            x: 0,
            y: 0,
            width: this.width() * size,
            height: this.height() * size,
        });

        const im = new Image();
        im.onload = () => backgroundRect.fillPatternImage(im);
        im.src = diagramBackground;
        this.add(backgroundRect);

        this.on("mousedown", (e) => {
            if (e.evt.button === 1) {
                this.startDrag();
            }
        });

        this.on("dragmove", (e) => {
            // console.log("move");
            const maxLeftX = -(this.width() * size - this.width());
            const maxUpY = -(this.height() * size - this.height());
            e.target.x( Math.max( Math.min(0, e.target.x()), maxLeftX ) );
            e.target.y( Math.max( Math.min(0, e.target.y()), maxUpY ) );
        })
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

export function init() {
    const domContainer = document.querySelector("#diagram-container")!;
    const stage = new Konva.Stage({
        container: "diagram-container",
        width: domContainer.clientWidth,
        height: domContainer.clientHeight,
    });

    const layer = new Konva.Layer();
    const baseGroup = new CGroup({
        width: stage.width(),
        height: stage.height(),
        listening: true
    });

    const diagGroup = new DiagramGroup();
    const diagGroup2 = new DiagramGroup();
    const diagGroup3 = new DiagramGroup();
    const diagram = new Diagram({
        x: 70,
        y: 70
    });
    const diagram2 = new Diagram({
        x: 600,
        y: 70
    });

    diagGroup.addChild(diagram);
    diagGroup2.addChild(diagram2);
    diagGroup3.addChild(new Diagram({
        x: 800,
        y: 100
    }))

    baseGroup.add(diagGroup);
    baseGroup.add(diagGroup2);
    baseGroup.add(diagGroup3);
    layer.add(baseGroup);
    stage.add(layer);
}
