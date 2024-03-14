import Konva from "konva";
import diagramBackground from "/assets/diagram-background.png";
import { Rect } from "konva/lib/shapes/Rect";
import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { Diagram, DiagramGroup } from "./diagram";

export class BaseGroup extends Group {
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

