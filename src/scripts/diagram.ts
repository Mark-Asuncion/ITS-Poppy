import Konva from "konva";
import diagramBackground from "/assets/diagram-background.png";
import { RectConfig } from "konva/lib/shapes/Rect";
import { TextConfig } from "konva/lib/shapes/Text";

class CText extends Konva.Text {
    constructor(textConfig: TextConfig) {
       super(textConfig);
        this.handleEdit();
    }
    handleEdit() {
        this.on("dblclick", () => {
            const input = document.createElement("textarea");
            input.classList.add("canvas-edit");
            input.style.left = `${ this.getAbsolutePosition().x }px`;
            input.style.top = `${ this.getAbsolutePosition().y }px`;
            input.style.width = `${ this.width() }px`;
            input.style.height = `${ this.height() }px`;
            input.style.fontSize = `${ this.fontSize() }px`;
            input.style.height = `${ this.height() - this.padding() * 2 + 5 }px`;
            input.style.fontSize = `${ this.fontSize() }px`;
            input.style.lineHeight = `${ this.lineHeight() }`;
            input.style.fontFamily = `${ this.fontFamily() }`;
            input.style.textAlign = `${ this.align() }`;
            input.style.color = `${ this.fill() }`;
            input.value = this.text();
            this.hide();
            input.addEventListener("focusout", () => {
                this.text(input.value);
                input.remove();
                this.show();
            });
            input.addEventListener("keyup", (e) => {
                e.preventDefault();
                if (e.key == "Enter") {
                    input.blur();
                }
                else if (e.key == "Escape") {
                    input.remove();
                }
            });
            document.body.appendChild(input);
            input.focus();
        });
    }
}

class Diagram extends Konva.Group {
    attachRect: Konva.Rect;
    constructor(rectConfig: RectConfig = {}) {
        super();
        const rect = new Konva.Rect({
            width: 130,
            height: 70,
            fill: "#00",
            ...rectConfig,
            strokeEnabled: true,
            stroke: "#00ff00",
            strokeWidth: 1,
        })
        const text = new CText({
            text: "Hello World",
            fontSize: 20,
            width: rect.width() - 20,
            fill: "#00",
            x: rectConfig.x || 0,
            y: rectConfig.y || 0
        });

        this.attachRect = new Konva.Rect({
            id: "attach",
            x: rect.x(),
            y: rect.y() + rect.height() / 2,
            width: 130,
            height: rect.height() / 2,
            // fill: "white",
        });

        // this.handleDragEvent();
        this.add(rect);
        this.add(text);
        this.add(this.attachRect);
    }

    // handleDragEvent() {
    //     this.on("dragstart", (e) => {
    //         e.cancelBubble = true;
    //     })
    //     this.on("dragmove", (e) => {
    //         e.cancelBubble = true;
    //         e.target.moveToTop();
    //     })
    //     this.on("dragend", (e) => {
    //         e.cancelBubble = true;
    //     })
    // }

    getRect() {
        return this.children[0] as Konva.Rect;
    }

    getText() {
        return this.children[1] as CText;
    }

    setPos(x: number, y: number) {
        // set position of text and other elements
        this.getRect().setPosition({
            x,
            y
        });
        this.getText().setPosition({
            x,
            y
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
        super({
            ...opts,
            draggable: true
        });
        this.handleDragEvent();
        this.handleSelect();
    }

    handleSelect() {
        this.on("pointerdown", (e) => {
            console.log(e.target);
        });
    }

    handleDragEvent() {
        function tryAttach(ctx: DiagramGroup) {
            if (ctx.attachedTo === null) {
                return;
            }
            ctx.attachedTo.v.insert(ctx.attachedTo.i, ctx);
            ctx.removeChildren();
            ctx.destroy();
            ctx.getLayer()?.draw();
            ctx.attachedTo = null;
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
            const parent = this.parent as CGroup;
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

    addChild(v: Diagram) {
        super.add(v);
        this.nodes.push(v);
    }
}

class CGroup extends Konva.Group {
    selecting: {
        isSelecting: boolean,
        rect: Konva.Rect | null
    } = {
        isSelecting: false,
        rect: null
    };
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
        this.selection();
    }

    selection() {
        this.on("pointerdown", (e) => {
            if (e.target !== this.children[0]) {
                return;
            }
            if (e.evt.button === 0) {
                this.selecting.isSelecting = true
                const stPos = this.getRelativePointerPosition();
                if (stPos === null) {
                    this.selecting.isSelecting = false;
                    return;
                }
                // console.log("down", this.selecting);
                if (this.selecting.rect === null) {
                    this.selecting.rect = new Konva.Rect({
                        id: "selector",
                        x: stPos.x,
                        y: stPos.y,
                        fill: "#6388eb",
                        stroke: "#1A4BCC",
                        strokeWidth: 1,
                        opacity: .5,
                        width: 0,
                        height: 0
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
        this.on("pointermove", (_) => {
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
        });
        this.on("pointerup", (_) => {
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
        y: 70,
        fill: "white"
    });
    const diagram2 = new Diagram( {
        x: 600,
        y: 70,
        fill: "green"
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
