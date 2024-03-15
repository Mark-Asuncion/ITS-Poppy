import Konva from "konva";
import { Rect } from "konva/lib/shapes/Rect";
import { TextConfig, Text } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { Group } from "konva/lib/Group";

export class TextBox extends Group {
    text: Text;
    bg: Rect;
    isEditing = false;
    constructor(textConfig: TextConfig) {
        super({
            x: textConfig.x,
            y: textConfig.y
        });

        delete textConfig.x;
        delete textConfig.y;

        this.text = new Text({
            padding: Theme.Diagram.textPadding,
            wrap: "none",
            ...textConfig
        });

        this.x(this.x() - (this.text.width() / 2));
        this.y(this.y() - (this.text.height() / 2));
        this.text.height(this.text.fontSize() + this.text.padding())

        this.bg = new Rect({
            cornerRadius: Theme.Diagram.cornerRadius,
            fill: Theme.Diagram.textBg,
            stroke: Theme.Diagram.textStroke,
            strokeWidth: 1,
            x: this.text.x(),
            y: this.text.y(),
            width: this.text.width(),
            height: this.text.height() + this.text.padding(),
        });
        this.registerEvents();
        this.add(this.bg);
        this.add(this.text);
    }

    createInput() {
        this.isEditing = true;
        this.text.hide();
        const input = document.createElement("textarea");
        input.classList.add("canvas-edit");
        input.style.left = `${ this.text.getAbsolutePosition().x + this.text.padding() }px`;
        input.style.top = `${ this.text.getAbsolutePosition().y + this.text.padding() }px`;
        input.style.width = `${ this.text.width() }px`;
        input.style.height = `${ this.text.height() }px`;
        input.style.fontSize = `${ this.text.fontSize() }px`;
        input.style.lineHeight = `${ this.text.lineHeight() }`;
        input.style.fontFamily = `${ this.text.fontFamily() }`;
        input.style.textAlign = `${ this.text.align() }`;
        input.style.color = `${ this.text.fill() }`;
        input.value = this.text.text();

        input.addEventListener("focusout", () => {
            this.text.text(input.value);
            input.remove();
            this.text.show();
            this.fire("texteditdone", {}, true);
            this.isEditing = false;
        });

        input.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                input.blur();
            }
            else if (e.key == "Escape") {
                input.value = this.text.text();
                input.blur();
            }
            this.fire("textbeforechanged", { value: input.value },true);
        });

        input.addEventListener("keyup", () => {
            this.fire("textchanged", { value: input.value }, true);
        });

        document.body.appendChild(input);

        // tmp
        setTimeout(() => input.focus(), 300);
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

    setPosition(pos: Konva.Vector2d): this {
        const posX = pos.x - this.text.width() / 2;
        const posY = (pos.y - (this.text.height() / 2))
            - (this.text.padding() / 2);
        super.setPosition({
            x: posX,
            y: posY
        });
        this.text.setPosition({
            x: 0,
            y: 0
        })
        this.bg.setPosition({
            x: 0,
            y: 0
        });
        return this;
    }

    getContent() {
        return this.text.text();
    }
}
