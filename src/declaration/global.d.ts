import { DiagramGroup } from "../scripts/canvas/diagramgroup";
import { _Selected } from "../scripts/canvas/utils";

declare global {
    interface Window {
        mSelected: _Selected | null;
        mCvRootNode: {
            getDiagramGroups: () => DiagramGroup[]
        };
    }
}
