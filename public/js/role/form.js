(function () {
    document.getElementById('role-form').addEventListener('change', event => {
        if (event.target.matches('input[name^="grantsMap"]')) {
            const input = event.target;
            const key = input.name.replace(/^grantsMap\[.*\]\[(.*)\]$/, '$1');
            const tr = input.closest('tr');
            const folderId = tr.getAttribute('data-folder-id');
            const children = tr.closest('tbody').querySelectorAll(`tr[data-parent-folder-id="${folderId}"`);
            children.forEach(child => {
                const childInput = child.querySelector(`input[name$="${key}]"]`);
                childInput.checked = input.checked;
                childInput.dispatchEvent(new Event('change', { bubbles: true }));
            });
        }
    });
})();
