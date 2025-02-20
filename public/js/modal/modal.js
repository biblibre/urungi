export default class Modal {
    constructor (args) {
        this.args = args;
    }

    open () {
        const dialog = document.createElement('dialog');
        const content = this.content;
        if (content instanceof Node) {
            dialog.append(content);
        } else {
            dialog.innerHTML = this.content;
        }
        document.body.append(dialog);

        this.dialog = dialog;
        this.init();

        return new Promise ((resolve, reject) => {
            dialog.addEventListener('close', function () {
                this.remove();
                if (this.returnValue) {
                    resolve(this.returnValue);
                } else {
                    reject();
                }
            });

            dialog.addEventListener('click', function (ev) {
                if (ev.target.closest('[data-dismiss="modal"]')) {
                    // User clicked on close/cancel button
                    this.close();
                } else if (ev.target === dialog) {
                    const rect = this.getBoundingClientRect();
                    const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
                        rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
                    if (!isInDialog) {
                        // User clicked outside the dialog
                        this.close();
                    }
                }
            });

            dialog.showModal();
        });
    }
}
