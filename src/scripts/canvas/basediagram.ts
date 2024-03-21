import Konva from "konva";
import { Group } from "konva/lib/Group";
import { Theme } from "../../themes/diagram";
import { ContainerConfig } from "konva/lib/Container";
import { Rect, RectConfig } from "konva/lib/shapes/Rect";

export interface AttachRect {
    x: number,
    y: number,
    width: number,
    height: number
};

export class BaseDiagram extends Group {
    rect: Rect;
    _indent: number = 0;
    constructor(config: ContainerConfig, rectConfig: RectConfig) {
        super(config);

        delete rectConfig.x;
        delete rectConfig.y;
        this.rect = new Rect({
            width: this.width(),
            height: this.height(),
            fill: Theme.Diagram.fill,
            stroke: Theme.Diagram.stroke,
            cornerRadius: Theme.Diagram.cornerRadius,
            strokeWidth: Theme.Diagram.strokeWidth,
            ...rectConfig,
        });

        this.add(this.rect);
    }
    setActive() {
        this.rect.stroke(Theme.Diagram.strokeActive);
    }
    removeActive() {
        this.rect.stroke(Theme.Diagram.stroke);
    }
    attachRect(): AttachRect {
        return  {
            x: 0, y: 0, width: 0, height: 0
        }
    }
    attachRectAbsolutePosition(): AttachRect{
        return  {
            x: 0, y: 0, width: 0, height: 0
        }
    }
    resize(size: {
        width?: number,
        height?: number
    }) {
        if (size.width) {
            this.width(size.width);
            this.rect.width(size.width);
        }
        if (size.height) {
            this.height(size.height);
            this.rect.height(size.height);
        }
        this.fire("onstateactive", {}, true);
    }
    indent(v?: number): number {
        if (v != undefined) {
            if (v === 0) {
                this._indent = 0;
            }
            else {
                this._indent += v;
            }
        }
        this._indent = (this._indent < 0)? 0:this._indent;
        return this._indent;
    }

    getIndentPosition(level: number): number {
        if (level === 0) {
            return this.x();
        }
        const l = this.rect.width() / 5;
        if (level * ( l + 1 ) > this.width()) {
            this.resize({
                width: level * ( l + 1 )
            });
        }
        return  this.x() + level * l;
    }

    getContent() {
        return "";
    }
}
