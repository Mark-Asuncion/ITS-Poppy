import { Theme } from "../../../themes/diagram";
import { BaseDiagram } from "../basediagram";

export class EndBlock extends BaseDiagram {
    constructor() {
        super({
            name: "endblock",
            diagramType: "endblock",
            theme: Theme.Diagram.Statement
        });
    }

    refresh() { }

    getContent() {
        return "";
    }
}
