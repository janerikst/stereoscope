var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	context: __dirname + '/src',
	entry: {
		app: './jsx/main.jsx',
	},
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'js/[name].js',
	},
	resolve: {
		extensions: ['', '.js', '.jsx'],
		modulesDirectories: ['src/jsx', 'node_modules'],
		root: [path.resolve('./src')],
		alias: {},
	},
	devServer: {
		// host: '192.168.1.101',
		port: 8080,
		historyApiFallback: true,
	},
	module: {
		loaders: [
			/*
			{
				test: /\.jsx?$/,
				enforce: 'pre',
				loader: 'eslint-loader',
				options: {
					emitWarning: true,
				},
			},*/
			{
				exclude: /node_modules/,
				test: /\.jsx?$/,
				loader: 'babel',
			},
			{
				test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.eot$|\.wav$|\.mp3$|\.tsv$|\.csv$|\.txt$|\.json$/,
				loader: 'file?name=[name]-[hash:6].[ext]',
			},
			{
				test: /\.html$/,
				loader:
					'file?name=[name].[ext]!extract-loader!html?interpolate=require',
			},
			{
				test: /\.css$/,
				loaders: ['style?name=[name]-[hash:6].[ext]', 'css'],
			},
			{
				test: /\.sass$/,
				loaders: [
					'style?name=[name]-[hash:6].[ext]',
					'css',
					'sass?indentedSyntax',
				],
			},
		],
	},
	// context: path.join(__dirname, 'build'),
	plugins: [
		new webpack.EnvironmentPlugin('NODE_ENV'),
		new CopyWebpackPlugin([{ from: 'data/', to: 'data/' }], {
			debug: true,
		}),
	],
};
