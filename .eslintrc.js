module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:react-app/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "plugin:prettier/recommended",
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2020,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "react-app",
        "prettier",
        "import"
    ],
    "rules": {
        "no-case-declarations": "off",
        "import/extensions": [
            "off",
            "ignorePackages",
            {
                "js": "never",
                "jsx": "never",
                "ts": "never",
                "tsx": "never"
            }
        ],
        '@typescript-eslint/ban-ts-comment': 'off',
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "prettier/prettier": "error",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { "vars": "all","args": "all", "argsIgnorePattern": "^_" }],
        "react-app/react-hooks/exhaustive-deps": "off",
        "import/named": "error",
        "import/namespace": "error",
        "import/default": "error",
        "import/export": "error",
        "import/order": [
            "error",
            {
                "alphabetize": {
                    "order": "asc",
                    "caseInsensitive": true
                },
                "newlines-between": "always",
                "groups": [
                    "builtin",
                    "external",
                    "internal",
                    ["parent", "sibling"],
                    "index"
                ],
                "pathGroups": [
                    {
                        "pattern": "react",
                        "group": "external",
                        "position": "before"
                    },
                    {
                        "pattern": "nav-**",
                        "group": "external",
                        "position": "after"
                    },
                    {
                        "pattern": "@navikt/**",
                        "group": "internal",
                        "position": "before"
                    }
                ],
                "pathGroupsExcludedImportTypes": [
                    "builtin"
                ]
            }
        ]
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
}