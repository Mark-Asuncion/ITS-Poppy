import { TerminalInstance } from "./instance";
const btns = document.querySelectorAll('[aria-role="term-button"]');
const close = document.querySelector('[aria-role="term-close"]');
const restart = document.querySelector('[aria-role="term-restart"]');

btns.forEach(async (elem) => {
    const tname = elem.getAttribute("aria-target");
    if (!tname) {
        return;
    }
    const target = document.querySelector(`#${tname}`) as HTMLDivElement;
    if (!target) {
        return;
    }

    const termView = target.querySelector("#term-view") as HTMLElement;

    if (TerminalInstance.instance == null && termView) {
        TerminalInstance.open(termView).then(() => {
            TerminalInstance.init();
        });
    }

    elem.addEventListener("click", (e) => {
        e.stopPropagation();
        if (target.classList.replace("d-none", "d-flex")) {
            if (TerminalInstance.instance == null && termView) {
                TerminalInstance.open(termView).then(() => {
                    TerminalInstance.init();
                });
            }
            elem.classList.add("active");
            // target.classList.add("sidebar-content")
        }
        else {
            elem.classList.remove("active");
            target.classList.replace("d-flex", "d-none");
            // target.classList.remove("sidebar-content");
        }
    });

    if (close) {
        close.addEventListener("click", (_) => {
            TerminalInstance.close();
            (elem as HTMLButtonElement).click();
            termView.innerHTML = "";
        });
    }

    if (restart) {
        restart.addEventListener("click", async (_) => {
            TerminalInstance.restart();
        });
    }
    // TODO REMOVE DEBUG PURPOSES ONLY
    // setTimeout(() => ( elem as HTMLDivElement ).click(), 300);
});
