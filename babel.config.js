module.exports = function (api) {
    api.cache(true);
    return process.env.NODE_ENV === 'development' ? {} : {
        presets: [
            [
                '@babel/preset-env',
                {
                    loose: true,
                    useBuiltIns: "entry",
                    corejs: 3,
                    targets: [
                        "ie >= 9"
                    ],
                    modules: "umd"
                }
            ]
        ],
        plugins: [
            [
                "@babel/plugin-transform-runtime",
                {
                    "regenerator": true
                }
            ]
        ]
    };
};
