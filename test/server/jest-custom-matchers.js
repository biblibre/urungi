expect.extend({
    toBeAfterOrEqual (received, date) {
        const res = { pass: received.getTime() >= date.getTime() };
        if (res.pass) {
            res.message = () => `expected ${received.toISOString()} not to be after or equal to ${date.toISOString()}`;
        } else {
            res.message = () => `expected ${received.toISOString()} to be after or equal to ${date.toISOString()}`;
        }

        return res;
    },
    toBeAfter (received, date) {
        const res = { pass: received.getTime() > date.getTime() };
        if (res.pass) {
            res.message = () => `expected ${received.toISOString()} not to be after ${date.toISOString()}`;
        } else {
            res.message = () => `expected ${received.toISOString()} to be after ${date.toISOString()}`;
        }

        return res;
    },
    toBeBeforeOrEqual (received, date) {
        const res = { pass: received.getTime() <= date.getTime() };
        if (res.pass) {
            res.message = () => `expected ${received.toISOString()} not to be before or equal to ${date.toISOString()}`;
        } else {
            res.message = () => `expected ${received.toISOString()} to be before or equal to ${date.toISOString()}`;
        }

        return res;
    },
    toBeBefore (received, date) {
        const res = { pass: received.getTime() < date.getTime() };
        if (res.pass) {
            res.message = () => `expected ${received.toISOString()} not to be before ${date.toISOString()}`;
        } else {
            res.message = () => `expected ${received.toISOString()} to be before ${date.toISOString()}`;
        }

        return res;
    },
});
