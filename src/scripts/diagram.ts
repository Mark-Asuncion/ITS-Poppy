import Konva from "konva";
import diagramBackground from "/assets/diagram-background.png";
import { Rect, RectConfig } from "konva/lib/shapes/Rect";
import { TextConfig } from "konva/lib/shapes/Text";
import { Group } from "konva/lib/Group";

const Theme = {
    Diagram: {
        cornerRadius: 5,
        stroke: "#6F6F6F",
        fill: "#F9F9F9",
        textPadding: 10,
        textBg: "#FFFFFF",
        textStroke: "#6F6F6F",
        fontSize: 16,
    }
};

class TextBox extends Group {
    text: Konva.Text;
    bg: Rect;
    constructor(textConfig: TextConfig) {
        super();

        this.text = new Konva.Text({
            padding: Theme.Diagram.textPadding,
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
        this.on("dblclick dbltap", (e) => {
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
            input.addEventListener("focusout", () => {
                this.text.text(input.value);
                input.remove();
                this.text.show();
            });
            input.addEventListener("keydown", (e) => {
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
    }

    handleClick() {
        this.on("pointerdown", (e) => {
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
        super({
            ...opts,
            draggable: true
        });
        this.handleDragEvent();
        this.handleSelect();
    }

    handleSelect() {
        this.on("pointerdown", () => {
            // console.log(e.target);
        });
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
            const parent = this.parent as Background;
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
        console.log("newnodes", this.nodes, this.children);
        let idx = 0;
        this.nodes = this.nodes.filter((v, i) => {
            if (v !== diagram) {
                return true;
            }
            idx = i - 1;
            return false;
        });
        console.log("newnodes", this.nodes, this.nodes.length);
        if (idx < this.nodes.length && idx >= 0) {
            const nodeRef = this.nodes[idx];
            if (nodeRef === null) {
                return;
            }
            const rectRef = nodeRef.getRect();
            const slice = this.nodes.slice(idx+1);
            if (slice === null) {
                return;
            }
            this.setNodesPosition(
                rectRef.x(),
                rectRef.y(),
                rectRef.height(),
                slice
            );
        }
        if (this.nodes.length === 0) {
            this.remove();
            this.destroy();
        }
    }

    setNodesPosition(x: number, y: number, height: number, nodes: Diagram[]) {
        let ypos = y + height;
        console.log("setpos[]", nodes, x, y);
        for (let i=0;i<nodes.length;i++) {
            const child = nodes[i];
            child.setPos(x, ypos);
            ypos += height;
        }
    }

    insert(index: number, other: DiagramGroup) {
        // TODO Fix
        const node = this.nodes[index].getRect();
        this.setNodesPosition(node.x(),node.y(),node.height()+1, other.nodes);
        if (index !== this.nodes.length - 1) {
            const otherNode = other.nodes[0].getRect();
            this.setNodesPosition(otherNode.x(), otherNode.y(), otherNode.height()+1, this.nodes.slice(index+1))
        }
        this.nodes.splice(index+1,0,...other.nodes);

        this.add(...other.nodes);
        // console.log("this.nodes",  this.nodes.length);
        // console.log("this.nodes", this.nodes);
    }

    isAttachedTo(other: DiagramGroup) {
        console.log(this.nodes);
        const { x, y } = this.nodes[0].getRect().getAbsolutePosition();
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

class Background extends Group {
    selecting: {
        isSelecting: boolean,
        rect: Rect | null
    } = {
        isSelecting: false,
        rect: null
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
        console.log("Bg", this.position());

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
                    this.selecting.rect = new Rect({
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

function createDiagramAt(position: { x: number, y:number }): DiagramGroup {
    const diagGroup = new DiagramGroup();
    const diagram = new Diagram(position);
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
            const bg = (stage.children[0].children[0] as Background)
            const pos = bg.getRelativePointerPosition()
            if (pos === null) {
                return;
            }
            const diagram = createDiagramAt(pos);
            bg.add(diagram);
        }
        else if (e.evt.button === 0 && e.evt.shiftKey) {

            console.log(e.target.parent instanceof Diagram);
            if (e.target.parent instanceof Diagram) {
                e.target.parent.removeNodeFromParent();
            }
        }
    })

    const layer = new Konva.Layer();
    const baseGroup = new Background({
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
