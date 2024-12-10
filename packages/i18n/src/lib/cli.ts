#!/usr/bin/env node

/* istanbul ignore file */
import 'reflect-metadata';
import yargs from 'yargs';
import { GenerateTypesCommand } from './commands/generate-types.command';
import { VersionCommand } from './commands/version.command';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .recommendCommands()
  .command(new GenerateTypesCommand())
  .command(new VersionCommand())
  .demandCommand(1, '在继续之前您至少需要一个命令')
  .strict()
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv;


/*
这段代码配置了 yargs 实例：
usage：设置 CLI 工具的使用说明。
recommendCommands：在用户输入错误的命令时推荐正确的命令。
command：注册自定义命令 GenerateTypesCommand 和 VersionCommand。
demandCommand：要求至少提供一个命令，否则显示错误信息。
strict：启用严格模式，禁止未知命令和选项。
alias：设置命令别名，例如 -v 表示 --version，-h 表示 --help。
help：启用帮助信息。
通过这些配置，这个 CLI 工具可以解析和处理用户输入的命令和选项，并执行相应的操作。
GenerateTypesCommand 和 VersionCommand 是自定义的命令类，定义了具体的命令逻辑。
*/
