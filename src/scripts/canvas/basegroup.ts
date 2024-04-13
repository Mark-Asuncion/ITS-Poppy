import Konva from "konva";
import diagramBackground from "/assets/diagram-background.png";
import { Rect } from "konva/lib/shapes/Rect";
import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { BaseDiagram } from "./basediagram";
import { DiagramGroup } from "./diagramgroup";
import { KonvaEventObject } from "konva/lib/Node";
import { Transformer } from "konva/lib/shapes/Transformer";

export interface OnStateEvent extends KonvaEventObject<any> {
    diagram?: BaseDiagram[],
    diagramGroup?: DiagramGroup[],
    append?: boolean,
    select?: "diagram" | "diagramgroup",
    borderOnly?: boolean
};

interface _Selection {
    enabled: boolean,
    rect?: Rect,
    eDown: (ref: BaseGroup, e: KonvaEventObject<MouseEvent>) => void,
    eMove: (ref: BaseGroup) => void,
    eUp: () => void,
    selected?: Transformer,
    clearSelected: () => void
};

const Selection: _Selection = {
    enabled: false,
    eDown: function(ref, e) {
        if (e.evt.button === 0) {
            this.enabled = true
            const stPos = ref.getRelativePointerPosition();
            if (stPos === null) {
                this.enabled = false;
                return;
            }
            if (this.rect == undefined) {
                this.rect = new Rect({
                    id: "selector",
                    x: stPos.x,
                    y: stPos.y,
                    width: 0,
                    height: 0,
                    ...Theme.Selection
                });
            }
            else {
                this.rect.x(stPos.x);
                this.rect.y(stPos.y);
                this.rect.width(0);
                this.rect.height(0);
            }
        }
    },
    eMove: function(ref) {
        if (this.enabled && this.rect !== null) {
            const cPos = ref.getRelativePointerPosition();
            if (cPos === null) {
                this.enabled = false;
                return;
            }
            const diffx =  cPos.x - this.rect!.x();
            const diffy =  cPos.y - this.rect!.y();
            this.rect!.width(diffx);
            this.rect!.height(diffy);
        }
    },
    eUp: function() {
        if (this.enabled) {
            this.enabled = false
            this.rect?.remove();
        }
    },
    clearSelected: function() {
        this.selected?.nodes().forEach((v) => {
            v.fire("onstateremove", {}, false);
        })
        this.selected?.nodes([]);
    }
}

export class BaseGroup extends Group {
    selection = Selection;
    mtpSize: number ;
    constructor(opts: Konva.ContainerConfig, size: number = 5) {
        super(opts);
        this.mtpSize = size;

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

        this.registerEvents();

        this.selection.selected = new Transformer(Theme.Transformer);
        this.add(this.selection.selected);
    }

    registerEvents() {
        this.on("onstateremove", (e: OnStateEvent) => {
            const n = this.selection.selected?.nodes().filter((v) => {
                return v !== e.target;
            });
            e.target.fire("onstateremove", {}, false);
            if (n) {
                this.selection.selected?.nodes(n);
            }
        });

        this.on("onstateselect", (e: OnStateEvent) => {
            this.selection.selected?.nodes().forEach((v) => {
                v.fire("onstateremove", {}, false);
            });

            this.selection.selected?.moveToTop();
            if (e.select === "diagramgroup") {
                if (e.diagramGroup) {
                    this.selection.selected?.nodes(e.diagramGroup);
                }
            }
            else {
                if (e.diagram) {
                    this.selection.selected?.nodes(e.diagram);
                }
            }
            this.selection.selected?.nodes().forEach((v) => {
                v.fire("onstateactive", {}, false);
            });
        });

        this.on("mousedown", (e) => {
            if (e.evt.button === 1) {
                this.startDrag();
                return;
            }
            if (e.target !== this.children[0]) {
                return;
            }

            this.selection.clearSelected();
            this.selection.eDown(this, e);
            if (this.selection.rect) {
                this.add(this.selection.rect);
            }
        });
        this.on("mousemove", () => {
            this.selection.eMove(this)
        });
        this.on("mouseup", () => {
            this.selection.eUp();
        });

        this.on("dragmove", (e) => {
            const maxLeftX = -(this.width() * this.mtpSize - this.width());
            const maxUpY = -(this.height() * this.mtpSize - this.height());
            e.target.x( Math.max( Math.min(0, e.target.x()), maxLeftX ) );
            e.target.y( Math.max( Math.min(0, e.target.y()), maxUpY ) );
        })

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

