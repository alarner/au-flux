const path = require('path');

module.exports = {
	entry: './src/index.js',
	module: {
		loaders: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['react']
				}
			}
		]
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname)
	}
};
