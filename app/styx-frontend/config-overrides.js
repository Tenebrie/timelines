var path = require('path')
const { override, babelInclude } = require('customize-cra')

module.exports = function (config, env) {
	return Object.assign(
		config,
		override(babelInclude([path.resolve('src'), path.resolve('../ts-shared/src')]))(config, env)
	)
}
