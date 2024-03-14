import Konva from "konva";
import { Rect } from "konva/lib/shapes/Rect";
import { TextConfig, Text } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { Group } from "konva/lib/Group";

export class TextBox extends Group {
    text: Text;
    bg: Rect;
    constructor(textConfig: TextConfig) {
        super();

        this.text = new Text({
            padding: Theme.Diagram.textPadding,
            wrap: "none",
            ...textConfig
        });

        this.text.x(this.text.x() - (this.text.width() / 2));
        this.text.y(this.text.y() - (this.text.height() / 2));
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
        this.handleEdit();
        this.add(this.bg);
        this.add(this.text);
    }

    handleEdit() {
        // TODO: Change to click instead
        this.on("mousedown", (e) => {
            e.cancelBubble = true;
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
            const ref = this;
            input.addEventListener("focusin", () => {
                input.addEventListener("focusout", () => {
                    ref.text.text(input.value);
                    input.remove();
                    ref.text.show();
                    ref.fire("texteditdone", {}, true);
                });
            })
            input.addEventListener("keydown", (e) => {
                if (e.key == "Enter") {
                    input.blur();
                }
                else if (e.key == "Escape") {
                    // FIX: don't update content
                    input.remove();
                }
                // ref.fire("textchanged", { value: input.value },true);
                ref.fire("textedit", {}, true);
            });
            document.body.appendChild(input);
            // tmp
            setTimeout(() => input.focus(), 300);
        });
    }

    setPosition(pos: Konva.Vector2d): this {
        console.log("TextBox", this.text.position(),this.text.size());
        const posX = pos.x - (this.text.width() / 2);
        const posY = (pos.y - (this.text.height() / 2))
                    - (this.text.padding() / 2);
        this.text.x(posX);
        this.text.y(posY);
        console.log("TextBox", this.text.position(),this.text.size());
        this.bg.setPosition({
            x: posX,
            y: posY
        });
        return this;
    }

    getContent() {
        return this.text.text();
    }
}
