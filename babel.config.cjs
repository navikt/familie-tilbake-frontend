// Jest nekter å lese .babelrc-filer, så da får det bli babel.config.cjs
module.exports = api => {
    api.cache(true);

    return {
        presets: ['react-app'],
        plugins: ['babel-plugin-styled-components'],
        env: {
            testing: {
                presets: ['@babel/preset-env', { targets: { node: 'current' } }],
            },
        },
    };
};
