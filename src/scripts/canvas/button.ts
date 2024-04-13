import { Group } from "konva/lib/Group";
import { ContainerConfig } from "konva/lib/Container";
import { Circle } from "konva/lib/shapes/Circle";
import { Easings, Tween } from "konva/lib/Tween";
import { Theme } from "../../themes/diagram";
import { Path } from "konva/lib/shapes/Path";

export interface ArrowButtonConfig extends ContainerConfig {
    direction?: "left" | "right"
}

export class ArrowButton extends Group {
    bg: Circle;
    fg: Path;
    constructor(config: ArrowButtonConfig) {
        super(config);

        const direction = config.direction;
        delete config.direction;

        this.bg = new Circle({
            radius: 20,
            strokeWidth: 1,
            fill: Theme.Button.hover,
            opacity: 0
        });

        const scale = 0.06;
        const radius = this.bg.radius();
        this.fg = new Path({
            x: -radius - (radius * 0.4),
            y: radius + (radius * 0.4),
            data: (direction === "left")? Theme.Button.arrow_left: Theme.Button.arrow_right,
            fill: Theme.Button.fill,
            scale: {
                x: scale,
                y: scale
            }
        })

        this.add(this.bg);
        this.add(this.fg);
        this.registerEvents();
    }

    tween(attrs: any) {
        if (Object.keys(attrs).length === 0) {
            return;
        }
        const tween = new Tween({
            duration: 0.3,
            easing: Easings.EaseInOut,
            ...attrs,
            node: this,
        });
        tween.play();
    }

    registerEvents() {
        this.on("mouseenter", (e) => {
            e.cancelBubble = true;
            this.bg.opacity(1);
        });

        this.on("mouseleave", (e) => {
            e.cancelBubble = true;
            this.bg.opacity(0);
        });
    }
}
