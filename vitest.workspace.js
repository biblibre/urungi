import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
    {
        test: {
            name: 'front',
            root: './test/front',
            environment: 'happy-dom',
            setupFiles: ['setup.js'],
        },
    },
])
