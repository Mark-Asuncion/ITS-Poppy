export function createErrorModal(message: string) {
    const modalRoot = document.createElement("div");
    modalRoot.classList.add("modal", "fade", "show");
    modalRoot.id = "errorModal";
    modalRoot.tabIndex = -1;
    modalRoot.id = "error-modal";
    modalRoot.setAttribute("aria-labelledby", "errorModalLabel");
    modalRoot.setAttribute("aria-modal", "true");
    modalRoot.setAttribute("role", "dialog");
    modalRoot.style.display = "block";

    let innerHtml = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title error" id="errorModalLabel"><i class="fa-solid fa-triangle-exclamation"></i>&#9;Error Occurred</h5>
                    <button id="dismiss" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${message}
                </div>
                <div class="modal-footer d-flex justify-content-center">
                    <button id="dismiss" type="button" class="btn btn-danger" data-bs-dismiss="modal">Okay</button>
                </div>
            </div>
        </div>`;

    modalRoot.innerHTML = innerHtml;
    modalRoot.querySelectorAll("#dismiss")!.forEach((v) =>{
        v.addEventListener(("click"), (e) => {
            e.preventDefault();
            removeErrorModal();
        })
    });
    document.body.appendChild(modalRoot);
}

export function removeErrorModal() {
    document.querySelectorAll("#error-modal").forEach((v) => v.remove());
}
