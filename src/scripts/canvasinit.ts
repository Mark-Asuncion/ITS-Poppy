import Konva from "konva";
import { BaseGroup } from "./canvas/basegroup";
import { createElifDiagramAt, createElseDiagramAt, createIfDiagramAt, createStatementDiagramAt, createForDiagramAt } from "./canvas/utils";
import { Module } from "./backendconnector";

function getPlacementPos(stage: Konva.Stage): Konva.Vector2d {
    const basegroup = stage.getChildren()[0].getChildren()[0] as BaseGroup;
    const container = stage.container().getBoundingClientRect();
    const containerCenter = {
        x: container.width,
        y: container.height,
    };
    return {
        x: Math.abs( basegroup.x() + (basegroup.x() / 2 + containerCenter.x) ),
        y: Math.abs( basegroup.y() + (basegroup.y() / 2 + containerCenter.y) ),
    };
}

export function diagramToModules(stage: Konva.Stage) {
    const basegroup = (stage.children[0]
                        .children[0] as BaseGroup);
    let ret = new Array<Module>();
    basegroup.getDiagramGroups()
        .forEach((v) => {
            ret.push(v.getContent());
        });
    return ret;
}

// export function createStageForDiagramImage(container: HTMLDivElement) {
//     const size = container.getBoundingClientRect();
//     const stage = new Konva.Stage({
//         container: container,
//         width: size.width,
//         height: size.height,
//     });
//     return stage;
// }
//
export function init() {
    const domContainer = document.querySelector("#diagram-container")! as HTMLDivElement;
    const size = domContainer.getBoundingClientRect();

    const stage = new Konva.Stage({
        container: domContainer,
        width: size.width,
        height: size.height,
    });

    document.addEventListener("diagramdrop", ((e: any) => {
        const type = e.detail;
        if (!type) {
            return;
        }
        const bg = stage.children[0].children[0] as BaseGroup;
        const pos = getPlacementPos(stage);
        switch (type) {
            case "statement":
                bg.add(createStatementDiagramAt(pos));
                break;
            case "control-if":
                const dg = createIfDiagramAt(pos);
                const dgElse = createElseDiagramAt(pos);
                dgElse.attach({
                    v: dg,
                    i: 0
                });
                bg.add(dg);
                break;
            case "control-elif":
                bg.add(createElifDiagramAt(pos));
                break;
            case "control-else":
                bg.add(createElseDiagramAt(pos));
                break;
            case "loop-for":
                bg.add(createForDiagramAt(pos));
                break;
            default:
                break;
        }
    }) as EventListener);

    stage.on("mousedown", (e) => {
        if (e.evt.button === 0 && e.evt.ctrlKey) {
            const bg = (stage.children[0].children[0] as BaseGroup)
            const pos = bg.getRelativePointerPosition()
            if (pos === null) {
                return;
            }
            console.log(pos)
        }
        else if (e.evt.button === 0 && e.evt.shiftKey && e.evt.ctrlKey) {

            console.log(e.target.parent instanceof BaseGroup);
            if (e.target.parent instanceof BaseGroup) {
                console.assert(false, "Remove NOT IMPPLEMENTED");
            }
        }
    })

    const layer = new Konva.Layer();
    const baseGroup = new BaseGroup({
        width: stage.width(),
        height: stage.height(),
    });

    layer.add(baseGroup);
    stage.add(layer);
    return stage;
}
