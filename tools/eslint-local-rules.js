export default {
    rules: {
        "no-hardcoded-colors": {
            meta: {
                type: "suggestion",
                docs: {
                    description: "Disallow hardcoded color classes in favor of design tokens",
                },
                schema: [],
            },
            create(context) {
                return {
                    Literal(node) {
                        if (typeof node.value !== "string") return;

                        // Basic heuristic: check if we are inside a className attribute
                        if (node.parent.type === "JSXAttribute" && node.parent.name.name === "className") {
                            const forbiddenPattern = /\b(bg|text|border)-(neutral|slate|gray|zinc|stone)-(50|100|200|300|400|500|600|700|800|900|950)\b/;

                            if (forbiddenPattern.test(node.value)) {
                                context.report({
                                    node,
                                    message: "Avoid using hardcoded neutral colors ({{ value }}). Use design tokens (SURFACE.*, COLORS.*) or semantic colors instead.",
                                    data: {
                                        value: node.value.match(forbiddenPattern)[0]
                                    }
                                });
                            }
                        }
                    },
                };
            },
        },
    },
};
