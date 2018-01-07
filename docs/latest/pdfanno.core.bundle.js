(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PDFAnnoCore"] = factory();
	else
		root["PDFAnnoCore"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 66);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = convertToExportY;
/* harmony export (immutable) */ __webpack_exports__["a"] = convertFromExportY;
/* unused harmony export getPageSize */
/* harmony export (immutable) */ __webpack_exports__["c"] = nextZIndex;
/**
 * Convert the `y` position from the local coords to exported json.
 */
function convertToExportY (y) {

    let meta = getPageSize()

    y -= paddingTop

    let pageHeight = meta.height + paddingBetweenPages

    let pageNumber = Math.floor(y / pageHeight) + 1
    let yInPage = y - (pageNumber - 1) * pageHeight

    return { pageNumber, y : yInPage }
}

/**
 * Convert the `y` position from exported json to local coords.
 */
function convertFromExportY (pageNumber, yInPage) {

    let meta = getPageSize()

    let y = yInPage + paddingTop

    let pagePadding = paddingBetweenPages

    y += (pageNumber - 1) * (meta.height + pagePadding)

    return y
}

/**
 * The padding of page top.
 */
const paddingTop = 9

/**
 * The padding between pages.
 */
const paddingBetweenPages = 9
/* harmony export (immutable) */ __webpack_exports__["d"] = paddingBetweenPages;


/**
 * Get a page size of a single PDF page.
 */
function getPageSize () {

    let pdfView = window.PDFView || window.iframeWindow.PDFView

    let viewBox = pdfView.pdfViewer.getPageView(0).viewport.viewBox
    let size = { width : viewBox[2], height : viewBox[3] }
    return size
}

/**
 * Get the next z-index.
 */
function nextZIndex () {

    let w = (window.iframeWindow ? window.iframeWindow : window)

    if (!w.nextZIndex) {
        w.nextZIndex = 10
    }

    return w.nextZIndex++
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export setupResizableColumns */
/* unused harmony export tomlString */
/* harmony export (immutable) */ __webpack_exports__["a"] = uuid;
/* unused harmony export download */
/* unused harmony export loadFileAsText */
/**
 * Make the UI resizable.
 */
function setupResizableColumns () {
    // Make resizable.
    $('#tools').resizable({
        handles           : 'e',
        alsoResizeReverse : '#viewerWrapper',
        start             : () => {
            $('#viewer iframe').css({
                'pointer-events' : 'none'
            })
        },
        stop : () => {
            $('#viewer iframe').css({
                'pointer-events' : 'auto'
            })
        }
    })

    // Customize.
    $.ui.plugin.add('resizable', 'alsoResizeReverse', {

        start : function () {
            let that = $(this).resizable('instance')
            let o = that.options

            $(o.alsoResizeReverse).each(function () {
                var el = $(this)
                el.data('ui-resizable-alsoresizeReverse', {
                    width  : parseInt(el.width(), 10),
                    height : parseInt(el.height(), 10),
                    left   : parseInt(el.css('left'), 10),
                    top    : parseInt(el.css('top'), 10)
                })
            })
        },

        resize : function (event, ui) {
            let that = $(this).resizable('instance')
            let o = that.options
            let os = that.originalSize
            let op = that.originalPosition
            let delta = {
                height : (that.size.height - os.height) || 0,
                width  : (that.size.width - os.width) || 0,
                top    : (that.position.top - op.top) || 0,
                left   : (that.position.left - op.left) || 0
            }

            $(o.alsoResizeReverse).each(function () {
                let el = $(this)
                let start = $(this).data('ui-resizable-alsoresize-reverse')
                let style = {}
                let css = el.parents(ui.originalElement[0]).length
                        ? [ 'width', 'height' ]
                        : [ 'width', 'height', 'top', 'left' ]

                $.each(css, function (i, prop) {
                    let sum = (start[prop] || 0) - (delta[prop] || 0)
                    if (sum && sum >= 0) {
                        style[prop] = sum || null
                    }
                })

                el.css(style)
            })
        },

        stop : function () {
            $(this).removeData('resizable-alsoresize-reverse')
        }
    })
}

/**
 * Convert object to TOML String.
 */
function tomlString (obj, root = true) {
    let lines = []

    // `version` is first.
    if ('version' in obj) {
        lines.push(`version = "${obj['version']}"`)
        lines.push('')
        delete obj['version']
    }

    // #paperanno-ja/issues/38
    // Make all values in `position` as string.
    if ('position' in obj) {
        let position = obj.position
        position = position.map(p => {
            if (typeof p === 'number') {
                return String(p)
            } else {
                return p.map(v => String(v))
            }
        })
        obj.position = position
    }

    Object.keys(obj).forEach(prop => {
        let val = obj[prop]
        if (typeof val === 'string') {
            lines.push(`${prop} = "${val}"`)
            root && lines.push('')
        } else if (typeof val === 'number') {
            lines.push(`${prop} = ${val}`)
            root && lines.push('')
        } else if (isArray(val)) {
            lines.push(`${prop} = ${JSON.stringify(val)}`)
            root && lines.push('')
        } else if (typeof val === 'object') {
            lines.push(`[${prop}]`)
            lines.push(tomlString(val, false))
            root && lines.push('')
        }
    })

    return lines.join('\n')
}

/**
 * Check the value is array.
 */
function isArray (val) {
    return val && 'length' in val
}

/**
 * Generate a universally unique identifier
 *
 * @return {String}
 */
function uuid (len = 8) {

    // Length of ID characters.
    const ID_LENGTH = len

    // Candidates.
    const BASE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    // The number of candidates.
    const BASE_LEN = BASE.length

    let id = ''
    for (let i = 0; i < ID_LENGTH; i++) {
        id += BASE[ Math.floor(Math.random() * BASE_LEN) ]
    }
    return id
}

/**
 * Download a content with the fileName.
 */
function download (fileName, content) {
    let blob = new Blob([content])
    let blobURL = window.URL.createObjectURL(blob)
    let a = document.createElement('a')
    document.body.appendChild(a) // for Firefox working correctly.
    a.download = fileName
    a.href = blobURL
    a.click()
    a.parentNode.removeChild(a)
}

/**
 * Load a file as a text.
 */
function loadFileAsText (file) {
    return new Promise((resolve, reject) => {
        let fileReader = new FileReader()
        fileReader.onload = event => {
            const text = event.target.result
            resolve(text)
        }
        fileReader.onerror = err => {
            reject(err)
        }
        fileReader.readAsText(file)
    })
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = anyOf;
/* harmony export (immutable) */ __webpack_exports__["b"] = dispatchWindowEvent;
/**
 * Utility.
 */

function anyOf (target, candidates) {
    return candidates.filter(c => c === target).length > 0
}

/**
 * Dispatch a custom event to `window` object.
 */
function dispatchWindowEvent (eventName, data) {
    var event = document.createEvent('CustomEvent')
    event.initCustomEvent(eventName, true, true, data)
    window.dispatchEvent(event)
}


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var parser = __webpack_require__(8);
var compiler = __webpack_require__(9);

module.exports = {
  parse: function(input) {
    var nodes = parser.parse(input.toString());
    return compiler.compile(nodes);
  }
};


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = [],
        peg$c1 = function() { return nodes },
        peg$c2 = peg$FAILED,
        peg$c3 = "#",
        peg$c4 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c5 = void 0,
        peg$c6 = { type: "any", description: "any character" },
        peg$c7 = "[",
        peg$c8 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c9 = "]",
        peg$c10 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c11 = function(name) { addNode(node('ObjectPath', name, line, column)) },
        peg$c12 = function(name) { addNode(node('ArrayPath', name, line, column)) },
        peg$c13 = function(parts, name) { return parts.concat(name) },
        peg$c14 = function(name) { return [name] },
        peg$c15 = function(name) { return name },
        peg$c16 = ".",
        peg$c17 = { type: "literal", value: ".", description: "\".\"" },
        peg$c18 = "=",
        peg$c19 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c20 = function(key, value) { addNode(node('Assign', value, line, column, key)) },
        peg$c21 = function(chars) { return chars.join('') },
        peg$c22 = function(node) { return node.value },
        peg$c23 = "\"\"\"",
        peg$c24 = { type: "literal", value: "\"\"\"", description: "\"\\\"\\\"\\\"\"" },
        peg$c25 = null,
        peg$c26 = function(chars) { return node('String', chars.join(''), line, column) },
        peg$c27 = "\"",
        peg$c28 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c29 = "'''",
        peg$c30 = { type: "literal", value: "'''", description: "\"'''\"" },
        peg$c31 = "'",
        peg$c32 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c33 = function(char) { return char },
        peg$c34 = function(char) { return char},
        peg$c35 = "\\",
        peg$c36 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c37 = function() { return '' },
        peg$c38 = "e",
        peg$c39 = { type: "literal", value: "e", description: "\"e\"" },
        peg$c40 = "E",
        peg$c41 = { type: "literal", value: "E", description: "\"E\"" },
        peg$c42 = function(left, right) { return node('Float', parseFloat(left + 'e' + right), line, column) },
        peg$c43 = function(text) { return node('Float', parseFloat(text), line, column) },
        peg$c44 = "+",
        peg$c45 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c46 = function(digits) { return digits.join('') },
        peg$c47 = "-",
        peg$c48 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c49 = function(digits) { return '-' + digits.join('') },
        peg$c50 = function(text) { return node('Integer', parseInt(text, 10), line, column) },
        peg$c51 = "true",
        peg$c52 = { type: "literal", value: "true", description: "\"true\"" },
        peg$c53 = function() { return node('Boolean', true, line, column) },
        peg$c54 = "false",
        peg$c55 = { type: "literal", value: "false", description: "\"false\"" },
        peg$c56 = function() { return node('Boolean', false, line, column) },
        peg$c57 = function() { return node('Array', [], line, column) },
        peg$c58 = function(value) { return node('Array', value ? [value] : [], line, column) },
        peg$c59 = function(values) { return node('Array', values, line, column) },
        peg$c60 = function(values, value) { return node('Array', values.concat(value), line, column) },
        peg$c61 = function(value) { return value },
        peg$c62 = ",",
        peg$c63 = { type: "literal", value: ",", description: "\",\"" },
        peg$c64 = "{",
        peg$c65 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c66 = "}",
        peg$c67 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c68 = function(values) { return node('InlineTable', values, line, column) },
        peg$c69 = function(key, value) { return node('InlineTableValue', value, line, column, key) },
        peg$c70 = function(digits) { return "." + digits },
        peg$c71 = function(date) { return  date.join('') },
        peg$c72 = ":",
        peg$c73 = { type: "literal", value: ":", description: "\":\"" },
        peg$c74 = function(time) { return time.join('') },
        peg$c75 = "T",
        peg$c76 = { type: "literal", value: "T", description: "\"T\"" },
        peg$c77 = "Z",
        peg$c78 = { type: "literal", value: "Z", description: "\"Z\"" },
        peg$c79 = function(date, time) { return node('Date', new Date(date + "T" + time + "Z"), line, column) },
        peg$c80 = function(date, time) { return node('Date', new Date(date + "T" + time), line, column) },
        peg$c81 = /^[ \t]/,
        peg$c82 = { type: "class", value: "[ \\t]", description: "[ \\t]" },
        peg$c83 = "\n",
        peg$c84 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c85 = "\r",
        peg$c86 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c87 = /^[0-9a-f]/i,
        peg$c88 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
        peg$c89 = /^[0-9]/,
        peg$c90 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c91 = "_",
        peg$c92 = { type: "literal", value: "_", description: "\"_\"" },
        peg$c93 = function() { return "" },
        peg$c94 = /^[A-Za-z0-9_\-]/,
        peg$c95 = { type: "class", value: "[A-Za-z0-9_\\-]", description: "[A-Za-z0-9_\\-]" },
        peg$c96 = function(d) { return d.join('') },
        peg$c97 = "\\\"",
        peg$c98 = { type: "literal", value: "\\\"", description: "\"\\\\\\\"\"" },
        peg$c99 = function() { return '"'  },
        peg$c100 = "\\\\",
        peg$c101 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
        peg$c102 = function() { return '\\' },
        peg$c103 = "\\b",
        peg$c104 = { type: "literal", value: "\\b", description: "\"\\\\b\"" },
        peg$c105 = function() { return '\b' },
        peg$c106 = "\\t",
        peg$c107 = { type: "literal", value: "\\t", description: "\"\\\\t\"" },
        peg$c108 = function() { return '\t' },
        peg$c109 = "\\n",
        peg$c110 = { type: "literal", value: "\\n", description: "\"\\\\n\"" },
        peg$c111 = function() { return '\n' },
        peg$c112 = "\\f",
        peg$c113 = { type: "literal", value: "\\f", description: "\"\\\\f\"" },
        peg$c114 = function() { return '\f' },
        peg$c115 = "\\r",
        peg$c116 = { type: "literal", value: "\\r", description: "\"\\\\r\"" },
        peg$c117 = function() { return '\r' },
        peg$c118 = "\\U",
        peg$c119 = { type: "literal", value: "\\U", description: "\"\\\\U\"" },
        peg$c120 = function(digits) { return convertCodePoint(digits.join('')) },
        peg$c121 = "\\u",
        peg$c122 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$cache = {},
        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsestart() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 0,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseline();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseline();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c1();
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseline() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 49 + 1,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseS();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseS();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseexpression();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseS();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseS();
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parsecomment();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parsecomment();
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseNL();
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseNL();
                }
              } else {
                s5 = peg$c2;
              }
              if (s5 === peg$FAILED) {
                s5 = peg$parseEOF();
              }
              if (s5 !== peg$FAILED) {
                s1 = [s1, s2, s3, s4, s5];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseS();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseS();
          }
        } else {
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseNL();
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parseNL();
            }
          } else {
            s2 = peg$c2;
          }
          if (s2 === peg$FAILED) {
            s2 = peg$parseEOF();
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseNL();
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseexpression() {
      var s0;

      var key    = peg$currPos * 49 + 2,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parsecomment();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepath();
        if (s0 === peg$FAILED) {
          s0 = peg$parsetablearray();
          if (s0 === peg$FAILED) {
            s0 = peg$parseassignment();
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 49 + 3,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c3;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c4); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseNL();
        if (s5 === peg$FAILED) {
          s5 = peg$parseEOF();
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = peg$c5;
        } else {
          peg$currPos = s4;
          s4 = peg$c2;
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c6); }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c2;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseNL();
          if (s5 === peg$FAILED) {
            s5 = peg$parseEOF();
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = peg$c5;
          } else {
            peg$currPos = s4;
            s4 = peg$c2;
          }
          if (s4 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsepath() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 49 + 4,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseS();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseS();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsetable_key();
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parseS();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseS();
            }
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s5 = peg$c9;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c10); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c11(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetablearray() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      var key    = peg$currPos * 49 + 5,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 91) {
          s2 = peg$c7;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c8); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseS();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseS();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsetable_key();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseS();
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parseS();
              }
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s6 = peg$c9;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c10); }
                }
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s7 = peg$c9;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c10); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c12(s4);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetable_key() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 6,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsedot_ended_table_key_part();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsedot_ended_table_key_part();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsetable_key_part();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c13(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsetable_key_part();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c14(s1);
        }
        s0 = s1;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetable_key_part() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 49 + 7,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseS();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseS();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsekey();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseS();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseS();
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c15(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseS();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseS();
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsequoted_key();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseS();
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseS();
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c15(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedot_ended_table_key_part() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 49 + 8,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseS();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseS();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsekey();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseS();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseS();
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 46) {
              s4 = peg$c16;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c17); }
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseS();
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parseS();
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c15(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseS();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseS();
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsequoted_key();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseS();
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseS();
            }
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 46) {
                s4 = peg$c16;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c17); }
              }
              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseS();
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseS();
                }
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c15(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseassignment() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 49 + 9,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsekey();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseS();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseS();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s3 = peg$c18;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c19); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parseS();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseS();
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsevalue();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c20(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsequoted_key();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseS();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseS();
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s3 = peg$c18;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c19); }
            }
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$parseS();
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parseS();
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsevalue();
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c20(s1, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsekey() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 10,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseASCII_BASIC();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseASCII_BASIC();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c21(s1);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsequoted_key() {
      var s0, s1;

      var key    = peg$currPos * 49 + 11,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsedouble_quoted_single_line_string();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c22(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsesingle_quoted_single_line_string();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c22(s1);
        }
        s0 = s1;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsevalue() {
      var s0;

      var key    = peg$currPos * 49 + 12,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parsestring();
      if (s0 === peg$FAILED) {
        s0 = peg$parsedatetime();
        if (s0 === peg$FAILED) {
          s0 = peg$parsefloat();
          if (s0 === peg$FAILED) {
            s0 = peg$parseinteger();
            if (s0 === peg$FAILED) {
              s0 = peg$parseboolean();
              if (s0 === peg$FAILED) {
                s0 = peg$parsearray();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseinline_table();
                }
              }
            }
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsestring() {
      var s0;

      var key    = peg$currPos * 49 + 13,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parsedouble_quoted_multiline_string();
      if (s0 === peg$FAILED) {
        s0 = peg$parsedouble_quoted_single_line_string();
        if (s0 === peg$FAILED) {
          s0 = peg$parsesingle_quoted_multiline_string();
          if (s0 === peg$FAILED) {
            s0 = peg$parsesingle_quoted_single_line_string();
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedouble_quoted_multiline_string() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 49 + 14,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c23) {
        s1 = peg$c23;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNL();
        if (s2 === peg$FAILED) {
          s2 = peg$c25;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsemultiline_string_char();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsemultiline_string_char();
          }
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c23) {
              s4 = peg$c23;
              peg$currPos += 3;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c24); }
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c26(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedouble_quoted_single_line_string() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 49 + 15,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c27;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c28); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsestring_char();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsestring_char();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c27;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c28); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c26(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsesingle_quoted_multiline_string() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 49 + 16,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c29) {
        s1 = peg$c29;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNL();
        if (s2 === peg$FAILED) {
          s2 = peg$c25;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsemultiline_literal_char();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsemultiline_literal_char();
          }
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c29) {
              s4 = peg$c29;
              peg$currPos += 3;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c30); }
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c26(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsesingle_quoted_single_line_string() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 49 + 17,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c31;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseliteral_char();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseliteral_char();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 39) {
            s3 = peg$c31;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c32); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c26(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsestring_char() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 18,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseESCAPED();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 34) {
          s2 = peg$c27;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c28); }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = peg$c5;
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c6); }
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c33(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseliteral_char() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 19,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 39) {
        s2 = peg$c31;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c5;
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c6); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c33(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultiline_string_char() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 20,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseESCAPED();
      if (s0 === peg$FAILED) {
        s0 = peg$parsemultiline_string_delim();
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 3) === peg$c23) {
            s2 = peg$c23;
            peg$currPos += 3;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c24); }
          }
          peg$silentFails--;
          if (s2 === peg$FAILED) {
            s1 = peg$c5;
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
          if (s1 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c34(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultiline_string_delim() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 49 + 21,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c35;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c36); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNL();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseNLS();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseNLS();
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c37();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsemultiline_literal_char() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 22,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.substr(peg$currPos, 3) === peg$c29) {
        s2 = peg$c29;
        peg$currPos += 3;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c5;
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c6); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c33(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsefloat() {
      var s0, s1, s2, s3;

      var key    = peg$currPos * 49 + 23,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsefloat_text();
      if (s1 === peg$FAILED) {
        s1 = peg$parseinteger_text();
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 101) {
          s2 = peg$c38;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c39); }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 69) {
            s2 = peg$c40;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseinteger_text();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c42(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsefloat_text();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c43(s1);
        }
        s0 = s1;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsefloat_text() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 49 + 24,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 43) {
        s1 = peg$c44;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c25;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parseDIGITS();
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 46) {
            s4 = peg$c16;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c17); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseDIGITS();
            if (s5 !== peg$FAILED) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c46(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
          s1 = peg$c47;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c48); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          s3 = peg$parseDIGITS();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 46) {
              s4 = peg$c16;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c17); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseDIGITS();
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c49(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseinteger() {
      var s0, s1;

      var key    = peg$currPos * 49 + 25,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parseinteger_text();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c50(s1);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseinteger_text() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 49 + 26,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 43) {
        s1 = peg$c44;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c25;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseDIGIT_OR_UNDER();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseDIGIT_OR_UNDER();
          }
        } else {
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          peg$silentFails++;
          if (input.charCodeAt(peg$currPos) === 46) {
            s4 = peg$c16;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c17); }
          }
          peg$silentFails--;
          if (s4 === peg$FAILED) {
            s3 = peg$c5;
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c46(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
          s1 = peg$c47;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c48); }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseDIGIT_OR_UNDER();
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parseDIGIT_OR_UNDER();
            }
          } else {
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            peg$silentFails++;
            if (input.charCodeAt(peg$currPos) === 46) {
              s4 = peg$c16;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c17); }
            }
            peg$silentFails--;
            if (s4 === peg$FAILED) {
              s3 = peg$c5;
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c49(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseboolean() {
      var s0, s1;

      var key    = peg$currPos * 49 + 27,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c51) {
        s1 = peg$c51;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c53();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c54) {
          s1 = peg$c54;
          peg$currPos += 5;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c55); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c56();
        }
        s0 = s1;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsearray() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 49 + 28,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsearray_sep();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsearray_sep();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s3 = peg$c9;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c10); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c57();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
          s1 = peg$c7;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c8); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsearray_value();
          if (s2 === peg$FAILED) {
            s2 = peg$c25;
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 93) {
              s3 = peg$c9;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c10); }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c58(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c7;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parsearray_value_list();
            if (s3 !== peg$FAILED) {
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsearray_value_list();
              }
            } else {
              s2 = peg$c2;
            }
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s3 = peg$c9;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c10); }
              }
              if (s3 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c59(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 91) {
              s1 = peg$c7;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsearray_value_list();
              if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parsearray_value_list();
                }
              } else {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsearray_value();
                if (s3 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s4 = peg$c9;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c10); }
                  }
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c60(s2, s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsearray_value() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 49 + 29,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsearray_sep();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsearray_sep();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsevalue();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsearray_sep();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsearray_sep();
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c61(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsearray_value_list() {
      var s0, s1, s2, s3, s4, s5, s6;

      var key    = peg$currPos * 49 + 30,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsearray_sep();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsearray_sep();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsevalue();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parsearray_sep();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parsearray_sep();
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s4 = peg$c62;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c63); }
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parsearray_sep();
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parsearray_sep();
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c61(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsearray_sep() {
      var s0;

      var key    = peg$currPos * 49 + 31,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseS();
      if (s0 === peg$FAILED) {
        s0 = peg$parseNL();
        if (s0 === peg$FAILED) {
          s0 = peg$parsecomment();
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseinline_table() {
      var s0, s1, s2, s3, s4, s5;

      var key    = peg$currPos * 49 + 32,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c64;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c65); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseS();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseS();
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseinline_table_assignment();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseinline_table_assignment();
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parseS();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseS();
            }
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s5 = peg$c66;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c67); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c68(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseinline_table_assignment() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      var key    = peg$currPos * 49 + 33,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseS();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseS();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsekey();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseS();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseS();
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s4 = peg$c18;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c19); }
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseS();
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parseS();
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsevalue();
                if (s6 !== peg$FAILED) {
                  s7 = [];
                  s8 = peg$parseS();
                  while (s8 !== peg$FAILED) {
                    s7.push(s8);
                    s8 = peg$parseS();
                  }
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 44) {
                      s8 = peg$c62;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c63); }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = [];
                      s10 = peg$parseS();
                      while (s10 !== peg$FAILED) {
                        s9.push(s10);
                        s10 = peg$parseS();
                      }
                      if (s9 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c69(s2, s6);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseS();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseS();
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsekey();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseS();
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseS();
            }
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 61) {
                s4 = peg$c18;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c19); }
              }
              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseS();
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseS();
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsevalue();
                  if (s6 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c69(s2, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsesecfragment() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 34,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c16;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c17); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseDIGITS();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c70(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedate() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      var key    = peg$currPos * 49 + 35,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseDIGIT_OR_UNDER();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseDIGIT_OR_UNDER();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseDIGIT_OR_UNDER();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseDIGIT_OR_UNDER();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 45) {
                s6 = peg$c47;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c48); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parseDIGIT_OR_UNDER();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseDIGIT_OR_UNDER();
                  if (s8 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 45) {
                      s9 = peg$c47;
                      peg$currPos++;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c48); }
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parseDIGIT_OR_UNDER();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseDIGIT_OR_UNDER();
                        if (s11 !== peg$FAILED) {
                          s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11];
                          s1 = s2;
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c2;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c2;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c2;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c2;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c71(s1);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetime() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      var key    = peg$currPos * 49 + 36,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseDIGIT_OR_UNDER();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseDIGIT_OR_UNDER();
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s4 = peg$c72;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c73); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseDIGIT_OR_UNDER();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseDIGIT_OR_UNDER();
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                  s7 = peg$c72;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c73); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseDIGIT_OR_UNDER();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseDIGIT_OR_UNDER();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parsesecfragment();
                      if (s10 === peg$FAILED) {
                        s10 = peg$c25;
                      }
                      if (s10 !== peg$FAILED) {
                        s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10];
                        s1 = s2;
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c2;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c2;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c2;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c74(s1);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsetime_with_offset() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16;

      var key    = peg$currPos * 49 + 37,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseDIGIT_OR_UNDER();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseDIGIT_OR_UNDER();
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s4 = peg$c72;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c73); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseDIGIT_OR_UNDER();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseDIGIT_OR_UNDER();
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                  s7 = peg$c72;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c73); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseDIGIT_OR_UNDER();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseDIGIT_OR_UNDER();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parsesecfragment();
                      if (s10 === peg$FAILED) {
                        s10 = peg$c25;
                      }
                      if (s10 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 45) {
                          s11 = peg$c47;
                          peg$currPos++;
                        } else {
                          s11 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c48); }
                        }
                        if (s11 === peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 43) {
                            s11 = peg$c44;
                            peg$currPos++;
                          } else {
                            s11 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c45); }
                          }
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parseDIGIT_OR_UNDER();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseDIGIT_OR_UNDER();
                            if (s13 !== peg$FAILED) {
                              if (input.charCodeAt(peg$currPos) === 58) {
                                s14 = peg$c72;
                                peg$currPos++;
                              } else {
                                s14 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c73); }
                              }
                              if (s14 !== peg$FAILED) {
                                s15 = peg$parseDIGIT_OR_UNDER();
                                if (s15 !== peg$FAILED) {
                                  s16 = peg$parseDIGIT_OR_UNDER();
                                  if (s16 !== peg$FAILED) {
                                    s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16];
                                    s1 = s2;
                                  } else {
                                    peg$currPos = s1;
                                    s1 = peg$c2;
                                  }
                                } else {
                                  peg$currPos = s1;
                                  s1 = peg$c2;
                                }
                              } else {
                                peg$currPos = s1;
                                s1 = peg$c2;
                              }
                            } else {
                              peg$currPos = s1;
                              s1 = peg$c2;
                            }
                          } else {
                            peg$currPos = s1;
                            s1 = peg$c2;
                          }
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c2;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c2;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c2;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c2;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c74(s1);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parsedatetime() {
      var s0, s1, s2, s3, s4;

      var key    = peg$currPos * 49 + 38,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = peg$parsedate();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 84) {
          s2 = peg$c75;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c76); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsetime();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 90) {
              s4 = peg$c77;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c78); }
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c79(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsedate();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 84) {
            s2 = peg$c75;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c76); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsetime_with_offset();
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c80(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseS() {
      var s0;

      var key    = peg$currPos * 49 + 39,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c81.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c82); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseNL() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 40,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (input.charCodeAt(peg$currPos) === 10) {
        s0 = peg$c83;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c84); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 13) {
          s1 = peg$c85;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c86); }
        }
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 10) {
            s2 = peg$c83;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c84); }
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseNLS() {
      var s0;

      var key    = peg$currPos * 49 + 41,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$parseNL();
      if (s0 === peg$FAILED) {
        s0 = peg$parseS();
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseEOF() {
      var s0, s1;

      var key    = peg$currPos * 49 + 42,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      peg$silentFails++;
      if (input.length > peg$currPos) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c6); }
      }
      peg$silentFails--;
      if (s1 === peg$FAILED) {
        s0 = peg$c5;
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseHEX() {
      var s0;

      var key    = peg$currPos * 49 + 43,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c87.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c88); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseDIGIT_OR_UNDER() {
      var s0, s1;

      var key    = peg$currPos * 49 + 44,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c89.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c90); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 95) {
          s1 = peg$c91;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c92); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c93();
        }
        s0 = s1;
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseASCII_BASIC() {
      var s0;

      var key    = peg$currPos * 49 + 45,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      if (peg$c94.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c95); }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseDIGITS() {
      var s0, s1, s2;

      var key    = peg$currPos * 49 + 46,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseDIGIT_OR_UNDER();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseDIGIT_OR_UNDER();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c96(s1);
      }
      s0 = s1;

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseESCAPED() {
      var s0, s1;

      var key    = peg$currPos * 49 + 47,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c97) {
        s1 = peg$c97;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c98); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c99();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c100) {
          s1 = peg$c100;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c101); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c102();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c103) {
            s1 = peg$c103;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c104); }
          }
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c105();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c106) {
              s1 = peg$c106;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c107); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c108();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c109) {
                s1 = peg$c109;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c110); }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c111();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c112) {
                  s1 = peg$c112;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c113); }
                }
                if (s1 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c114();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c115) {
                    s1 = peg$c115;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c116); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c117();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseESCAPED_UNICODE();
                  }
                }
              }
            }
          }
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }

    function peg$parseESCAPED_UNICODE() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      var key    = peg$currPos * 49 + 48,
          cached = peg$cache[key];

      if (cached) {
        peg$currPos = cached.nextPos;
        return cached.result;
      }

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c118) {
        s1 = peg$c118;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parseHEX();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseHEX();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseHEX();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseHEX();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseHEX();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseHEX();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseHEX();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parseHEX();
                      if (s10 !== peg$FAILED) {
                        s3 = [s3, s4, s5, s6, s7, s8, s9, s10];
                        s2 = s3;
                      } else {
                        peg$currPos = s2;
                        s2 = peg$c2;
                      }
                    } else {
                      peg$currPos = s2;
                      s2 = peg$c2;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c2;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c120(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c121) {
          s1 = peg$c121;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c122); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          s3 = peg$parseHEX();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseHEX();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseHEX();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseHEX();
                if (s6 !== peg$FAILED) {
                  s3 = [s3, s4, s5, s6];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c120(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      peg$cache[key] = { nextPos: peg$currPos, result: s0 };

      return s0;
    }


      var nodes = [];

      function genError(err, line, col) {
        var ex = new Error(err);
        ex.line = line;
        ex.column = col;
        throw ex;
      }

      function addNode(node) {
        nodes.push(node);
      }

      function node(type, value, line, column, key) {
        var obj = { type: type, value: value, line: line(), column: column() };
        if (key) obj.key = key;
        return obj;
      }

      function convertCodePoint(str, line, col) {
        var num = parseInt("0x" + str);

        if (
          !isFinite(num) ||
          Math.floor(num) != num ||
          num < 0 ||
          num > 0x10FFFF ||
          (num > 0xD7FF && num < 0xE000)
        ) {
          genError("Invalid Unicode escape code: " + str, line, col);
        } else {
          return fromCodePoint(num);
        }
      }

      function fromCodePoint() {
        var MAX_SIZE = 0x4000;
        var codeUnits = [];
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
          return '';
        }
        var result = '';
        while (++index < length) {
          var codePoint = Number(arguments[index]);
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint);
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            highSurrogate = (codePoint >> 10) + 0xD800;
            lowSurrogate = (codePoint % 0x400) + 0xDC00;
            codeUnits.push(highSurrogate, lowSurrogate);
          }
          if (index + 1 == length || codeUnits.length > MAX_SIZE) {
            result += String.fromCharCode.apply(null, codeUnits);
            codeUnits.length = 0;
          }
        }
        return result;
      }


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function compile(nodes) {
  var assignedPaths = [];
  var valueAssignments = [];
  var currentPath = "";
  var data = {};
  var context = data;
  var arrayMode = false;

  return reduce(nodes);

  function reduce(nodes) {
    var node;
    for (var i in nodes) {
      node = nodes[i];
      switch (node.type) {
      case "Assign":
        assign(node);
        break;
      case "ObjectPath":
        setPath(node);
        break;
      case "ArrayPath":
        addTableArray(node);
        break;
      }
    }

    return data;
  }

  function genError(err, line, col) {
    var ex = new Error(err);
    ex.line = line;
    ex.column = col;
    throw ex;
  }

  function assign(node) {
    var key = node.key;
    var value = node.value;
    var line = node.line;
    var column = node.column;

    var fullPath;
    if (currentPath) {
      fullPath = currentPath + "." + key;
    } else {
      fullPath = key;
    }
    if (typeof context[key] !== "undefined") {
      genError("Cannot redefine existing key '" + fullPath + "'.", line, column);
    }

    context[key] = reduceValueNode(value);

    if (!pathAssigned(fullPath)) {
      assignedPaths.push(fullPath);
      valueAssignments.push(fullPath);
    }
  }


  function pathAssigned(path) {
    return assignedPaths.indexOf(path) !== -1;
  }

  function reduceValueNode(node) {
    if (node.type === "Array") {
      return reduceArrayWithTypeChecking(node.value);
    } else if (node.type === "InlineTable") {
      return reduceInlineTableNode(node.value);
    } else {
      return node.value;
    }
  }

  function reduceInlineTableNode(values) {
    var obj = {};
    for (var i = 0; i < values.length; i++) {
      var val = values[i];
      if (val.value.type === "InlineTable") {
        obj[val.key] = reduceInlineTableNode(val.value.value);
      } else if (val.type === "InlineTableValue") {
        obj[val.key] = reduceValueNode(val.value);
      }
    }

    return obj;
  }

  function setPath(node) {
    var path = node.value;
    var quotedPath = path.map(quoteDottedString).join(".");
    var line = node.line;
    var column = node.column;

    if (pathAssigned(quotedPath)) {
      genError("Cannot redefine existing key '" + path + "'.", line, column);
    }
    assignedPaths.push(quotedPath);
    context = deepRef(data, path, {}, line, column);
    currentPath = path;
  }

  function addTableArray(node) {
    var path = node.value;
    var quotedPath = path.map(quoteDottedString).join(".");
    var line = node.line;
    var column = node.column;

    if (!pathAssigned(quotedPath)) {
      assignedPaths.push(quotedPath);
    }
    assignedPaths = assignedPaths.filter(function(p) {
      return p.indexOf(quotedPath) !== 0;
    });
    assignedPaths.push(quotedPath);
    context = deepRef(data, path, [], line, column);
    currentPath = quotedPath;

    if (context instanceof Array) {
      var newObj = {};
      context.push(newObj);
      context = newObj;
    } else {
      genError("Cannot redefine existing key '" + path + "'.", line, column);
    }
  }

  // Given a path 'a.b.c', create (as necessary) `start.a`,
  // `start.a.b`, and `start.a.b.c`, assigning `value` to `start.a.b.c`.
  // If `a` or `b` are arrays and have items in them, the last item in the
  // array is used as the context for the next sub-path.
  function deepRef(start, keys, value, line, column) {
    var key;
    var traversed = [];
    var traversedPath = "";
    var path = keys.join(".");
    var ctx = start;
    var keysLen = keys.length;

    for (var i in keys) {
      key = keys[i];
      traversed.push(key);
      traversedPath = traversed.join(".");
      if (typeof ctx[key] === "undefined") {
        if (i === String(keysLen - 1)) {
          ctx[key] = value;
        } else {
          ctx[key] = {};
        }
      } else if (i !== keysLen - 1 && valueAssignments.indexOf(traversedPath) > -1) {
        // already a non-object value at key, can't be used as part of a new path
        genError("Cannot redefine existing key '" + traversedPath + "'.", line, column);
      }

      ctx = ctx[key];
      if (ctx instanceof Array && ctx.length && i < keys.length - 1) {
        ctx = ctx[ctx.length - 1];
      }
    }

    return ctx;
  }

  function reduceArrayWithTypeChecking(array) {
    // Ensure that all items in the array are of the same type
    var firstType = null;
    for(var i in array) {
      var node = array[i];
      if (firstType === null) {
        firstType = node.type;
      } else if ((node.type === "Integer" || node.type === "Float") && (firstType === "Integer" || firstType === "Float")) {
        // OK.
      } else if (node.type !== firstType) {
        genError("Cannot add value of type " + node.type + " to array of type " +
          firstType + ".", node.line, node.column);
      }
    }

    // Recursively reduce array of nodes into array of the nodes' values
    return array.map(reduceValueNode);
  }

  function quoteDottedString(str) {
    if (str.indexOf(".") > -1) {
      return "\"" + str + "\"";
    } else {
      return str;
    }
  }
}

module.exports = {
  compile: compile
};


/***/ }),
/* 10 */,
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_anno_ui_src_utils__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__abstract__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shared_coords__ = __webpack_require__(1);




/**
 * Span Annotation.
 */
class SpanAnnotation extends __WEBPACK_IMPORTED_MODULE_1__abstract__["a" /* default */] {

    /**
     * Constructor.
     */
    constructor () {
        super()

        this.uuid       = null
        this.type       = 'span'
        this.rectangles = []
        this.text       = null
        this.color      = null
        this.readOnly   = false
        this.$element   = this.createDummyElement()

        window.globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation)
        window.globalEvent.on('enableViewMode', this.enableViewMode)
    }

    /**
     * Create an instance from an annotation data.
     */
    static newInstance (annotation) {
        let a          = new SpanAnnotation()
        a.uuid         = annotation.uuid || __WEBPACK_IMPORTED_MODULE_0_anno_ui_src_utils__["a" /* uuid */]()
        a.rectangles   = annotation.rectangles
        a.text         = annotation.text
        a.color        = annotation.color
        a.readOnly     = annotation.readOnly || false
        a.selectedText = annotation.selectedText
        a.textRange    = annotation.textRange
        a.zIndex       = annotation.zIndex || 10
        return a
    }

    /**
     * Create an instance from a TOML object.
     */
    static newInstanceFromTomlObject (tomlObject) {
        let d = tomlObject
        // position: String -> Float.
        let position = d.position.map(p => p.map(parseFloat))
        d.selectedText = d.text
        d.text = d.label
        d.textRange = d.textrange
        // Convert.
        d.rectangles = position.map(p => {
            return {
                x      : p[0],
                y      : __WEBPACK_IMPORTED_MODULE_2__shared_coords__["a" /* convertFromExportY */](d.page, p[1]),
                width  : p[2],
                height : p[3]
            }
        })
        let span = SpanAnnotation.newInstance(d)
        return span
    }

    /**
     * Set a hover event.
     */
    setHoverEvent () {
        this.$element.find('.anno-knob').hover(
            this.handleHoverInEvent,
            this.handleHoverOutEvent
        )
    }

    /**
     * Delete the annotation from rendering, a container in window, and a container in localStorage.
     */
    destroy () {
        let promise = super.destroy()
        this.emit('delete')

        // TODO オブジェクトベースで削除できるようにしたい.
        window.globalEvent.removeListener('deleteSelectedAnnotation', this.deleteSelectedAnnotation)
        window.globalEvent.removeListener('enableViewMode', this.enableViewMode)
        return promise
    }

    /**
     * Create an annotation data for save.
     */
    createAnnotation () {
        return {
            uuid         : this.uuid,
            type         : this.type,
            rectangles   : this.rectangles,
            text         : this.text,
            color        : this.color,
            readyOnly    : this.readOnly,
            selectedText : this.selectedText
        }
    }

    /**
     * Get the position for text.
     */
    getTextPosition () {

        let p = null

        if (this.rectangles.length > 0) {
            p = {
                x : this.rectangles[0].x + 7,
                y : this.rectangles[0].y - 20
            }
        }

        return p
    }

    /**
     * Delete the annotation if selected.
     */
    deleteSelectedAnnotation () {
        super.deleteSelectedAnnotation()
    }

    /**
     * Handle a selected event on a text.
     */
    handleTextSelected () {
        this.select()
    }

    /**
     * Handle a deselected event on a text.
     */
    handleTextDeselected () {
        this.deselect()
    }

    /**
     * Handle a hovein event on a text.
     */
    handleTextHoverIn () {
        this.highlight()
        this.emit('hoverin')
    }

    /**
     * Handle a hoveout event on a text.
     */
    handleTextHoverOut () {
        this.dehighlight()
        this.emit('hoverout')
    }

    /**
     * Save a new text.
     */
    handleTextChanged (newText) {
        this.text = newText
        this.save()
    }

    /**
     * Handle a hoverin event.
     */
    handleHoverInEvent (e) {
        super.handleHoverInEvent(e)
        this.emit('circlehoverin', this)
    }

    /**
     * Handle a hoverout event.
     */
    handleHoverOutEvent (e) {
        super.handleHoverOutEvent(e)
        this.emit('circlehoverout', this)
    }

    /**
     * Handle a click event.
     */
    handleClickEvent (e) {
        super.handleClickEvent(e)
    }

    /**
     * Enable view mode.
     */
    enableViewMode () {
        this.disableViewMode()
        super.enableViewMode()
        if (!this.readOnly) {
            this.$element.find('.anno-knob').on('click', this.handleClickEvent)
        }
    }

    /**
     * Disable view mode.
     */
    disableViewMode () {
        super.disableViewMode()
        this.$element.find('.anno-knob').off('click')
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SpanAnnotation;



/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_events__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_events___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_events__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__render_appendChild__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_event__ = __webpack_require__(32);




/**
 * Abstract Annotation Class.
 */
class AbstractAnnotation extends __WEBPACK_IMPORTED_MODULE_0_events___default.a {

    /**
     * Check the argument is an annotation.
     */
    static isAnnotation (obj) {
        return obj && obj.uuid && obj.type
    }

    /**
     * Constructor.
     */
    constructor () {
        super()
        this.autoBind()
        this.deleted = false
        this.selected = false
        this.selectedTime = null
        this.createdAt = new Date().getTime()
    }

    /**
     * Bind the `this` scope of instance methods to `this`.
     */
    autoBind () {
        Object.getOwnPropertyNames(this.constructor.prototype)
            .filter(prop => typeof this[prop] === 'function')
            .forEach(method => {
                this[method] = this[method].bind(this)
            })
    }

    /**
     * Render annotation(s).
     */
    render () {

        this.$element.remove()

        if (this.deleted) {
            return false
        }

        const base = $('#annoLayer2')[0]
        this.$element = $(__WEBPACK_IMPORTED_MODULE_1__render_appendChild__["a" /* default */](base, this))

        if (!this.hoverEventDisable && this.setHoverEvent) {
            this.setHoverEvent()
        }

        this.selected && this.$element.addClass('--selected')

        this.disabled && this.disable()

        return true
    }

    /**
     * Save the annotation data.
     */
    save () {
        window.annotationContainer.add(this)
    }

    /**
     * Delete the annotation from rendering, a container in window, and a container in localStorage.
     */
    destroy () {
        this.deleted = true
        this.$element.remove()

        let promise = Promise.resolve()

        if (this.uuid) {
            window.annotationContainer.remove(this)
        }

        return promise
    }

    /**
     * Judge the point within the element.
     */
    isHit (x, y) {
        return false
    }

    /**
     * Handle a click event.
     */
    handleClickEvent (e) {
        this.toggleSelect()

        if (this.type !== 'textbox') {

            if (this.selected) {

                // deselect another annotations.
                if (window.ctrlPressed === false) {
                    window.annotationContainer
                        .getSelectedAnnotations()
                        .filter(a => a.uuid !== this.uuid)
                        .forEach(a => a.deselect())
                }

                // TODO Use common function.
                let event = document.createEvent('CustomEvent')
                event.initCustomEvent('annotationSelected', true, true, this)
                window.dispatchEvent(event)

            } else {

                // TODO Use common function.
                let event = document.createEvent('CustomEvent')
                event.initCustomEvent('annotationDeselected', true, true, this)
                window.dispatchEvent(event)

            }
        }
    }

    /**
     * Handle a hoverIn event.
     */
    handleHoverInEvent (e) {
        console.log('handleHoverInEvent')
        this.highlight()
        this.emit('hoverin')
        __WEBPACK_IMPORTED_MODULE_2__utils_event__["a" /* dispatchWindowEvent */]('annotationHoverIn', this)
    }

    /**
     * Handle a hoverOut event.
     */
    handleHoverOutEvent (e) {
        console.log('handleHoverOutEvent')
        this.dehighlight()
        this.emit('hoverout')
        __WEBPACK_IMPORTED_MODULE_2__utils_event__["a" /* dispatchWindowEvent */]('annotationHoverOut', this)
    }

    /**
     * Highlight the annotation.
     */
    highlight () {
        this.$element.addClass('--hover')
    }

    /**
     * Dehighlight the annotation.
     */
    dehighlight () {
        this.$element.removeClass('--hover')
    }

    /**
     * Select the annotation.
     */
    select () {
        this.selected = true
        this.selectedTime = Date.now()
        this.$element.addClass('--selected')
    }

    /**
     * Deselect the annotation.
     */
    deselect () {
        console.log('deselect')
        this.selected = false
        this.selectedTime = null
        this.$element.removeClass('--selected')
    }

    /**
     * Toggle the selected state.
     */
    toggleSelect () {

        if (this.selected) {
            this.deselect()
        } else {
            this.select()
        }

    }

    /**
     * Delete the annotation if selected.
     */
    deleteSelectedAnnotation () {

        if (this.isSelected()) {
            this.destroy().then(() => {
                __WEBPACK_IMPORTED_MODULE_2__utils_event__["a" /* dispatchWindowEvent */]('annotationDeleted', { uuid : this.uuid })
            })
            return true
        }
        return false
    }

    /**
     * Check whether the annotation is selected.
     */
    isSelected () {
        return this.$element.hasClass('--selected')
    }

    /**
     * Create a dummy DOM element for the timing that a annotation hasn't be specified yet.
     */
    createDummyElement () {
        return $('<div class="dummy"/>')
    }

    /**
     * Get the central position of the boundingCircle.
     */
    getBoundingCirclePosition () {
        const $circle = this.$element.find('.anno-knob')
        if ($circle.length > 0) {
            return {
                x : parseFloat($circle.css('left')) + parseFloat($circle.css('width')) / 2,
                y : parseFloat($circle.css('top')) + parseFloat($circle.css('height')) / 2
            }
        }
        return null
    }

    /**
     * Enable a view mode.
     */
    enableViewMode () {
        this.render()
    }

    /**
     * Disable a view mode.
     */
    disableViewMode () {
        this.render()
    }

    setDisableHoverEvent () {
        this.hoverEventDisable = true
    }

    setEnableHoverEvent () {
        this.hoverEventDisable = false
    }

    enable () {
        this.disabled = false
        this.$element.css('pointer-events', 'auto')
    }

    disable () {
        this.disabled = true
        this.$element.css('pointer-events', 'none')
    }

    /**
     * Check the another annotation is equal to `this`.
     */
    equalTo (anotherAnnotation) {
        // Implement Here.
        return false
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = AbstractAnnotation;



/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = renderKnob;

/**
 * Circle radius.
 */
const DEFAULT_RADIUS = 7
/* harmony export (immutable) */ __webpack_exports__["a"] = DEFAULT_RADIUS;


/**
 * Create a bounding circle.
 * @param {Object} the data for rendering.
 */
function renderKnob ({ x, y, readOnly }) {

    // Adjust the position.
    [x, y] = adjustPoint(x, (y - (DEFAULT_RADIUS + 2)), DEFAULT_RADIUS)

    // Set the CSS class.
    let cssClass = 'anno-knob'
    if (readOnly) {
        cssClass += ' is-readonly'
    }

    // Create a knob.
    return $(`<div class="${cssClass}"/>`).css({
        top    : `${y}px`,
        left   : `${x}px`,
        width  : DEFAULT_RADIUS + 'px',
        height : DEFAULT_RADIUS + 'px'
    })
}

/**
 * Adjust the circle position not overlay anothers.
 */
function adjustPoint (x, y, radius) {

    // Get all knobs.
    const $circles = $('.anno-knob')

    // Find a position where all knobs are not placed at.
    while (true) {
        let good = true
        $circles.each(function () {
            const $this = $(this)
            const x1 = parseInt($this.css('left'))
            const y1 = parseInt($this.css('top'))
            const distance1 = Math.pow(x - x1, 2) + Math.pow(y - y1, 2)
            const distance2 = Math.pow(radius, 2)
            if (distance1 < distance2) {
                good = false
            }
        })
        if (good) {
            break
        }
        y -= 1
    }
    return [x, y]
}


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_anno_ui_src_utils__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__abstract__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_relation_js__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_util__ = __webpack_require__(3);





let globalEvent

/**
 * Relation Annotation (one-way / two-way / link)
 */
class RelationAnnotation extends __WEBPACK_IMPORTED_MODULE_1__abstract__["a" /* default */] {

    /**
     * Constructor.
     */
    constructor () {
        super()

        globalEvent = window.globalEvent

        this.uuid = __WEBPACK_IMPORTED_MODULE_0_anno_ui_src_utils__["a" /* uuid */]()
        this.type = 'relation'
        this.direction = null
        this.rel1Annotation = null
        this.rel2Annotation = null
        this.text = null
        this.color = null
        this.readOnly = false
        this.$element = this.createDummyElement()

        // for render.
        this.x1 = 0
        this.y1 = 0
        this.x2 = 0
        this.y2 = 0

        globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation)
        globalEvent.on('enableViewMode', this.enableViewMode)
        globalEvent.on('rectmoveend', this.handleRelMoveEnd)
    }

    /**
     * Create an instance from an annotation data.
     */
    static newInstance (annotation) {
        let a            = new RelationAnnotation()
        a.uuid           = annotation.uuid || __WEBPACK_IMPORTED_MODULE_0_anno_ui_src_utils__["a" /* uuid */]()
        a.direction      = annotation.direction
        a.rel1Annotation = __WEBPACK_IMPORTED_MODULE_1__abstract__["a" /* default */].isAnnotation(annotation.rel1) ? annotation.rel1 : window.annotationContainer.findById(annotation.rel1)
        a.rel2Annotation = __WEBPACK_IMPORTED_MODULE_1__abstract__["a" /* default */].isAnnotation(annotation.rel2) ? annotation.rel2 : window.annotationContainer.findById(annotation.rel2)
        a.text           = annotation.text
        a.color          = annotation.color
        a.readOnly       = annotation.readOnly || false
        a.zIndex         = annotation.zIndex || 10
        return a
    }

    /**
     * Create an instance from a TOML object.
     */
    static newInstanceFromTomlObject (d) {
        d.direction = d.dir
        // TODO Annotation側を、labelに合わせてもいいかも。
        d.text = d.label
        let rel = RelationAnnotation.newInstance(d)
        return rel
    }

    /**
     * Set a hover event.
     */
    setHoverEvent () {
        this.$element.find('path').hover(
            this.handleHoverInEvent,
            this.handleHoverOutEvent
        )
    }

    /**
     * Setter - rel1Annotation.
     */
    set rel1Annotation (a) {
        this._rel1Annotation = a
        if (this._rel1Annotation) {
            this._rel1Annotation.on('hoverin', this.handleRelHoverIn)
            this._rel1Annotation.on('hoverout', this.handleRelHoverOut)
            this._rel1Annotation.on('rectmove', this.handleRelMove)
            this._rel1Annotation.on('delete', this.handleRelDelete)
        }
    }

    /**
     * Getter - rel1Annotation.
     */
    get rel1Annotation () {
        return this._rel1Annotation
    }

    /**
     * Setter - rel2Annotation.
     */
    set rel2Annotation (a) {
        this._rel2Annotation = a
        if (this._rel2Annotation) {
            this._rel2Annotation.on('hoverin', this.handleRelHoverIn)
            this._rel2Annotation.on('hoverout', this.handleRelHoverOut)
            this._rel2Annotation.on('rectmove', this.handleRelMove)
            this._rel2Annotation.on('delete', this.handleRelDelete)
        }
    }

    /**
     * Getter - rel2Annotation.
     */
    get rel2Annotation () {
        return this._rel2Annotation
    }

    /**
     * Render the annotation.
     */
    render () {
        this.setStartEndPosition()
        super.render()
    }

    /**
     * Create an annotation data for save.
     */
    createAnnotation () {
        return {
            uuid      : this.uuid,
            type      : this.type,
            direction : this.direction,
            rel1      : this._rel1Annotation.uuid,
            rel2      : this._rel2Annotation.uuid,
            text      : this.text,
            color     : this.color,
            readOnly  : this.readOnly
        }
    }

    /**
     * Destroy the annotation.
     */
    destroy () {
        let promise = super.destroy()
        if (this._rel1Annotation) {
            this._rel1Annotation.removeListener('hoverin', this.handleRelHoverIn)
            this._rel1Annotation.removeListener('hoverout', this.handleRelHoverOut)
            this._rel1Annotation.removeListener('rectmove', this.handleRelMove)
            this._rel1Annotation.removeListener('delete', this.handleRelDelete)
            delete this._rel1Annotation
        }
        if (this._rel2Annotation) {
            this._rel2Annotation.removeListener('hoverin', this.handleRelHoverIn)
            this._rel2Annotation.removeListener('hoverout', this.handleRelHoverOut)
            this._rel2Annotation.removeListener('rectmove', this.handleRelMove)
            this._rel2Annotation.removeListener('delete', this.handleRelDelete)
            delete this._rel2Annotation
        }

        globalEvent.removeListener('deleteSelectedAnnotation', this.deleteSelectedAnnotation)
        globalEvent.removeListener('enableViewMode', this.enableViewMode)
        globalEvent.removeListener('rectmoveend', this.handleRelMoveEnd)

        return promise
    }

    /**
     * Delete the annotation if selected.
     */
    deleteSelectedAnnotation () {
        super.deleteSelectedAnnotation()
    }

    /**
     * Get the position for text.
     */
    // TODO No need ?
    getTextPosition () {
        this.setStartEndPosition()
        return __WEBPACK_IMPORTED_MODULE_2__utils_relation_js__["b" /* getRelationTextPosition */](this.x1, this.y1, this.x2, this.y2, this.text, this.uuid)
    }

    /**
     * Highlight relations.
     */
    highlightRelAnnotations () {
        if (this._rel1Annotation) {
            this._rel1Annotation.highlight()
        }
        if (this._rel2Annotation) {
            this._rel2Annotation.highlight()
        }
    }

    /**
     * Dehighlight relations.
     */
    dehighlightRelAnnotations () {
        if (this._rel1Annotation) {
            this._rel1Annotation.dehighlight()
        }
        if (this.rel2Annotation) {
            this.rel2Annotation.dehighlight()
        }
    }

    /**
     * Handle a selected event on a text.
     */
    handleTextSelected () {
        this.select()
    }

    /**
     * Handle a deselected event on a text.
     */
    handleTextDeselected () {
        this.deselect()
    }

    /**
     * The callback for the relational text hoverred in.
     */
    handleTextHoverIn () {
        this.highlight()
        this.emit('hoverin')
        this.highlightRelAnnotations()
    }

    /**
     * The callback for the relational text hoverred out.
     */
    handleTextHoverOut () {
        this.dehighlight()
        this.emit('hoverout')
        this.dehighlightRelAnnotations()
    }

    /**
     * The callback for the relationals hoverred in.
     */
    handleRelHoverIn () {
        this.highlight()
        this.highlightRelAnnotations()
    }

    /**
     * The callback for the relationals hoverred out.
     */
    handleRelHoverOut () {
        this.dehighlight()
        this.dehighlightRelAnnotations()
    }

    /**
     * The callback that is called relations has benn deleted.
     */
    handleRelDelete () {
        this.destroy()
    }

    /**
     * The callback that is called relations has been moved.
     */
    handleRelMove () {
        this.render()
    }

    /**
     * The callback that is called relations has finished to be moved.
     */
    handleRelMoveEnd (rectAnnotation) {
        if (this._rel1Annotation === rectAnnotation || this._rel2Annotation === rectAnnotation) {
            this.enableViewMode()
        }
    }

    /**
     * The callback that is called the text content is changed.
     *
     * @param {String} newText - the content an user changed.
     */
    handleTextChanged (newText) {
        this.text = newText
        this.save()
    }

    /**
     * The callback that is called at hoverred in.
     */
    handleHoverInEvent (e) {
        super.handleHoverInEvent(e)
        this.highlightRelAnnotations()
    }

    /**
     * The callback that is called at hoverred out.
     */
    handleHoverOutEvent (e) {
        super.handleHoverOutEvent(e)
        this.dehighlightRelAnnotations()
    }

    /**
     * The callback that is called at clicked.
     */
    handleClickEvent (e) {
        super.handleClickEvent(e)
    }

    /**
     * Enable view mode.
     */
    enableViewMode () {

        this.disableViewMode()

        super.enableViewMode()

        if (!this.readOnly) {
            this.$element.find('path').on('click', this.handleClickEvent)
        }
    }

    /**
     * Disable view mode.
     */
    disableViewMode () {
        super.disableViewMode()
        this.$element.find('path').off('click')
    }

    /**
     * Set the start / end points of the relation.
     */
    setStartEndPosition () {
        if (this._rel1Annotation) {
            let p = this._rel1Annotation.getBoundingCirclePosition()
            this.x1 = p.x
            this.y1 = p.y
        }
        if (this._rel2Annotation) {
            let p = this._rel2Annotation.getBoundingCirclePosition()
            this.x2 = p.x
            this.y2 = p.y
        }
    }

    /**
     * @{inheritDoc}
     */
    equalTo (anno) {

        if (!anno || this.type !== anno) {
            return false
        }

        const isSame = __WEBPACK_IMPORTED_MODULE_3__shared_util__["a" /* anyOf */](this.rel1Annotation.uuid, [anno.rel1Annotation.uuid, anno.rel2Annotation.uuid])
                        && __WEBPACK_IMPORTED_MODULE_3__shared_util__["a" /* anyOf */](this.rel2Annotation.uuid, [anno.rel1Annotation.uuid, anno.rel2Annotation.uuid])

        return isSame
    }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = RelationAnnotation;



/***/ }),
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export scaleUp */
/* harmony export (immutable) */ __webpack_exports__["d"] = scaleDown;
/* harmony export (immutable) */ __webpack_exports__["a"] = disableTextlayer;
/* harmony export (immutable) */ __webpack_exports__["b"] = enableTextlayer;
/* unused harmony export getXY */
/* unused harmony export getSVGLayer */
/* unused harmony export getCurrentPage */
/* harmony export (immutable) */ __webpack_exports__["c"] = getAnnoLayerBoundingRect;

const BORDER_COLOR = '#00BFFF'
/* unused harmony export BORDER_COLOR */


/**
 * Adjust scale from normalized scale (100%) to rendered scale.
 *
 * @param {SVGElement} svg The SVG to gather metadata from
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled up
 */
function scaleUp (svg, rect) {

    if (arguments.length === 1) {
        rect = svg
        svg = getSVGLayer()
    }

    let result = {}
    const viewport = window.PDFView.pdfViewer.getPageView(0).viewport

    Object.keys(rect).forEach((key) => {
        result[key] = rect[key] * viewport.scale
    })

    return result
}

/**
 * Adjust scale from rendered scale to a normalized scale (100%).
 *
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled down
 */
function scaleDown (rect) {

    // TODO for old style:  scaleDown(svg, rect)
    if (arguments.length === 2) {
        rect = arguments[1]
    }

    let result = {}
    const viewport = window.PDFView.pdfViewer.getPageView(0).viewport
    Object.keys(rect).forEach((key) => {
        result[key] = rect[key] / viewport.scale
    })

    return result
}

/**
 * Disable all text layers.
 */
function disableTextlayer () {
    $('body').addClass('disable-text-layer')
}

/**
 * Enable all text layers.
 */
function enableTextlayer () {
    $('body').removeClass('disable-text-layer')
}

function getXY (e) {
    let rect2 = $('#annoLayer2')[0].getBoundingClientRect()
    let y = e.clientY + $('#annoLayer2').scrollTop() - rect2.top
    let x = e.clientX - rect2.left
    return { x, y }
}

function getSVGLayer () {
    return document.getElementById('annoLayer')
}

function getCurrentPage (e) {

    let { x, y } = getXY(e)

    let scrollTop = $('#annoLayer2')[0].getBoundingClientRect().top
    let scrollLeft = $('#annoLayer2')[0].getBoundingClientRect().left

    let elements = document.querySelectorAll('.canvasWrapper')

    for (let i = 0, l = elements.length; i < l; i++) {
        let el = elements[i]
        let rect = el.getBoundingClientRect()
        let minX = rect.left - scrollLeft
        let maxX = rect.right - scrollLeft
        let minY = rect.top - scrollTop
        let maxY = rect.bottom - scrollTop

        if (minX <= x && x <= maxX && minY <= y && y <= maxY) {
            let page = parseInt(el.parentNode.id.replace('pageContainer', ''))
            return { page, minX, maxX, minY, maxY }
        }
    }

    console.log('notfound ><...')
    return null
}

function getAnnoLayerBoundingRect () {
    return $('#annoLayer2')[0].getBoundingClientRect()
}


/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = hex2rgba;
/**
 * Change color definition style from hex to rgba.
 */
function hex2rgba (hex, alpha = 1) {

    // long version
    let r = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
    let c = null
    if (r) {
        c = r.slice(1, 4).map(function (x) { return parseInt(x, 16) })
    }
    // short version
    r = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
    if (r) {
        c = r.slice(1, 4).map(function (x) { return 0x11 * parseInt(x, 16) })
    }
    if (!c) {
        return hex
    }
    return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`
}


/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = setAttributes;
const UPPER_REGEX = /[A-Z]/g

// Don't convert these attributes from camelCase to hyphenated-attributes
const BLACKLIST = [
    'viewBox'
]

let keyCase = (key) => {
    if (BLACKLIST.indexOf(key) === -1) {
        key = key.replace(UPPER_REGEX, match => '-' + match.toLowerCase())
    }
    return key
}

/**
 * Set attributes for a node from a map
 *
 * @param {Node} node The node to set attributes on
 * @param {Object} attributes The map of key/value pairs to use for attributes
 */
function setAttributes (node, attributes) {
    Object.keys(attributes).forEach((key) => {
        node.setAttribute(keyCase(key), attributes[key])
    })
}


/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = findBezierControlPoint;
/* harmony export (immutable) */ __webpack_exports__["b"] = getRelationTextPosition;
/**
 *   The list of functionalities for a relationship between annotations.
 */

/**
 * Get bezier control point.
 *
 * @params x1 : the x of a start position.
 * @params y1 : the y of a start position.
 * @params x2 : the x of an end position.
 * @params y2 : the y of an end position.
 * @return { x, y } the position of bezier control.
 */
function findBezierControlPoint (x1, y1, x2, y2) {

    const DISTANCE = 30

    // vertical line.
    if (x1 === x2) {
        return {
            x : x1,
            y : (y1 + y2) / 2
        }
    }

    // horizontal line.
    if (y1 === y2) {
        return {
            x : (x1 + x2) / 2,
            y : y1 - DISTANCE
        }
    }

    let center = {
        x : (x1 + x2) / 2,
        y : (y1 + y2) / 2
    }

    let gradient = (y1 - y2) / (x1 - x2)
    gradient = -1 / gradient

    let theta = Math.atan(gradient)
    let deltaX = Math.cos(theta) * DISTANCE
    let deltaY = Math.sin(theta) * DISTANCE

    if (x1 < x2) {
        // right top quadrant.
        if (y1 > y2) {
            return {
                x : center.x - Math.abs(deltaX),
                y : center.y - Math.abs(deltaY)
            }
        // right bottom quadrant.
        } else {
            return {
                x : center.x + Math.abs(deltaX),
                y : center.y - Math.abs(deltaY)
            }
        }
    } else {
        // left top quadrant.
        if (y1 > y2) {
            return {
                x : center.x + Math.abs(deltaX),
                y : center.y - Math.abs(deltaY)
            }
        // left bottom quadrant.
        } else {
            return {
                x : center.x - Math.abs(deltaX),
                y : center.y - Math.abs(deltaY)
            }
        }
    }
}

function getRelationTextPosition (x1, y1, x2, y2, text = '', parentId = null) {

    // texts rendered.
    let rects = []
    $('.anno-text').each(function () {
        let $this = $(this)
        // Remove myself.
        if ($this.parent().data('parent-id') !== parentId) {
            rects.push({
                x      : parseFloat($this.attr('x')),
                y      : parseFloat($this.attr('y')),
                width  : parseFloat($this.attr('width')),
                height : parseFloat($this.attr('height'))
            })
        }
    })

    // Set self size.
    let myWidth = 200
    let myHeight = 15

    let addY = 5
    if (y1 < y2) {
        addY *= -1
    }

    // Find the position not overlap.
    while (true) {

        let cp = findBezierControlPoint(x1, y1, x2, y2)
        let x = x2 + (cp.x - x2) * 0.4
        let y = y2 + (cp.y - y2) * 0.4

        let ok = true
        for (let i = 0; i < rects.length; i++) {
            let r = rects[i]

            // Check rects overlap.

            let aX1 = r.x
            let aX2 = r.x + r.width
            let aY1 = r.y
            let aY2 = r.y + r.height

            let bX1 = x
            let bX2 = x + myWidth
            let bY1 = y
            let bY2 = y + myHeight

            let crossX = aX1 <= bX2 && bX1 <= aX2
            let crossY = aY1 <= bY2 && bY1 <= aY2

            if (crossX && crossY) {
                ok = false
                break
            }
        }

        if (ok) {
            return { x, y }
        }

        y1 += addY
        y2 += addY
    }
}


/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = dispatchWindowEvent;
/**
 * Dispatch a custom event to `window` object.
 */
function dispatchWindowEvent (eventName, data) {
    var event = document.createEvent('CustomEvent')
    event.initCustomEvent(eventName, true, true, data)
    window.dispatchEvent(event)
}


/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = enable;
/* unused harmony export disable */
/**
 * Enable Text input enable.
 */
function enable ({ uuid, text, disable = false, autoFocus = false, blurListener = null }) {
    var event = document.createEvent('CustomEvent')
    event.initCustomEvent('enableTextInput', true, true, ...arguments)
    window.dispatchEvent(event)
    console.log('dispatchEvent:', event, arguments[0])
}

/**
 * Disable the text input.
 */
function disable () {
    var event = document.createEvent('CustomEvent')
    event.initCustomEvent('disappearTextInput', true, true)
    window.dispatchEvent(event)
}


/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_anno_ui_src_utils__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__abstract__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__UI_utils__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_coords__ = __webpack_require__(1);





let globalEvent

/**
 * Rect Annotation.
 */
class RectAnnotation extends __WEBPACK_IMPORTED_MODULE_1__abstract__["a" /* default */] {

    /**
     * Constructor.
     */
    constructor () {

        super()

        globalEvent = window.globalEvent

        this.uuid     = null
        this.type     = 'rect'
        this.x        = 0
        this.y        = 0
        this.width    = 0
        this.height   = 0
        this.text     = null
        this.color    = null
        this.readOnly = false
        this.$element = this.createDummyElement()

        globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation)
        globalEvent.on('enableViewMode', this.enableViewMode)
    }

    /**
     * Create an instance from an annotation data.
     */
    static newInstance (annotation) {
        let rect      = new RectAnnotation()
        rect.uuid     = annotation.uuid || __WEBPACK_IMPORTED_MODULE_0_anno_ui_src_utils__["a" /* uuid */]()
        rect.x        = annotation.x
        rect.y        = annotation.y
        rect.width    = annotation.width
        rect.height   = annotation.height
        rect.text     = annotation.text
        rect.color    = annotation.color
        rect.readOnly = annotation.readOnly || false
        rect.zIndex   = annotation.zIndex || 10
        return rect
    }

    /**
     * Create an instance from a TOML object.
     */
    static newInstanceFromTomlObject (tomlObject) {
        let d      = tomlObject
        d.position = d.position.map(parseFloat)
        d.x        = d.position[0]
        d.y        = __WEBPACK_IMPORTED_MODULE_3__shared_coords__["a" /* convertFromExportY */](d.page, d.position[1])
        d.width    = d.position[2]
        d.height   = d.position[3]
        d.text     = d.label
        let rect   = RectAnnotation.newInstance(d)
        return rect
    }

    /**
     * Set a hover event.
     */
    setHoverEvent () {
        this.$element.find('.anno-rect, .anno-knob').hover(
            this.handleHoverInEvent,
            this.handleHoverOutEvent
        )
    }

    /**
     * Delete the annotation from rendering, a container in window, and a container in localStorage.
     */
    destroy () {
        let promise = super.destroy()
        this.emit('delete')
        window.globalEvent.removeListener('deleteSelectedAnnotation', this.deleteSelectedAnnotation)
        window.globalEvent.removeListener('enableViewMode', this.enableViewMode)
        return promise
    }

    /**
     * Create an annotation data for save.
     */
    createAnnotation () {
        return {
            uuid      : this.uuid,
            type      : this.type,
            x         : this.x,
            y         : this.y,
            width     : this.width,
            height    : this.height,
            text      : this.text,
            color     : this.color,
            readyOnly : this.readOnly
        }
    }

    /**
     * Delete the annotation if selected.
     */
    deleteSelectedAnnotation () {
        super.deleteSelectedAnnotation()
    }

    /**
     * Get the position for text.
     */
    getTextPosition () {
        return {
            x : this.x + 7,
            y : this.y - 20
        }
    }

    /**
     * Handle a selected event on a text.
     */
    handleTextSelected () {
        this.select()
    }

    /**
     * Handle a deselected event on a text.
     */
    handleTextDeselected () {
        this.deselect()
    }

    /**
     * Handle a hovein event on a text.
     */
    handleTextHoverIn () {
        this.highlight()
        this.emit('hoverin')
    }

    /**
     * Handle a hoveout event on a text.
     */
    handleTextHoverOut () {
        this.dehighlight()
        this.emit('hoverout')
    }

    /**
     * Save a new text.
     */
    handleTextChanged (newText) {
        console.log('rect:handleTextChanged:', newText)
        this.text = newText
        this.save()
    }

    /**
     * Handle a hoverin event.
     */
    handleHoverInEvent (e) {
        super.handleHoverInEvent(e)

        let $elm = $(e.currentTarget)
        if ($elm.prop('tagName') === 'circle') {
            this.emit('circlehoverin', this)
        }
    }

    /**
     * Handle a hoverout event.
     */
    handleHoverOutEvent (e) {
        super.handleHoverOutEvent(e)

        let $elm = $(e.currentTarget)
        if ($elm.prop('tagName') === 'circle') {
            this.emit('circlehoverout', this)
        }
    }

    /**
     * Handle a click event.
     */
    handleClickEvent (e) {
        super.handleClickEvent(e)
    }

    /**
     * Handle a mousedown event.
     */
    handleMouseDownOnRect () {
        console.log('handleMouseDownOnRect')

        this.originalX = this.x
        this.originalY = this.y

        document.addEventListener('mousemove', this.handleMouseMoveOnDocument)
        document.addEventListener('mouseup', this.handleMouseUpOnDocument)

        window.globalEvent.emit('rectmovestart')

        __WEBPACK_IMPORTED_MODULE_2__UI_utils__["a" /* disableTextlayer */]()
    }

    /**
     * Handle a mousemove event.
     */
    handleMouseMoveOnDocument (e) {

        this._dragging = true

        if (!this.startX) {
            this.startX = parseInt(e.clientX)
            this.startY = parseInt(e.clientY)
        }
        this.endX = parseInt(e.clientX)
        this.endY = parseInt(e.clientY)

        let diff = __WEBPACK_IMPORTED_MODULE_2__UI_utils__["d" /* scaleDown */]({
            x : this.endX - this.startX,
            y : this.endY - this.startY
        })

        this.x = this.originalX + diff.x
        this.y = this.originalY + diff.y

        this.render()

        this.emit('rectmove', this)
    }

    /**
     * Handle a mouseup event.
     */
    handleMouseUpOnDocument () {

        if (this._dragging) {
            this._dragging = false

            this.originalX = null
            this.originalY = null
            this.startX = null
            this.startY = null
            this.endX = null
            this.endY = null

            this.save()
            this.enableViewMode()
            globalEvent.emit('rectmoveend', this)
        }

        document.removeEventListener('mousemove', this.handleMouseMoveOnDocument)
        document.removeEventListener('mouseup', this.handleMouseUpOnDocument)

        if (window.currentType !== 'rect') {
            __WEBPACK_IMPORTED_MODULE_2__UI_utils__["b" /* enableTextlayer */]()
        }
    }

    enableDragAction () {
        this.$element.find('.anno-rect, circle')
            .off('mousedown', this.handleMouseDownOnRect)
            .on('mousedown', this.handleMouseDownOnRect)
    }

    disableDragAction () {
        this.$element.find('.anno-rect, circle')
            .off('mousedown', this.handleMouseDownOnRect)
    }

    /**
     * Enable view mode.
     */
    enableViewMode () {
        super.enableViewMode()
        if (!this.readOnly) {
            this.$element.find('.anno-rect, .anno-knob').on('click', this.handleClickEvent)
            this.enableDragAction()
        }
    }

    /**
     * Disable view mode.
     */
    disableViewMode () {
        super.disableViewMode()
        this.$element.find('.anno-rect, .anno-knob').off('click')
        this.disableDragAction()
    }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = RectAnnotation;



/***/ }),
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shared_util__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_events__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_events___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_events__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_PDFAnnoCore__ = __webpack_require__(69);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__src_annotation_container__ = __webpack_require__(79);
/**
    Functions for annotations rendered over a PDF file.
*/
__webpack_require__(67)




window.globalEvent = new __WEBPACK_IMPORTED_MODULE_1_events___default.a()

// This is the entry point of window.xxx.
// (setting from webpack.config.js)

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_2__src_PDFAnnoCore__["a" /* default */]);

// Create an annocation container.

window.annotationContainer = new __WEBPACK_IMPORTED_MODULE_3__src_annotation_container__["a" /* default */]()

// Enable a view mode.
__WEBPACK_IMPORTED_MODULE_2__src_PDFAnnoCore__["a" /* default */].UI.enableViewMode()

// Check Ctrl or Cmd button clicked.
// ** ATTENTION!! ALSO UPDATED by pdfanno.js **
window.ctrlPressed = false
$(document).on('keydown', e => {
    // Allow any keyboard events for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return
    }
    if (e.keyCode === 17 || e.keyCode === 91) { // 17:ctrlKey, 91:cmdKey
        window.ctrlPressed = true
    }
}).on('keyup', e => {
    // Allow any keyboard events for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return
    }
    window.ctrlPressed = false
})

// The event called at page rendered by pdfjs.
window.addEventListener('pagerendered', function (ev) {
    console.log('pagerendered:', ev.detail.pageNumber)

    // No action, if the viewer is closed.
    if (!window.PDFView.pdfViewer.getPageView(0)) {
        return
    }

    renderAnno()

    // Issue Fix.
    // Correctly rendering when changing scaling.
    // The margin between pages is fixed(9px), and never be scaled in default,
    // then manually have to change the margin.
    let scale = window.PDFView.pdfViewer.getPageView(0).viewport.scale
    let borderWidth = `${9 * scale}px`
    let marginBottom = `${-9 * scale}px`
    $('.page').css({
        'border-top-width'    : borderWidth,
        'border-bottom-width' : borderWidth,
        'margin-bottom'       : marginBottom
    })
})

// Adapt to scale change.
window.addEventListener('scalechange', () => {
    console.log('scalechange')
    removeAnnoLayer()
    renderAnno()
})

/*
 * Remove the annotation layer and the temporary rendering layer.
 */
function removeAnnoLayer () {
    // TODO Remove #annoLayer.
    $('#annoLayer, #annoLayer2').remove()
}

/*
 * Render annotations saved in the storage.
 */
function renderAnno () {

    // No action, if the viewer is closed.
    if (!window.PDFView.pdfViewer.getPageView(0)) {
        return
    }

    // TODO make it a global const.
    const svgLayerId = 'annoLayer'
    const annoLayer2Id = 'annoLayer2'

    // Check already exists.
    if ($('#' + svgLayerId).length > 0) {
        return
    }
    if ($('#' + annoLayer2Id).length > 0) {
        return
    }

    let leftMargin = ($('#viewer').width() - $('.page').width()) / 2

    // At window.width < page.width.
    if (leftMargin < 0) {
        leftMargin = 9
    }

    let height = $('#viewer').height()

    let width = $('.page').width()

    // TODO no need ?
    // Add an annotation layer.
    let $annoLayer = $(`<svg id="${svgLayerId}" class="${svgLayerId}"/>`).css({   // TODO CSSClass.
        position   : 'absolute',
        top        : '0px',
        left       : `${leftMargin}px`,
        width      : `${width}px`,
        height     : `${height}px`,
        visibility : 'hidden',
        'z-index'  : 2
    })
    // Add an annotation layer.
    let $annoLayer2 = $(`<div id="${annoLayer2Id}"/>`).addClass('annoLayer').css({   // TODO CSSClass.
        position   : 'absolute',
        top        : '0px',
        left       : `${leftMargin}px`,
        width      : `${width}px`,
        height     : `${height}px`,
        visibility : 'hidden',
        'z-index'  : 2
    })

    $('#viewer').css({
        position : 'relative'  // TODO css.
    }).append($annoLayer).append($annoLayer2)

    renderAnnotations()
}

/**
 * Render all annotations.
 */
function renderAnnotations () {
    const annotations = window.annotationContainer.getAllAnnotations()
    if (annotations.length === 0) {
        return
    }
    annotations.forEach(a => {
        a.render()
        a.enableViewMode()
    })
    __WEBPACK_IMPORTED_MODULE_0__shared_util__["b" /* dispatchWindowEvent */]('annotationrendered')
}


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(68);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(5)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./index.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./index.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)();
// imports


// module
exports.push([module.i, "@charset \"utf-8\";\n\n/*\n *  Search UI.\n */\n.pdfanno-search-result {\n    position: absolute;\n    background-color: rgba(0, 255, 0, 0.7)\n}\n.pdfanno-search-result--highlight {\n    background-color: rgba(255, 0, 0, 0.7)\n}\n\n/*\n * Text Layer.\n */\n.pdfanno-text-layer {\n    position: absolute;\n    text-align: center;\n}\n\n/**\n * Annotation Layer.\n */\n.annoLayer > * {\n  opacity: 0.5;\n}\n.annoLayer > *.\\--hover,\n.annoLayer > *.\\--selected {\n  opacity: 1;\n}\n\n/**\n    Annotation Knob for control.\n*/\n.anno-knob {\n    position: absolute;\n    background-color: blue;\n    border-radius: 50%;\n    transition: 0.2s;\n    transform-origin: center center;\n}\n.\\--hover .anno-knob,\n.\\--selected .anno-knob {\n  box-shadow: rgba(113,135,164,.2) 1px 1px 1px;\n  transform: scale(2);\n}\n.anno-knob.is-readonly {\n    border-radius: 0;\n    transform: rotate(45deg) scale(0.7);\n}\n.\\--hover .anno-knob.is-readonly,\n.\\--selected .anno-knob.is-readonly {\n  transform: rotate(45deg) scale(1.4);\n}\n\n/*\n * Span Annotation.\n */\n.anno-span {\n    position: absolute;\n    top: 0;\n    left: 0;\n    visibility: visible;\n}\n.anno-span__area {\n    position: absolute;\n    border: 1px dashed black;\n}\n.\\--hover .anno-span__area,\n.\\--selected .anno-span__area {\n  border: 2px dashed black !important;\n  box-sizing: border-box;\n}\n.anno-span__border {\n    position: absolute;\n    border-bottom-width: 1px;\n    border-bottom-style: solid;\n}\n\n/*TODO Relationを描画した直後は、位置が少しずれる。その後にフォーカスが外れると正しい位置へ移動する。*/\n\n/**\n  Relation Annotation.\n*/\n.\\--hover .anno-relation,\n.\\--selected .anno-relation {\n  stroke-width: 2px;\n}\n.anno-relation-outline {\n  fill: none;\n  visibility: hidden;\n}\n.\\--selected .anno-relation-outline {\n  visibility: visible;\n  stroke: black;\n  stroke-width: 4px;\n  pointer-events: stroke;\n  stroke-dasharray: 5;\n}\n\n/**\n * Span Annotation.\n */\n.anno-span rect {\n    /* Enable the hover event on circles and text even if they are overwraped other spans. */\n    pointer-events: none;\n}\n\n/**\n  Rect Annotation.\n*/\n.anno-rect-base {\n    position: absolute;\n    top: 0;\n    left: 0;\n    visibility: visible;\n}\n.anno-rect {\n    position: absolute;\n}\n.\\--hover .anno-rect {\n  box-shadow: 0 0 0 1px #ccc inset;\n  stroke: #ccc;\n  stroke-width: 0.75px;\n}\n.\\--selected .anno-rect {\n  stroke: black;\n  stroke-width: 0.5px;\n  stroke-dasharray: 3;\n}\n\n/**\n Disable text layers.\n*/\nbody.disable-text-layer .textLayer {\n    display: none;\n}\n\n", ""]);

// exports


/***/ }),
/* 69 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__UI__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__annotation_rect__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__annotation_span__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__annotation_relation__ = __webpack_require__(14);
// import render from './render'





/* harmony default export */ __webpack_exports__["a"] = ({

    /**
     * UI is a helper for instrumenting UI interactions for creating,
     * editing, and deleting annotations in the browser.
     */
    UI: __WEBPACK_IMPORTED_MODULE_0__UI__["a" /* default */],

    /**
     * RectAnnotation Class.
     */
    RectAnnotation: __WEBPACK_IMPORTED_MODULE_1__annotation_rect__["a" /* default */],

    /**
     * SpanAnnotation Class.
     */
    SpanAnnotation: __WEBPACK_IMPORTED_MODULE_2__annotation_span__["a" /* default */],

    /**
     * RelationAnnotation Class.
     */
    RelationAnnotation: __WEBPACK_IMPORTED_MODULE_3__annotation_relation__["a" /* default */]
});


/***/ }),
/* 70 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__span__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__relation__ = __webpack_require__(77);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__view__ = __webpack_require__(78);




/* harmony default export */ __webpack_exports__["a"] = ({
    createSpan: __WEBPACK_IMPORTED_MODULE_0__span__["a" /* createSpan */],
    getRectangles: __WEBPACK_IMPORTED_MODULE_0__span__["b" /* getRectangles */],
    createRelation: __WEBPACK_IMPORTED_MODULE_1__relation__["a" /* createRelation */],
    enableViewMode: __WEBPACK_IMPORTED_MODULE_2__view__["a" /* enableViewMode */]
});


/***/ }),
/* 71 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = getRectangles;
/* harmony export (immutable) */ __webpack_exports__["a"] = createSpan;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__annotation_span__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_textInput__ = __webpack_require__(33);




function scale () {
    return window.PDFView.pdfViewer.getPageView(0).viewport.scale
}

/**
 * Get the current window selections and texts.
 */
function getSelectionRects () {
    try {
        let selection = window.getSelection()

        if (selection.rangeCount === 0) {
            return { rects : null, selectedText : null, textRange : null }
        }
        let range = selection.getRangeAt(0)
        let rects = range.getClientRects()

        const pageNumber = getPageNumber(selection.anchorNode)
        const startIndex = getIndex(selection.anchorNode)
        const endIndex = getIndex(selection.focusNode)
        console.log('t:', pageNumber, startIndex, endIndex)

        // TODO a little tricky.
        const { text, textRange } = window.parent.getText(pageNumber, startIndex, endIndex)
        console.log('text:', text)
        console.log('textRange:', textRange)

        // Bug detect.
        // This selects loadingIcon and/or loadingSpacer.
        if (selection.anchorNode && selection.anchorNode.tagName === 'DIV') {
            return { rects : null, selectedText : null, textRange : null }
        }

        if (rects.length > 0 && rects[0].width > 0 && rects[0].height > 0) {
            return { rects : mergeRects(rects), selectedText : text, textRange }
        }

    } catch (e) {
        console.log('ERROR:', e)
    }

    return { rects : null, selectedText : null, textRange : null }
}

function getPageNumber (elm) {
    if (elm.parentNode.hasAttribute('data-page')) {
        return parseInt(elm.parentNode.getAttribute('data-page'), 10)
    } else if (elm.hasAttribute('data-page')) {
        return parseInt(elm.getAttribute('data-page'), 10)
    }
    return null
}

function getIndex (elm) {
    if (elm.parentNode.hasAttribute('data-index')) {
        return parseInt(elm.parentNode.getAttribute('data-index'), 10)
    } else if (elm.hasAttribute('data-index')) {
        return parseInt(elm.getAttribute('data-index'), 10)
    }
    return null
}

/**
 * Merge user selections.
 */
function mergeRects (rects) {

    // Trim a rect which is almost same to other.
    rects = trimRects(rects)

    // a virtical margin of error.
    const error = 5 * scale()

    let tmp = convertToObject(rects[0])
    let newRects = [tmp]
    for (let i = 1; i < rects.length; i++) {

        // Same line -> Merge rects.
        if (withinMargin(rects[i].top, tmp.top, error)) {
            tmp.top    = Math.min(tmp.top, rects[i].top)
            tmp.left   = Math.min(tmp.left, rects[i].left)
            tmp.right  = Math.max(tmp.right, rects[i].right)
            tmp.bottom = Math.max(tmp.bottom, rects[i].bottom)
            tmp.x      = tmp.left
            tmp.y      = tmp.top
            tmp.width  = tmp.right - tmp.left
            tmp.height = tmp.bottom - tmp.top

        // New line -> Create a new rect.
        } else {
            tmp = convertToObject(rects[i])
            newRects.push(tmp)
        }
    }

    return newRects
}

/**
 * Trim rects which is almost same other.
 */
function trimRects (rects) {

    const error = 1.5 * scale()

    let newRects = [rects[0]]

    for (let i = 1; i < rects.length; i++) {
        if (Math.abs(rects[i].left - rects[i - 1].left) < error) {
            // Almost same.
            continue
        }
        newRects.push(rects[i])
    }

    return newRects
}

/**
 * Convert a DOMList to a javascript plan object.
 */
function convertToObject (rect) {
    return {
        top    : rect.top,
        left   : rect.left,
        right  : rect.right,
        bottom : rect.bottom,
        x      : rect.x,
        y      : rect.y,
        width  : rect.width,
        height : rect.height
    }
}

/**
 * Check the value(x) within the range.
 */
function withinMargin (x, base, margin) {
    return (base - margin) <= x && x <= (base + margin)
}

/**
 * Remove user selections.
 */
function removeSelection () {
    let selection = window.getSelection()
    // Firefox
    selection.removeAllRanges && selection.removeAllRanges()
    // Chrome
    selection.empty && selection.empty()
}

/**
 * Save a rect annotation.
 */
function saveSpan (text, zIndex, color) {

    // Get the rect area which User selected.
    let { rects, selectedText, textRange } = getSelectionRects()

    // Remove the user selection.
    removeSelection()

    if (!rects) {
        return
    }

    let boundingRect = __WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getAnnoLayerBoundingRect */]()

    // Initialize the annotation
    let annotation = {
        rectangles : rects.map((r) => {
            return __WEBPACK_IMPORTED_MODULE_0__utils__["d" /* scaleDown */]({
                x      : r.left - boundingRect.left,
                y      : r.top - boundingRect.top,
                width  : r.width,
                height : r.height
            })
        }).filter(r => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1),
        selectedText,
        text,
        textRange,
        zIndex,
        color
    }

    // Save.
    let spanAnnotation = __WEBPACK_IMPORTED_MODULE_1__annotation_span__["a" /* default */].newInstance(annotation)
    spanAnnotation.save()

    // Render.
    spanAnnotation.render()

    // Select.
    spanAnnotation.select()

    // Enable label input.
    __WEBPACK_IMPORTED_MODULE_2__utils_textInput__["a" /* enable */]({ uuid : spanAnnotation.uuid, autoFocus : true, text })

    return spanAnnotation
}

/**
 * Get the rect area of User selected.
 */
function getRectangles () {
    let { rects } = getSelectionRects()
    if (!rects) {
        return null
    }

    const boundingRect = __WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getAnnoLayerBoundingRect */]()

    rects = [...rects].map(r => {
        return __WEBPACK_IMPORTED_MODULE_0__utils__["d" /* scaleDown */]({
            x      : r.left - boundingRect.left,
            y      : r.top - boundingRect.top,
            width  : r.width,
            height : r.height
        })
    }).filter(r => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)

    return rects
}

/**
 * Create a span by current texts selection.
 */
function createSpan ({ text = null, zIndex = 10, color = null }) {
    return saveSpan(text, zIndex, color)
}


/***/ }),
/* 72 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = appendChild;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__renderRect__ = __webpack_require__(73);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__renderSpan__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__renderText__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__renderRelation__ = __webpack_require__(76);





/**
 * Transform the rotation and scale of a node using SVG's native transform attribute.
 *
 * @param {Node} node The node to be transformed
 * @param {Object} viewport The page's viewport data
 * @return {Node}
 */
function transform (node, viewport) {
    node.style.transform = `scale(${viewport.scale})`
    return node
}

/**
 * Append an annotation as a child of an SVG.
 *
 * @param {SVGElement} svg The SVG element to append the annotation to
 * @param {Object} annotation The annotation definition to render and append
 * @param {Object} viewport The page's viewport data
 * @return {SVGElement} A node that was created and appended by this function
 */
function appendChild (svg, annotation, viewport) {
    // TODO no need third argument(viewport) ?
    if (!viewport) {
        viewport = window.PDFView.pdfViewer.getPageView(0).viewport
    }

    let child
    switch (annotation.type) {
    case 'rect':
        child = __WEBPACK_IMPORTED_MODULE_0__renderRect__["a" /* renderRect */](annotation, svg)
        break
    case 'span':
        child = __WEBPACK_IMPORTED_MODULE_1__renderSpan__["a" /* renderSpan */](annotation, svg)
        break
    case 'textbox':
        child = __WEBPACK_IMPORTED_MODULE_2__renderText__["a" /* default */](annotation, svg)
        break
    case 'relation':
        child = __WEBPACK_IMPORTED_MODULE_3__renderRelation__["a" /* renderRelation */](annotation, svg)
        break
    }

    // If no type was provided for an annotation it will result in node being null.
    // Skip appending/transforming if node doesn't exist.
    if (child) {

        let elm = transform(child, viewport)

        if (annotation.type === 'textbox') {
            svg.appendChild(elm)

        // `text` show above other type elements.
        } else {
            svg.append(elm)
        }
    }
    return child
}


/***/ }),
/* 73 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = renderRect;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__renderKnob__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_color__ = __webpack_require__(29);



/**
 * Create a rect annotation.
 * @param {RectAnnotation} a - rect annotation.
 */
function renderRect (a) {

    let color = a.color || '#FF0'

    const $base = $('<div class="anno-rect-base"/>')

    $base.append($('<div class="anno-rect"/>').css({
        top             : `${a.y}px`,
        left            : `${a.x}px`,
        width           : `${a.width}px`,
        height          : `${a.height}px`,
        border          : `1px solid ${color}`,
        backgroundColor : a.readOnly ? 'none' : __WEBPACK_IMPORTED_MODULE_1__utils_color__["a" /* hex2rgba */](color, 0.3)
    }))

    $base.append(__WEBPACK_IMPORTED_MODULE_0__renderKnob__["b" /* renderKnob */](a))

    return $base[0]
}


/***/ }),
/* 74 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = renderSpan;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__renderKnob__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_color__ = __webpack_require__(29);



/**
 * Create a Span element.
 * @param {SpanAnnotation} a - span annotation.
 * @return {HTMLElement} a html element describing a span annotation.
 */
function renderSpan (a) {

    const readOnly = a.readOnly

    const color = a.color || '#FF0'

    const $base = $('<div class="anno-span"/>')
        .css('zIndex', a.zIndex || 10)

    a.rectangles.forEach(r => {
        $base.append(createRect(r, color, readOnly))
    })

    $base.append(__WEBPACK_IMPORTED_MODULE_0__renderKnob__["b" /* renderKnob */]({
        x : a.rectangles[0].x,
        y : a.rectangles[0].y,
        readOnly
    }))

    return $base[0]
}

function createRect (r, color, readOnly) {

    if (readOnly) {
        return $('<div class="anno-span__border"/>').css({
            top         : r.y + 'px',
            left        : r.x + 'px',
            width       : r.width + 'px',
            height      : r.height + 'px',
            borderColor : color
        })

    } else {

        const rgba = __WEBPACK_IMPORTED_MODULE_1__utils_color__["a" /* hex2rgba */](color, 0.4)

        return $('<div class="anno-span__area"/>').css({
            top             : r.y + 'px',
            left            : r.x + 'px',
            width           : r.width + 'px',
            height          : r.height + 'px',
            backgroundColor : rgba
        })
    }
}


/***/ }),
/* 75 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = renderText;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_setAttributes__ = __webpack_require__(30);
// TODO no need this file ?


/**
 * Default font size for Text.
 */
const DEFAULT_FONT_SIZE = 9.5

/**
 * Calculate boundingClientRect that is needed for rendering text.
 *
 * @param {String} text - A text to be renderd.
 * @param {SVGElement} svg - svgHTMLElement to be used for rendering text.
 * @return {Object} A boundingBox of text element.
 */
function getRect (text, svg) {
    svg.appendChild(text)
    let rect = text.getBoundingClientRect()
    text.parentNode.removeChild(text)
    return rect
}

/**
 * Create SVGTextElement from an annotation definition.
 * This is used for anntations of type `textbox`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGTextElement} A text to be rendered
 */
function renderText (a, svg) {
    // Text.
    let text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    __WEBPACK_IMPORTED_MODULE_0__utils_setAttributes__["a" /* default */](text, {
        x        : a.x,
        y        : a.y + parseInt(DEFAULT_FONT_SIZE, 10),
        fill     : a.color || '#F00',
        fontSize : DEFAULT_FONT_SIZE
    })
    text.innerHTML = a.content || a.text

    // Background.
    let box = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    let rect = getRect(text, svg)
    __WEBPACK_IMPORTED_MODULE_0__utils_setAttributes__["a" /* default */](box, {
        x      : a.x - 1,
        y      : a.y,
        width  : rect.width,
        height : rect.height,
        fill   : '#FFFFFF',
        class  : 'anno-text'
    })

    // Group.
    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.classList.add('anno-text-group')
    group.setAttribute('read-only', a.readOnly === true)
    group.setAttribute('data-parent-id', a.parentId)
    group.style.visibility = 'visible'
    group.appendChild(box)
    group.appendChild(text)

    return group
}


/***/ }),
/* 76 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = renderRelation;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_setAttributes__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__renderKnob__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_relation_js__ = __webpack_require__(31);




/**
 * Create a RELATION annotation.
 *
 * @param {RelationAnnotation} a - The annotation definition
 * @return {SVGGElement} A group of a relation to be rendered
 */
function renderRelation (a) {

    a.color = a.color || '#F00'

    // Adjust the start/end points.
    let theta = Math.atan((a.y1 - a.y2) / (a.x1 - a.x2))
    let sign = (a.x1 < a.x2 ? 1 : -1)
    a.x1 += __WEBPACK_IMPORTED_MODULE_1__renderKnob__["a" /* DEFAULT_RADIUS */] * Math.cos(theta) * sign
    a.x2 -= __WEBPACK_IMPORTED_MODULE_1__renderKnob__["a" /* DEFAULT_RADIUS */] * Math.cos(theta) * sign
    a.y1 += __WEBPACK_IMPORTED_MODULE_1__renderKnob__["a" /* DEFAULT_RADIUS */] * Math.sin(theta) * sign
    a.y2 -= __WEBPACK_IMPORTED_MODULE_1__renderKnob__["a" /* DEFAULT_RADIUS */] * Math.sin(theta) * sign

    let top    = Math.min(a.y1, a.y2)
    let left   = Math.min(a.x1, a.x2)
    let width  = Math.abs(a.x1 - a.x2)
    let height = Math.abs(a.y1 - a.y2)

    const [ $svg, margin ] = createSVGElement(top, left, width, height)

    // Transform coords.
    a.x1 = a.x1 - left + margin
    a.x2 = a.x2 - left + margin
    a.y1 = a.y1 - top + margin
    a.y2 = a.y2 - top + margin

    // <svg viewBox="0 0 200 200">
    //     <marker id="m_ar" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="strokeWidth" preserveAspectRatio="none" markerWidth="2" markerHeight="3" orient="auto-start-reverse">
    //         <polygon points="0,0 0,10 10,5" fill="red" id="ms"/>
    //     </marker>
    //     <path d="M50,50 h100" fill="none" stroke="black" stroke-width="10" marker-start="url(#m_ar)" marker-end="url(#m_ar)"/>
    // </svg>

    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    __WEBPACK_IMPORTED_MODULE_0__utils_setAttributes__["a" /* default */](group, {
        fill   : a.color,
        stroke : a.color
    })
    group.style.visibility = 'visible'
    group.setAttribute('read-only', a.readOnly === true)

    $svg[0].appendChild(group)

    const markerId = 'relationhead' + a.color.replace('#', '')

    if (!document.querySelector('#' + markerId)) {
        let marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
        __WEBPACK_IMPORTED_MODULE_0__utils_setAttributes__["a" /* default */](marker, {
            viewBox      : '0 0 10 10',
            markerWidth  : 2,
            markerHeight : 3,
            fill         : a.color,
            id           : markerId,
            orient       : 'auto-start-reverse'
        })
        marker.setAttribute('refX', 5)
        marker.setAttribute('refY', 5)
        group.appendChild(marker)

        let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
        __WEBPACK_IMPORTED_MODULE_0__utils_setAttributes__["a" /* default */](polygon, {
            points : '0,0 0,10 10,5'
        })
        marker.appendChild(polygon)
    }

    // Find Control points.
    let control = __WEBPACK_IMPORTED_MODULE_2__utils_relation_js__["a" /* findBezierControlPoint */](a.x1, a.y1, a.x2, a.y2)

    // Create Outline.
    let outline = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    __WEBPACK_IMPORTED_MODULE_0__utils_setAttributes__["a" /* default */](outline, {
        d     : `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
        class : 'anno-relation-outline'
    })
    group.appendChild(outline)

    /*
        <path d="M 25 25 Q 175 25 175 175" stroke="blue" fill="none"/>
    */
    let relation = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    __WEBPACK_IMPORTED_MODULE_0__utils_setAttributes__["a" /* default */](relation, {
        d           : `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
        stroke      : a.color,
        strokeWidth : 1,
        fill        : 'none',
        class       : 'anno-relation'
    })

    // Triangle for the end point.
    if (a.direction === 'one-way' || a.direction === 'two-way') {
        relation.setAttribute('marker-end', `url(#${markerId})`)
    }

    // Triangle for the start point.
    if (a.direction === 'two-way') {
        relation.setAttribute('marker-start', `url(#${markerId})`)
    }

    group.appendChild(relation)

    const $base = $('<div/>').css({
        position   : 'absolute',
        top        : 0,
        left       : 0,
        visibility : 'visible'
    }).addClass('anno-relation')
    $base.append($svg)

    return $base[0]
}

function createSVGElement (top, left, width, height) {

    // the margin for rendering an arrow curve.
    const margin = 50

    // Add an annotation layer.
    let $svg = $('<svg class=""/>').css({ // I don't know why, but empty class is need.
        position   : 'absolute',
        top        : `${top - margin}px`,
        left       : `${left - margin}px`,
        width      : `${width + margin * 2}px`,
        height     : `${height + margin * 2}px`,
        visibility : 'hidden',
        'z-index'  : 2
    }).attr({
        x : 0,
        y : 0
    })

    return [ $svg, margin ]
}


/***/ }),
/* 77 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createRelation;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_textInput__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__annotation_relation__ = __webpack_require__(14);



/**
 * Create a new Relation annotation.
 */
function createRelation ({ type, anno1, anno2, text, color }) {
    // TODO No need?
    // for old style.
    if (arguments.length === 3) {
        type = arguments[0]
        anno1 = arguments[1]
        anno2 = arguments[2]
    }

    let annotation = new __WEBPACK_IMPORTED_MODULE_1__annotation_relation__["a" /* default */]()
    annotation.direction = type
    annotation.rel1Annotation = anno1
    annotation.rel2Annotation = anno2
    annotation.text = text
    annotation.color = color

    annotation.save()
    annotation.render()

    // TODO Refactoring.
    // TODO 適切な場所に移動する.
    // Deselect all.
    window.annotationContainer
        .getSelectedAnnotations()
        .forEach(a => a.deselect())

    // Select.
    annotation.select()

    // New type text.
    __WEBPACK_IMPORTED_MODULE_0__utils_textInput__["a" /* enable */]({ uuid : annotation.uuid, autoFocus : true, text })

    return annotation
}


/***/ }),
/* 78 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = enableViewMode;
/**
 * Disable the action of pageback, if `DEL` or `BackSpace` button pressed.
 */
function disablePagebackAction (e) {
    // Allow any keyboard events for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return
    }

    // Delete or BackSpace.
    if (e.keyCode === 46 || e.keyCode === 8) {
        e.preventDefault()

        if (e.type === 'keyup') {
            deleteSelectedAnnotations()
        }

        return false
    }
}

/**
 * Deselect annotations when pages clicked.
 */
function handlePageClick (e) {
    window.annotationContainer
        .getSelectedAnnotations()
        .forEach(a => a.deselect())

    var event = document.createEvent('CustomEvent')
    event.initCustomEvent('annotationDeselected', true, true, this)
    window.dispatchEvent(event)
}

/**
 * Delete selected annotations.
 */
function deleteSelectedAnnotations () {
    window.globalEvent.emit('deleteSelectedAnnotation')
}

// TODO NO NEED `enableViewMode` event ?

/**
 * Enable view mode.
 */
function enableViewMode () {
    console.log('view:enableViewMode')

    document.removeEventListener('keyup', disablePagebackAction)
    document.removeEventListener('keydown', disablePagebackAction)
    document.addEventListener('keyup', disablePagebackAction)
    document.addEventListener('keydown', disablePagebackAction)

    $(document)
        .off('click', handlePageClick)
        .on('click', '.page', handlePageClick)
}


/***/ }),
/* 79 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_anno_ui_src_utils__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__version__ = __webpack_require__(80);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_tomlString__ = __webpack_require__(82);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_event__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__shared_coords__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__span__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__rect__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__relation__ = __webpack_require__(14);









/**
 * Annotation Container.
 */
class AnnotationContainer {

    /**
     * Constructor.
     */
    constructor () {
        this.set = new Set()
    }

    /**
     * Add an annotation to the container.
     */
    add (annotation) {
        this.set.add(annotation)
        __WEBPACK_IMPORTED_MODULE_3__utils_event__["a" /* dispatchWindowEvent */]('annotationUpdated')
    }

    /**
     * Remove the annotation from the container.
     */
    remove (annotation) {
        this.set.delete(annotation)
        __WEBPACK_IMPORTED_MODULE_3__utils_event__["a" /* dispatchWindowEvent */]('annotationUpdated')
    }

    /**
     * Remove all annotations.
     */
    destroy () {
        console.log('AnnotationContainer#destroy')
        this.set.forEach(a => a.destroy())
        this.set = new Set()
    }

    /**
     * Get all annotations from the container.
     */
    getAllAnnotations () {
        let list = []
        this.set.forEach(a => list.push(a))
        return list
    }

    /**
     * Get annotations which user select.
     */
    getSelectedAnnotations () {
        return this.getAllAnnotations().filter(a => a.selected)
    }

    /**
     * Find an annotation by the id which an annotation has.
     */
    findById (uuid) {
        uuid = String(uuid) // `uuid` must be string.
        let annotation = null
        this.set.forEach(a => {
            if (a.uuid === uuid) {
                annotation = a
            }
        })
        return annotation
    }

    /**
     * Change the annotations color, if the text is the same in an annotation.
     *
     * annoType : span, one-way, two-way, link
     */
    changeColor ({ text, color, uuid, annoType }) {
        console.log('changeColor: ', text, color, uuid)
        if (uuid) {
            const a = this.findById(uuid)
            if (a) {
                a.color = color
                a.render()
                a.enableViewMode()
            }
        } else {
            this.getAllAnnotations()
                .filter(a => !a.readOnly)
                .filter(a => a.text === text)
                .filter(a => {
                    if (annoType === 'span') {
                        return a.type === annoType
                    } else if (annoType === 'one-way' || annoType === 'two-way' || annoType === 'link') {
                        if (a.type === 'relation' && a.direction === annoType) {
                            return true
                        }
                    }
                    return false
                }).forEach(a => {
                    a.color = color
                    a.render()
                    a.enableViewMode()
                })
        }
    }

    /**
     * Export annotations as a TOML string.
     */
    exportData () {

        return new Promise((resolve, reject) => {

            let dataExport = {}

            // Set version.
            dataExport.version = __WEBPACK_IMPORTED_MODULE_1__version__["a" /* default */]

            // Only writable.
            const annos = this.getAllAnnotations().filter(a => !a.readOnly)

            // Sort by create time.
            // This reason is that a relation need start/end annotation ids which are numbered at export.
            annos.sort((a1, a2) => a1.createdAt - a2.createdAt)

            // The ID for specifing an annotation on a TOML file.
            // This ID is sequential.
            let id = 0

            // Create export data.
            annos.forEach(annotation => {

                // Increment to next.
                id++

                // Span.
                if (annotation.type === 'span') {

                    // TODO Define at annotation/span.js

                    // page.
                    let { pageNumber } = __WEBPACK_IMPORTED_MODULE_4__shared_coords__["b" /* convertToExportY */](annotation.rectangles[0].y)

                    // rectangles.
                    let rectangles = annotation.rectangles.map(rectangle => {
                        const { y } = __WEBPACK_IMPORTED_MODULE_4__shared_coords__["b" /* convertToExportY */](rectangle.y)
                        return [
                            rectangle.x,
                            y,
                            rectangle.width,
                            rectangle.height
                        ]
                    })

                    let text = (annotation.selectedText || '')
                                .replace(/\r\n/g, ' ')
                                .replace(/\r/g, ' ')
                                .replace(/\n/g, ' ')
                                .replace(/"/g, '')
                                .replace(/\\/g, '')

                    dataExport[id] = {
                        type      : annotation.type,
                        page      : pageNumber,
                        position  : rectangles,
                        label     : annotation.text || '',
                        text,
                        textrange : annotation.textRange
                    }

                    // Save temporary for relation.
                    annotation.exportId = id

                // Relation.
                } else if (annotation.type === 'relation') {

                    // TODO Define at annotation/relation.js

                    dataExport[id] = {
                        type  : 'relation',
                        dir   : annotation.direction,
                        ids   : [ annotation.rel1Annotation.exportId, annotation.rel2Annotation.exportId ],
                        label : annotation.text || ''
                    }

                // Rect.
                } else if (annotation.type === 'rect') {

                    /*
                        [2]
                        type = "rect"
                        page = 1
                        position = ["9.24324324324326","435.94054054054055","235.7027027027027","44.65945945945946"]
                        label = "aaaa"
                    */
                    let { pageNumber, y } = __WEBPACK_IMPORTED_MODULE_4__shared_coords__["b" /* convertToExportY */](annotation.y)

                    dataExport[id] = {
                        type     : 'rect',
                        page     : pageNumber,
                        position : [ annotation.x, y, annotation.width, annotation.height ],
                        label    : annotation.text || ''
                    }

                    // Save temporary for relation.
                    annotation.exportId = id

                }

            })

            resolve(__WEBPACK_IMPORTED_MODULE_2__utils_tomlString__["b" /* toTomlString */](dataExport))
        })
    }

    /**
     * Import annotations.
     */
    importAnnotations (data, isPrimary) {

        const readOnly = !isPrimary
        const colorMap = data.colorMap

        function getColor (index, type, text) {
            if (readOnly) {
                return data.colors[index]
            } else {
                let color = colorMap.default
                if (colorMap[type] && colorMap[type][text]) {
                    color = colorMap[type][text]
                }
                // console.log('getColor:', type, text, colorMap[type][text], color)
                return color
            }
        }

        return new Promise((resolve, reject) => {

            // Delete old ones.
            this.getAllAnnotations()
                    .filter(a => a.readOnly === readOnly)
                    .forEach(a => a.destroy())

            // Add annotations.
            data.annotations.forEach((tomlString, i) => {

                // Create a object from TOML string.
                let tomlObject = __WEBPACK_IMPORTED_MODULE_2__utils_tomlString__["a" /* fromTomlString */](tomlString)
                if (!tomlObject) {
                    return
                }

                // let color = data.colors[i]

                for (const key in tomlObject) {

                    let d = tomlObject[key]

                    // Skip if the content is not object, like version string.
                    if (typeof d !== 'object') {
                        continue
                    }

                    d.uuid = __WEBPACK_IMPORTED_MODULE_0_anno_ui_src_utils__["a" /* uuid */]()
                    d.readOnly = readOnly
                    // d.color = data.colors[i]

                    if (d.type === 'span') {

                        let span = __WEBPACK_IMPORTED_MODULE_5__span__["a" /* default */].newInstanceFromTomlObject(d)
                        span.color = getColor(i, span.type, span.text)
                        span.save()
                        span.render()
                        span.enableViewMode()

                    // Rect.
                    } else if (d.type === 'rect') {

                        let rect = __WEBPACK_IMPORTED_MODULE_6__rect__["a" /* default */].newInstanceFromTomlObject(d)
                        rect.color = getColor(i, rect.type, rect.text)
                        rect.save()
                        rect.render()
                        rect.enableViewMode()

                    // Relation.
                    } else if (d.type === 'relation') {

                        d.rel1 = tomlObject[d.ids[0]].uuid
                        d.rel2 = tomlObject[d.ids[1]].uuid
                        let relation = __WEBPACK_IMPORTED_MODULE_7__relation__["a" /* default */].newInstanceFromTomlObject(d)
                        relation.color = getColor(i, relation.direction, relation.text)
                        relation.save()
                        relation.render()
                        relation.enableViewMode()

                    } else {
                        console.log('Unknown: ', key, d)
                    }
                }
            })

            // Done.
            resolve(true)
        })
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = AnnotationContainer;



/***/ }),
/* 80 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let packageJson = __webpack_require__(81)
/**
 * Paper Anno Version.
 * This is overwritten at build.
 */
let ANNO_VERSION = packageJson.version
/* harmony default export */ __webpack_exports__["a"] = (ANNO_VERSION);


/***/ }),
/* 81 */
/***/ (function(module, exports) {

module.exports = {"name":"pdfanno","version":"0.4.0-dev","description":"","main":"index.js","scripts":{"_prepare":"gulp prepare","dev":"npm run _prepare && webpack-dev-server --inline","watch":"npm run _prepare && webpack --watch","publish:latest":"npm run _prepare && cross-env NODE_ENV=production SERVER_PATH=latest webpack && gulp publish_latest","publish:stable":"npm run _prepare && cross-env NODE_ENV=production SERVER_PATH=0.3.0  webpack && gulp publish_stable","server:latest":"cross-env NODE_ENV=production NODE_PORT=1001 node server/server.js","server:stable":"cross-env NODE_ENV=production NODE_PORT=1000 node server/server.js","server:dev":"cross-env NODE_PORT=3000 ./node_modules/.bin/node-dev server/server.js"},"repository":{"type":"git","url":"git+https://github.com/paperai/pdfanno"},"author":"hshindo, yoheiMune","license":"MIT","bugs":{"url":"https://github.com/paperai/pdfanno/issues"},"homepage":"https://github.com/paperai/pdfanno#readme","pdfextract":{"version":"0.1.6","url":"https://github.com/paperai/pdfextract/releases/download/v0.1.6/pdfextract-0.1.6.jar"},"devDependencies":{"babel-cli":"^6.26.0","babel-core":"^6.26.0","babel-eslint":"^7.2.3","babel-loader":"6.2.4","babel-messages":"^6.23.0","babel-plugin-add-module-exports":"^0.2.1","babel-preset-es2015":"^6.24.1","babel-preset-stage-1":"^6.24.1","copy":"^0.3.0","cpr":"^2.2.0","cross-env":"^5.0.5","css-loader":"^0.25.0","deep-assign":"^2.0.0","eslint":"^3.19.0","eslint-config-standard":"^6.2.1","eslint-friendly-formatter":"^2.0.7","eslint-loader":"^1.7.1","eslint-plugin-html":"^2.0.0","eslint-plugin-promise":"^3.5.0","eslint-plugin-standard":"^2.3.1","file-loader":"^0.9.0","fs-extra":"^1.0.0","fuse.js":"^3.1.0","gulp":"^3.9.1","gulp-cli":"^1.4.0","node-dev":"^3.1.3","style-loader":"^0.13.2","vinyl-source-stream":"^1.1.0","webpack":"3.0.0","webpack-dev-server":"^1.16.5"},"dependencies":{"anno-ui":"github:paperai/anno-ui#master","axios":"^0.15.2","body-parser":"^1.17.2","express":"^4.15.4","json-loader":"^0.5.7","mkdirp-promise":"^5.0.1","multer":"^1.3.0","request":"^2.81.0","requirejs":"^2.3.5","socket.io":"^2.0.4","toml":"github:yoheiMune/toml-node","urijs":"^1.19.0"}}

/***/ }),
/* 82 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = toTomlString;
/* harmony export (immutable) */ __webpack_exports__["a"] = fromTomlString;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_toml__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_toml___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_toml__);
/**
 * Utilities for TOML format.
 */


/**
 * Create a TOML String from jsObject.
 */
function toTomlString (obj, root = true) {

    let lines = []

    // `version` is first.
    if ('version' in obj) {
        lines.push(`version = "${obj['version']}"`)
        lines.push('')
        delete obj['version']
    }

    // #paperanno-ja/issues/38
    // Make all values in `position` as string.
    if ('position' in obj) {
        let position = obj.position
        position = position.map(p => {
            if (typeof p === 'number') {
                return String(p)
            } else {
                return p.map(v => String(v))
            }
        })
        obj.position = position
    }

    Object.keys(obj).forEach(prop => {

        let val = obj[prop]
        if (typeof val === 'string') {
            lines.push(`${prop} = "${val}"`)
            root && lines.push('')

        } else if (typeof val === 'number') {
            lines.push(`${prop} = ${val}`)
            root && lines.push('')

        } else if (isArray(val)) {
            lines.push(`${prop} = ${JSON.stringify(val)}`)
            root && lines.push('')

        } else if (typeof val === 'object') {
            lines.push(`[${prop}]`)
            lines.push(toTomlString(val, false))
            root && lines.push('')
        }
    })

    return lines.join('\n')
}

/**
 * Create a object from TOML string.
 */
function fromTomlString (tomlString) {
    try {
        return __WEBPACK_IMPORTED_MODULE_0_toml___default.a.parse(tomlString)
    } catch (e) {
        console.log('ERROR:', e)
        console.log('TOML:\n', tomlString)
        return null
    }
}

/**
 * Check the val is array.
 */
function isArray (val) {
    return val && 'length' in val
}


/***/ })
/******/ ]);
});
//# sourceMappingURL=pdfanno.core.bundle.js.map