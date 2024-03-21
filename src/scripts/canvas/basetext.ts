import { Rect } from "konva/lib/shapes/Rect";
import { TextConfig, Text } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { Group } from "konva/lib/Group";

export class BaseText extends Group {
    text?: Text | Text[];
    bg: Rect;
    isEditing = false;
    constructor(textConfig: TextConfig) {
        super({
            x: textConfig.x,
            y: textConfig.y
        });

        this.bg = new Rect({
            cornerRadius: Theme.Diagram.cornerRadius,
            fill: Theme.Diagram.textBg,
            stroke: Theme.Diagram.textStroke,
            strokeWidth: 1,
            x: 0,
            y: 0,
        });

        this.add(this.bg);
    }
    createInput() {
        return;
    }

    registerEvents() {
        this.on("mousedown", (e) => {
            this.fire("onstateactive", {}, true);
            e.cancelBubble = true;
            if (this.isEditing) {
                return;
            }
            this.createInput();
        });
    }

    getContent(): string {
        return "";
    }
}
