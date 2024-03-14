import Konva from "konva";
import { BaseGroup } from "./canvas/basegroup";
import { Diagram, DiagramGroup } from "./canvas/diagram";
import { createDiagramAt } from "./canvas/utils";

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

            console.log(e.target.parent instanceof Diagram);
            if (e.target.parent instanceof Diagram) {
                e.target.parent.removeNodeFromParent();
            }
        }
    })

    const layer = new Konva.Layer();
    const baseGroup = new BaseGroup({
        width: stage.width(),
        height: stage.height(),
    });

    const diagGroup = new DiagramGroup();
    const diagGroup2 = new DiagramGroup();
    const diagGroup3 = new DiagramGroup();
    const diagram = new Diagram({
        x: 70,
        y: 70,
    });
    const diagram2 = new Diagram( {
        x: 600,
        y: 70,
    });

    diagGroup.addDiagram(diagram);
    diagGroup2.addDiagram(diagram2);
    diagGroup3.addDiagram(new Diagram({
        x: 800,
        y: 100
    }))

    baseGroup.add(diagGroup);
    baseGroup.add(diagGroup2);
    baseGroup.add(diagGroup3);
    layer.add(baseGroup);
    stage.add(layer);
}
