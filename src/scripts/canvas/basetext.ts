import { Rect } from "konva/lib/shapes/Rect";
import { TextConfig, Text } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { Group } from "konva/lib/Group";

export class BaseText extends Group {
    text?: Text;
    bg: Rect;
    isEditing = false;
    constructor(textConfig: TextConfig) {
        super({
            ...textConfig
        });

        this.bg = new Rect({
            cornerRadius: Theme.BaseDiagram.cornerRadius,
            fill: Theme.TextBox.fill,
            stroke: Theme.TextBox.stroke,
            strokeWidth: 1,
            x: 0,
            y: 0,
        });

        this.add(this.bg);
    }

    resize(size: {
        width?: number, height?: number
    }) {
        this.setSize(size);
    }

    setSize(size: any): this {
        if (size.width) {
            this.width(size.width);
            this.bg.width(size.width);
        }
        if (size.height) {
            this.height(size.height);
            this.bg.height(size.height);
        }
        return this;
    }

    createInput() {
        return;
    }

    padding(): number {
        return 0;
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
