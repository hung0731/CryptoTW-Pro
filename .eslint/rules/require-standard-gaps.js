/**
 * ESLint Rule: require-standard-gaps
 * 
 * Enforces Card System v3.0 Hard Rule 16.5:
 * Only gap-3, gap-4, gap-6 are allowed
 * 
 * Examples:
 * ❌ <div className="gap-2">
 * ❌ <div className="gap-5">
 * ✅ <div className="gap-3">
 * ✅ <div className="gap-4">
 */

module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce standard gap values (gap-3, gap-4, gap-6)',
            category: 'Design System',
            recommended: true,
        },
        messages: {
            nonStandardGap: 'Use standard gaps only: gap-3, gap-4, or gap-6. Found: {{gap}}',
        },
        fixable: 'code',
        schema: [],
    },

    create(context) {
        const ALLOWED_GAPS = ['gap-3', 'gap-4', 'gap-6'];
        const GAP_PATTERN = /gap-(\d+)/g;

        return {
            JSXAttribute(node) {
                if (node.name.name !== 'className') return;
                if (!node.value) return;

                let classNameValue = '';

                // Extract className value
                if (node.value.type === 'Literal') {
                    classNameValue = node.value.value || '';
                } else if (node.value.type === 'JSXExpressionContainer') {
                    // For dynamic classNames like cn(...), we can't easily check
                    // Skip for now
                    return;
                }

                // Check for gap-* classes
                const matches = classNameValue.match(GAP_PATTERN);
                if (!matches) return;

                for (const gapClass of matches) {
                    if (!ALLOWED_GAPS.includes(gapClass)) {
                        context.report({
                            node,
                            messageId: 'nonStandardGap',
                            data: { gap: gapClass },
                            fix(fixer) {
                                // Suggest closest standard gap
                                const gapNum = parseInt(gapClass.split('-')[1]);
                                const closest = gapNum <= 3 ? 'gap-3' : gapNum <= 5 ? 'gap-4' : 'gap-6';

                                const newClassName = classNameValue.replace(gapClass, closest);
                                return fixer.replaceText(node.value, `"${newClassName}"`);
                            }
                        });
                    }
                }
            },
        };
    },
};
