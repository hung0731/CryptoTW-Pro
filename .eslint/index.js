/**
 * ESLint Plugin: CryptoTW Card System
 * 
 * Custom rules to enforce Card System v3.0 compliance
 */

const enforceVariantSizeMatrix = require('./rules/enforce-variant-size-matrix');
const noNestedCards = require('./rules/no-nested-cards');
const requireStandardGaps = require('./rules/require-standard-gaps');

module.exports = {
    rules: {
        'enforce-variant-size-matrix': enforceVariantSizeMatrix,
        'no-nested-cards': noNestedCards,
        'require-standard-gaps': requireStandardGaps,
    },

    configs: {
        recommended: {
            plugins: ['@cryptotw/card-system'],
            rules: {
                '@cryptotw/card-system/enforce-variant-size-matrix': 'error',
                '@cryptotw/card-system/no-nested-cards': 'error',
                '@cryptotw/card-system/require-standard-gaps': 'warn',
            },
        },
    },
};
