import { execa } from 'execa'

/*
 * 根据环境变量判断运行模式:
 * - 生产环境: 直接导入构建后的服务器代码
 * - 开发环境: 使用tsx监视文件变化并实时重启服务器
 */
if (process.env.NODE_ENV === 'production') {
	// 生产环境下导入构建后的服务器代码
	await import('../server-build/index.js')
} else {
	/*
	 * 开发环境下使用tsx watch命令:
	 * - --clear-screen=false: 禁止清屏
	 * - --ignore: 忽略不需要监视的文件/目录
	 * - --inspect: 启用调试模式
	 */
	const command =
		'tsx watch --clear-screen=false --ignore ".cache/**" --ignore "app/**" --ignore "vite.config.ts.timestamp-*" --ignore "build/**" --ignore "node_modules/**" --inspect ./index.js'

	/*
	 * 使用execa执行命令:
	 * - stdio: 配置标准输入输出
	 * - shell: 在shell中执行命令
	 * - env: 设置环境变量
	 * - windowsHide: Windows下不隐藏控制台窗口
	 */
	execa(command, {
		stdio: ['ignore', 'inherit', 'inherit'],
		shell: true,
		env: {
			FORCE_COLOR: true,
			MOCKS: true,
			...process.env,
		},
		// https://github.com/sindresorhus/execa/issues/433
		windowsHide: false,
	})
}
