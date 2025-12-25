/**
 * ESLint Rule: no-nested-cards
 * 
 * Enforces Card System v3.0 Hard Rule 16.1:
 * Nested UniversalCard is absolutely forbidden
 * 
 * Examples:
 * ❌ <UniversalCard><UniversalCard /></UniversalCard>
 * ✅ <UniversalCard><div className="divide-y">...</div></UniversalCard>
 */

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent nested UniversalCard components',
            category: 'Design System',
            recommended: true,
        },
        messages: {
            nestedCard: 'Nested UniversalCard is forbidden. Use dividers instead. (Hard Rule 16.1)',
        },
        schema: [],
    },

    create(context) {
        let cardDepth = 0;

        return {
            JSXOpeningElement(node) {
                if (node.name.name === 'UniversalCard') {
                    cardDepth++;

                    if (cardDepth > 1) {
                        context.report({
                            node,
                            messageId: 'nestedCard',
                        });
                    }
                }
            },

            JSXClosingElement(node) {
                if (node.name.name === 'UniversalCard') {
                    cardDepth--;
                }
            },

            // Handle self-closing tags
            'JSXOpeningElement:exit'(node) {
                if (node.name.name === 'UniversalCard' && node.selfClosing) {
                    cardDepth--;
                }
            },
        };
    },
};
