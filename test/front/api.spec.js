import { describe, test, expect, vi } from 'vitest';
import api from '../../public/js/api.js';

const fetch = vi.spyOn(window, 'fetch');

describe('api', function () {
    test('getSharedSpace', async function () {
        const getSharedSpaceResponse = { items: [] };
        fetch.mockImplementationOnce(() => Promise.resolve(createJsonResponse(getSharedSpaceResponse)));
        const sharedSpace = await api.getSharedSpace();

        expect(fetch).toHaveBeenCalled()
        expect(fetch.mock.lastCall[0].pathname).toEqual('/api/shared-space');
        expect(fetch.mock.lastCall[1].method).toEqual('GET');
        expect(sharedSpace).toEqual({
            response: expect.any(Response),
            data: getSharedSpaceResponse,
        });
    });
});

function createJsonResponse(object) {
    const response = new Response(JSON.stringify(object), {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response;
}
