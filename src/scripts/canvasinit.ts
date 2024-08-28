import Konva from "konva";
import { BaseGroup } from "./canvas/basegroup";
import { createElifDiagramAt, createElseDiagramAt, createIfDiagramAt, createStatementDiagramAt, createForDiagramAt } from "./canvas/utils";
import { Module, get_cwd, load_modules } from "./backendconnector";
import { DiagramGroup } from "./canvas/diagramgroup";
import { EndBlock } from "./canvas/blocks/endblock";
import { contextMenuHide, contextMenuShow } from "./contextmenu/contextmenu";
import { While } from "./canvas/blocks/loop";
import { Function } from "./canvas/blocks/function";
import { Shape, ShapeConfig } from "konva/lib/Shape";

function getPlacementPos(stage: Konva.Stage): Konva.Vector2d {
    const basegroup = stage.getChildren()[0].getChildren()[0] as BaseGroup;
    const container = stage.container().getBoundingClientRect();
    // offset because if half it is on the right side
    const containerCenter = {
        x: container.x + container.width * .2,
        y: container.y + container.height * .2,
    };
    let transform = basegroup.getAbsoluteTransform()
        .copy()
        .invert();

    // const div = document.createElement("div");
    // div.style.position = "absolute";
    // div.style.width = "10px";
    // div.style.height = "10px";
    // div.style.left = `${container.x + containerCenter.x}px`;
    // div.style.top = `${container.y + containerCenter.y}px`;
    // div.style.backgroundColor = "red";
    // document.body.appendChild(div);

    const p = transform.point(containerCenter);
    return p;
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

export function init() {
    const domContainer = document.querySelector("#diagram-container")! as HTMLDivElement;
    const size = domContainer.getBoundingClientRect();

    const stage = new Konva.Stage({
        container: domContainer,
        width: size.width,
        height: size.height,
    });

    window.mCvStage = stage;

    stage.on("mousedown", (e) => {
        e.cancelBubble = true;
        if (e.evt.button !== 2) {
            contextMenuHide();
        }
    });

    domContainer.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        console.log(window.mContextMenu);
        contextMenuHide();
        contextMenuShow();
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
            case "endblock":
                {
                    const diagGroup = new DiagramGroup(pos);
                    const diagram = new EndBlock();
                    diagGroup.addDiagram(diagram);
                    bg.add(diagGroup);
                }
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
            case "loop-while":
                const diagGroup = new DiagramGroup(pos);
                const diagram = new While();
                diagGroup.addDiagram(diagram);
                bg.add(diagGroup);
                break;
            default:
                break;
        }
    }) as EventListener);

    window["addFn"] = () => {
        const pos = getPlacementPos(stage);
        const diagGroup = new DiagramGroup(pos);
        const diagram = new Function();
        diagGroup.addDiagram(diagram);
        const bg = stage.children[0].children[0] as BaseGroup;
        bg.add(diagGroup);
    };

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

            baseGroup.focus(0);
        });

    layer.add(baseGroup);
    stage.add(layer);
    return stage;
}
