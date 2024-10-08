import Konva from "konva";
import { BaseGroup } from "./canvas/basegroup";
import { Module, get_cwd, load_modules, write_diagrams_to_modules } from "./backendconnector";
import { DiagramGroup } from "./canvas/diagramgroup";
import { contextMenuHide, contextMenuShow } from "./contextmenu/contextmenu";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { createDiagramFrom, getPlacementPos, isPointIntersectRect } from "./canvas/utils";
import { Poppy } from "../poppy/poppy";
import { Lint } from "./lint";
import { BaseDiagram } from "./canvas/basediagram";
import { Function } from "./canvas/blocks/function";
import { notifyPush } from "./notify";


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
        if (e.ctrlKey && e.key == "s") {
            const contents = diagramToModules(window.mCvStage);
            write_diagrams_to_modules(contents);
            notifyPush("Saving...");
        }

        if (!window.mSelected) {
            return;
        }

        if (e.key == "Tab") {
            e.preventDefault();
            e.stopPropagation();
        }
        else if (e.key == "Delete") {
            e.preventDefault();
            e.stopPropagation();
            if (window.mSelected instanceof BaseDiagram) {
                window.mSelected.delete();
            }
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
        const type = e.detail.type;
        if (!type) {
            return;
        }
        const bg = stage.children[0].children[0] as BaseGroup;
        let pos = getPlacementPos(stage);
        if (e.detail.pos) {
            pos = e.detail.pos;
        }

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
            case "class":
                dgGroup.addDiagram(createDiagramFrom("class"));
                break;
            default:
                dgGroup.addDiagram(createDiagramFrom("statement"));
                console.warn("SHOULD NOT HAPPEN");
                break;
        }
        dgGroup.refresh();
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
    Poppy.update();

    layer.add(baseGroup);
    stage.add(layer);
    return stage;
}
