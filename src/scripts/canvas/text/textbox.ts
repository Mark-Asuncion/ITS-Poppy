import { Text } from "konva/lib/shapes/Text";
import { Theme } from "../../../themes/diagram";
import { BaseText, BaseTextConfig } from "../basetext";
import { BaseDiagram } from "../basediagram";

export class TextBox extends BaseText {
    text: Text;
    minWidth: number;
    constructor(textConfig: BaseTextConfig) {
        super({
            name: "TextBox",
            x: textConfig.x,
            y: textConfig.y,
            width: textConfig.width,
            height: textConfig.height,
            noBG: textConfig.noBG,
        });

        delete textConfig.x;
        delete textConfig.y;
        delete textConfig.noBG;

        this.text = new Text({
            padding: Theme.TextBox.padding,
            wrap: Theme.TextBox.wrap,
            ...textConfig,
        });

        this.text.height(this.text.fontSize() + this.text.padding())

        this.width(this.text.width());
        this.minWidth = this.width();
        this.height(this.text.height());

        this.setSize({
            width: this.text.width(),
            height: this.text.height() + this.text.padding(),
        });

        this.registerEvents();
        this.add(this.text);
    }

    createInput() {
        this.isEditing = true;
        const text = this.text as Text;
        text.hide();
        const ctBox = this.getStage()!.container().getBoundingClientRect();
        const textAbsPos = {
            x: text.getAbsolutePosition().x,
            y: text.getAbsolutePosition().y
        };
        const input = document.createElement("textarea");
        input.classList.add("canvas-edit");
        input.style.left = `${ ctBox.x + textAbsPos.x + text.padding() }px`;
        input.style.top = `${ ctBox.y + textAbsPos.y + text.padding() }px`;
        input.style.width = `${ this.width() - this.text.padding() * 2}px`;
        input.style.height = `${ text.height() }px`;
        input.style.fontSize = `${ text.fontSize() }px`;
        input.style.lineHeight = `${ text.lineHeight() }`;
        input.style.fontFamily = `${ text.fontFamily() }`;
        input.style.textAlign = `${ text.align() }`;
        input.style.color = `${ text.fill() }`;
        // input.style.border = `1px solid red`;
        input.style.whiteSpace = "nowrap";
        input.value = text.text();

        this.input = input;

        input.addEventListener("focusout", () => {
            text.text(input.value);
            text.show();
            input.remove();
            this.input = null;

            // this.fire("texteditdone", {}, true);
            this.isEditing = false;

            this.fire("TextChanged", { value: input.value }, true);
            // this.fire("OnStateRemove", {}, true);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                input.blur();
            }
            else if (e.key == "Escape") {
                input.value = text.text();
                input.blur();
            }
        });

        input.addEventListener("keyup", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tWidth = this.adjustWidth(input.value);
            input.style.width = `${ tWidth - this.text.padding() * 2 }px`;

            if (this.parent instanceof BaseDiagram) {
                this.parent.refresh();
            }
            this.fire("KeyUp", { value: input.value, key: e.key }, true);
        });

        document.body.appendChild(input);

        // tmp
        setTimeout(() => {
            input.focus();
            this.fire("OnStateSelect", {}, true);
        }, 300);
    }

    adjustWidth(v: string) {
        const div = document.createElement("div");
        div.innerText = v;
        div.style.visibility = "none";
        div.style.float = "left";
        div.style.fontSize = `${this.text.fontSize()}px`;
        document.body.appendChild(div);
        const max = this.minWidth;
        const tWidth = Math.max(max,
            div.clientWidth + ( this.text.padding() * 3 ));

        this.setSize({ width: tWidth });
        div.remove();
        return tWidth;
    }

    setSize(size: any): this {
        if (size.width) {
            this.text.width(size.width);
        }

        super.setSize({
            width: this.text.width(),
            height: this.text.height() + this.text.padding(),
        });
        return this;
    }

    getContent(): string {
        return (this.text! as Text).text();
    }

    padding(): number {
        return (this.text! as Text).padding();
    }
}
