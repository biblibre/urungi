import { describe, expect, test } from 'vitest'
import { v4 } from '../../public/js/uuid.js';

describe('uuid', function () {
    test('should return a valid UUID', function () {
        expect(v4()).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
    });
});
