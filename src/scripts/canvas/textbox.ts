import Konva from "konva";
import { TextConfig, Text } from "konva/lib/shapes/Text";
import { Theme } from "../../themes/diagram";
import { BaseText } from "./basetext";
import { BaseDiagram } from "./basediagram";

export class TextBox extends BaseText {
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

        this.width(this.text.width());
        this.height(this.text.height());


        this.bg.setSize({
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
        input.style.width = "auto";
        input.style.height = `${ text.height() }px`;
        input.style.fontSize = `${ text.fontSize() }px`;
        input.style.lineHeight = `${ text.lineHeight() }`;
        input.style.fontFamily = `${ text.fontFamily() }`;
        input.style.textAlign = `${ text.align() }`;
        input.style.color = `${ text.fill() }`;
        input.style.whiteSpace = "nowrap";
        input.value = text.text();

        input.addEventListener("focusout", () => {
            text.text(input.value);
            input.remove();
            text.show();
            this.fire("texteditdone", {}, true);
            this.isEditing = false;
            this.fire("onstateremove", {}, true);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                input.blur();
            }
            else if (e.key == "Escape") {
                input.value = text.text();
                input.blur();
            }
            this.fire("textbeforechanged", { value: input.value },true);
        });

        input.addEventListener("keyup", () => {
            this.fire("textchanged", { value: input.value }, true);
            const nWidth = this.textResize(input.value);
            input.style.width = `${ nWidth }px`;
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
        const text = this.text as Text;
        const posX = pos.x - text.width() / 2;
        const posY = (pos.y - (text.height() / 2))
            - (text.padding() / 2);
        super.setPosition({
            x: posX,
            y: posY
        });
        text.setPosition({
            x: 0,
            y: 0
        })
        this.bg.setPosition({
            x: 0,
            y: 0
        });
        return this;
    }

    textResize(str: string): number {
        const div = document.createElement("div");
        div.innerText = str;
        div.style.visibility = "none";
        div.style.float = "left";
        document.body.appendChild(div);
        const max = this.width();
        console.log(max, div.clientWidth);
        const tWidth = Math.max(max, div.clientWidth + this.padding() * 2);
        this.resize({
            width: tWidth
        })
        if (this.parent instanceof BaseDiagram) {
            this.parent.resize({ width: tWidth + ( this.padding() * 2 ) });
        }
        console.log(this.width());
        div.remove();
        return tWidth;
    }

    resize(size: {
        width?: number,
        height?: number
    }) {
        if (size.width) {
            this.width(size.width);
            ( this.text! as Text ).width(size.width);
            this.bg.width(size.width);
        }
        if (size.height) {
            this.height(size.height);
            ( this.text! as Text ).height(size.height);
            this.bg.height(size.height);
        }
    }

    getContent(): string {
        return (this.text! as Text).text();
    }

    padding(): number {
        return (this.text! as Text).padding();
    }
}
