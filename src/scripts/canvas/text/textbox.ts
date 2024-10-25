import { Text } from "konva/lib/shapes/Text";
import { SyntaxColors, Theme } from "../../../themes/diagram";
import { BaseText, BaseTextConfig } from "../basetext";
import { BaseDiagram } from "../basediagram";
import { analyze_line } from "../../backendconnector";

export class TextBox extends BaseText {
    text: Text;
    textConfig: BaseTextConfig;
    // if text has multiple colors use this
    components: Text[] = [];
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

        this.autoFill = (textConfig.autoFill != undefined)? textConfig.autoFill:this.autoFill;
        this.textConfig = { ...textConfig };
        delete this.textConfig.text;

        delete textConfig.autoFill;
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

        // this.setSize({
        //     width: this.text.width(),
        //     height: this.text.height() + this.text.padding(),
        // });

        this.adjustWidth(this.text.text());
        this.setColors();

        this.registerEvents();
        this.add(this.text);
    }

    createInput() {
        this.isEditing = true;
        const text = this.text as Text;
        text.hide();
        this.components.forEach((v) => {
            v.hide();
        });
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
        input.style.fontWeight = text.fontStyle();
        input.style.color = `${ text.fill() }`;
        // input.style.border = `1px solid red`;
        input.style.whiteSpace = "nowrap";
        input.value = text.text();

        this.input = input;
        window.mFocusDiagram = true;

        input.addEventListener("focusout", () => {
            let v = input.value;
            text.text((v.trim().length == 0)? " ":v.trim());
            text.show();
            this.setColors();
            input.remove();
            this.input = null;

            this.isEditing = false;

            window.mFocusDiagram = false;
            this.fire("TextChanged", { value: input.value }, true);
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

    async setColors() {
        if (this.autoFill == false) {
            return;
        }

        let v = this.text.text().trim();
        if (v.length == 0) {
            this.text.fill(SyntaxColors.OTHER);
            return;
        }
        let res = await analyze_line(v);
        if (res.length == 0) {
            this.text.fill(SyntaxColors.OTHER);
            return;
        }
        this.components.forEach((v) => {
            v.remove();
            v.destroy();
        });
        if (this.components.length > 0)
            this.components = [];

        // console.log(v, res);
        if (res.length == 1) {
            let color = SyntaxColors[res[0].tokenType];

            if (color == undefined) {
                color = SyntaxColors.OTHER;
            }
            else if(res[0].keyword) {
                color = SyntaxColors.KEYWORD;
            }

            this.text.fill(color);
            this.text.show();
        }
        else {
            let pos = {
                x: 0,
                y: 0
            };
            pos.y = 0;
            let cursor = 0;
            let i = 0;
            // console.log(v, res);
            while(i<res.length && cursor < v.length) {
                let token = res[i];
                if (token.len == 0) {
                    i++;
                    continue;
                }
                if (cursor == token.index) {
                    i++;
                    let t = v.substring(token.index, token.index + token.len);
                    cursor += token.len;
                    // console.log(t);

                    let color = SyntaxColors[token.tokenType];
                    if (color == undefined) {
                        color = SyntaxColors.OTHER;
                    }
                    else if(token.keyword == true) {
                        color = SyntaxColors.KEYWORD;
                    }

                    this.components.push(new Text({
                        ...this.textConfig,
                        text: t,
                        x: pos.x,
                        y: pos.y,
                        fill: color,
                        padding: Theme.TextBox.padding,
                        wrap: Theme.TextBox.wrap,
                    }));
                    pos.x += this.getTextWidth(t);
                }
                else {
                    let t = v[cursor];
                    cursor++;
                    this.components.push(new Text({
                        ...this.textConfig,
                        text: t,
                        x: pos.x,
                        y: pos.y,
                        fill: SyntaxColors.OTHER,
                        padding: Theme.TextBox.padding,
                        wrap: Theme.TextBox.wrap,
                    }));
                    pos.x += this.getTextWidth(t, t == ' ');
                }
            }
            this.add(...this.components);
            this.text.hide();
        }
    }

    getTextWidth(v: string, usePre?: boolean) {
        const div = document.createElement("div");
        if (usePre == true) {
            div.innerHTML = `<pre>${v}</pre>`;
        }
        else {
            div.innerText = v;
        }
        div.style.visibility = "none";
        div.style.float = "left";
        div.style.fontSize = `${this.text.fontSize()}px`;
        div.style.fontFamily = this.text.fontFamily();
        div.style.fontWeight = this.text.fontStyle();
        document.body.appendChild(div);
        let w = div.clientWidth;
        div.remove();
        return w;
    }

    adjustWidth(v: string) {
        let w = this.getTextWidth(v);
        const max = this.minWidth;
        const tWidth = Math.max(max,
            w + ( this.text.padding() * 3 ));

        this.setSize({ width: tWidth });
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
