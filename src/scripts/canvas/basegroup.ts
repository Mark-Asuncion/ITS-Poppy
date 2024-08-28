import Konva from "konva";
import diagramBackground from "/assets/diagram-background.png";
import { Rect } from "konva/lib/shapes/Rect";
import { Group } from "konva/lib/Group";
import { KonvaEventObject } from "konva/lib/Node";
import { DiagramGroup } from "./diagramgroup";
import { _Selected } from "./utils";

export class BaseGroup extends Group {
    // background size multipler
    mtpSize: number ;
    constructor(opts: Konva.ContainerConfig, size: number = 10) {
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

        window.mCvRootNode = {
            getDiagramGroups: this.getDiagramGroups.bind(this)
        };
        this.registerEvents();
    }


    // add(children: any) {
    //     super.add(children)
    //     if (children instanceof DiagramGroup) {
    //         children.setModuleName("main");
    //     }
    //     return this;
    // }

    registerEvents() {
        this.on("OnStateSelect", (e: KonvaEventObject<any>) => {
            if (window.mSelected)
                window.mSelected.removeActive();

            window.mSelected = e.target as unknown as _Selected | null;

            if (window.mSelected)
                window.mSelected.setActive();
        });

        this.on("mousedown", (e) => {
            if (e.evt.button === 1) {
                this.startDrag();
                return;
            }
            if (e.target !== this.children[0]) {
                return;
            }

            if (window.mSelected) {
                window.mSelected.removeActive();
            }
            window.mSelected = null;
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

    // childn focus on the nth child
    focus(childn: number) {
        const childs = this.getDiagramGroups();
        if (childs.length == 0 || childs[childn] == undefined) {
            return;
        }
        const ch = childs[childn];

        const stage = this.getStage()!;
        const container = stage.container().getBoundingClientRect();
        const offset = {
            x: container.x + container.width * .1,
            y: container.y + container.height * .1
        };
        const pos = {
            x: this.x() + ch.x() - offset.x,
            y: this.y() + ch.y() - offset.y
        };

        // console.log(this.position(), ch.position(), pos);
        this.setPosition(pos);
    }
}
