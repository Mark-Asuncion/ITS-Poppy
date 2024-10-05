import { Stage } from "konva/lib/Stage";
import { DiagramGroup } from "../scripts/canvas/diagramgroup";
import { _Selected } from "../scripts/canvas/utils";
import { _ContextMenuItem } from "../scripts/contextmenu/interface";
import { BaseGroup } from "../scripts/canvas/basegroup";

declare global {
    interface Window {
        mSelected: _Selected | null;
        mDragDiv: Element | null;
        mCvRootNode: {
            node: BaseGroup,
            getDiagramGroups: () => DiagramGroup[]
        };
        mCvStage: Stage;

        mContextMenu: _ContextMenuItem[];
        mCursor: {
            x: number,
            y: number
        };
        mNotifyDiv: HTMLDivElement | null;
    }
}
