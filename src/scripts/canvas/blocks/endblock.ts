import { Theme } from "../../../themes/diagram";
import { BaseDiagram } from "../basediagram";

// REMOVE
export class EndBlock extends BaseDiagram {
    constructor() {
        super({
            name: "Endblock",
            diagramType: "endblock",
            theme: Theme.Diagram.Statement
        });
    }

    getContent() {
        return "";
    }

    onContextMenu() {
        super.onContextMenu();
        window.mContextMenu = window.mContextMenu.slice(1);
    }
}
