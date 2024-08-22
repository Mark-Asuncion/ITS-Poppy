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
        p.nodes.forEach((v) => {
            maxWidth = Math.max(maxWidth, v.x() + v.width() - this.x());
        })

        this.setSize({ width: maxWidth });
    }

    getContent() {
        return "";
    }
}
