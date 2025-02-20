import { expect, test, vi } from 'vitest'
import api from '../../../public/js/api.esm.js';
import LayerEditSqlModal from '../../../public/js/modal/layer-edit-sql-modal.js';

vi.mock('../../../public/js/api.esm.js');

test('basic test', async function () {
    const returnedCollection = {
        collectionName: 'things',
        collectionLabel: 'things',
        elements: [
            {
                elementName: 'id',
                elementLabel: 'id',
                type: 'number',
            },
        ],
    }
    api.getSqlQueryCollection.mockImplementationOnce(() => Promise.resolve({ data: returnedCollection }));

    const modal = new LayerEditSqlModal({
        layer: {},
    });
    const promise = modal.open();
    const form = modal.dialog.querySelector('form');
    form.elements.collectionName.value = 'Test';
    form.elements.sqlQuery.value = 'SELECT * FROM things';
    form.requestSubmit();

    const json = await promise;
    const collection = JSON.parse(json);
    expect(collection).toEqual({
        collectionID: expect.any(String),
        collectionLabel: 'things',
        collectionName: 'things',
        elements: [
            {
                collectionID: expect.any(String),
                collectionName: 'things',
                elementID: expect.any(String),
                elementLabel: 'id',
                elementName: 'id',
                type: 'number',
            }
        ]
    });
});
