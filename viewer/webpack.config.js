const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const sveltePreprocess = require('svelte-preprocess');
const webpack = require("webpack");

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
	devServer: {
		port: 9090,
	},
	entry: {
		'build/bundle': ['./src/main.ts']
	},
	resolve: {
		alias: {
			svelte: path.dirname(require.resolve('svelte/package.json')),
			process: "process/browser",
		},
		extensions: ['.mjs', '.js', '.ts', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
		fallback: {
			"buffer": require.resolve("buffer"),
			"crypto": require.resolve("crypto-browserify"),
			"events": require.resolve("events/"),
			"http": require.resolve("stream-http"),
			"https": require.resolve("https-browserify"),
			"os": require.resolve("os-browserify"),
			"path": require.resolve("path-browserify"),
			"stream": require.resolve("stream-browserify"),
			"url": require.resolve("url/")
		}
	},
	output: {
		path: path.join(__dirname, '/public'),
		filename: '[name].js',
		chunkFilename: '[name].[id].js'
	},
	module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader',
					exclude: /node_modules/
				},
				{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							dev: !prod
						},
						emitCss: prod,
						hotReload: !prod,
							preprocess: sveltePreprocess({ sourceMap: !prod })
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
			{
				// required to prevent errors from Svelte on Webpack 5+
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			}
		]
	},
	mode,
	plugins: [
		new webpack.ProvidePlugin({
			Buffer: ['buffer', 'Buffer'],
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new webpack.DefinePlugin({
			'BUILD_MODE_DEV': !prod,
		}),		  
	],
	devtool: prod ? false : 'source-map',
	devServer: {
		hot: true
	}
};