/**
 * 检查SharedArrayBuffer支持
 */
export declare function checkSharedArrayBufferSupport(): boolean
/**
 * 位置转换为字符串格式 (如 A1, B2)
 */
export declare function positionToString(pos: [number, number]): string
/**
 * 字符串格式转换为位置 (如 A1 -> [0, 0])
 */
export declare function stringToPosition(str: string): [number, number]
/**
 * 评估值字符串转数值
 */
export declare function evalStringToNumber(evalStr: string): number
/**
 * 获取默认线程数
 */
export declare function getDefaultThreadNum(): number
