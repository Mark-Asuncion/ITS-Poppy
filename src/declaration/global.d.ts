import { BaseGroup } from "../scripts/canvas/basegroup";
import { _Selected } from "../scripts/canvas/utils";

declare global {
    interface Window {
        mSelected: _Selected | null = null;
        mCvRootNode: BaseGroup | null = null;
    }
}
