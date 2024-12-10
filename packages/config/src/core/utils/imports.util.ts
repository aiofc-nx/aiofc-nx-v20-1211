import type { plainToClass as _plainToClass } from 'class-transformer';
import type { validateSync as _validateSync } from 'class-validator';

const requireFromRootNodeModules = <T = any>(moduleName: string): T => {
  const modulePath = require.resolve(moduleName, { paths: ['../..', '.'] });
   
  return require(modulePath) as unknown as T;
};

export const { validateSync } = requireFromRootNodeModules<{
  validateSync: typeof _validateSync;
}>('class-validator');
export const { plainToClass } = requireFromRootNodeModules<{
  plainToClass: typeof _plainToClass;
}>('class-transformer');
