import { expect, test, vi } from 'vitest'
import DeleteModal from '../../../public/js/modal/delete-modal.js';

test('basic test', function () {
    const deleteSpy = vi.fn(() => Promise.resolve());
    const modal = new DeleteModal({
        title: 'TEST TITLE',
        delete: deleteSpy,
    });

    const promise = modal.open();
    const form = modal.dialog.querySelector('form');
    const title = form.querySelector('.modal-title').textContent;
    expect(title).toBe('TEST TITLE');

    expect(deleteSpy).not.toHaveBeenCalled();
    form.requestSubmit();
    expect(deleteSpy).toHaveBeenCalled();

    return expect(promise).resolves.toBe('deleted');
});
