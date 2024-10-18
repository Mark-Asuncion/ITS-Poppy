import { DialogType } from "../../poppy/interface";
import { Poppy } from "../../poppy/poppy";

let gHoverTimer: NodeJS.Timeout | null = null;

export function setHover(
    source: HTMLElement,
    message: string,
    type: "normal" | "poppy" = "normal",
    timeout: number = 1000
) {
    source.addEventListener("mouseenter", (e) => {
        if (gHoverTimer != undefined) {
            clearTimeout(gHoverTimer);
            let items = document.querySelectorAll(".hover-item");
            items.forEach((v) => {
                v.remove();
            });
            gHoverTimer = null;
        }

        let id = setTimeout(() =>  {
            if (type == "normal") {
                const div = document.createElement("div");
                div.classList.add("hover-item");
                div.innerHTML = `<p style="margin: 0">${message}</p>`;

                const center = {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2
                };

                document.body.appendChild(div);

                const pos = {
                    x: e.x,
                    y: e.y
                };
                const rect = div.getBoundingClientRect();
                if (pos.x > center.x) {
                    pos.x -= rect.width;
                }
                if (pos.y > center.y) {
                    pos.y -= rect.height;
                }

                div.style.left = `${pos.x}px`;
                div.style.top = `${pos.y}px`;
            }
            else {
                Poppy.swapDialog = {
                    message: message,
                    dialogType: DialogType.NEXT,
                    hover: true
                }
            }
        }, timeout);
        gHoverTimer = id;
    });

    source.addEventListener("mouseleave", () => {
        if (gHoverTimer != undefined) {
            clearTimeout(gHoverTimer);
            let items = document.querySelectorAll(".hover-item");
            items.forEach((v) => {
                v.remove();
            });
            gHoverTimer = null;
            return;
        }
    })

}
