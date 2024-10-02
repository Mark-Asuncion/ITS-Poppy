import Konva from "konva";
import { BaseGroup } from "./canvas/basegroup";
import { Module, get_cwd, load_modules } from "./backendconnector";
import { DiagramGroup } from "./canvas/diagramgroup";
import { contextMenuHide, contextMenuShow } from "./contextmenu/contextmenu";
import { Function } from "./canvas/blocks/function";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { createDiagramFrom, isPointIntersectRect } from "./canvas/utils";
import { Poppy } from "../poppy/poppy";
import { Lint } from "./lint";

function getPlacementPos(stage: Konva.Stage): Konva.Vector2d {
    const basegroup = stage.getChildren()[0].getChildren()[0] as BaseGroup;
    const container = stage.container().getBoundingClientRect();
    const containerCenter = {
        x: container.x + container.width * .5,
        y: container.y + container.height * .5,
    };

    let transform = basegroup.getAbsoluteTransform()
        .copy()
        .invert();

    const p = transform.point(containerCenter);
    console.log(p);
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
            console.log("placed in: ", pos);
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

    // disable default behaviour
    document.addEventListener("keydown", (e) => {
        if (!window.mSelected) {
            return;
        }

        if (e.key == "Tab") {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    document.addEventListener("keyup", (e) => {
        if (isPointIntersectRect(window.mCursor, domContainer.getBoundingClientRect())) {
            console.log(window.mSelected);
            if (!window.mSelected) {
                return;
            }
            const shape = (window.mSelected as unknown as Shape<ShapeConfig>)
            shape.fire("KeyUp", {
                key: e.key,
                shiftKey: e.shiftKey
            }, true);
        }
    });

    domContainer.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        // console.log(window.mContextMenu);
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
        const dgGroup = new DiagramGroup(pos);
        switch (type) {
            case "statement":
                dgGroup.addDiagram(createDiagramFrom("statement"));
                break;
            case "endblock":
                dgGroup.addDiagram(createDiagramFrom("endblock"));
                break;
            case "control-if":
                dgGroup.addDiagram(createDiagramFrom("if"));
                dgGroup.addDiagram(createDiagramFrom("statement"));
                dgGroup.addDiagram(createDiagramFrom("endblock"));
                break;
            case "control-elif":
                dgGroup.addDiagram(createDiagramFrom("elif"));
                break;
            case "control-else":
                dgGroup.addDiagram(createDiagramFrom("else"));
                break;
            case "loop-for":
                dgGroup.addDiagram(createDiagramFrom("for"));
                break;
            case "loop-while":
                dgGroup.addDiagram(createDiagramFrom("while"));
                break;
            case "function":
                dgGroup.addDiagram(createDiagramFrom("function"));
                break;
            default:
                dgGroup.addDiagram(createDiagramFrom("statement"));
                console.warn("SHOULD NOT HAPPEN");
                break;
        }
        bg.add(dgGroup);
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

    window.addEventListener("resize", (_) => {
        const boundingClient = domContainer.getBoundingClientRect();
        const size = {
            width: boundingClient.width,
            height: boundingClient.height
        };
        // console.log(`Set Size`, stage.size(), baseGroup.size(), size);
        stage.setSize(size);
        baseGroup.setSize(size);
    });

    __loadModules(stage)
        .then((diagramGroups) => {
            diagramGroups.forEach((v) => {
                baseGroup.add(v);
            });

            baseGroup.focus(0);
            Lint.lint();
        });

    Poppy.init();
    window["Poppy"] = Poppy;
    Poppy.loadTutorial(1);
    Poppy.update();

    layer.add(baseGroup);
    stage.add(layer);
    return stage;
}
