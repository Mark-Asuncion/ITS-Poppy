import Konva from "konva";
import { BaseGroup } from "./canvas/basegroup";
// import { DiagramGroup } from "./canvas/diagramgroup";
import { createDiagramAt } from "./canvas/utils";
// import { Statement } from "./canvas/statement";
import { Module } from "./backendconnector";

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
    const domContainer = document.querySelector("#diagram-container")!;
    const stage = new Konva.Stage({
        container: "diagram-container",
        width: domContainer.clientWidth,
        height: domContainer.clientHeight,
    });

    stage.on("mousedown", (e) => {
        if (e.evt.button === 0 && e.evt.ctrlKey) {
            const bg = (stage.children[0].children[0] as BaseGroup)
            const pos = bg.getRelativePointerPosition()
            if (pos === null) {
                return;
            }
            const diagram = createDiagramAt(pos);
            bg.add(diagram);
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

    // const diagGroup = new DiagramGroup();
    // const diagGroup2 = new DiagramGroup();
    // const diagGroup3 = new DiagramGroup();
    // const diagram = new Statement({
    //     x: 70,
    //     y: 70,
    // });
    // const diagram2 = new Statement( {
    //     x: 600,
    //     y: 70,
    // });
    //
    // diagGroup.addDiagram(diagram);
    // diagGroup2.addDiagram(diagram2);
    // diagGroup3.addDiagram(new Statement({
    //     x: 800,
    //     y: 100
    // }))
    //
    // baseGroup.add(diagGroup);
    // baseGroup.add(diagGroup2);
    // baseGroup.add(diagGroup3);
    layer.add(baseGroup);
    stage.add(layer);
    return stage;
}
