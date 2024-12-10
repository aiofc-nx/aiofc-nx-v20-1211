import { getValueFromPath, setValueFromPath } from './value-from-path';

/**
 * 测试 getValueFromPath 函数
 *
 * @description
 * 测试从对象中根据路径获取值的功能:
 * 1. 获取顶层属性值
 * 2. 获取嵌套属性值
 * 3. 获取不存在路径的值返回undefined
 */
describe('getValueFromPath', () => {
    const obj = { a: { b: { c: 4 } } };
    it('gets top level value from path', () => {
        expect(getValueFromPath(obj, 'a')).toEqual({ b: { c: 4 } });
    });
    it('gets nested value from path', () => {
        expect(getValueFromPath(obj, 'a.b.c')).toEqual(4);
    });
    it('gets undefined for value that does not exist', () => {
        expect(getValueFromPath(obj, 'a.b.c.d' as any)).toBeUndefined;
    });
});

/**
 * 测试 setValueFromPath 函数
 *
 * @description
 * 测试根据路径设置对象值的功能:
 * 1. 设置顶层属性值
 * 2. 设置嵌套属性值
 * 3. 设置嵌套值时不覆盖已存在的其他属性
 */
describe('setValueFromPath', () => {
    const expected = { a: { b: { c: 4 } } };
    it('sets top level value from path', () => {
        const obj = {} as typeof expected;
        expect(setValueFromPath(obj, 'a', { b: { c: 4 } })).toEqual(expected);
    });
    it('gets nested value from path', () => {
        const obj = {} as typeof expected;
        expect(setValueFromPath(obj, 'a.b.c', 4)).toEqual(expected);
    });
    it("doesn't overwrite existing values if nested value is set", () => {
        const expected2 = expected as any;
        expected2.a.d = 8;
        const obj = {} as typeof expected;
        setValueFromPath(obj, 'a.b.c', 4);
        setValueFromPath(obj, 'a.d' as any, 8);
        expect(obj).toEqual(expected2);
    });
});
