/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

/**
 * 从给定的sourceMap对象的sources数组中获取特定索引的元素，并根据sourceRoot的值，返回完整的源文件路径
 */
const getSource = (sourceMap, index) => {
	if (index < 0) return null;
	const { sourceRoot, sources } = sourceMap;
	const source = sources[index];
	if (!sourceRoot) return source;
	if (sourceRoot.endsWith("/")) return sourceRoot + source;
	return sourceRoot + "/" + source;
};

module.exports = getSource;
