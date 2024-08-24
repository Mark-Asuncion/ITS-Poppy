import { Stage } from "konva/lib/Stage";
import { DiagramGroup } from "../scripts/canvas/diagramgroup";
import { _Selected } from "../scripts/canvas/utils";
import { _ContextMenuItem } from "../scripts/contextmenu/interface";

declare global {
    interface Window {
        mSelected: _Selected | null;
        mCvRootNode: {
            getDiagramGroups: () => DiagramGroup[]
        };
        // mCvStage: Stage;

        mDebugContextMenuFn: {
            contextMenuShow: () => void
            contextMenuHide: () => void
        };
        mContextMenu: _ContextMenuItem[];
        mCursor: {
            x: number,
            y: number
        }
    }
}
