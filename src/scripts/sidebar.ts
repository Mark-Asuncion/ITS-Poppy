// const container = document.querySelector("#sidebar-container")! as HTMLDivElement;
const sidebarBtn = document.querySelectorAll('[aria-role="sidebar-button"]');

sidebarBtn.forEach((elem) => {
    const tname = elem.getAttribute("aria-target")
    if (!tname) {
        return;
    }
    const target = document.querySelector("#" + tname);
    const type = elem.getAttribute("aria-type");
    if (!(target && type)) {
        return;
    }

    elem.addEventListener("click", (e) => {
        e.stopPropagation();
        if (target.classList.replace("d-none", "d-block")) {
            elem.classList.add("active");
            target.classList.add("sidebar-content")
        }
        else {
            elem.classList.remove("active");
            target.classList.replace("d-block", "d-none");
            target.classList.remove("sidebar-content");
        }
    });
});
