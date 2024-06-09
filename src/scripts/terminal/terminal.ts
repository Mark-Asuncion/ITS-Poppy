import { TerminalInstance } from "./instance";
const btns = document.querySelectorAll('[aria-role="term-button"]');

btns.forEach(async (elem) => {
    const tname = elem.getAttribute("aria-target");
    if (!tname) {
        return;
    }
    const target = document.querySelector(`#${tname}`) as HTMLDivElement;
    if (!target) {
        return;
    }

    if (TerminalInstance.instance == null) {
        await TerminalInstance.open(target);
        TerminalInstance.init();
    }

    elem.addEventListener("click", (e) => {
        e.stopPropagation();
        if (target.classList.replace("d-none", "d-block")) {
            elem.classList.add("active");
            // target.classList.add("sidebar-content")
        }
        else {
            elem.classList.remove("active");
            target.classList.replace("d-block", "d-none");
            // target.classList.remove("sidebar-content");
        }
    });
});
