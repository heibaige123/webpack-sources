/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

/**
 * 从给定的sourceMap对象的names数组中获取特定索引的元素
 * */
const getName = (sourceMap, index) => {
	if (index < 0) return null;
	const { names } = sourceMap;
	return names[index];
};

module.exports = getName;
