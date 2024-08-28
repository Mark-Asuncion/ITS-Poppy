import { Theme } from "../../../themes/diagram";
import { BaseDiagram } from "../basediagram";
import { DiagramGroup } from "../diagramgroup";

export class EndBlock extends BaseDiagram {
    constructor() {
        super({
            name: "Endblock",
            diagramType: "endblock",
            theme: Theme.Diagram.Statement
        });
    }

    refresh() {
        const p = (this.parent! as DiagramGroup);
        let maxWidth = 0;
        for (let i=0;i<p.nodes.length; i++) {
            let v = p.nodes[i];
            if (v == this)
                break;
            maxWidth = Math.max(maxWidth, v.x() + v.width() - this.x());
        }

        this.setSize({ width: maxWidth });
    }

    getContent() {
        return "";
    }

    onContextMenu() {
        super.onContextMenu();
        window.mContextMenu = window.mContextMenu.slice(1);
    }
}
