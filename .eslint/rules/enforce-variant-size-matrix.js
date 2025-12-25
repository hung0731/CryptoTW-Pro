/**
 * ESLint Rule: enforce-variant-size-matrix
 * 
 * Enforces Card System v3.0 Hard Rule 17.1:
 * Variant × Size matrix - certain combinations are forbidden
 * 
 * Examples:
 * ❌ <UniversalCard variant="highlight" size="S" />
 * ❌ <UniversalCard variant="clickable" size="M" />
 * ✅ <UniversalCard variant="highlight" size="M" />
 * ✅ <UniversalCard variant="clickable" size="S" />
 */

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce Card System v3.0 Variant × Size matrix',
            category: 'Design System',
            recommended: true,
        },
        messages: {
            invalidCombination: 'variant="{{variant}}" cannot use size="{{size}}". See Card System v3.0 spec Chapter 17.1.',
        },
        fixable: 'code',
        schema: [], // no options
    },

    create(context) {
        // Forbidden combinations per Card System v3.0
        const FORBIDDEN_COMBINATIONS = {
            highlight: ['S'],      // highlight can only be M or L
            clickable: ['M', 'L'], // clickable can only be S
            danger: ['S', 'L'],    // danger can only be M
            success: ['S', 'L'],   // success can only be M
        };

        // Helper to get attribute value
        function getAttributeValue(node, attrName) {
            const attr = node.attributes.find(
                a => a.type === 'JSXAttribute' && a.name.name === attrName
            );
            if (!attr || !attr.value) return null;

            // Handle string literals
            if (attr.value.type === 'Literal') {
                return attr.value.value;
            }

            // Handle JSX expressions
            if (attr.value.type === 'JSXExpressionContainer') {
                if (attr.value.expression.type === 'Literal') {
                    return attr.value.expression.value;
                }
            }

            return null;
        }

        return {
            JSXOpeningElement(node) {
                // Only check UniversalCard components
                if (node.name.name !== 'UniversalCard') return;

                const variant = getAttributeValue(node, 'variant');
                const size = getAttributeValue(node, 'size');

                // Skip if either is missing or dynamic
                if (!variant || !size) return;

                // Check if combination is forbidden
                const forbidden = FORBIDDEN_COMBINATIONS[variant];
                if (forbidden && forbidden.includes(size)) {
                    context.report({
                        node,
                        messageId: 'invalidCombination',
                        data: { variant, size },
                        fix(fixer) {
                            // Auto-fix by suggesting correct size
                            const sizeAttr = node.attributes.find(
                                a => a.type === 'JSXAttribute' && a.name.name === 'size'
                            );

                            if (!sizeAttr) return null;

                            // Suggest M for most cases, L for highlight
                            const suggestedSize = variant === 'highlight' ? 'L' : 'M';

                            return fixer.replaceText(
                                sizeAttr.value,
                                `"${suggestedSize}"`
                            );
                        }
                    });
                }
            },
        };
    },
};
