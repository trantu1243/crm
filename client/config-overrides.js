const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        vm: require.resolve("vm-browserify"),
    };

    if (env === "production") {
        config.devtool = false;

        config.optimization.minimize = true;

        config.plugins.push(
            new JavaScriptObfuscator({
                rotateStringArray: true,
                stringArray: true,
                stringArrayThreshold: 0.75, 
            })
        );

        config.optimization.splitChunks = {
            chunks: "all",
        };
        config.optimization.runtimeChunk = false;
    }

    return config;
};
