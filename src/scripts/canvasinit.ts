import Konva from "konva";
import { BaseGroup } from "./canvas/basegroup";
import { createElifDiagramAt, createElseDiagramAt, createIfDiagramAt, createStatementDiagramAt, createForDiagramAt, isPointIntersectRect } from "./canvas/utils";
import { Module, get_cwd, load_modules } from "./backendconnector";
import { DiagramGroup } from "./canvas/diagramgroup";
import { EndBlock } from "./canvas/blocks/endblock";

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

async function __loadModules(stage: Konva.Stage): Promise<DiagramGroup[]> {
    const cwd = await get_cwd();
    if (cwd.length == 0) {
        return [];
    }
    const modules = await load_modules();
    // console.log("__loadModules", modules);
    const pos = getPlacementPos(stage);
    let list: DiagramGroup[] = [];
    modules.forEach((module) => {
        // console.log("__loadModules", module);
        const dg = DiagramGroup.deserialize(module);
        if (module.position) {
            dg.setPosition({
                x: module.position[0],
                y: module.position[1]
            });
        }
        else {
            dg.setPosition(pos);
            pos.x += 100;
            pos.y += 100;
        }
        list.push(dg);
    });
    return list;
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
        // Check if name main is already used and rename if used
        const bg = stage.children[0].children[0] as BaseGroup;
        const pos = getPlacementPos(stage);
        switch (type) {
            case "statement":
                bg.add(createStatementDiagramAt(pos));
                break;
            case "endblock":
                const diagGroup = new DiagramGroup(pos);
                const diagram = new EndBlock();
                diagGroup.addDiagram(diagram);
                bg.add(diagGroup);
                break;
            case "control-if":
                const dg = createIfDiagramAt(pos);
                const dgEnd = new DiagramGroup(pos);
                const endblock = new EndBlock();
                dgEnd.addDiagram(endblock);

                const dgStatement = createStatementDiagramAt(pos);
                const dgElse = createElseDiagramAt(pos);
                dgStatement.attach({
                    v: dg,
                    i: 0
                });
                dgEnd.attach({
                    v: dg,
                    i: 1
                });
                dgElse.attach({
                    v: dg,
                    i: 2
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
        else if (e.evt.button === 0 && e.evt.shiftKey) {
            if (e.target.parent instanceof BaseGroup &&
                e.target instanceof DiagramGroup) {
                const pointerPos = e.target.parent!.getRelativePointerPosition()!;
                const target = e.target as DiagramGroup;
                target.nodes.forEach((v) => {
                    const pos = v.getAbsolutePosition();
                    const size = v.getSize();
                    const isIntersect = isPointIntersectRect(pointerPos, {
                        x: pos.x, y: pos.y,
                        width: size.width, height: size.height
                    });

                    if (isIntersect) {
                        const bd = target.detach(v);
                        bd?.remove();
                        bd?.destroy();
                    }
                });
                // console.assert(false, "Remove NOT IMPPLEMENTED");
            }
        }
        })

    const layer = new Konva.Layer();
    const baseGroup = new BaseGroup({
        width: stage.width(),
        height: stage.height(),
    });

    __loadModules(stage)
        .then((diagramGroups) => {
            diagramGroups.forEach((v) => {
                baseGroup.add(v);
            });
        });

    layer.add(baseGroup);
    stage.add(layer);
    return stage;
}
