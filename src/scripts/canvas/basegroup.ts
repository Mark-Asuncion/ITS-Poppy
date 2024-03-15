import Konva from "konva";
import diagramBackground from "/assets/diagram-background.png";
import { Rect } from "konva/lib/shapes/Rect";
import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { Diagram, DiagramGroup } from "./diagram";
import { KonvaEventObject } from "konva/lib/Node";
import { Transformer } from "konva/lib/shapes/Transformer";

export interface OnStateEvent extends KonvaEventObject<any> {
    diagram?: Diagram[],
    diagramGroup?: DiagramGroup[],
    append?: boolean,
    select?: "diagram" | "diagramgroup",

};

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
            this.diagram.forEach((v) => v.fire("onstartactivestop", {}, true));
            this.diagram = [];
            this.diagramGroup = [];
        },
        empty: function() {
            return ( this.diagram.length + this.diagram.length ) === 0;
        }
    };
    transformer: Transformer;
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

        this.registerEvents();

        this.transformer = new Transformer(Theme.Transformer);
        this.add(this.transformer);
    }

    registerEvents() {
        this.on("onstateremove", (e: OnStateEvent) => {
            console.log("onstateremove", e);
            if (e.diagramGroup && e.diagramGroup?.length >= 1) {
                const nNodes = this.transformer.nodes().filter((v) => {
                    console.log("tryremove");
                    return v !== e.diagramGroup![0]
                });
                this.transformer.nodes(nNodes);
            }
        });

        this.on("onstateactive", (e: OnStateEvent) => {
            this.transformer.moveToTop();
            if (e.select === "diagramgroup" && e.diagramGroup) {
                // handle append
                if (e.append) {
                    e.diagramGroup?.forEach((v) =>
                        this.transformer.nodes([ ...this.transformer.nodes(),
                            v])
                    );
                }
                else {
                    this.transformer.nodes(e.diagramGroup);
                }
            }
            else {
                if (e.append && e.diagram) {
                    this.transformer.nodes([ ...this.transformer.nodes(), ...e.diagram ]);
                }
                else if(e.diagram != undefined) {
                    this.transformer.nodes(e.diagram);
                }
            }
            this.transformer.nodes().forEach((v) => {
                console.log(v._id, v.name(), v.draggable());
            })
        });

        this.on("mousedown", (e) => {
            if (e.evt.button === 1) {
                this.startDrag();
                return;
            }
            if (e.target !== this.children[0]) {
                return;
            }
            // TODO: handle clearing
            this.transformer.nodes([]);
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
                // this.activeNode.diagramGroup[0].fire("ondetachnodes", {
                //     nodes: this.activeNode.diagram
                // }, false);
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

    getDiagramGroups(): DiagramGroup[]  {
        let ret: DiagramGroup[] = [];
        for (let i = 0; i<this.children.length;i++) {
            const child = this.children[i];
            if (child.id() === "background") { 
                continue;
            }
            if ( !(child instanceof DiagramGroup) ) {
                continue;
            }
            ret.push(child);
        }
        return ret;
    }
}

