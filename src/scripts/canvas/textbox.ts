import { TextConfig, Text } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { BaseText } from "./basetext";
import { BaseDiagram } from "./basediagram";

export class TextBox extends BaseText {
    text: Text;
    minWidth: number;
    constructor(textConfig: TextConfig) {
        super({
            x: textConfig.x,
            y: textConfig.y,
            width: textConfig.width,
            height: textConfig.height,
        });

        delete textConfig.x;
        delete textConfig.y;

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

        input.addEventListener("focusout", () => {
            text.text(input.value);
            input.remove();
            text.show();
            // this.fire("texteditdone", {}, true);
            this.isEditing = false;
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
            // this.fire("textbeforechanged", { value: input.value },true);
        });

        input.addEventListener("keyup", () => {
            this.fire("textchanged", { value: input.value }, true);

            const div = document.createElement("div");
            div.innerText = input.value;
            div.style.visibility = "none";
            div.style.float = "left";
            div.style.fontSize = `${this.text.fontSize()}px`;
            document.body.appendChild(div);
            const max = this.minWidth;
            const tWidth = Math.max(max,
                div.clientWidth + ( this.text.padding() * 2 ));

            this.setSize({ width: tWidth });
            div.remove();

            input.style.width = `${ tWidth - this.text.padding() * 2 }px`;

            if (this.parent instanceof BaseDiagram) {
                this.parent.refresh();
            }
        });

        document.body.appendChild(input);

        // tmp
        setTimeout(() => {
            input.focus();
            this.fire("OnStateSelect", {}, true);
        }, 300);
    }

    registerEvents() {
        this.on("mousedown", (e) => {
            e.cancelBubble = true;
            if (this.isEditing) {
                return;
            }
            this.createInput();
        });
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
