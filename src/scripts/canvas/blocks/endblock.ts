import { Theme } from "../../../themes/diagram";
import { BaseDiagram, BaseDiagramParent } from "../basediagram";

export class EndBlock extends BaseDiagram {
    constructor() {
        super({
            name: "endblock",
            diagramType: "endblock",
            theme: Theme.Diagram.Statement
        });
    }

    refresh() {
        const p = (this.parent! as unknown as BaseDiagramParent);
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
        window.mContextMenu = [];
    }
}
