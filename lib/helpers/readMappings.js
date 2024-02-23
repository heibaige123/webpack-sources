/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const ALPHABET =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * 二进制表示为00100000
 * 用于标记某个过程是否应该继续
 */
const CONTINUATION_BIT = 0x20;
/**
 * 二进制表示为01000000
 * 可能用于标记某个段落或部分是否结束
 */
const END_SEGMENT_BIT = 0x40;
/**
 * 二进制表示为01000001
 * 用于标记是否应该进入下一行
 */
const NEXT_LINE = END_SEGMENT_BIT | 0x01;
/**
 * 二进制表示为01000010
 * 用于标记某个值是否无效
 */
const INVALID = END_SEGMENT_BIT | 0x02;
/**
 * 二进制表示为00011111
 * 用于屏蔽某个值的特定位，通常用于只保留该值的低5位，而忽略高位
 */
const DATA_MASK = 0x1f;

const ccToValue = new Uint8Array("z".charCodeAt(0) + 1);
{
	ccToValue.fill(INVALID);
	for (let i = 0; i < ALPHABET.length; i++) {
		ccToValue[ALPHABET.charCodeAt(i)] = i;
	}
	ccToValue[",".charCodeAt(0)] = END_SEGMENT_BIT;
	ccToValue[";".charCodeAt(0)] = NEXT_LINE;
}
const ccMax = ccToValue.length - 1;

/**
 * 解析源代码映射的编码，并使用onMapping函数处理解析出的映射信息。
 * 源代码映射是一种技术，用于将编译、压缩或转换后的代码映射回原始源代码，以便于调试和分析
 *
 * @param {string} mappings the mappings string
 * @param {function(number, number, number, number, number, number): void} onMapping called for each mapping
 * @returns {void}
 */
const readMappings = (mappings, onMapping) => {
	// generatedColumn, [sourceIndex, originalLine, orignalColumn, [nameIndex]]
	const currentData = new Uint32Array([0, 0, 1, 0, 0]);
	let currentDataPos = 0;
	// currentValue will include a sign bit at bit 0
	let currentValue = 0;
	let currentValuePos = 0;
	let generatedLine = 1;
	let generatedColumn = -1;
	for (let i = 0; i < mappings.length; i++) {
		const cc = mappings.charCodeAt(i);
		if (cc > ccMax) continue;
		const value = ccToValue[cc];
		if ((value & END_SEGMENT_BIT) !== 0) {
			// End current segment
			if (currentData[0] > generatedColumn) {
				if (currentDataPos === 1) {
					onMapping(generatedLine, currentData[0], -1, -1, -1, -1);
				} else if (currentDataPos === 4) {
					onMapping(
						generatedLine,
						currentData[0],
						currentData[1],
						currentData[2],
						currentData[3],
						-1
					);
				} else if (currentDataPos === 5) {
					onMapping(
						generatedLine,
						currentData[0],
						currentData[1],
						currentData[2],
						currentData[3],
						currentData[4]
					);
				}
				generatedColumn = currentData[0];
			}
			currentDataPos = 0;
			if (value === NEXT_LINE) {
				// Start new line
				generatedLine++;
				currentData[0] = 0;
				generatedColumn = -1;
			}
		} else if ((value & CONTINUATION_BIT) === 0) {
			// last sextet
			currentValue |= value << currentValuePos;
			const finalValue =
				currentValue & 1 ? -(currentValue >> 1) : currentValue >> 1;
			currentData[currentDataPos++] += finalValue;
			currentValuePos = 0;
			currentValue = 0;
		} else {
			currentValue |= (value & DATA_MASK) << currentValuePos;
			currentValuePos += 5;
		}
	}
	// End current segment
	if (currentDataPos === 1) {
		onMapping(generatedLine, currentData[0], -1, -1, -1, -1);
	} else if (currentDataPos === 4) {
		onMapping(
			generatedLine,
			currentData[0],
			currentData[1],
			currentData[2],
			currentData[3],
			-1
		);
	} else if (currentDataPos === 5) {
		onMapping(
			generatedLine,
			currentData[0],
			currentData[1],
			currentData[2],
			currentData[3],
			currentData[4]
		);
	}
};

module.exports = readMappings;
