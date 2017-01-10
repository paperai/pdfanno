(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PDFAnnotate"] = factory();
	else
		root["PDFAnnotate"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _jquery = __webpack_require__(6);
	
	var _jquery2 = _interopRequireDefault(_jquery);
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _container = __webpack_require__(56);
	
	var _container2 = _interopRequireDefault(_container);
	
	var _rect = __webpack_require__(48);
	
	var _rect2 = _interopRequireDefault(_rect);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	__webpack_require__(57);
	
	
	// for Convinience.
	window.$ = window.jQuery = _jquery2.default;
	
	// The entry point of window.xxx.
	// (setting from webpack.config.js)
	exports.default = _PDFJSAnnotate2.default;
	
	// Alias.
	
	var PDFAnnotate = _PDFJSAnnotate2.default;
	
	window.annotationContainer = new _container2.default();
	
	// Setup Storage.
	PDFAnnotate.setStoreAdapter(new PDFAnnotate.PdfannoStoreAdapter());
	
	// The event called at page rendered by pdfjs.
	window.addEventListener('pagerendered', function (ev) {
	    console.log('pagerendered:', ev.detail.pageNumber);
	    renderAnno();
	});
	
	// Adapt to scale change.
	(0, _jquery2.default)(window).on('resize', removeAnnoLayer);
	(0, _jquery2.default)('#scaleSelect').on('change', removeAnnoLayer);
	(0, _jquery2.default)('#zoomIn, #zoomOut').on('click', removeAnnoLayer);
	
	/*
	 * Remove the annotation layer and the temporary rendering layer.
	 */
	function removeAnnoLayer() {
	    (0, _jquery2.default)('#annoLayer, #tmpLayer').remove();
	}
	
	/*
	 * Render annotations saved in the storage.
	 */
	function renderAnno() {
	
	    // TODO make it a global const.
	    var svgLayerId = 'annoLayer';
	
	    // Check already exists.
	    if ((0, _jquery2.default)('#' + svgLayerId).length > 0) {
	        return;
	    }
	
	    var leftMargin = ((0, _jquery2.default)('#viewer').width() - (0, _jquery2.default)('.page').width()) / 2;
	
	    // At window.width < page.width.
	    if (leftMargin < 0) {
	        leftMargin = 9;
	    }
	
	    var height = (0, _jquery2.default)('#viewer').height();
	
	    var width = (0, _jquery2.default)('.page').width();
	
	    // Add an annotation layer.
	    var $annoLayer = (0, _jquery2.default)('<svg id="' + svgLayerId + '"/>').css({ // TODO CSSClass.
	        position: 'absolute',
	        top: '0px',
	        left: leftMargin + 'px',
	        width: width + 'px',
	        height: height + 'px',
	        visibility: 'hidden',
	        'z-index': 2
	    });
	    // Add a tmp layer.
	    var $tmpLayer = (0, _jquery2.default)('<div id="tmpLayer"/>').css({ // TODO CSSClass.
	        position: 'absolute',
	        top: '0px',
	        left: leftMargin + 'px',
	        width: width + 'px',
	        height: height + 'px',
	        visibility: 'hidden',
	        'z-index': 2
	    });
	
	    (0, _jquery2.default)('#viewer').css({
	        position: 'relative'
	    }).append($annoLayer).append($tmpLayer);
	
	    var svg = $annoLayer.get(0);
	    var documentId = getFileName(PDFView.url);
	    var viewport = PDFView.pdfViewer.getPageView(0).viewport;
	    svg.setAttribute('data-pdf-annotate-viewport', JSON.stringify(viewport));
	    svg.setAttribute('data-pdf-annotate-document', documentId);
	    svg.setAttribute('data-pdf-annotate-page', 1);
	
	    // Import user uploading annotation, if exists.
	    if (uploadedAnnotationExists()) {
	        importUploadedAnnotation().then(function () {
	            renderAnnotations(svg, 1);
	        });
	    } else {
	        renderAnnotations(svg, 1);
	    }
	}
	
	function renderAnnotations(svg, pageNumber) {
	    var documentId = getFileName(PDFView.url);
	    PDFAnnotate.getAnnotations(documentId, pageNumber).then(function (annotations) {
	        PDFAnnotate.getStoreAdapter().getSecondaryAnnotations(documentId, pageNumber).then(function (secondaryAnnotations) {
	
	            // Primary + Secondary annotations.
	            annotations.annotations = annotations.annotations.concat(secondaryAnnotations.annotations);
	
	            // Render annotations.
	            var viewport = PDFView.pdfViewer.getPageView(0).viewport;
	            // PDFAnnotate.render(svg, viewport, annotations).then((svg, elements) => {
	
	            //     for (let i = 0; i < annotations.length; i++) {
	
	            //     }
	
	
	            //     // var event = document.createEvent('CustomEvent');
	            //     // event.initCustomEvent('annotationrendered', true, true, {
	            //     //   pageNumber: pageNumber
	            //     // });
	            //     // window.dispatchEvent(event);
	
	            // });
	
	            annotations.annotations.forEach(function (a) {
	
	                if (a.type === 'area') {
	                    var rect = _rect2.default.newInstance(a);
	                    rect.render();
	                    window.annotationContainer.add(rect);
	                } else {
	                    (0, _appendChild2.default)(svg, a);
	                }
	            });
	
	            var event = document.createEvent('CustomEvent');
	            event.initCustomEvent('annotationrendered', true, true, {
	                pageNumber: pageNumber
	            });
	            window.dispatchEvent(event);
	        });
	    });
	}
	
	function uploadedAnnotationExists() {
	    var item = localStorage.getItem('_pdfanno_pdfanno_upload');
	    var itemSecondary = localStorage.getItem('_pdfanno_pdfanno_upload_second');
	    return item || itemSecondary;
	}
	
	function importUploadedAnnotation() {
	
	    var actions = [];
	
	    // Primary Annotation.
	    if (localStorage.getItem('_pdfanno_pdfanno_upload')) {
	        console.log('LOAD PRIMARY');
	        var annotations = JSON.parse(localStorage.getItem('_pdfanno_pdfanno_upload'));
	        console.log('importUploadedAnnotation:', annotations);
	        var promise = PDFAnnotate.getStoreAdapter().importData(annotations).then(function () {
	            localStorage.removeItem('_pdfanno_pdfanno_upload');
	        });
	        actions.push(promise);
	    }
	
	    // Seconday Annotations.
	    if (localStorage.getItem('_pdfanno_pdfanno_upload_second')) {
	        console.log('LOAD SECONDARY');
	        var secondAnnotations = JSON.parse(localStorage.getItem('_pdfanno_pdfanno_upload_second'));
	        console.log('secondAnnotations:', secondAnnotations);
	        var _promise = PDFAnnotate.getStoreAdapter().importDataSecondary(secondAnnotations).then(function () {
	            localStorage.removeItem('_pdfanno_pdfanno_upload_second');
	        });
	        actions.push(_promise);
	    }
	
	    return Promise.all(actions);
	}
	
	function setupPDFDragAndDropLoader() {
	
	    var element = document.querySelector('body');
	
	    (0, _jquery2.default)(element).off('dragenter', handleDragEnter);
	    (0, _jquery2.default)(element).off('dragleave', handleDragLeave);
	    (0, _jquery2.default)(element).off('dragover', handleDragOver);
	    (0, _jquery2.default)(element).off('drop', handleDroppedFile);
	    (0, _jquery2.default)(element).on('dragenter', handleDragEnter);
	    (0, _jquery2.default)(element).on('dragleave', handleDragLeave);
	    (0, _jquery2.default)(element).on('dragover', handleDragOver);
	    (0, _jquery2.default)(element).on('drop', handleDroppedFile);
	}
	setupPDFDragAndDropLoader();
	
	function handleDroppedFile(e) {
	
	    console.log('bbbbbbbbbbbbb');
	
	    var event = document.createEvent('CustomEvent');
	    event.initCustomEvent('pdfdropped', true, true, { originalEvent: e.originalEvent });
	    window.dispatchEvent(event);
	
	    return cancelEvent(e);
	}
	
	function handleDragEnter(e) {
	
	    var event = document.createEvent('CustomEvent');
	    event.initCustomEvent('pdfdragenter', true, true, { originalEvent: e });
	    window.dispatchEvent(event);
	
	    return cancelEvent(e);
	}
	
	function handleDragLeave(e) {
	
	    var event = document.createEvent('CustomEvent');
	    event.initCustomEvent('pdfdragleave', true, true, { originalEvent: e });
	    window.dispatchEvent(event);
	
	    return cancelEvent(e);
	}
	
	function handleDragOver(e) {
	
	    // This is the setting to allow D&D for Firefox.
	    // @see https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/effectAllowed
	    e.originalEvent.dataTransfer.effectAllowed = 'move';
	
	    var event = document.createEvent('CustomEvent');
	    event.initCustomEvent('pdfdragover', true, true, { originalEvent: e });
	    window.dispatchEvent(event);
	
	    return cancelEvent(e);
	}
	
	// Cancel handler
	function cancelEvent(e) {
	    e.preventDefault();
	    return false;
	}
	module.exports = exports['default'];

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports) {

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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

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
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
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


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v3.1.1
	 * https://jquery.com/
	 *
	 * Includes Sizzle.js
	 * https://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * https://jquery.org/license
	 *
	 * Date: 2016-09-22T22:30Z
	 */
	( function( global, factory ) {
	
		"use strict";
	
		if ( typeof module === "object" && typeof module.exports === "object" ) {
	
			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}
	
	// Pass this if window is not defined yet
	} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
	
	// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
	// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
	// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
	// enough that all such attempts are guarded in a try block.
	"use strict";
	
	var arr = [];
	
	var document = window.document;
	
	var getProto = Object.getPrototypeOf;
	
	var slice = arr.slice;
	
	var concat = arr.concat;
	
	var push = arr.push;
	
	var indexOf = arr.indexOf;
	
	var class2type = {};
	
	var toString = class2type.toString;
	
	var hasOwn = class2type.hasOwnProperty;
	
	var fnToString = hasOwn.toString;
	
	var ObjectFunctionString = fnToString.call( Object );
	
	var support = {};
	
	
	
		function DOMEval( code, doc ) {
			doc = doc || document;
	
			var script = doc.createElement( "script" );
	
			script.text = code;
			doc.head.appendChild( script ).parentNode.removeChild( script );
		}
	/* global Symbol */
	// Defining this global in .eslintrc.json would create a danger of using the global
	// unguarded in another place, it seems safer to define global only for this module
	
	
	
	var
		version = "3.1.1",
	
		// Define a local copy of jQuery
		jQuery = function( selector, context ) {
	
			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},
	
		// Support: Android <=4.0 only
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
	
		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([a-z])/g,
	
		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};
	
	jQuery.fn = jQuery.prototype = {
	
		// The current version of jQuery being used
		jquery: version,
	
		constructor: jQuery,
	
		// The default length of a jQuery object is 0
		length: 0,
	
		toArray: function() {
			return slice.call( this );
		},
	
		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
	
			// Return all the elements in a clean array
			if ( num == null ) {
				return slice.call( this );
			}
	
			// Return just the one element from the set
			return num < 0 ? this[ num + this.length ] : this[ num ];
		},
	
		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {
	
			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );
	
			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
	
			// Return the newly-formed element set
			return ret;
		},
	
		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},
	
		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},
	
		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},
	
		first: function() {
			return this.eq( 0 );
		},
	
		last: function() {
			return this.eq( -1 );
		},
	
		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},
	
		end: function() {
			return this.prevObject || this.constructor();
		},
	
		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};
	
	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;
	
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
	
			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}
	
		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}
	
		for ( ; i < length; i++ ) {
	
			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {
	
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];
	
					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}
	
					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = jQuery.isArray( copy ) ) ) ) {
	
						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray( src ) ? src : [];
	
						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}
	
						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );
	
					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}
	
		// Return the modified object
		return target;
	};
	
	jQuery.extend( {
	
		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),
	
		// Assume jQuery is ready without the ready module
		isReady: true,
	
		error: function( msg ) {
			throw new Error( msg );
		},
	
		noop: function() {},
	
		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},
	
		isArray: Array.isArray,
	
		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},
	
		isNumeric: function( obj ) {
	
			// As of jQuery 3.0, isNumeric is limited to
			// strings and numbers (primitives or objects)
			// that can be coerced to finite numbers (gh-2662)
			var type = jQuery.type( obj );
			return ( type === "number" || type === "string" ) &&
	
				// parseFloat NaNs numeric-cast false positives ("")
				// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
				// subtraction forces infinities to NaN
				!isNaN( obj - parseFloat( obj ) );
		},
	
		isPlainObject: function( obj ) {
			var proto, Ctor;
	
			// Detect obvious negatives
			// Use toString instead of jQuery.type to catch host objects
			if ( !obj || toString.call( obj ) !== "[object Object]" ) {
				return false;
			}
	
			proto = getProto( obj );
	
			// Objects with no prototype (e.g., `Object.create( null )`) are plain
			if ( !proto ) {
				return true;
			}
	
			// Objects with prototype are plain iff they were constructed by a global Object function
			Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
			return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
		},
	
		isEmptyObject: function( obj ) {
	
			/* eslint-disable no-unused-vars */
			// See https://github.com/eslint/eslint/issues/6125
			var name;
	
			for ( name in obj ) {
				return false;
			}
			return true;
		},
	
		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}
	
			// Support: Android <=2.3 only (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},
	
		// Evaluates a script in a global context
		globalEval: function( code ) {
			DOMEval( code );
		},
	
		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE <=9 - 11, Edge 12 - 13
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},
	
		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},
	
		each: function( obj, callback ) {
			var length, i = 0;
	
			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}
	
			return obj;
		},
	
		// Support: Android <=4.0 only
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},
	
		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];
	
			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}
	
			return ret;
		},
	
		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},
	
		// Support: Android <=4.0 only, PhantomJS 1 only
		// push.apply(_, arraylike) throws on ancient WebKit
		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;
	
			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}
	
			first.length = i;
	
			return first;
		},
	
		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;
	
			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}
	
			return matches;
		},
	
		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];
	
			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );
	
					if ( value != null ) {
						ret.push( value );
					}
				}
	
			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );
	
					if ( value != null ) {
						ret.push( value );
					}
				}
			}
	
			// Flatten any nested arrays
			return concat.apply( [], ret );
		},
	
		// A global GUID counter for objects
		guid: 1,
	
		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;
	
			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}
	
			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}
	
			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};
	
			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;
	
			return proxy;
		},
	
		now: Date.now,
	
		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );
	
	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}
	
	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );
	
	function isArrayLike( obj ) {
	
		// Support: real iOS 8.2 only (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );
	
		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}
	
		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.3.3
	 * https://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-08-08
	 */
	(function( window ) {
	
	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,
	
		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,
	
		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},
	
		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// https://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},
	
		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
	
		// Regular expressions
	
		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",
	
		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",
	
		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",
	
		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",
	
		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),
	
		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),
	
		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),
	
		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),
	
		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},
	
		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,
	
		rnative = /^[^{]+\{\s*\[native \w/,
	
		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
	
		rsibling = /[+~]/,
	
		// CSS escapes
		// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},
	
		// CSS string/identifier serialization
		// https://drafts.csswg.org/cssom/#common-serializing-idioms
		rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
		fcssescape = function( ch, asCodePoint ) {
			if ( asCodePoint ) {
	
				// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
				if ( ch === "\0" ) {
					return "\uFFFD";
				}
	
				// Control characters and (dependent upon position) numbers get escaped as code points
				return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
			}
	
			// Other potentially-special ASCII characters get backslash-escaped
			return "\\" + ch;
		},
	
		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		},
	
		disabledAncestor = addCombinator(
			function( elem ) {
				return elem.disabled === true && ("form" in elem || "label" in elem);
			},
			{ dir: "parentNode", next: "legend" }
		);
	
	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?
	
			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :
	
			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}
	
	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, match, groups, newSelector,
			newContext = context && context.ownerDocument,
	
			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;
	
		results = results || [];
	
		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {
	
			return results;
		}
	
		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {
	
			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;
	
			if ( documentIsHTML ) {
	
				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
	
					// ID selector
					if ( (m = match[1]) ) {
	
						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {
	
								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}
	
						// Element context
						} else {
	
							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {
	
								results.push( elem );
								return results;
							}
						}
	
					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;
	
					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {
	
						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}
	
				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
	
					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;
	
					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {
	
						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rcssescape, fcssescape );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}
	
						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						while ( i-- ) {
							groups[i] = "#" + nid + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );
	
						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}
	
					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}
	
		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}
	
	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];
	
		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}
	
	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}
	
	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created element and returns a boolean result
	 */
	function assert( fn ) {
		var el = document.createElement("fieldset");
	
		try {
			return !!fn( el );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( el.parentNode ) {
				el.parentNode.removeChild( el );
			}
			// release memory in IE
			el = null;
		}
	}
	
	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;
	
		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}
	
	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				a.sourceIndex - b.sourceIndex;
	
		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}
	
		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}
	
		return a ? 1 : -1;
	}
	
	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}
	
	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}
	
	/**
	 * Returns a function to use in pseudos for :enabled/:disabled
	 * @param {Boolean} disabled true for :disabled; false for :enabled
	 */
	function createDisabledPseudo( disabled ) {
	
		// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
		return function( elem ) {
	
			// Only certain elements can match :enabled or :disabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
			if ( "form" in elem ) {
	
				// Check for inherited disabledness on relevant non-disabled elements:
				// * listed form-associated elements in a disabled fieldset
				//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
				// * option elements in a disabled optgroup
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
				// All such elements have a "form" property.
				if ( elem.parentNode && elem.disabled === false ) {
	
					// Option elements defer to a parent optgroup if present
					if ( "label" in elem ) {
						if ( "label" in elem.parentNode ) {
							return elem.parentNode.disabled === disabled;
						} else {
							return elem.disabled === disabled;
						}
					}
	
					// Support: IE 6 - 11
					// Use the isDisabled shortcut property to check for disabled fieldset ancestors
					return elem.isDisabled === disabled ||
	
						// Where there is no isDisabled, check manually
						/* jshint -W018 */
						elem.isDisabled !== !disabled &&
							disabledAncestor( elem ) === disabled;
				}
	
				return elem.disabled === disabled;
	
			// Try to winnow out elements that can't be disabled before trusting the disabled property.
			// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
			// even exist on them, let alone have a boolean value.
			} else if ( "label" in elem ) {
				return elem.disabled === disabled;
			}
	
			// Remaining elements are neither :enabled nor :disabled
			return false;
		};
	}
	
	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;
	
				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}
	
	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}
	
	// Expose support vars for convenience
	support = Sizzle.support = {};
	
	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};
	
	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, subWindow,
			doc = node ? node.ownerDocument || node : preferredDoc;
	
		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}
	
		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );
	
		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( preferredDoc !== document &&
			(subWindow = document.defaultView) && subWindow.top !== subWindow ) {
	
			// Support: IE 11, Edge
			if ( subWindow.addEventListener ) {
				subWindow.addEventListener( "unload", unloadHandler, false );
	
			// Support: IE 9 - 10 only
			} else if ( subWindow.attachEvent ) {
				subWindow.attachEvent( "onunload", unloadHandler );
			}
		}
	
		/* Attributes
		---------------------------------------------------------------------- */
	
		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( el ) {
			el.className = "i";
			return !el.getAttribute("className");
		});
	
		/* getElement(s)By*
		---------------------------------------------------------------------- */
	
		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( el ) {
			el.appendChild( document.createComment("") );
			return !el.getElementsByTagName("*").length;
		});
	
		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );
	
		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programmatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( el ) {
			docElem.appendChild( el ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});
	
		// ID filter and find
		if ( support.getById ) {
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var elem = context.getElementById( id );
					return elem ? [ elem ] : [];
				}
			};
		} else {
			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};
	
			// Support: IE 6 - 7 only
			// getElementById is not reliable as a find shortcut
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var node, i, elems,
						elem = context.getElementById( id );
	
					if ( elem ) {
	
						// Verify the id attribute
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}
	
						// Fall back on getElementsByName
						elems = context.getElementsByName( id );
						i = 0;
						while ( (elem = elems[i++]) ) {
							node = elem.getAttributeNode("id");
							if ( node && node.value === id ) {
								return [ elem ];
							}
						}
					}
	
					return [];
				}
			};
		}
	
		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );
	
				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :
	
			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );
	
				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}
	
					return tmp;
				}
				return results;
			};
	
		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};
	
		/* QSA/matchesSelector
		---------------------------------------------------------------------- */
	
		// QSA and matchesSelector support
	
		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];
	
		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See https://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];
	
		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( el ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// https://bugs.jquery.com/ticket/12359
				docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";
	
				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( el.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}
	
				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !el.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}
	
				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}
	
				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !el.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}
	
				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibling-combinator selector` fails
				if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});
	
			assert(function( el ) {
				el.innerHTML = "<a href='' disabled='disabled'></a>" +
					"<select disabled='disabled'><option/></select>";
	
				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				el.appendChild( input ).setAttribute( "name", "D" );
	
				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( el.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}
	
				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( el.querySelectorAll(":enabled").length !== 2 ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}
	
				// Support: IE9-11+
				// IE's :disabled selector does not pick up the children of disabled fieldsets
				docElem.appendChild( el ).disabled = true;
				if ( el.querySelectorAll(":disabled").length !== 2 ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}
	
				// Opera 10-11 does not throw on post-comma invalid pseudos
				el.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}
	
		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {
	
			assert(function( el ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( el, "*" );
	
				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( el, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}
	
		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );
	
		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );
	
		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};
	
		/* Sorting
		---------------------------------------------------------------------- */
	
		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {
	
			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}
	
			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :
	
				// Otherwise we know they are disconnected
				1;
	
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {
	
				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}
	
				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}
	
			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];
	
			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
	
			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}
	
			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}
	
			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}
	
			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :
	
				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};
	
		return document;
	};
	
	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};
	
	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}
	
		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );
	
		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {
	
			try {
				var ret = matches.call( elem, expr );
	
				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}
	
		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};
	
	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};
	
	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}
	
		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;
	
		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};
	
	Sizzle.escape = function( sel ) {
		return (sel + "").replace( rcssescape, fcssescape );
	};
	
	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};
	
	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;
	
		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );
	
		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}
	
		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;
	
		return results;
	};
	
	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;
	
		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	
		return ret;
	};
	
	Expr = Sizzle.selectors = {
	
		// Can be adjusted by the user
		cacheLength: 50,
	
		createPseudo: markFunction,
	
		match: matchExpr,
	
		attrHandle: {},
	
		find: {},
	
		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},
	
		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );
	
				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );
	
				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}
	
				return match.slice( 0, 4 );
			},
	
			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();
	
				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}
	
					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );
	
				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}
	
				return match;
			},
	
			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];
	
				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}
	
				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";
	
				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {
	
					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}
	
				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},
	
		filter: {
	
			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},
	
			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];
	
				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},
	
			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );
	
					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}
	
					result += "";
	
					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},
	
			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";
	
				return first === 1 && last === 0 ?
	
					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :
	
					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;
	
						if ( parent ) {
	
							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {
	
											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}
	
							start = [ forward ? parent.firstChild : parent.lastChild ];
	
							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {
	
								// Seek `elem` from a previously-cached index
	
								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});
	
								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});
	
								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];
	
								while ( (node = ++nodeIndex && node && node[ dir ] ||
	
									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {
	
									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}
	
							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});
	
									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});
	
									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}
	
								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {
	
										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {
	
											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});
	
												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});
	
												uniqueCache[ type ] = [ dirruns, diff ];
											}
	
											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}
	
							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},
	
			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );
	
				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}
	
				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}
	
				return fn;
			}
		},
	
		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );
	
				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;
	
						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),
	
			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),
	
			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),
	
			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {
	
							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),
	
			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},
	
			"root": function( elem ) {
				return elem === docElem;
			},
	
			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},
	
			// Boolean properties
			"enabled": createDisabledPseudo( false ),
			"disabled": createDisabledPseudo( true ),
	
			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},
	
			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}
	
				return elem.selected === true;
			},
	
			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},
	
			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},
	
			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},
	
			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},
	
			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},
	
			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&
	
					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},
	
			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),
	
			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),
	
			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),
	
			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};
	
	Expr.pseudos["nth"] = Expr.pseudos["eq"];
	
	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}
	
	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();
	
	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];
	
		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}
	
		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;
	
		while ( soFar ) {
	
			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}
	
			matched = false;
	
			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}
	
			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}
	
			if ( !matched ) {
				break;
			}
		}
	
		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};
	
	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}
	
	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			skip = combinator.next,
			key = skip || dir,
			checkNonElements = base && key === "parentNode",
			doneName = done++;
	
		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
				return false;
			} :
	
			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];
	
				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});
	
							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});
	
							if ( skip && skip === elem.nodeName.toLowerCase() ) {
								elem = elem[ dir ] || elem;
							} else if ( (oldCache = uniqueCache[ key ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {
	
								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ key ] = newCache;
	
								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
				return false;
			};
	}
	
	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}
	
	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}
	
	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;
	
		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}
	
		return newUnmatched;
	}
	
	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,
	
				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),
	
				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,
	
				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?
	
						// ...intermediate processing is necessary
						[] :
	
						// ...otherwise use results directly
						results :
					matcherIn;
	
			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}
	
			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );
	
				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}
	
			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}
	
					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {
	
							seed[temp] = !(results[temp] = elem);
						}
					}
				}
	
			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}
	
	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,
	
			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];
	
		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );
	
				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}
	
		return elementMatcher( matchers );
	}
	
	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;
	
				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}
	
				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}
	
					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}
	
						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}
	
				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;
	
				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}
	
					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}
	
						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}
	
					// Add matches to results
					push.apply( results, setMatched );
	
					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {
	
						Sizzle.uniqueSort( results );
					}
				}
	
				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}
	
				return unmatched;
			};
	
		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}
	
	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];
	
		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}
	
			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	
			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};
	
	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );
	
		results = results || [];
	
		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {
	
			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {
	
				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
	
				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}
	
				selector = selector.slice( tokens.shift().value.length );
			}
	
			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];
	
				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {
	
						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}
	
						break;
					}
				}
			}
		}
	
		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};
	
	// One-time assignments
	
	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;
	
	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;
	
	// Initialize against the default document
	setDocument();
	
	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( el ) {
		// Should return 1, but returns 4 (following)
		return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
	});
	
	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( el ) {
		el.innerHTML = "<a href='#'></a>";
		return el.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}
	
	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( el ) {
		el.innerHTML = "<input/>";
		el.firstChild.setAttribute( "value", "" );
		return el.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}
	
	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( el ) {
		return el.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}
	
	return Sizzle;
	
	})( window );
	
	
	
	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	
	// Deprecated
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;
	jQuery.escapeSelector = Sizzle.escape;
	
	
	
	
	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;
	
		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};
	
	
	var siblings = function( n, elem ) {
		var matched = [];
	
		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}
	
		return matched;
	};
	
	
	var rneedsContext = jQuery.expr.match.needsContext;
	
	var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );
	
	
	
	var risSimple = /^.[^:#\[\.,]*$/;
	
	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				return !!qualifier.call( elem, i, elem ) !== not;
			} );
		}
	
		// Single element
		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );
		}
	
		// Arraylike of elements (jQuery, arguments, Array)
		if ( typeof qualifier !== "string" ) {
			return jQuery.grep( elements, function( elem ) {
				return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
			} );
		}
	
		// Simple selector that can be filtered directly, removing non-Elements
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}
	
		// Complex selector, compare the two sets, removing non-Elements
		qualifier = jQuery.filter( qualifier, elements );
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not && elem.nodeType === 1;
		} );
	}
	
	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];
	
		if ( not ) {
			expr = ":not(" + expr + ")";
		}
	
		if ( elems.length === 1 && elem.nodeType === 1 ) {
			return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
		}
	
		return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
	};
	
	jQuery.fn.extend( {
		find: function( selector ) {
			var i, ret,
				len = this.length,
				self = this;
	
			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}
	
			ret = this.pushStack( [] );
	
			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}
	
			return len > 1 ? jQuery.uniqueSort( ret ) : ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,
	
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );
	
	
	// Initialize a jQuery object
	
	
	// A central reference to the root jQuery(document)
	var rootjQuery,
	
		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		// Shortcut simple #id case for speed
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
	
		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;
	
			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}
	
			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;
	
			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {
	
					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];
	
				} else {
					match = rquickExpr.exec( selector );
				}
	
				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {
	
					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;
	
						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );
	
						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {
	
								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );
	
								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}
	
						return this;
	
					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );
	
						if ( elem ) {
	
							// Inject the element directly into the jQuery object
							this[ 0 ] = elem;
							this.length = 1;
						}
						return this;
					}
	
				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );
	
				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}
	
			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this[ 0 ] = selector;
				this.length = 1;
				return this;
	
			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :
	
					// Execute immediately if ready is not present
					selector( jQuery );
			}
	
			return jQuery.makeArray( selector, this );
		};
	
	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;
	
	// Initialize central reference
	rootjQuery = jQuery( document );
	
	
	var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	
		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};
	
	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;
	
			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},
	
		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				targets = typeof selectors !== "string" && jQuery( selectors );
	
			// Positional selectors never match, since there's no _selection_ context
			if ( !rneedsContext.test( selectors ) ) {
				for ( ; i < l; i++ ) {
					for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {
	
						// Always skip document fragments
						if ( cur.nodeType < 11 && ( targets ?
							targets.index( cur ) > -1 :
	
							// Don't pass non-elements to Sizzle
							cur.nodeType === 1 &&
								jQuery.find.matchesSelector( cur, selectors ) ) ) {
	
							matched.push( cur );
							break;
						}
					}
				}
			}
	
			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},
	
		// Determine the position of an element within the set
		index: function( elem ) {
	
			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}
	
			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}
	
			// Locate the position of the desired element
			return indexOf.call( this,
	
				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},
	
		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},
	
		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );
	
	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}
	
	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			return elem.contentDocument || jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );
	
			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}
	
			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}
	
			if ( this.length > 1 ) {
	
				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}
	
				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}
	
			return this.pushStack( matched );
		};
	} );
	var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );
	
	
	
	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}
	
	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {
	
		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );
	
		var // Flag to know if list is currently firing
			firing,
	
			// Last fire value for non-forgettable lists
			memory,
	
			// Flag to know if list was already fired
			fired,
	
			// Flag to prevent firing
			locked,
	
			// Actual callback list
			list = [],
	
			// Queue of execution data for repeatable lists
			queue = [],
	
			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,
	
			// Fire callbacks
			fire = function() {
	
				// Enforce single-firing
				locked = options.once;
	
				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {
	
						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {
	
							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}
	
				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}
	
				firing = false;
	
				// Clean up if we're done firing for good
				if ( locked ) {
	
					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];
	
					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},
	
			// Actual Callbacks object
			self = {
	
				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {
	
						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}
	
						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {
	
									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );
	
						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},
	
				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
	
							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},
	
				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},
	
				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},
	
				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},
	
				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory && !firing ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},
	
				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},
	
				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},
	
				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};
	
		return self;
	};
	
	
	function Identity( v ) {
		return v;
	}
	function Thrower( ex ) {
		throw ex;
	}
	
	function adoptValue( value, resolve, reject ) {
		var method;
	
		try {
	
			// Check for promise aspect first to privilege synchronous behavior
			if ( value && jQuery.isFunction( ( method = value.promise ) ) ) {
				method.call( value ).done( resolve ).fail( reject );
	
			// Other thenables
			} else if ( value && jQuery.isFunction( ( method = value.then ) ) ) {
				method.call( value, resolve, reject );
	
			// Other non-thenables
			} else {
	
				// Support: Android 4.0 only
				// Strict mode functions invoked without .call/.apply get global-object context
				resolve.call( undefined, value );
			}
	
		// For Promises/A+, convert exceptions into rejections
		// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
		// Deferred#then to conditionally suppress rejection.
		} catch ( value ) {
	
			// Support: Android 4.0 only
			// Strict mode functions invoked without .call/.apply get global-object context
			reject.call( undefined, value );
		}
	}
	
	jQuery.extend( {
	
		Deferred: function( func ) {
			var tuples = [
	
					// action, add listener, callbacks,
					// ... .then handlers, argument index, [final state]
					[ "notify", "progress", jQuery.Callbacks( "memory" ),
						jQuery.Callbacks( "memory" ), 2 ],
					[ "resolve", "done", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 0, "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 1, "rejected" ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					"catch": function( fn ) {
						return promise.then( null, fn );
					},
	
					// Keep pipe for back-compat
					pipe: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;
	
						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {
	
								// Map tuples (progress, done, fail) to arguments (done, fail, progress)
								var fn = jQuery.isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];
	
								// deferred.progress(function() { bind to newDefer or newDefer.notify })
								// deferred.done(function() { bind to newDefer or newDefer.resolve })
								// deferred.fail(function() { bind to newDefer or newDefer.reject })
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},
					then: function( onFulfilled, onRejected, onProgress ) {
						var maxDepth = 0;
						function resolve( depth, deferred, handler, special ) {
							return function() {
								var that = this,
									args = arguments,
									mightThrow = function() {
										var returned, then;
	
										// Support: Promises/A+ section 2.3.3.3.3
										// https://promisesaplus.com/#point-59
										// Ignore double-resolution attempts
										if ( depth < maxDepth ) {
											return;
										}
	
										returned = handler.apply( that, args );
	
										// Support: Promises/A+ section 2.3.1
										// https://promisesaplus.com/#point-48
										if ( returned === deferred.promise() ) {
											throw new TypeError( "Thenable self-resolution" );
										}
	
										// Support: Promises/A+ sections 2.3.3.1, 3.5
										// https://promisesaplus.com/#point-54
										// https://promisesaplus.com/#point-75
										// Retrieve `then` only once
										then = returned &&
	
											// Support: Promises/A+ section 2.3.4
											// https://promisesaplus.com/#point-64
											// Only check objects and functions for thenability
											( typeof returned === "object" ||
												typeof returned === "function" ) &&
											returned.then;
	
										// Handle a returned thenable
										if ( jQuery.isFunction( then ) ) {
	
											// Special processors (notify) just wait for resolution
											if ( special ) {
												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special )
												);
	
											// Normal processors (resolve) also hook into progress
											} else {
	
												// ...and disregard older resolution values
												maxDepth++;
	
												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special ),
													resolve( maxDepth, deferred, Identity,
														deferred.notifyWith )
												);
											}
	
										// Handle all other returned values
										} else {
	
											// Only substitute handlers pass on context
											// and multiple values (non-spec behavior)
											if ( handler !== Identity ) {
												that = undefined;
												args = [ returned ];
											}
	
											// Process the value(s)
											// Default process is resolve
											( special || deferred.resolveWith )( that, args );
										}
									},
	
									// Only normal processors (resolve) catch and reject exceptions
									process = special ?
										mightThrow :
										function() {
											try {
												mightThrow();
											} catch ( e ) {
	
												if ( jQuery.Deferred.exceptionHook ) {
													jQuery.Deferred.exceptionHook( e,
														process.stackTrace );
												}
	
												// Support: Promises/A+ section 2.3.3.3.4.1
												// https://promisesaplus.com/#point-61
												// Ignore post-resolution exceptions
												if ( depth + 1 >= maxDepth ) {
	
													// Only substitute handlers pass on context
													// and multiple values (non-spec behavior)
													if ( handler !== Thrower ) {
														that = undefined;
														args = [ e ];
													}
	
													deferred.rejectWith( that, args );
												}
											}
										};
	
								// Support: Promises/A+ section 2.3.3.3.1
								// https://promisesaplus.com/#point-57
								// Re-resolve promises immediately to dodge false rejection from
								// subsequent errors
								if ( depth ) {
									process();
								} else {
	
									// Call an optional hook to record the stack, in case of exception
									// since it's otherwise lost when execution goes async
									if ( jQuery.Deferred.getStackHook ) {
										process.stackTrace = jQuery.Deferred.getStackHook();
									}
									window.setTimeout( process );
								}
							};
						}
	
						return jQuery.Deferred( function( newDefer ) {
	
							// progress_handlers.add( ... )
							tuples[ 0 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									jQuery.isFunction( onProgress ) ?
										onProgress :
										Identity,
									newDefer.notifyWith
								)
							);
	
							// fulfilled_handlers.add( ... )
							tuples[ 1 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									jQuery.isFunction( onFulfilled ) ?
										onFulfilled :
										Identity
								)
							);
	
							// rejected_handlers.add( ... )
							tuples[ 2 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									jQuery.isFunction( onRejected ) ?
										onRejected :
										Thrower
								)
							);
						} ).promise();
					},
	
					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};
	
			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 5 ];
	
				// promise.progress = list.add
				// promise.done = list.add
				// promise.fail = list.add
				promise[ tuple[ 1 ] ] = list.add;
	
				// Handle state
				if ( stateString ) {
					list.add(
						function() {
	
							// state = "resolved" (i.e., fulfilled)
							// state = "rejected"
							state = stateString;
						},
	
						// rejected_callbacks.disable
						// fulfilled_callbacks.disable
						tuples[ 3 - i ][ 2 ].disable,
	
						// progress_callbacks.lock
						tuples[ 0 ][ 2 ].lock
					);
				}
	
				// progress_handlers.fire
				// fulfilled_handlers.fire
				// rejected_handlers.fire
				list.add( tuple[ 3 ].fire );
	
				// deferred.notify = function() { deferred.notifyWith(...) }
				// deferred.resolve = function() { deferred.resolveWith(...) }
				// deferred.reject = function() { deferred.rejectWith(...) }
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
					return this;
				};
	
				// deferred.notifyWith = list.fireWith
				// deferred.resolveWith = list.fireWith
				// deferred.rejectWith = list.fireWith
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );
	
			// Make the deferred a promise
			promise.promise( deferred );
	
			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}
	
			// All done!
			return deferred;
		},
	
		// Deferred helper
		when: function( singleValue ) {
			var
	
				// count of uncompleted subordinates
				remaining = arguments.length,
	
				// count of unprocessed arguments
				i = remaining,
	
				// subordinate fulfillment data
				resolveContexts = Array( i ),
				resolveValues = slice.call( arguments ),
	
				// the master Deferred
				master = jQuery.Deferred(),
	
				// subordinate callback factory
				updateFunc = function( i ) {
					return function( value ) {
						resolveContexts[ i ] = this;
						resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( !( --remaining ) ) {
							master.resolveWith( resolveContexts, resolveValues );
						}
					};
				};
	
			// Single- and empty arguments are adopted like Promise.resolve
			if ( remaining <= 1 ) {
				adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject );
	
				// Use .then() to unwrap secondary thenables (cf. gh-3000)
				if ( master.state() === "pending" ||
					jQuery.isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {
	
					return master.then();
				}
			}
	
			// Multiple arguments are aggregated like Promise.all array elements
			while ( i-- ) {
				adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
			}
	
			return master.promise();
		}
	} );
	
	
	// These usually indicate a programmer mistake during development,
	// warn about them ASAP rather than swallowing them by default.
	var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
	
	jQuery.Deferred.exceptionHook = function( error, stack ) {
	
		// Support: IE 8 - 9 only
		// Console exists when dev tools are open, which can happen at any time
		if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
			window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
		}
	};
	
	
	
	
	jQuery.readyException = function( error ) {
		window.setTimeout( function() {
			throw error;
		} );
	};
	
	
	
	
	// The deferred used on DOM ready
	var readyList = jQuery.Deferred();
	
	jQuery.fn.ready = function( fn ) {
	
		readyList
			.then( fn )
	
			// Wrap jQuery.readyException in a function so that the lookup
			// happens at the time of error handling instead of callback
			// registration.
			.catch( function( error ) {
				jQuery.readyException( error );
			} );
	
		return this;
	};
	
	jQuery.extend( {
	
		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,
	
		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,
	
		// Hold (or release) the ready event
		holdReady: function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		},
	
		// Handle when the DOM is ready
		ready: function( wait ) {
	
			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}
	
			// Remember that the DOM is ready
			jQuery.isReady = true;
	
			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}
	
			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );
		}
	} );
	
	jQuery.ready.then = readyList.then;
	
	// The ready event handler and self cleanup method
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}
	
	// Catch cases where $(document).ready() is called
	// after the browser event has already occurred.
	// Support: IE <=9 - 10 only
	// Older IE sometimes signals "interactive" too soon
	if ( document.readyState === "complete" ||
		( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {
	
		// Handle it asynchronously to allow scripts the opportunity to delay ready
		window.setTimeout( jQuery.ready );
	
	} else {
	
		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", completed );
	
		// A fallback to window.onload, that will always work
		window.addEventListener( "load", completed );
	}
	
	
	
	
	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;
	
		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}
	
		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;
	
			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}
	
			if ( bulk ) {
	
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;
	
				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}
	
			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}
	
		if ( chainable ) {
			return elems;
		}
	
		// Gets
		if ( bulk ) {
			return fn.call( elems );
		}
	
		return len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {
	
		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};
	
	
	
	
	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}
	
	Data.uid = 1;
	
	Data.prototype = {
	
		cache: function( owner ) {
	
			// Check if the owner object already has a cache
			var value = owner[ this.expando ];
	
			// If not, create one
			if ( !value ) {
				value = {};
	
				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {
	
					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;
	
					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}
	
			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );
	
			// Handle: [ owner, key, value ] args
			// Always use camelCase key (gh-2257)
			if ( typeof data === "string" ) {
				cache[ jQuery.camelCase( data ) ] = value;
	
			// Handle: [ owner, { properties } ] args
			} else {
	
				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ jQuery.camelCase( prop ) ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :
	
				// Always use camelCase key (gh-2257)
				owner[ this.expando ] && owner[ this.expando ][ jQuery.camelCase( key ) ];
		},
		access: function( owner, key, value ) {
	
			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {
	
				return this.get( owner, key );
			}
	
			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );
	
			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i,
				cache = owner[ this.expando ];
	
			if ( cache === undefined ) {
				return;
			}
	
			if ( key !== undefined ) {
	
				// Support array or space separated string of keys
				if ( jQuery.isArray( key ) ) {
	
					// If key is an array of keys...
					// We always set camelCase keys, so remove that.
					key = key.map( jQuery.camelCase );
				} else {
					key = jQuery.camelCase( key );
	
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					key = key in cache ?
						[ key ] :
						( key.match( rnothtmlwhite ) || [] );
				}
	
				i = key.length;
	
				while ( i-- ) {
					delete cache[ key[ i ] ];
				}
			}
	
			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {
	
				// Support: Chrome <=35 - 45
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();
	
	var dataUser = new Data();
	
	
	
	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014
	
	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;
	
	function getData( data ) {
		if ( data === "true" ) {
			return true;
		}
	
		if ( data === "false" ) {
			return false;
		}
	
		if ( data === "null" ) {
			return null;
		}
	
		// Only convert to a number if it doesn't change the string
		if ( data === +data + "" ) {
			return +data;
		}
	
		if ( rbrace.test( data ) ) {
			return JSON.parse( data );
		}
	
		return data;
	}
	
	function dataAttr( elem, key, data ) {
		var name;
	
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );
	
			if ( typeof data === "string" ) {
				try {
					data = getData( data );
				} catch ( e ) {}
	
				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}
	
	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},
	
		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},
	
		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},
	
		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},
	
		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );
	
	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;
	
			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );
	
					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {
	
							// Support: IE 11 only
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}
	
				return data;
			}
	
			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}
	
			return access( this, function( value ) {
				var data;
	
				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {
	
					// Attempt to get data from the cache
					// The key will always be camelCased in Data
					data = dataUser.get( elem, key );
					if ( data !== undefined ) {
						return data;
					}
	
					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, key );
					if ( data !== undefined ) {
						return data;
					}
	
					// We tried really hard, but the data doesn't exist.
					return;
				}
	
				// Set the data...
				this.each( function() {
	
					// We always store the camelCased key
					dataUser.set( this, key, value );
				} );
			}, null, value, arguments.length > 1, null, true );
		},
	
		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );
	
	
	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;
	
			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );
	
				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || jQuery.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},
	
		dequeue: function( elem, type ) {
			type = type || "fx";
	
			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};
	
			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}
	
			if ( fn ) {
	
				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}
	
				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}
	
			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},
	
		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );
	
	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;
	
			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}
	
			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}
	
			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );
	
					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );
	
					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},
	
		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};
	
			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";
	
			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;
	
	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );
	
	
	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];
	
	var isHiddenWithinTree = function( elem, el ) {
	
			// isHiddenWithinTree might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;
	
			// Inline style trumps all
			return elem.style.display === "none" ||
				elem.style.display === "" &&
	
				// Otherwise, check computed style
				// Support: Firefox <=43 - 45
				// Disconnected elements can have computed display: none, so first confirm that elem is
				// in the document.
				jQuery.contains( elem.ownerDocument, elem ) &&
	
				jQuery.css( elem, "display" ) === "none";
		};
	
	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};
	
		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}
	
		ret = callback.apply( elem, args || [] );
	
		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	
		return ret;
	};
	
	
	
	
	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() {
					return tween.cur();
				} :
				function() {
					return jQuery.css( elem, prop, "" );
				},
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),
	
			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );
	
		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {
	
			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];
	
			// Make sure we update the tween properties later on
			valueParts = valueParts || [];
	
			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;
	
			do {
	
				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";
	
				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );
	
			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}
	
		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;
	
			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}
	
	
	var defaultDisplayMap = {};
	
	function getDefaultDisplay( elem ) {
		var temp,
			doc = elem.ownerDocument,
			nodeName = elem.nodeName,
			display = defaultDisplayMap[ nodeName ];
	
		if ( display ) {
			return display;
		}
	
		temp = doc.body.appendChild( doc.createElement( nodeName ) );
		display = jQuery.css( temp, "display" );
	
		temp.parentNode.removeChild( temp );
	
		if ( display === "none" ) {
			display = "block";
		}
		defaultDisplayMap[ nodeName ] = display;
	
		return display;
	}
	
	function showHide( elements, show ) {
		var display, elem,
			values = [],
			index = 0,
			length = elements.length;
	
		// Determine new display value for elements that need to change
		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
	
			display = elem.style.display;
			if ( show ) {
	
				// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
				// check is required in this first loop unless we have a nonempty display value (either
				// inline or about-to-be-restored)
				if ( display === "none" ) {
					values[ index ] = dataPriv.get( elem, "display" ) || null;
					if ( !values[ index ] ) {
						elem.style.display = "";
					}
				}
				if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
					values[ index ] = getDefaultDisplay( elem );
				}
			} else {
				if ( display !== "none" ) {
					values[ index ] = "none";
	
					// Remember what we're overwriting
					dataPriv.set( elem, "display", display );
				}
			}
		}
	
		// Set the display of the elements in a second loop to avoid constant reflow
		for ( index = 0; index < length; index++ ) {
			if ( values[ index ] != null ) {
				elements[ index ].style.display = values[ index ];
			}
		}
	
		return elements;
	}
	
	jQuery.fn.extend( {
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}
	
			return this.each( function() {
				if ( isHiddenWithinTree( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );
	var rcheckableType = ( /^(?:checkbox|radio)$/i );
	
	var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );
	
	var rscriptType = ( /^$|\/(?:java|ecma)script/i );
	
	
	
	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {
	
		// Support: IE <=9 only
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
	
		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
	
		_default: [ 0, "", "" ]
	};
	
	// Support: IE <=9 only
	wrapMap.optgroup = wrapMap.option;
	
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;
	
	
	function getAll( context, tag ) {
	
		// Support: IE <=9 - 11 only
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret;
	
		if ( typeof context.getElementsByTagName !== "undefined" ) {
			ret = context.getElementsByTagName( tag || "*" );
	
		} else if ( typeof context.querySelectorAll !== "undefined" ) {
			ret = context.querySelectorAll( tag || "*" );
	
		} else {
			ret = [];
		}
	
		if ( tag === undefined || tag && jQuery.nodeName( context, tag ) ) {
			return jQuery.merge( [ context ], ret );
		}
	
		return ret;
	}
	
	
	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;
	
		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}
	
	
	var rhtml = /<|&#?\w+;/;
	
	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;
	
		for ( ; i < l; i++ ) {
			elem = elems[ i ];
	
			if ( elem || elem === 0 ) {
	
				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
	
					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );
	
				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );
	
				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );
	
					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];
	
					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}
	
					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );
	
					// Remember the top-level container
					tmp = fragment.firstChild;
	
					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}
	
		// Remove wrapper from fragment
		fragment.textContent = "";
	
		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {
	
			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}
	
			contains = jQuery.contains( elem.ownerDocument, elem );
	
			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );
	
			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}
	
			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}
	
		return fragment;
	}
	
	
	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );
	
		// Support: Android 4.0 - 4.3 only
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );
	
		div.appendChild( input );
	
		// Support: Android <=4.1 only
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;
	
		// Support: IE <=11 only
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();
	var documentElement = document.documentElement;
	
	
	
	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
	
	function returnTrue() {
		return true;
	}
	
	function returnFalse() {
		return false;
	}
	
	// Support: IE <=9 only
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}
	
	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;
	
		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
	
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
	
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}
	
		if ( data == null && fn == null ) {
	
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
	
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
	
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}
	
		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
	
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
	
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}
	
	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {
	
		global: {},
	
		add: function( elem, types, handler, data, selector ) {
	
			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );
	
			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}
	
			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}
	
			// Ensure that invalid selectors throw exceptions at attach time
			// Evaluate against documentElement in case elem is a non-element node (e.g., document)
			if ( selector ) {
				jQuery.find.matchesSelector( documentElement, selector );
			}
	
			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}
	
			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {
	
					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}
	
			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();
	
				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}
	
				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};
	
				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;
	
				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};
	
				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );
	
				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;
	
					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
	
						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}
	
				if ( special.add ) {
					special.add.call( elem, handleObj );
	
					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}
	
				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}
	
				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}
	
		},
	
		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {
	
			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );
	
			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}
	
			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();
	
				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}
	
				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );
	
				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];
	
					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );
	
						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}
	
				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
	
						jQuery.removeEvent( elem, type, elemData.handle );
					}
	
					delete events[ type ];
				}
			}
	
			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},
	
		dispatch: function( nativeEvent ) {
	
			// Make a writable jQuery.Event from the native event object
			var event = jQuery.event.fix( nativeEvent );
	
			var i, j, ret, matched, handleObj, handlerQueue,
				args = new Array( arguments.length ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};
	
			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;
	
			for ( i = 1; i < arguments.length; i++ ) {
				args[ i ] = arguments[ i ];
			}
	
			event.delegateTarget = this;
	
			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}
	
			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );
	
			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;
	
				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {
	
					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {
	
						event.handleObj = handleObj;
						event.data = handleObj.data;
	
						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );
	
						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}
	
			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}
	
			return event.result;
		},
	
		handlers: function( event, handlers ) {
			var i, handleObj, sel, matchedHandlers, matchedSelectors,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;
	
			// Find delegate handlers
			if ( delegateCount &&
	
				// Support: IE <=9
				// Black-hole SVG <use> instance trees (trac-13180)
				cur.nodeType &&
	
				// Support: Firefox <=42
				// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
				// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
				// Support: IE 11 only
				// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
				!( event.type === "click" && event.button >= 1 ) ) {
	
				for ( ; cur !== this; cur = cur.parentNode || this ) {
	
					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
						matchedHandlers = [];
						matchedSelectors = {};
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];
	
							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";
	
							if ( matchedSelectors[ sel ] === undefined ) {
								matchedSelectors[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matchedSelectors[ sel ] ) {
								matchedHandlers.push( handleObj );
							}
						}
						if ( matchedHandlers.length ) {
							handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
						}
					}
				}
			}
	
			// Add the remaining (directly-bound) handlers
			cur = this;
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
			}
	
			return handlerQueue;
		},
	
		addProp: function( name, hook ) {
			Object.defineProperty( jQuery.Event.prototype, name, {
				enumerable: true,
				configurable: true,
	
				get: jQuery.isFunction( hook ) ?
					function() {
						if ( this.originalEvent ) {
								return hook( this.originalEvent );
						}
					} :
					function() {
						if ( this.originalEvent ) {
								return this.originalEvent[ name ];
						}
					},
	
				set: function( value ) {
					Object.defineProperty( this, name, {
						enumerable: true,
						configurable: true,
						writable: true,
						value: value
					} );
				}
			} );
		},
	
		fix: function( originalEvent ) {
			return originalEvent[ jQuery.expando ] ?
				originalEvent :
				new jQuery.Event( originalEvent );
		},
	
		special: {
			load: {
	
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
	
				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
	
				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},
	
				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},
	
			beforeunload: {
				postDispatch: function( event ) {
	
					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};
	
	jQuery.removeEvent = function( elem, type, handle ) {
	
		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};
	
	jQuery.Event = function( src, props ) {
	
		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}
	
		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;
	
			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&
	
					// Support: Android <=2.3 only
					src.returnValue === false ?
				returnTrue :
				returnFalse;
	
			// Create target properties
			// Support: Safari <=6 - 7 only
			// Target should not be a text node (#504, #13143)
			this.target = ( src.target && src.target.nodeType === 3 ) ?
				src.target.parentNode :
				src.target;
	
			this.currentTarget = src.currentTarget;
			this.relatedTarget = src.relatedTarget;
	
		// Event type
		} else {
			this.type = src;
		}
	
		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}
	
		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();
	
		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};
	
	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
		isSimulated: false,
	
		preventDefault: function() {
			var e = this.originalEvent;
	
			this.isDefaultPrevented = returnTrue;
	
			if ( e && !this.isSimulated ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;
	
			this.isPropagationStopped = returnTrue;
	
			if ( e && !this.isSimulated ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;
	
			this.isImmediatePropagationStopped = returnTrue;
	
			if ( e && !this.isSimulated ) {
				e.stopImmediatePropagation();
			}
	
			this.stopPropagation();
		}
	};
	
	// Includes all common event props including KeyEvent and MouseEvent specific props
	jQuery.each( {
		altKey: true,
		bubbles: true,
		cancelable: true,
		changedTouches: true,
		ctrlKey: true,
		detail: true,
		eventPhase: true,
		metaKey: true,
		pageX: true,
		pageY: true,
		shiftKey: true,
		view: true,
		"char": true,
		charCode: true,
		key: true,
		keyCode: true,
		button: true,
		buttons: true,
		clientX: true,
		clientY: true,
		offsetX: true,
		offsetY: true,
		pointerId: true,
		pointerType: true,
		screenX: true,
		screenY: true,
		targetTouches: true,
		toElement: true,
		touches: true,
	
		which: function( event ) {
			var button = event.button;
	
			// Add which for key events
			if ( event.which == null && rkeyEvent.test( event.type ) ) {
				return event.charCode != null ? event.charCode : event.keyCode;
			}
	
			// Add which for click: 1 === left; 2 === middle; 3 === right
			if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
				if ( button & 1 ) {
					return 1;
				}
	
				if ( button & 2 ) {
					return 3;
				}
	
				if ( button & 4 ) {
					return 2;
				}
	
				return 0;
			}
	
			return event.which;
		}
	}, jQuery.event.addProp );
	
	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,
	
			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;
	
				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );
	
	jQuery.fn.extend( {
	
		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {
	
				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {
	
				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {
	
				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );
	
	
	var
	
		/* eslint-disable max-len */
	
		// See https://github.com/eslint/eslint/issues/3229
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,
	
		/* eslint-enable */
	
		// Support: IE <=10 - 11, Edge 12 - 13
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,
	
		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
	
	function manipulationTarget( elem, content ) {
		if ( jQuery.nodeName( elem, "table" ) &&
			jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {
	
			return elem.getElementsByTagName( "tbody" )[ 0 ] || elem;
		}
	
		return elem;
	}
	
	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );
	
		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}
	
		return elem;
	}
	
	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;
	
		if ( dest.nodeType !== 1 ) {
			return;
		}
	
		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;
	
			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};
	
				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}
	
		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );
	
			dataUser.set( dest, udataCur );
		}
	}
	
	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();
	
		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;
	
		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}
	
	function domManip( collection, args, callback, ignored ) {
	
		// Flatten any nested arrays
		args = concat.apply( [], args );
	
		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );
	
		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}
	
		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;
	
			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}
	
			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;
	
				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;
	
					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );
	
						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
	
							// Support: Android <=4.0 only, PhantomJS 1 only
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}
	
					callback.call( collection[ i ], node, i );
				}
	
				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;
	
					// Reenable scripts
					jQuery.map( scripts, restoreScript );
	
					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {
	
							if ( node.src ) {
	
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								DOMEval( node.textContent.replace( rcleanScript, "" ), doc );
							}
						}
					}
				}
			}
		}
	
		return collection;
	}
	
	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;
	
		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}
	
			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}
	
		return elem;
	}
	
	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},
	
		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );
	
			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {
	
				// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );
	
				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}
	
			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );
	
					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}
	
			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}
	
			// Return the cloned set
			return clone;
		},
	
		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;
	
			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );
	
								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}
	
						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {
	
						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );
	
	jQuery.fn.extend( {
		detach: function( selector ) {
			return remove( this, selector, true );
		},
	
		remove: function( selector ) {
			return remove( this, selector );
		},
	
		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},
	
		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},
	
		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},
	
		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},
	
		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},
	
		empty: function() {
			var elem,
				i = 0;
	
			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {
	
					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );
	
					// Remove any remaining nodes
					elem.textContent = "";
				}
			}
	
			return this;
		},
	
		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
	
			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},
	
		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;
	
				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}
	
				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {
	
					value = jQuery.htmlPrefilter( value );
	
					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};
	
							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}
	
						elem = 0;
	
					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}
	
				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},
	
		replaceWith: function() {
			var ignored = [];
	
			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;
	
				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}
	
			// Force callback invocation
			}, ignored );
		}
	} );
	
	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;
	
			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );
	
				// Support: Android <=4.0 only, PhantomJS 1 only
				// .get() because push.apply(_, arraylike) throws on ancient WebKit
				push.apply( ret, elems.get() );
			}
	
			return this.pushStack( ret );
		};
	} );
	var rmargin = ( /^margin/ );
	
	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );
	
	var getStyles = function( elem ) {
	
			// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;
	
			if ( !view || !view.opener ) {
				view = window;
			}
	
			return view.getComputedStyle( elem );
		};
	
	
	
	( function() {
	
		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {
	
			// This is a singleton, we need to execute it only once
			if ( !div ) {
				return;
			}
	
			div.style.cssText =
				"box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );
	
			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";
	
			// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";
	
			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";
	
			documentElement.removeChild( container );
	
			// Nullify the div so it wouldn't be stored in the memory and
			// it will also be a sign that checks already performed
			div = null;
		}
	
		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );
	
		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}
	
		// Support: IE <=9 - 11 only
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";
	
		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );
	
		jQuery.extend( support, {
			pixelPosition: function() {
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				computeStyleTests();
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {
				computeStyleTests();
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {
				computeStyleTests();
				return reliableMarginLeftVal;
			}
		} );
	} )();
	
	
	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;
	
		computed = computed || getStyles( elem );
	
		// Support: IE <=9 only
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {
			ret = computed.getPropertyValue( name ) || computed[ name ];
	
			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}
	
			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// https://drafts.csswg.org/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {
	
				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;
	
				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;
	
				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}
	
		return ret !== undefined ?
	
			// Support: IE <=9 - 11 only
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}
	
	
	function addGetHookIf( conditionFn, hookFn ) {
	
		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {
	
					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}
	
				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}
	
	
	var
	
		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},
	
		cssPrefixes = [ "Webkit", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;
	
	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {
	
		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}
	
		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;
	
		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}
	
	function setPositiveNumber( elem, value, subtract ) {
	
		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?
	
			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}
	
	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i,
			val = 0;
	
		// If we already have the right measurement, avoid augmentation
		if ( extra === ( isBorderBox ? "border" : "content" ) ) {
			i = 4;
	
		// Otherwise initialize for horizontal or vertical properties
		} else {
			i = name === "width" ? 1 : 0;
		}
	
		for ( ; i < 4; i += 2 ) {
	
			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}
	
			if ( isBorderBox ) {
	
				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}
	
				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {
	
				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
	
				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}
	
		return val;
	}
	
	function getWidthOrHeight( elem, name, extra ) {
	
		// Start with offset property, which is equivalent to the border-box value
		var val,
			valueIsBorderBox = true,
			styles = getStyles( elem ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";
	
		// Support: IE <=11 only
		// Running getBoundingClientRect on a disconnected node
		// in IE throws an error.
		if ( elem.getClientRects().length ) {
			val = elem.getBoundingClientRect()[ name ];
		}
	
		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if ( val <= 0 || val == null ) {
	
			// Fall back to computed then uncomputed css if necessary
			val = curCSS( elem, name, styles );
			if ( val < 0 || val == null ) {
				val = elem.style[ name ];
			}
	
			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}
	
			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );
	
			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}
	
		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}
	
	jQuery.extend( {
	
		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {
	
						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},
	
		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},
	
		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},
	
		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {
	
			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}
	
			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				style = elem.style;
	
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );
	
			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
	
			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;
	
				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );
	
					// Fixes bug #9237
					type = "number";
				}
	
				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}
	
				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}
	
				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}
	
				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {
	
					style[ name ] = value;
				}
	
			} else {
	
				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {
	
					return ret;
				}
	
				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},
	
		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name );
	
			// Make sure that we're working with the right name
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );
	
			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
	
			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}
	
			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}
	
			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}
	
			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}
			return val;
		}
	} );
	
	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {
	
					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
	
						// Support: Safari 8+
						// Table columns in Safari have non-zero offsetWidth & zero
						// getBoundingClientRect().width unless display is changed.
						// Support: IE <=11 only
						// Running getBoundingClientRect on a disconnected node
						// in IE throws an error.
						( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},
	
			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);
	
				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {
	
					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}
	
				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );
	
	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);
	
	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},
	
					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];
	
				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}
	
				return expanded;
			}
		};
	
		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );
	
	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;
	
				if ( jQuery.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;
	
					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}
	
					return map;
				}
	
				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		}
	} );
	
	
	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;
	
	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];
	
			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];
	
			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;
	
			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}
	
			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};
	
	Tween.prototype.init.prototype = Tween.prototype;
	
	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;
	
				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}
	
				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );
	
				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {
	
				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};
	
	// Support: IE <=9 only
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};
	
	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};
	
	jQuery.fx = Tween.prototype.init;
	
	// Back compat <1.8 extension point
	jQuery.fx.step = {};
	
	
	
	
	var
		fxNow, timerId,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;
	
	function raf() {
		if ( timerId ) {
			window.requestAnimationFrame( raf );
			jQuery.fx.tick();
		}
	}
	
	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}
	
	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };
	
		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}
	
		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}
	
		return attrs;
	}
	
	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {
	
				// We're done with this property
				return tween;
			}
		}
	}
	
	function defaultPrefilter( elem, props, opts ) {
		var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
			isBox = "width" in props || "height" in props,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHiddenWithinTree( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );
	
		// Queue-skipping animations hijack the fx hooks
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;
	
			anim.always( function() {
	
				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}
	
		// Detect show/hide animations
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.test( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {
	
					// Pretend to be hidden if this is a "show" and
					// there is still data from a stopped show/hide
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;
	
					// Ignore all other no-op show/hide data
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
			}
		}
	
		// Bail out if this is a no-op like .hide().hide()
		propTween = !jQuery.isEmptyObject( props );
		if ( !propTween && jQuery.isEmptyObject( orig ) ) {
			return;
		}
	
		// Restrict "overflow" and "display" styles during box animations
		if ( isBox && elem.nodeType === 1 ) {
	
			// Support: IE <=9 - 11, Edge 12 - 13
			// Record all 3 overflow attributes because IE does not infer the shorthand
			// from identically-valued overflowX and overflowY
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];
	
			// Identify a display type, preferring old show/hide data over the CSS cascade
			restoreDisplay = dataShow && dataShow.display;
			if ( restoreDisplay == null ) {
				restoreDisplay = dataPriv.get( elem, "display" );
			}
			display = jQuery.css( elem, "display" );
			if ( display === "none" ) {
				if ( restoreDisplay ) {
					display = restoreDisplay;
				} else {
	
					// Get nonempty value(s) by temporarily forcing visibility
					showHide( [ elem ], true );
					restoreDisplay = elem.style.display || restoreDisplay;
					display = jQuery.css( elem, "display" );
					showHide( [ elem ] );
				}
			}
	
			// Animate inline elements as inline-block
			if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
				if ( jQuery.css( elem, "float" ) === "none" ) {
	
					// Restore the original display value at the end of pure show/hide animations
					if ( !propTween ) {
						anim.done( function() {
							style.display = restoreDisplay;
						} );
						if ( restoreDisplay == null ) {
							display = style.display;
							restoreDisplay = display === "none" ? "" : display;
						}
					}
					style.display = "inline-block";
				}
			}
		}
	
		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	
		// Implement show/hide animations
		propTween = false;
		for ( prop in orig ) {
	
			// General show/hide setup for this element animation
			if ( !propTween ) {
				if ( dataShow ) {
					if ( "hidden" in dataShow ) {
						hidden = dataShow.hidden;
					}
				} else {
					dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
				}
	
				// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
				if ( toggle ) {
					dataShow.hidden = !hidden;
				}
	
				// Show elements before animating them
				if ( hidden ) {
					showHide( [ elem ], true );
				}
	
				/* eslint-disable no-loop-func */
	
				anim.done( function() {
	
				/* eslint-enable no-loop-func */
	
					// The final step of a "hide" animation is actually hiding the element
					if ( !hidden ) {
						showHide( [ elem ] );
					}
					dataPriv.remove( elem, "fxshow" );
					for ( prop in orig ) {
						jQuery.style( elem, prop, orig[ prop ] );
					}
				} );
			}
	
			// Per-property setup
			propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = propTween.start;
				if ( hidden ) {
					propTween.end = propTween.start;
					propTween.start = 0;
				}
			}
		}
	}
	
	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;
	
		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( jQuery.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}
	
			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}
	
			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];
	
				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}
	
	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {
	
				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
	
					// Support: Android 2.3 only
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;
	
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( percent );
				}
	
				deferred.notifyWith( elem, [ animation, percent, remaining ] );
	
				if ( percent < 1 && length ) {
					return remaining;
				} else {
					deferred.resolveWith( elem, [ animation ] );
					return false;
				}
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,
	
						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length; index++ ) {
						animation.tweens[ index ].run( 1 );
					}
	
					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;
	
		propFilter( props, animation.opts.specialEasing );
	
		for ( ; index < length; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}
	
		jQuery.map( props, createTween, animation );
	
		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}
	
		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);
	
		// attach callbacks from options
		return animation.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );
	}
	
	jQuery.Animation = jQuery.extend( Animation, {
	
		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},
	
		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnothtmlwhite );
			}
	
			var prop,
				index = 0,
				length = props.length;
	
			for ( ; index < length; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},
	
		prefilters: [ defaultPrefilter ],
	
		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );
	
	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};
	
		// Go to the end state if fx are off or if document is hidden
		if ( jQuery.fx.off || document.hidden ) {
			opt.duration = 0;
	
		} else {
			if ( typeof opt.duration !== "number" ) {
				if ( opt.duration in jQuery.fx.speeds ) {
					opt.duration = jQuery.fx.speeds[ opt.duration ];
	
				} else {
					opt.duration = jQuery.fx.speeds._default;
				}
			}
		}
	
		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}
	
		// Queueing
		opt.old = opt.complete;
	
		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}
	
			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};
	
		return opt;
	};
	
	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {
	
			// Show any hidden elements after setting opacity to 0
			return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()
	
				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {
	
					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );
	
					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;
	
			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};
	
			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}
	
			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );
	
				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}
	
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {
	
						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}
	
				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;
	
				// Enable finishing flag on private data
				data.finish = true;
	
				// Empty the queue first
				jQuery.queue( this, type, [] );
	
				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}
	
				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}
	
				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}
	
				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );
	
	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );
	
	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );
	
	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;
	
		fxNow = jQuery.now();
	
		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
	
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}
	
		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};
	
	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		if ( timer() ) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};
	
	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( !timerId ) {
			timerId = window.requestAnimationFrame ?
				window.requestAnimationFrame( raf ) :
				window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
		}
	};
	
	jQuery.fx.stop = function() {
		if ( window.cancelAnimationFrame ) {
			window.cancelAnimationFrame( timerId );
		} else {
			window.clearInterval( timerId );
		}
	
		timerId = null;
	};
	
	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,
	
		// Default speed
		_default: 400
	};
	
	
	// Based off of the plugin by Clint Helfers, with permission.
	// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";
	
		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};
	
	
	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );
	
		input.type = "checkbox";
	
		// Support: Android <=4.3 only
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";
	
		// Support: IE <=11 only
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;
	
		// Support: IE <=11 only
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();
	
	
	var boolHook,
		attrHandle = jQuery.expr.attrHandle;
	
	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},
	
		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );
	
	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;
	
			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	
			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}
	
			// Attribute hooks are determined by the lowercase version
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}
	
			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}
	
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}
	
				elem.setAttribute( name, value + "" );
				return value;
			}
	
			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}
	
			ret = jQuery.find.attr( elem, name );
	
			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},
	
		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						jQuery.nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},
	
		removeAttr: function( elem, value ) {
			var name,
				i = 0,
	
				// Attribute names can contain non-HTML whitespace characters
				// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
				attrNames = value && value.match( rnothtmlwhite );
	
			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					elem.removeAttribute( name );
				}
			}
		}
	} );
	
	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {
	
				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};
	
	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;
	
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle,
				lowercaseName = name.toLowerCase();
	
			if ( !isXML ) {
	
				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ lowercaseName ];
				attrHandle[ lowercaseName ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					lowercaseName :
					null;
				attrHandle[ lowercaseName ] = handle;
			}
			return ret;
		};
	} );
	
	
	
	
	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;
	
	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},
	
		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );
	
	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;
	
			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
	
				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}
	
			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}
	
				return ( elem[ name ] = value );
			}
	
			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}
	
			return elem[ name ];
		},
	
		propHooks: {
			tabIndex: {
				get: function( elem ) {
	
					// Support: IE <=9 - 11 only
					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );
	
					if ( tabindex ) {
						return parseInt( tabindex, 10 );
					}
	
					if (
						rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) &&
						elem.href
					) {
						return 0;
					}
	
					return -1;
				}
			}
		},
	
		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );
	
	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	// eslint rule "no-unused-expressions" is disabled for this code
	// since it considers such accessions noop
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {
	
				/* eslint no-unused-expressions: "off" */
	
				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {
	
				/* eslint no-unused-expressions: "off" */
	
				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;
	
					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}
	
	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );
	
	
	
	
		// Strip and collapse whitespace according to HTML spec
		// https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
		function stripAndCollapse( value ) {
			var tokens = value.match( rnothtmlwhite ) || [];
			return tokens.join( " " );
		}
	
	
	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}
	
	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}
	
			if ( typeof value === "string" && value ) {
				classes = value.match( rnothtmlwhite ) || [];
	
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );
	
					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}
	
						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}
	
			return this;
		},
	
		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}
	
			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}
	
			if ( typeof value === "string" && value ) {
				classes = value.match( rnothtmlwhite ) || [];
	
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
	
					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );
	
					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
	
							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}
	
						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}
	
			return this;
		},
	
		toggleClass: function( value, stateVal ) {
			var type = typeof value;
	
			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}
	
			return this.each( function() {
				var className, i, self, classNames;
	
				if ( type === "string" ) {
	
					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnothtmlwhite ) || [];
	
					while ( ( className = classNames[ i++ ] ) ) {
	
						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}
	
				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {
	
						// Store className if set
						dataPriv.set( this, "__className__", className );
					}
	
					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},
	
		hasClass: function( selector ) {
			var className, elem,
				i = 0;
	
			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
						return true;
				}
			}
	
			return false;
		}
	} );
	
	
	
	
	var rreturn = /\r/g;
	
	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];
	
			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];
	
					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}
	
					ret = elem.value;
	
					// Handle most common string cases
					if ( typeof ret === "string" ) {
						return ret.replace( rreturn, "" );
					}
	
					// Handle cases where value is null/undef or number
					return ret == null ? "" : ret;
				}
	
				return;
			}
	
			isFunction = jQuery.isFunction( value );
	
			return this.each( function( i ) {
				var val;
	
				if ( this.nodeType !== 1 ) {
					return;
				}
	
				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}
	
				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";
	
				} else if ( typeof val === "number" ) {
					val += "";
	
				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}
	
				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];
	
				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );
	
	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {
	
					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :
	
						// Support: IE <=10 - 11 only
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						stripAndCollapse( jQuery.text( elem ) );
				}
			},
			select: {
				get: function( elem ) {
					var value, option, i,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one",
						values = one ? null : [],
						max = one ? index + 1 : options.length;
	
					if ( index < 0 ) {
						i = max;
	
					} else {
						i = one ? index : 0;
					}
	
					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];
	
						// Support: IE <=9 only
						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&
	
								// Don't return options that are disabled or in a disabled optgroup
								!option.disabled &&
								( !option.parentNode.disabled ||
									!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {
	
							// Get the specific value for the option
							value = jQuery( option ).val();
	
							// We don't need an array for one selects
							if ( one ) {
								return value;
							}
	
							// Multi-Selects return an array
							values.push( value );
						}
					}
	
					return values;
				},
	
				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;
	
					while ( i-- ) {
						option = options[ i ];
	
						/* eslint-disable no-cond-assign */
	
						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}
	
						/* eslint-enable no-cond-assign */
					}
	
					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );
	
	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );
	
	
	
	
	// Return jQuery for attributes-only inclusion
	
	
	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;
	
	jQuery.extend( jQuery.event, {
	
		trigger: function( event, data, elem, onlyHandlers ) {
	
			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];
	
			cur = tmp = elem = elem || document;
	
			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}
	
			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}
	
			if ( type.indexOf( "." ) > -1 ) {
	
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;
	
			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );
	
			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;
	
			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}
	
			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );
	
			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}
	
			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {
	
				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}
	
				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}
	
			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
	
				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;
	
				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}
	
				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;
	
			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {
	
				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {
	
					// Call a native DOM method on the target with the same name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {
	
						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];
	
						if ( tmp ) {
							elem[ ontype ] = null;
						}
	
						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;
	
						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}
	
			return event.result;
		},
	
		// Piggyback on a donor event to simulate a different one
		// Used only for `focus(in | out)` events
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true
				}
			);
	
			jQuery.event.trigger( e, null, elem );
		}
	
	} );
	
	jQuery.fn.extend( {
	
		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );
	
	
	jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup contextmenu" ).split( " " ),
		function( i, name ) {
	
		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );
	
	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );
	
	
	
	
	support.focusin = "onfocusin" in window;
	
	
	// Support: Firefox <=44
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {
	
			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};
	
			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );
	
					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;
	
					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );
	
					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;
	
	var nonce = jQuery.now();
	
	var rquery = ( /\?/ );
	
	
	
	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
	
		// Support: IE 9 - 11 only
		// IE throws on parseFromString with invalid input.
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}
	
		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};
	
	
	var
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;
	
	function buildParams( prefix, obj, traditional, add ) {
		var name;
	
		if ( jQuery.isArray( obj ) ) {
	
			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {
	
					// Treat each array item as a scalar.
					add( prefix, v );
	
				} else {
	
					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );
	
		} else if ( !traditional && jQuery.type( obj ) === "object" ) {
	
			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}
	
		} else {
	
			// Serialize scalar item.
			add( prefix, obj );
		}
	}
	
	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, valueOrFunction ) {
	
				// If value is a function, invoke it and use its return value
				var value = jQuery.isFunction( valueOrFunction ) ?
					valueOrFunction() :
					valueOrFunction;
	
				s[ s.length ] = encodeURIComponent( key ) + "=" +
					encodeURIComponent( value == null ? "" : value );
			};
	
		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
	
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );
	
		} else {
	
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}
	
		// Return the resulting serialization
		return s.join( "&" );
	};
	
	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {
	
				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;
	
				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();
	
				if ( val == null ) {
					return null;
				}
	
				if ( jQuery.isArray( val ) ) {
					return jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} );
				}
	
				return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );
	
	
	var
		r20 = /%20/g,
		rhash = /#.*$/,
		rantiCache = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	
		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,
	
		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},
	
		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},
	
		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),
	
		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;
	
	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {
	
		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {
	
			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}
	
			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];
	
			if ( jQuery.isFunction( func ) ) {
	
				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {
	
					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );
	
					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}
	
	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {
	
		var inspected = {},
			seekingTransport = ( structure === transports );
	
		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {
	
					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}
	
		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}
	
	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};
	
		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}
	
		return target;
	}
	
	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {
	
		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;
	
		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}
	
		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}
	
		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {
	
			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}
	
			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}
	
		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}
	
	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},
	
			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();
	
		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}
	
		current = dataTypes.shift();
	
		// Convert to each sequential dataType
		while ( current ) {
	
			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}
	
			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}
	
			prev = current;
			current = dataTypes.shift();
	
			if ( current ) {
	
				// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {
	
					current = prev;
	
				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {
	
					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];
	
					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {
	
							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {
	
								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {
	
									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];
	
									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}
	
					// Apply converter (if not an equivalence)
					if ( conv !== true ) {
	
						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}
	
		return { state: "success", data: response };
	}
	
	jQuery.extend( {
	
		// Counter for holding the number of active queries
		active: 0,
	
		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},
	
		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/
	
			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},
	
			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},
	
			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},
	
			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {
	
				// Convert anything to text
				"* text": String,
	
				// Text to html (true = no transformation)
				"text html": true,
	
				// Evaluate text as a json expression
				"text json": JSON.parse,
	
				// Parse text as xml
				"text xml": jQuery.parseXML
			},
	
			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},
	
		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?
	
				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :
	
				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},
	
		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),
	
		// Main method
		ajax: function( url, options ) {
	
			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}
	
			// Force options to be an object
			options = options || {};
	
			var transport,
	
				// URL without anti-cache param
				cacheURL,
	
				// Response headers
				responseHeadersString,
				responseHeaders,
	
				// timeout handle
				timeoutTimer,
	
				// Url cleanup var
				urlAnchor,
	
				// Request state (becomes false upon send and true upon completion)
				completed,
	
				// To know if global events are to be dispatched
				fireGlobals,
	
				// Loop variable
				i,
	
				// uncached part of the url
				uncached,
	
				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),
	
				// Callbacks context
				callbackContext = s.context || s,
	
				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,
	
				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),
	
				// Status-dependent callbacks
				statusCode = s.statusCode || {},
	
				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},
	
				// Default abort message
				strAbort = "canceled",
	
				// Fake xhr
				jqXHR = {
					readyState: 0,
	
					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( completed ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},
	
					// Raw string
					getAllResponseHeaders: function() {
						return completed ? responseHeadersString : null;
					},
	
					// Caches the header
					setRequestHeader: function( name, value ) {
						if ( completed == null ) {
							name = requestHeadersNames[ name.toLowerCase() ] =
								requestHeadersNames[ name.toLowerCase() ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},
	
					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( completed == null ) {
							s.mimeType = type;
						}
						return this;
					},
	
					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( completed ) {
	
								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							} else {
	
								// Lazy-add the new callbacks in a way that preserves old ones
								for ( code in map ) {
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							}
						}
						return this;
					},
	
					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};
	
			// Attach deferreds
			deferred.promise( jqXHR );
	
			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" )
				.replace( rprotocol, location.protocol + "//" );
	
			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;
	
			// Extract dataTypes list
			s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];
	
			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );
	
				// Support: IE <=8 - 11, Edge 12 - 13
				// IE throws exception on accessing the href property if url is malformed,
				// e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;
	
					// Support: IE <=8 - 11 only
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {
	
					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}
	
			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}
	
			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );
	
			// If request was aborted inside a prefilter, stop there
			if ( completed ) {
				return jqXHR;
			}
	
			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;
	
			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}
	
			// Uppercase the type
			s.type = s.type.toUpperCase();
	
			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );
	
			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			// Remove hash to simplify url manipulation
			cacheURL = s.url.replace( rhash, "" );
	
			// More options handling for requests with no content
			if ( !s.hasContent ) {
	
				// Remember the hash so we can put it back
				uncached = s.url.slice( cacheURL.length );
	
				// If data is available, append data to url
				if ( s.data ) {
					cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;
	
					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}
	
				// Add or update anti-cache param if needed
				if ( s.cache === false ) {
					cacheURL = cacheURL.replace( rantiCache, "$1" );
					uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
				}
	
				// Put hash and anti-cache on the URL that will be requested (gh-1732)
				s.url = cacheURL + uncached;
	
			// Change '%20' to '+' if this is encoded form body content (gh-2658)
			} else if ( s.data && s.processData &&
				( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
				s.data = s.data.replace( r20, "+" );
			}
	
			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}
	
			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}
	
			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);
	
			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}
	
			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {
	
				// Abort if not done already and return
				return jqXHR.abort();
			}
	
			// Aborting is no longer a cancellation
			strAbort = "abort";
	
			// Install callbacks on deferreds
			completeDeferred.add( s.complete );
			jqXHR.done( s.success );
			jqXHR.fail( s.error );
	
			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );
	
			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;
	
				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}
	
				// If request was aborted inside ajaxSend, stop there
				if ( completed ) {
					return jqXHR;
				}
	
				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}
	
				try {
					completed = false;
					transport.send( requestHeaders, done );
				} catch ( e ) {
	
					// Rethrow post-completion exceptions
					if ( completed ) {
						throw e;
					}
	
					// Propagate others as results
					done( -1, e );
				}
			}
	
			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;
	
				// Ignore repeat invocations
				if ( completed ) {
					return;
				}
	
				completed = true;
	
				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}
	
				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;
	
				// Cache response headers
				responseHeadersString = headers || "";
	
				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;
	
				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;
	
				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}
	
				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );
	
				// If successful, handle type chaining
				if ( isSuccess ) {
	
					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}
	
					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";
	
					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";
	
					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {
	
					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}
	
				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";
	
				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}
	
				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;
	
				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}
	
				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );
	
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
	
					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}
	
			return jqXHR;
		},
	
		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},
	
		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );
	
	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {
	
			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}
	
			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );
	
	
	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,
	
			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			cache: true,
			async: false,
			global: false,
			"throws": true
		} );
	};
	
	
	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;
	
			if ( this[ 0 ] ) {
				if ( jQuery.isFunction( html ) ) {
					html = html.call( this[ 0 ] );
				}
	
				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );
	
				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}
	
				wrap.map( function() {
					var elem = this;
	
					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}
	
					return elem;
				} ).append( this );
			}
	
			return this;
		},
	
		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}
	
			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();
	
				if ( contents.length ) {
					contents.wrapAll( html );
	
				} else {
					self.append( html );
				}
			} );
		},
	
		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );
	
			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},
	
		unwrap: function( selector ) {
			this.parent( selector ).not( "body" ).each( function() {
				jQuery( this ).replaceWith( this.childNodes );
			} );
			return this;
		}
	} );
	
	
	jQuery.expr.pseudos.hidden = function( elem ) {
		return !jQuery.expr.pseudos.visible( elem );
	};
	jQuery.expr.pseudos.visible = function( elem ) {
		return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
	};
	
	
	
	
	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};
	
	var xhrSuccessStatus = {
	
			// File protocol always yields status code 0, assume 200
			0: 200,
	
			// Support: IE <=9 only
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();
	
	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;
	
	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;
	
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();
	
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);
	
					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}
	
					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}
	
					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}
	
					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}
	
					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;
	
								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {
	
									// Support: IE <=9 only
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(
	
											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,
	
										// Support: IE <=9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};
	
					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );
	
					// Support: IE 9 only
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {
	
							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {
	
								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}
	
					// Create the abort callback
					callback = callback( "abort" );
	
					try {
	
						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {
	
						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},
	
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );
	
	
	
	
	// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
	jQuery.ajaxPrefilter( function( s ) {
		if ( s.crossDomain ) {
			s.contents.script = false;
		}
	} );
	
	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );
	
	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );
	
	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {
	
		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);
	
					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );
	
	
	
	
	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;
	
	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );
	
	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {
	
		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);
	
		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {
	
			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;
	
			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}
	
			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};
	
			// Force json dataType
			s.dataTypes[ 0 ] = "json";
	
			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};
	
			// Clean-up function (fires after converters)
			jqXHR.always( function() {
	
				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );
	
				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}
	
				// Save back as free
				if ( s[ callbackName ] ) {
	
					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;
	
					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}
	
				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}
	
				responseContainer = overwritten = undefined;
			} );
	
			// Delegate to script
			return "script";
		}
	} );
	
	
	
	
	// Support: Safari 8 only
	// In Safari 8 documents created via document.implementation.createHTMLDocument
	// collapse sibling forms: the second one becomes a child of the first one.
	// Because of that, this security measure has to be disabled in Safari 8.
	// https://bugs.webkit.org/show_bug.cgi?id=137337
	support.createHTMLDocument = ( function() {
		var body = document.implementation.createHTMLDocument( "" ).body;
		body.innerHTML = "<form></form><form></form>";
		return body.childNodes.length === 2;
	} )();
	
	
	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( typeof data !== "string" ) {
			return [];
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
	
		var base, parsed, scripts;
	
		if ( !context ) {
	
			// Stop scripts or inline event handlers from being executed immediately
			// by using document.implementation
			if ( support.createHTMLDocument ) {
				context = document.implementation.createHTMLDocument( "" );
	
				// Set the base href for the created document
				// so any parsed elements with URLs
				// are based on the document's URL (gh-2965)
				base = context.createElement( "base" );
				base.href = document.location.href;
				context.head.appendChild( base );
			} else {
				context = document;
			}
		}
	
		parsed = rsingleTag.exec( data );
		scripts = !keepScripts && [];
	
		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}
	
		parsed = buildFragment( [ data ], context, scripts );
	
		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}
	
		return jQuery.merge( [], parsed.childNodes );
	};
	
	
	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		var selector, type, response,
			self = this,
			off = url.indexOf( " " );
	
		if ( off > -1 ) {
			selector = stripAndCollapse( url.slice( off ) );
			url = url.slice( 0, off );
		}
	
		// If it's a function
		if ( jQuery.isFunction( params ) ) {
	
			// We assume that it's the callback
			callback = params;
			params = undefined;
	
		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}
	
		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,
	
				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {
	
				// Save response for use in complete callback
				response = arguments;
	
				self.html( selector ?
	
					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :
	
					// Otherwise use the full result
					responseText );
	
			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}
	
		return this;
	};
	
	
	
	
	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );
	
	
	
	
	jQuery.expr.pseudos.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};
	
	
	
	
	/**
	 * Gets a window from an element
	 */
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
	}
	
	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};
	
			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}
	
			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;
	
			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;
	
			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}
	
			if ( jQuery.isFunction( options ) ) {
	
				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}
	
			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}
	
			if ( "using" in options ) {
				options.using.call( elem, props );
	
			} else {
				curElem.css( props );
			}
		}
	};
	
	jQuery.fn.extend( {
		offset: function( options ) {
	
			// Preserve chaining for setter
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}
	
			var docElem, win, rect, doc,
				elem = this[ 0 ];
	
			if ( !elem ) {
				return;
			}
	
			// Support: IE <=11 only
			// Running getBoundingClientRect on a
			// disconnected node in IE throws an error
			if ( !elem.getClientRects().length ) {
				return { top: 0, left: 0 };
			}
	
			rect = elem.getBoundingClientRect();
	
			// Make sure element is not hidden (display: none)
			if ( rect.width || rect.height ) {
				doc = elem.ownerDocument;
				win = getWindow( doc );
				docElem = doc.documentElement;
	
				return {
					top: rect.top + win.pageYOffset - docElem.clientTop,
					left: rect.left + win.pageXOffset - docElem.clientLeft
				};
			}
	
			// Return zeros for disconnected and hidden elements (gh-2310)
			return rect;
		},
	
		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}
	
			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };
	
			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {
	
				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();
	
			} else {
	
				// Get *real* offsetParent
				offsetParent = this.offsetParent();
	
				// Get correct offsets
				offset = this.offset();
				if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}
	
				// Add offsetParent borders
				parentOffset = {
					top: parentOffset.top + jQuery.css( offsetParent[ 0 ], "borderTopWidth", true ),
					left: parentOffset.left + jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true )
				};
			}
	
			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},
	
		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;
	
				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}
	
				return offsetParent || documentElement;
			} );
		}
	} );
	
	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;
	
		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {
				var win = getWindow( elem );
	
				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}
	
				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);
	
				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );
	
	// Support: Safari <=7 - 9.1, Chrome <=37 - 49
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );
	
					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );
	
	
	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {
	
			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );
	
				return access( this, function( elem, type, value ) {
					var doc;
	
					if ( jQuery.isWindow( elem ) ) {
	
						// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
						return funcName.indexOf( "outer" ) === 0 ?
							elem[ "inner" + name ] :
							elem.document.documentElement[ "client" + name ];
					}
	
					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;
	
						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}
	
					return value === undefined ?
	
						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :
	
						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable );
			};
		} );
	} );
	
	
	jQuery.fn.extend( {
	
		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},
	
		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {
	
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		}
	} );
	
	jQuery.parseJSON = JSON.parse;
	
	
	
	
	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	
	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
	
	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
	
	
	
	
	var
	
		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,
	
		// Map over the $ in case of overwrite
		_$ = window.$;
	
	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}
	
		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}
	
		return jQuery;
	};
	
	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}
	
	
	
	
	
	return jQuery;
	} );


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _StoreAdapter = __webpack_require__(8);
	
	var _StoreAdapter2 = _interopRequireDefault(_StoreAdapter);
	
	var _LocalStoreAdapter = __webpack_require__(14);
	
	var _LocalStoreAdapter2 = _interopRequireDefault(_LocalStoreAdapter);
	
	var _PdfannoStoreAdapter = __webpack_require__(16);
	
	var _PdfannoStoreAdapter2 = _interopRequireDefault(_PdfannoStoreAdapter);
	
	var _render = __webpack_require__(22);
	
	var _render2 = _interopRequireDefault(_render);
	
	var _UI = __webpack_require__(42);
	
	var _UI2 = _interopRequireDefault(_UI);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	__webpack_require__(54);
	
	exports.default = {
	  /**
	   * Abstract class that needs to be defined so PDFJSAnnotate
	   * knows how to communicate with your server.
	   */
	  StoreAdapter: _StoreAdapter2.default,
	
	  /**
	   * Implementation of StoreAdapter that stores annotation data to localStorage.
	   */
	  LocalStoreAdapter: _LocalStoreAdapter2.default,
	
	  /**
	    Implementation of StoreAdapter for PDFAnno.
	  */
	  PdfannoStoreAdapter: _PdfannoStoreAdapter2.default,
	
	  /**
	   * Abstract instance of StoreAdapter
	   */
	  __storeAdapter: new _StoreAdapter2.default(),
	
	  /**
	   * Getter for the underlying StoreAdapter property
	   *
	   * @return {StoreAdapter}
	   */
	  getStoreAdapter: function getStoreAdapter() {
	    return this.__storeAdapter;
	  },
	
	
	  /**
	   * Setter for the underlying StoreAdapter property
	   *
	   * @param {StoreAdapter} adapter The StoreAdapter implementation to be used.
	   */
	  setStoreAdapter: function setStoreAdapter(adapter) {
	    // TODO this throws an error when bundled
	    // if (!(adapter instanceof StoreAdapter)) {
	    //   throw new Error('adapter must be an instance of StoreAdapter');
	    // }
	
	    this.__storeAdapter = adapter;
	  },
	
	
	  /**
	   * UI is a helper for instrumenting UI interactions for creating,
	   * editing, and deleting annotations in the browser.
	   */
	  UI: _UI2.default,
	
	  /**
	   * Render the annotations for a page in the PDF Document
	   *
	   * @param {SVGElement} svg The SVG element that annotations should be rendered to
	   * @param {PageViewport} viewport The PDFPage.getViewport data
	   * @param {Object} data The StoreAdapter.getAnnotations data
	   * @return {Promise}
	   */
	  render: _render2.default,
	
	  /**
	   * Convenience method for getting annotation data
	   *
	   * @alias StoreAdapter.getAnnotations
	   * @param {String} documentId The ID of the document
	   * @param {String} pageNumber The page number
	   * @return {Promise}
	   */
	  getAnnotations: function getAnnotations(documentId, pageNumber) {
	    var _getStoreAdapter;
	
	    return (_getStoreAdapter = this.getStoreAdapter()).getAnnotations.apply(_getStoreAdapter, arguments);
	  }
	};
	module.exports = exports['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _abstractFunction = __webpack_require__(9);
	
	var _abstractFunction2 = _interopRequireDefault(_abstractFunction);
	
	var _event = __webpack_require__(10);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// Adapter should never be invoked publicly
	var StoreAdapter = function () {
	  /**
	   * Create a new StoreAdapter instance
	   *
	   * @param {Object} [definition] The definition to use for overriding abstract methods
	   */
	  function StoreAdapter() {
	    var _this = this;
	
	    var definition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	
	    _classCallCheck(this, StoreAdapter);
	
	    // Copy each function from definition if it is a function we know about
	    Object.keys(definition).forEach(function (key) {
	      if (typeof definition[key] === 'function' && typeof _this[key] === 'function') {
	        _this[key] = definition[key];
	      }
	    });
	  }
	
	  /**
	   * Get all the annotations for a given document and page number.
	   *
	   * @param {String} documentId The ID for the document the annotations belong to
	   * @param {Number} pageNumber The number of the page the annotations belong to
	   * @return {Promise}
	   */
	
	
	  _createClass(StoreAdapter, [{
	    key: '__getAnnotations',
	    value: function __getAnnotations(documentId, pageNumber) {
	      (0, _abstractFunction2.default)('getAnnotations');
	    }
	  }, {
	    key: '__getSecondaryAnnotations',
	    value: function __getSecondaryAnnotations(documentId, pageNumber) {
	      (0, _abstractFunction2.default)('getSecondaryAnnotations');
	    }
	  }, {
	    key: 'getAnnotation',
	
	
	    /**
	     * Get the definition for a specific annotation.
	     *
	     * @param {String} documentId The ID for the document the annotation belongs to
	     * @param {String} annotationId The ID for the annotation
	     * @return {Promise}
	     */
	    value: function getAnnotation(documentId, annotationId) {
	      (0, _abstractFunction2.default)('getAnnotation');
	    }
	
	    /**
	     * Add an annotation
	     *
	     * @param {String} documentId The ID for the document to add the annotation to
	     * @param {String} pageNumber The page number to add the annotation to
	     * @param {Object} annotation The definition for the new annotation
	     * @return {Promise}
	     */
	
	  }, {
	    key: '__addAnnotation',
	    value: function __addAnnotation(documentId, pageNumber, annotation) {
	      (0, _abstractFunction2.default)('addAnnotation');
	    }
	  }, {
	    key: '__addAllAnnotations',
	    value: function __addAllAnnotations(documentId, annotations) {
	      (0, _abstractFunction2.default)('addAllAnnotations');
	    }
	  }, {
	    key: '__editAnnotation',
	
	
	    /**
	     * Edit an annotation
	     *
	     * @param {String} documentId The ID for the document
	     * @param {String} pageNumber the page number of the annotation
	     * @param {Object} annotation The definition of the modified annotation
	     * @return {Promise}
	     */
	    value: function __editAnnotation(documentId, pageNumber, annotation) {
	      (0, _abstractFunction2.default)('editAnnotation');
	    }
	  }, {
	    key: '__deleteAnnotation',
	
	
	    /**
	     * Delete an annotation
	     *
	     * @param {String} documentId The ID for the document
	     * @param {String} annotationId The ID for the annotation
	     * @return {Promise}
	     */
	    value: function __deleteAnnotation(documentId, annotationId) {
	      (0, _abstractFunction2.default)('deleteAnnotation');
	    }
	  }, {
	    key: '__deleteAnnotations',
	    value: function __deleteAnnotations(documentId) {
	      (0, _abstractFunction2.default)('deleteAnnotations');
	    }
	  }, {
	    key: 'getComments',
	
	
	    /**
	     * Get all the comments for an annotation
	     *
	     * @param {String} documentId The ID for the document
	     * @param {String} annotationId The ID for the annotation
	     * @return {Promise}
	     */
	    value: function getComments(documentId, annotationId) {
	      (0, _abstractFunction2.default)('getComments');
	    }
	
	    /**
	     * Add a new comment
	     *
	     * @param {String} documentId The ID for the document
	     * @param {String} annotationId The ID for the annotation
	     * @param {Object} content The definition of the comment
	     * @return {Promise}
	     */
	
	  }, {
	    key: '__addComment',
	    value: function __addComment(documentId, annotationId, content) {
	      (0, _abstractFunction2.default)('addComment');
	    }
	  }, {
	    key: '__deleteComment',
	
	
	    /**
	     * Delete a comment
	     *
	     * @param {String} documentId The ID for the document
	     * @param {String} commentId The ID for the comment
	     * @return {Promise}
	     */
	    value: function __deleteComment(documentId, commentId) {
	      (0, _abstractFunction2.default)('deleteComment');
	    }
	  }, {
	    key: '__exportData',
	    value: function __exportData() {
	      (0, _abstractFunction2.default)('exportData');
	    }
	  }, {
	    key: '__importAnnotations',
	    value: function __importAnnotations(data) {
	      (0, _abstractFunction2.default)('importAnnotations');
	    }
	  }, {
	    key: '__importData',
	
	
	    /**
	     * @Duplicated.
	     */
	    value: function __importData(json) {
	      (0, _abstractFunction2.default)('importData');
	    }
	  }, {
	    key: '__importDataSecondary',
	
	
	    /**
	     * @Duplicated.
	     */
	    value: function __importDataSecondary(jsonArray) {
	      (0, _abstractFunction2.default)('importDataSecondary');
	    }
	  }, {
	    key: '__findAnnotations',
	    value: function __findAnnotations(documentId, criteria) {
	      (0, _abstractFunction2.default)('findAnnotations');
	    }
	  }, {
	    key: 'getAnnotations',
	    get: function get() {
	      return this.__getAnnotations;
	    },
	    set: function set(fn) {
	      this.__getAnnotations = function getAnnotations(documentId, pageNumber) {
	        return fn.apply(undefined, arguments).then(function (annotations) {
	          // TODO may be best to have this happen on the server
	          if (annotations.annotations) {
	            annotations.annotations.forEach(function (a) {
	              a.documentId = documentId;
	            });
	          }
	          return annotations;
	        });
	      };
	    }
	  }, {
	    key: 'getSecondaryAnnotations',
	    get: function get() {
	      return this.__getSecondaryAnnotations;
	    },
	    set: function set(fn) {
	      this.__getSecondaryAnnotations = function getSecondaryAnnotations(documentId, pageNumber) {
	        return fn.apply(undefined, arguments).then(function (annotations) {
	          // TODO may be best to have this happen on the server
	          if (annotations.annotations) {
	            annotations.annotations.forEach(function (a) {
	              a.documentId = documentId;
	            });
	          }
	          return annotations;
	        });
	      };
	    }
	  }, {
	    key: 'addAnnotation',
	    get: function get() {
	      return this.__addAnnotation;
	    },
	    set: function set(fn) {
	      this.__addAnnotation = function addAnnotation(documentId, pageNumber, annotation) {
	        return fn.apply(undefined, arguments).then(function (annotation) {
	          (0, _event.fireEvent)('annotation:add', documentId, pageNumber, annotation);
	          return annotation;
	        });
	      };
	    }
	  }, {
	    key: 'addAllAnnotations',
	    get: function get() {
	      return this.__addAllAnnotations;
	    },
	    set: function set(fn) {
	      this.__addAllAnnotations = function addAllAnnotations(documentId, annotations) {
	        return fn.apply(undefined, arguments).then(function (annotation) {
	          (0, _event.fireEvent)('annotation:addAll', documentId);
	          return annotation;
	        });
	      };
	    }
	  }, {
	    key: 'editAnnotation',
	    get: function get() {
	      return this.__editAnnotation;
	    },
	    set: function set(fn) {
	      this.__editAnnotation = function editAnnotation(documentId, annotationId, annotation) {
	        return fn.apply(undefined, arguments).then(function (annotation) {
	          (0, _event.fireEvent)('annotation:edit', documentId, annotationId, annotation);
	          return annotation;
	        });
	      };
	    }
	  }, {
	    key: 'deleteAnnotation',
	    get: function get() {
	      return this.__deleteAnnotation;
	    },
	    set: function set(fn) {
	      this.__deleteAnnotation = function deleteAnnotation(documentId, annotationId) {
	        return fn.apply(undefined, arguments).then(function (success) {
	          if (success) {
	            (0, _event.fireEvent)('annotation:delete', documentId, annotationId);
	          }
	          return success;
	        });
	      };
	    }
	  }, {
	    key: 'deleteAnnotations',
	    get: function get() {
	      return this.__deleteAnnotations;
	    },
	    set: function set(fn) {
	      this.__deleteAnnotations = function deleteAnnotations(documentId) {
	        return fn.apply(undefined, arguments).then(function (success) {
	          if (success) {
	            (0, _event.fireEvent)('annotation:deleteAll', documentId);
	          }
	          return success;
	        });
	      };
	    }
	  }, {
	    key: 'addComment',
	    get: function get() {
	      return this.__addComment;
	    },
	    set: function set(fn) {
	      this.__addComment = function addComment(documentId, annotationId, content) {
	        return fn.apply(undefined, arguments).then(function (comment) {
	          (0, _event.fireEvent)('comment:add', documentId, annotationId, comment);
	          return comment;
	        });
	      };
	    }
	  }, {
	    key: 'deleteComment',
	    get: function get() {
	      return this.__deleteComment;
	    },
	    set: function set(fn) {
	      this.__deleteComment = function deleteComment(documentId, commentId) {
	        return fn.apply(undefined, arguments).then(function (success) {
	          if (success) {
	            (0, _event.fireEvent)('comment:delete', documentId, commentId);
	          }
	          return success;
	        });
	      };
	    }
	  }, {
	    key: 'exportData',
	    get: function get() {
	      return this.__exportData;
	    },
	    set: function set(fn) {
	      this.__exportData = function exportData() {
	        return fn.apply(undefined, arguments).then(function (success) {
	          if (success) {
	            (0, _event.fireEvent)('export');
	          }
	          return success;
	        });
	      };
	    }
	  }, {
	    key: 'importAnnotations',
	    get: function get() {
	      return this.__importAnnotations;
	    },
	    set: function set(fn) {
	      this.__importAnnotations = function importAnnotations(json) {
	        return fn.apply(undefined, arguments).then(function (success) {
	          if (success) {
	            (0, _event.fireEvent)('importAnnotations', json);
	          }
	          return success;
	        });
	      };
	    }
	  }, {
	    key: 'importData',
	    get: function get() {
	      return this.__importData;
	    },
	    set: function set(fn) {
	      this.__importData = function importData(json) {
	        return fn.apply(undefined, arguments).then(function (success) {
	          if (success) {
	            (0, _event.fireEvent)('import', json);
	          }
	          return success;
	        });
	      };
	    }
	  }, {
	    key: 'importDataSecondary',
	    get: function get() {
	      return this.__importDataSecondary;
	    },
	    set: function set(fn) {
	      this.__importDataSecondary = function importDataSecondary(jsonArray) {
	        return fn.apply(undefined, arguments).then(function (success) {
	          if (success) {
	            (0, _event.fireEvent)('importSecondary', jsonArray);
	          }
	          return success;
	        });
	      };
	    }
	  }, {
	    key: 'findAnnotations',
	    get: function get() {
	      return this.__findAnnotations;
	    },
	    set: function set(fn) {
	      this.__findAnnotations = function findAnnotations(documentId, criteria) {
	        return fn.apply(undefined, arguments).then(function (annotations) {
	          // TODO may be best to have this happen on the server
	          if (annotations.annotations) {
	            annotations.annotations.forEach(function (a) {
	              a.documentId = documentId;
	            });
	          }
	          return annotations;
	        });
	      };
	    }
	  }]);
	
	  return StoreAdapter;
	}();
	
	exports.default = StoreAdapter;
	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = abstractFunction;
	/**
	 * Throw an Error for an abstract function that hasn't been implemented.
	 *
	 * @param {String} name The name of the abstract function
	 */
	function abstractFunction(name) {
	  throw new Error(name + ' is not implemented');
	}
	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.fireEvent = fireEvent;
	exports.addEventListener = addEventListener;
	exports.removeEventListener = removeEventListener;
	
	var _events = __webpack_require__(11);
	
	var _events2 = _interopRequireDefault(_events);
	
	var _utils = __webpack_require__(12);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var emitter = new _events2.default();
	
	var clickNode = void 0;
	
	/**
	 * Handle document.click event
	 *
	 * @param {Event} e The DOM event to be handled
	 */
	document.addEventListener('click', function handleDocumentClick(e) {
	  if (!(0, _utils.findSVGAtPoint)(e.clientX, e.clientY)) {
	    return;
	  }
	
	  var target = (0, _utils.findAnnotationAtPoint)(e.clientX, e.clientY);
	
	  // Emit annotation:blur if clickNode is no longer clicked
	  if (clickNode && clickNode !== target) {
	    emitter.emit('annotation:blur', clickNode);
	  }
	
	  // Emit annotation:click if target was clicked
	  if (target) {
	    emitter.emit('annotation:click', target);
	  }
	
	  clickNode = target;
	});
	
	// let mouseOverNode;
	// document.addEventListener('mousemove', function handleDocumentMousemove(e) {
	//   let target = findAnnotationAtPoint(e.clientX, e.clientY);
	//
	//   // Emit annotation:mouseout if target was mouseout'd
	//   if (mouseOverNode && !target) {
	//     emitter.emit('annotation:mouseout', mouseOverNode);
	//   }
	//
	//   // Emit annotation:mouseover if target was mouseover'd
	//   if (target && mouseOverNode !== target) {
	//     emitter.emit('annotation:mouseover', target);
	//   }
	//
	//   mouseOverNode = target;
	// });
	
	function fireEvent() {
	  emitter.emit.apply(emitter, arguments);
	};
	function addEventListener() {
	  emitter.on.apply(emitter, arguments);
	};
	function removeEventListener() {
	  emitter.removeListener.apply(emitter, arguments);
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

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


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.BORDER_COLOR = undefined;
	exports.findSVGContainer = findSVGContainer;
	exports.findSVGAtPoint = findSVGAtPoint;
	exports.findAnnotationAtPoint = findAnnotationAtPoint;
	exports.pointIntersectsRect = pointIntersectsRect;
	exports.getOffsetAnnotationRect = getOffsetAnnotationRect;
	exports.getAnnotationRect = getAnnotationRect;
	exports.scaleUp = scaleUp;
	exports.scaleDown = scaleDown;
	exports.getScroll = getScroll;
	exports.getOffset = getOffset;
	exports.disableUserSelect = disableUserSelect;
	exports.enableUserSelect = enableUserSelect;
	exports.getMetadata = getMetadata;
	exports.getXY = getXY;
	exports.getSVGLayer = getSVGLayer;
	exports.getViewerContainer = getViewerContainer;
	exports.getTmpLayer = getTmpLayer;
	exports.getCurrentPage = getCurrentPage;
	
	var _jquery = __webpack_require__(6);
	
	var _jquery2 = _interopRequireDefault(_jquery);
	
	var _createStylesheet = __webpack_require__(13);
	
	var _createStylesheet2 = _interopRequireDefault(_createStylesheet);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var BORDER_COLOR = exports.BORDER_COLOR = '#00BFFF';
	
	var userSelectStyleSheet = (0, _createStylesheet2.default)({
	  body: {
	    '-webkit-user-select': 'none',
	    '-moz-user-select': 'none',
	    '-ms-user-select': 'none',
	    'user-select': 'none'
	  }
	});
	userSelectStyleSheet.setAttribute('data-pdf-annotate-user-select', 'true');
	
	/**
	 * Find the SVGElement that contains all the annotations for a page
	 *
	 * @param {Element} node An annotation within that container
	 * @return {SVGElement} The container SVG or null if it can't be found
	 */
	function findSVGContainer(node) {
	  var parentNode = node;
	
	  while ((parentNode = parentNode.parentNode) && parentNode !== document) {
	    if (parentNode.nodeName.toUpperCase() === 'SVG' && parentNode.getAttribute('data-pdf-annotate-container') === 'true') {
	      return parentNode;
	    }
	  }
	
	  return null;
	}
	
	/**
	 * Find an SVGElement container at a given point
	 *
	 * @param {Number} x The x coordinate of the point
	 * @param {Number} y The y coordinate of the point
	 * @return {SVGElement} The container SVG or null if one can't be found
	 */
	function findSVGAtPoint(x, y) {
	
	  // TODO make it a global const.
	  var svgLayerId = 'annoLayer';
	
	  var el = document.getElementById(svgLayerId);
	  if (!el) {
	    return;
	  }
	
	  var rect = el.getBoundingClientRect();
	
	  if (pointIntersectsRect(x, y, rect)) {
	
	    return el;
	  }
	
	  return null;
	
	  // let elements = document.querySelectorAll('svg[data-pdf-annotate-container="true"]');
	
	  // for (let i=0, l=elements.length; i<l; i++) {
	  //   let el = elements[i];
	  //   let rect = el.getBoundingClientRect();
	
	  //   if (pointIntersectsRect(x, y, rect)) {
	
	  //     return el;
	  //   }
	  // }
	
	  // return null;
	}
	
	/**
	 * Find an Element that represents an annotation at a given point
	 *
	 * @param {Number} x The x coordinate of the point
	 * @param {Number} y The y coordinate of the point
	 * @return {Element} The annotation element or null if one can't be found
	 */
	function findAnnotationAtPoint(x, y) {
	  var svg = findSVGAtPoint(x, y);
	  if (!svg) {
	    return;
	  }
	  var elements = svg.querySelectorAll('[data-pdf-annotate-type]');
	
	  // Find a target element within SVG
	  for (var i = 0, l = elements.length; i < l; i++) {
	    var el = elements[i];
	    if (pointIntersectsRect(x, y, getOffsetAnnotationRect(el))) {
	      return el;
	    }
	  }
	
	  return null;
	}
	
	/**
	 * Determine if a point intersects a rect
	 *
	 * @param {Number} x The x coordinate of the point
	 * @param {Number} y The y coordinate of the point
	 * @param {Object} rect The points of a rect (likely from getBoundingClientRect)
	 * @return {Boolean} True if a collision occurs, otherwise false
	 */
	function pointIntersectsRect(x, y, rect) {
	  return y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right;
	}
	
	/**
	 * Get the rect of an annotation element accounting for offset.
	 *
	 * @param {Element} el The element to get the rect of
	 * @return {Object} The dimensions of the element
	 */
	function getOffsetAnnotationRect(el) {
	  var rect = getAnnotationRect(el);
	
	  var _getOffset = getOffset(el),
	      offsetLeft = _getOffset.offsetLeft,
	      offsetTop = _getOffset.offsetTop;
	
	  return {
	    top: rect.top + offsetTop,
	    left: rect.left + offsetLeft,
	    right: rect.right + offsetLeft,
	    bottom: rect.bottom + offsetTop
	  };
	}
	
	/**
	 * Get the rect of an annotation element.
	 *
	 * @param {Element} el The element to get the rect of
	 * @return {Object} The dimensions of the element
	 */
	function getAnnotationRect(el) {
	  var h = 0,
	      w = 0,
	      x = 0,
	      y = 0;
	  var rect = el.getBoundingClientRect();
	  // TODO this should be calculated somehow
	  var LINE_OFFSET = 16;
	
	  (function () {
	    switch (el.nodeName.toLowerCase()) {
	      case 'path':
	        var minX = void 0,
	            maxX = void 0,
	            minY = void 0,
	            maxY = void 0;
	
	        el.getAttribute('d').replace(/Z/, '').split('M').splice(1).forEach(function (p) {
	          var s = p.split(' ').map(function (i) {
	            return parseInt(i, 10);
	          });
	
	          if (typeof minX === 'undefined' || s[0] < minX) {
	            minX = s[0];
	          }
	          if (typeof maxX === 'undefined' || s[2] > maxX) {
	            maxX = s[2];
	          }
	          if (typeof minY === 'undefined' || s[1] < minY) {
	            minY = s[1];
	          }
	          if (typeof maxY === 'undefined' || s[3] > maxY) {
	            maxY = s[3];
	          }
	        });
	
	        h = maxY - minY;
	        w = maxX - minX;
	        x = minX;
	        y = minY;
	        break;
	
	      case 'line':
	        h = parseInt(el.getAttribute('y2'), 10) - parseInt(el.getAttribute('y1'), 10);
	        w = parseInt(el.getAttribute('x2'), 10) - parseInt(el.getAttribute('x1'), 10);
	        x = parseInt(el.getAttribute('x1'), 10);
	        y = parseInt(el.getAttribute('y1'), 10);
	
	        if (h === 0) {
	          h += LINE_OFFSET;
	          y -= LINE_OFFSET / 2;
	        }
	        break;
	
	      case 'text':
	        h = rect.height;
	        w = rect.width;
	        x = parseInt(el.getAttribute('x'), 10);
	        y = parseInt(el.getAttribute('y'), 10) - h;
	        break;
	
	      case 'g':
	        var _getOffset2 = getOffset(el),
	            offsetLeft = _getOffset2.offsetLeft,
	            offsetTop = _getOffset2.offsetTop;
	
	        h = rect.height;
	        w = rect.width;
	        x = rect.left - offsetLeft;
	        y = rect.top - offsetTop;
	
	        if (el.getAttribute('data-pdf-annotate-type') === 'strikeout') {
	          h += LINE_OFFSET;
	          y -= LINE_OFFSET / 2;
	        }
	        break;
	
	      case 'rect':
	      case 'svg':
	        h = parseInt(el.getAttribute('height'), 10);
	        w = parseInt(el.getAttribute('width'), 10);
	        x = parseInt(el.getAttribute('x'), 10);
	        y = parseInt(el.getAttribute('y'), 10);
	        break;
	    }
	
	    // Result provides same properties as getBoundingClientRect
	  })();
	
	  var result = {
	    top: y,
	    left: x,
	    width: w,
	    height: h,
	    right: x + w,
	    bottom: y + h
	  };
	
	  // For the case of nested SVG (point annotations) and grouped
	  // lines or rects no adjustment needs to be made for scale.
	  // I assume that the scale is already being handled
	  // natively by virtue of the `transform` attribute.
	  if (!['svg', 'g'].includes(el.nodeName.toLowerCase())) {
	    result = scaleUp(findSVGAtPoint(rect.left, rect.top), result);
	  }
	
	  return result;
	}
	
	/**
	 * Adjust scale from normalized scale (100%) to rendered scale.
	 *
	 * @param {SVGElement} svg The SVG to gather metadata from
	 * @param {Object} rect A map of numeric values to scale
	 * @return {Object} A copy of `rect` with values scaled up
	 */
	function scaleUp(svg, rect) {
	
	  if (arguments.length === 1) {
	    rect = svg;
	    svg = getSVGLayer();
	  }
	
	  var result = {};
	
	  var _getMetadata = getMetadata(svg),
	      viewport = _getMetadata.viewport;
	
	  Object.keys(rect).forEach(function (key) {
	    result[key] = rect[key] * viewport.scale;
	  });
	
	  return result;
	}
	
	/**
	 * Adjust scale from rendered scale to a normalized scale (100%).
	 *
	 * @param {SVGElement} svg The SVG to gather metadata from
	 * @param {Object} rect A map of numeric values to scale
	 * @return {Object} A copy of `rect` with values scaled down
	 */
	function scaleDown(svg, rect) {
	
	  if (arguments.length === 1) {
	    rect = svg;
	    svg = getSVGLayer();
	  }
	
	  var result = {};
	
	  var _getMetadata2 = getMetadata(svg),
	      viewport = _getMetadata2.viewport;
	
	  Object.keys(rect).forEach(function (key) {
	    result[key] = rect[key] / viewport.scale;
	  });
	
	  return result;
	}
	
	/**
	 * Get the scroll position of an element, accounting for parent elements
	 *
	 * @param {Element} el The element to get the scroll position for
	 * @return {Object} The scrollTop and scrollLeft position
	 */
	function getScroll(el) {
	  var scrollTop = 0;
	  var scrollLeft = 0;
	  var parentNode = el;
	
	  while ((parentNode = parentNode.parentNode) && parentNode !== document) {
	    scrollTop += parentNode.scrollTop;
	    scrollLeft += parentNode.scrollLeft;
	  }
	
	  return { scrollTop: scrollTop, scrollLeft: scrollLeft };
	}
	
	/**
	 * Get the offset position of an element, accounting for parent elements
	 *
	 * @param {Element} el The element to get the offset position for
	 * @return {Object} The offsetTop and offsetLeft position
	 */
	function getOffset(el) {
	  var parentNode = el;
	
	  while ((parentNode = parentNode.parentNode) && parentNode !== document) {
	    if (parentNode.nodeName.toUpperCase() === 'SVG') {
	      break;
	    }
	  }
	
	  var rect = parentNode.getBoundingClientRect();
	
	  return { offsetLeft: rect.left, offsetTop: rect.top };
	}
	
	/**
	 * Disable user ability to select text on page
	 */
	function disableUserSelect() {
	  if (!userSelectStyleSheet.parentNode) {
	    document.head.appendChild(userSelectStyleSheet);
	  }
	}
	
	/**
	 * Enable user ability to select text on page
	 */
	function enableUserSelect() {
	  if (userSelectStyleSheet.parentNode) {
	    userSelectStyleSheet.parentNode.removeChild(userSelectStyleSheet);
	  }
	}
	
	/**
	 * Get the metadata for a SVG container
	 *
	 * @param {SVGElement} svg The SVG container to get metadata for
	 */
	function getMetadata(svg) {
	  svg = svg || getSVGLayer();
	  return {
	    documentId: svg.getAttribute('data-pdf-annotate-document'),
	    pageNumber: parseInt(svg.getAttribute('data-pdf-annotate-page'), 10),
	    viewport: JSON.parse(svg.getAttribute('data-pdf-annotate-viewport'))
	  };
	}
	
	function getXY(e) {
	
	  var rect1 = (0, _jquery2.default)('#pageContainer1')[0].getBoundingClientRect();
	  // console.log('rect1:', rect1);
	  var rect2 = (0, _jquery2.default)('#annoLayer')[0].getBoundingClientRect();
	  // console.log('rect2:', rect2);
	
	  var rectTop = rect2.top - rect1.top;
	  var rectLeft = rect2.left - rect1.left;
	  // console.log(rectTop, rectLeft);
	
	  // let x = e.clientX - rect.left;
	  // let y = $('#annoLayer').scrollTop() + e.clientY - rect.top;
	
	  // let x = e.clientX - rect.left;
	  // let y = e.clientY + $('#annoLayer').scrollTop() - rect.top;
	  // let y = e.clientY + $('#annoLayer').scrollTop();
	  // let y = e.clientY + $('#annoLayer').scrollTop() - rectTop;
	  var y = e.clientY + (0, _jquery2.default)('#annoLayer').scrollTop() - rect2.top;
	
	  // let x = e.clientX - rect.left;
	  // let x = e.clientX;
	  // let x = e.clientX - rectLeft;
	  var x = e.clientX - rect2.left;
	  // let y = e.clientY - rect.top;
	
	  // console.log('e.client:', e.clientX, e.clientY, $('#annoLayer').scrollTop());
	
	  // console.log('y:', y, e.clientY, $('#annoLayer').scrollTop(), rect2.top);
	
	  return { x: x, y: y };
	}
	
	function getSVGLayer() {
	  return document.getElementById('annoLayer');
	}
	
	function getViewerContainer() {
	  // return document.getElementById('viewerContainer');
	  return document.getElementById('pageContainer1');
	}
	
	function getTmpLayer() {
	  return document.getElementById('tmpLayer');
	}
	
	function getCurrentPage(e) {
	  var _getXY = getXY(e),
	      x = _getXY.x,
	      y = _getXY.y;
	
	  var scrollTop = (0, _jquery2.default)('#annoLayer')[0].getBoundingClientRect().top;
	  var scrollLeft = (0, _jquery2.default)('#annoLayer')[0].getBoundingClientRect().left;
	
	  // let elements = document.querySelectorAll('.page');
	  var elements = document.querySelectorAll('.canvasWrapper');
	
	  for (var i = 0, l = elements.length; i < l; i++) {
	    var el = elements[i];
	    var rect = el.getBoundingClientRect();
	
	    var pageNumber = i + 1;
	
	    // rect.top = $('#annoLayer').scrollTop();
	    // 927
	    var minX = rect.left - scrollLeft;
	    var maxX = rect.right - scrollLeft;
	    var minY = rect.top - scrollTop; // + 9 * pageNumber;    // 9 = margin
	    var maxY = rect.bottom - scrollTop; // + 9 * pageNumber;
	
	    if (minX <= x && x <= maxX && minY <= y && y <= maxY) {
	
	      var page = parseInt(el.parentNode.id.replace('pageContainer', ''));
	
	      console.log('find!!!!', page);
	      // console.log('x', minX <= x && x <= maxX, minX, x, maxX);
	      // console.log('y', minY <= y && y <= maxY, minY, y, maxY);
	
	      return { page: page, minX: minX, maxX: maxX, minY: minY, maxY: maxY };
	    }
	
	    // if (pointIntersectsRect(x, y, rect)) {
	
	    //   console.log('find!!!', el, rect);
	
	    //   return el;
	    // }
	  }
	
	  console.log('notfound ><...');
	  return null;
	
	  // TODO
	  return 1;
	}

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = function createStyleSheet(blocks) {
	  var style = document.createElement('style');
	  var text = Object.keys(blocks).map(function (selector) {
	    return processRuleSet(selector, blocks[selector]);
	  }).join('\n');
	  
	  style.setAttribute('type', 'text/css');
	  style.appendChild(document.createTextNode(text));
	
	  return style;
	}
	
	function processRuleSet(selector, block) {
	  return selector + ' {\n' + processDeclarationBlock(block) + '\n}';
	}
	
	function processDeclarationBlock(block) {
	  return Object.keys(block).map(function (prop) {
	    return processDeclaration(prop, block[prop]);
	  }).join('\n');
	}
	
	function processDeclaration(prop, value) {
	  if (!isNaN(value) && value != 0) {
	    value = value + 'px';
	  }
	
	  return hyphenate(prop) + ': ' + value + ';';
	}
	
	function hyphenate(prop) {
	  return prop.replace(/[A-Z]/g, function (match) {
	    return '-' + match.toLowerCase();
	  });
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _uuid = __webpack_require__(15);
	
	var _uuid2 = _interopRequireDefault(_uuid);
	
	var _StoreAdapter2 = __webpack_require__(8);
	
	var _StoreAdapter3 = _interopRequireDefault(_StoreAdapter2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	// StoreAdapter for working with localStorage
	// This is ideal for testing, examples, and prototyping
	var LocalStoreAdapter = function (_StoreAdapter) {
	  _inherits(LocalStoreAdapter, _StoreAdapter);
	
	  function LocalStoreAdapter() {
	    _classCallCheck(this, LocalStoreAdapter);
	
	    return _possibleConstructorReturn(this, (LocalStoreAdapter.__proto__ || Object.getPrototypeOf(LocalStoreAdapter)).call(this, {
	      getAnnotations: function getAnnotations(documentId, pageNumber) {
	        return new Promise(function (resolve, reject) {
	          var annotations = _getAnnotations(documentId).filter(function (i) {
	            return i.page === pageNumber && i.class === 'Annotation';
	          });
	
	          resolve({
	            documentId: documentId,
	            pageNumber: pageNumber,
	            annotations: annotations
	          });
	        });
	      },
	      getAnnotation: function getAnnotation(documentId, annotationId) {
	        return Promise.resolve(_getAnnotations(documentId)[findAnnotation(documentId, annotationId)]);
	      },
	      addAnnotation: function addAnnotation(documentId, pageNumber, annotation) {
	        return new Promise(function (resolve, reject) {
	          annotation.class = 'Annotation';
	          annotation.uuid = (0, _uuid2.default)();
	          annotation.page = pageNumber;
	
	          var annotations = _getAnnotations(documentId);
	          annotations.push(annotation);
	          updateAnnotations(documentId, annotations);
	
	          resolve(annotation);
	        });
	      },
	      addAllAnnotations: function addAllAnnotations(documentId, annotations) {
	        console.log('addAllAnnotations');
	        return new Promise(function (resolve, reject) {
	          updateAnnotations(documentId, annotations);
	          resolve();
	        });
	      },
	      editAnnotation: function editAnnotation(documentId, annotationId, annotation) {
	        return new Promise(function (resolve, reject) {
	          var annotations = _getAnnotations(documentId);
	          annotations[findAnnotation(documentId, annotationId)] = annotation;
	          updateAnnotations(documentId, annotations);
	
	          resolve(annotation);
	        });
	      },
	      deleteAnnotation: function deleteAnnotation(documentId, annotationId) {
	        return new Promise(function (resolve, reject) {
	          var index = findAnnotation(documentId, annotationId);
	          if (index > -1) {
	            var annotations = _getAnnotations(documentId);
	            annotations.splice(index, 1);
	            updateAnnotations(documentId, annotations);
	          }
	
	          resolve(true);
	        });
	      },
	      getComments: function getComments(documentId, annotationId) {
	        return new Promise(function (resolve, reject) {
	          resolve(_getAnnotations(documentId).filter(function (i) {
	            return i.class === 'Comment' && i.annotation === annotationId;
	          }));
	        });
	      },
	      addComment: function addComment(documentId, annotationId, content) {
	        return new Promise(function (resolve, reject) {
	          var comment = {
	            class: 'Comment',
	            uuid: (0, _uuid2.default)(),
	            annotation: annotationId,
	            content: content
	          };
	
	          var annotations = _getAnnotations(documentId);
	          annotations.push(comment);
	          updateAnnotations(documentId, annotations);
	
	          resolve(comment);
	        });
	      },
	      deleteComment: function deleteComment(documentId, commentId) {
	        return new Promise(function (resolve, reject) {
	          _getAnnotations(documentId);
	          var index = -1;
	          var annotations = _getAnnotations(documentId);
	          for (var i = 0, l = annotations.length; i < l; i++) {
	            if (annotations[i].uuid === commentId) {
	              index = i;
	              break;
	            }
	          }
	
	          if (index > -1) {
	            annotations.splice(index, 1);
	            updateAnnotations(documentId, annotations);
	          }
	
	          resolve(true);
	        });
	      }
	    }));
	  }
	
	  return LocalStoreAdapter;
	}(_StoreAdapter3.default);
	
	exports.default = LocalStoreAdapter;
	
	
	function _getAnnotations(documentId) {
	  return JSON.parse(localStorage.getItem(documentId + '/annotations')) || [];
	}
	
	function updateAnnotations(documentId, annotations) {
	  localStorage.setItem(documentId + '/annotations', JSON.stringify(annotations));
	}
	
	function findAnnotation(documentId, annotationId) {
	  var index = -1;
	  var annotations = _getAnnotations(documentId);
	  for (var i = 0, l = annotations.length; i < l; i++) {
	    if (annotations[i].uuid === annotationId) {
	      index = i;
	      break;
	    }
	  }
	  return index;
	}
	module.exports = exports['default'];

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = uuid;
	var REGEXP = /[xy]/g;
	var PATTERN = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
	
	function replacement(c) {
	  var r = Math.random() * 16 | 0;
	  var v = c == 'x' ? r : r & 0x3 | 0x8;
	  return v.toString(16);
	}
	
	/**
	 * Generate a univierally unique identifier
	 *
	 * @return {String}
	 */
	function uuid() {
	  return PATTERN.replace(REGEXP, replacement);
	}
	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _deepAssign = __webpack_require__(17);
	
	var _deepAssign2 = _interopRequireDefault(_deepAssign);
	
	var _uuid = __webpack_require__(15);
	
	var _uuid2 = _interopRequireDefault(_uuid);
	
	var _StoreAdapter2 = __webpack_require__(8);
	
	var _StoreAdapter3 = _interopRequireDefault(_StoreAdapter2);
	
	var _utils = __webpack_require__(12);
	
	var _relation = __webpack_require__(19);
	
	var _version = __webpack_require__(20);
	
	var _version2 = _interopRequireDefault(_version);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var LOCALSTORAGE_KEY = '_pdfanno_pdfanno';
	var LOCALSTORAGE_KEY_SECONDARY = '_pdfanno_pdfanno_secondary';
	
	var LOCALSTORAGE_KEY2 = '_pdfanno_containers';
	
	/**
	  Implmenetation of StoreAdapter for PDFAnno.
	*/
	
	var PdfannoStoreAdapter = function (_StoreAdapter) {
	  _inherits(PdfannoStoreAdapter, _StoreAdapter);
	
	  function PdfannoStoreAdapter() {
	    _classCallCheck(this, PdfannoStoreAdapter);
	
	    return _possibleConstructorReturn(this, (PdfannoStoreAdapter.__proto__ || Object.getPrototypeOf(PdfannoStoreAdapter)).call(this, {
	      getAnnotations: function getAnnotations(documentId, pageNumber) {
	        return new Promise(function (resolve, reject) {
	          var annotations = _getAnnotations(documentId).filter(function (i) {
	            // if (pageNumber) {
	            //   return i.page === pageNumber && i.class === 'Annotation';
	            // } else {
	            return true;
	            // }            
	          });
	
	          resolve({
	            documentId: documentId,
	            pageNumber: pageNumber,
	            annotations: annotations
	          });
	        });
	      },
	      getSecondaryAnnotations: function getSecondaryAnnotations(documentId, pageNumber) {
	        return new Promise(function (resolve, reject) {
	
	          var annotations = [];
	          var containers = _getSecondaryContainers();
	          containers.forEach(function (container) {
	            // TODO refactoring. same thing exists.
	            var tmpAnnotations = ((container[documentId] || {}).annotations || []).filter(function (i) {
	              // if (pageNumber) {
	              //   return i.page === pageNumber && i.class === 'Annotation';
	              // } else {
	              return true;
	              // }
	            });
	            annotations = annotations.concat(tmpAnnotations);
	          });
	
	          // Convert coordinate system.
	          annotations = annotations.map(function (a) {
	            return transformToRenderCoordinate(a);
	          });
	
	          resolve({
	            documentId: documentId,
	            pageNumber: pageNumber,
	            annotations: annotations
	          });
	        });
	      },
	      getAnnotation: function getAnnotation(documentId, annotationId) {
	        return Promise.resolve(_getAnnotations(documentId)[findAnnotation(documentId, annotationId)]);
	      },
	      addAnnotation: function addAnnotation(documentId, pageNumber, annotation) {
	
	        console.log('addAnnotation1:', annotation);
	
	        return new Promise(function (resolve, reject) {
	          annotation.class = 'Annotation';
	          annotation.uuid = annotation.uuid || (0, _uuid2.default)();
	          // annotation.page = pageNumber;
	
	          var annotations = _getAnnotations(documentId);
	          annotations.push(annotation);
	
	          updateAnnotations(documentId, annotations);
	
	          console.log('addAnnotation2:', annotation);
	
	          resolve(annotation);
	        });
	      },
	      addAllAnnotations: function addAllAnnotations(documentId, annotations) {
	        return new Promise(function (resolve, reject) {
	          updateAnnotations(documentId, annotations);
	          resolve();
	        });
	      },
	      editAnnotation: function editAnnotation(documentId, annotationId, annotation) {
	        return new Promise(function (resolve, reject) {
	          var annotations = _getAnnotations(documentId);
	          annotations[findAnnotation(documentId, annotationId)] = annotation;
	          updateAnnotations(documentId, annotations);
	
	          resolve(annotation);
	        });
	      },
	      deleteAnnotation: function deleteAnnotation(documentId, annotationId) {
	        return new Promise(function (resolve, reject) {
	          var index = findAnnotation(documentId, annotationId);
	          if (index > -1) {
	            var annotations = _getAnnotations(documentId);
	            annotations.splice(index, 1);
	            updateAnnotations(documentId, annotations);
	          }
	
	          resolve(true);
	        });
	      },
	      deleteAnnotations: function deleteAnnotations(documentId) {
	        return new Promise(function (resolve, reject) {
	          var container = _getContainer();
	          delete container[documentId];
	          _saveContainer(container);
	          resolve();
	        });
	      },
	      getComments: function getComments(documentId, annotationId) {
	        return new Promise(function (resolve, reject) {
	          resolve(_getAnnotations(documentId).filter(function (i) {
	            return i.class === 'Comment' && i.annotation === annotationId;
	          }));
	        });
	      },
	      addComment: function addComment(documentId, annotationId, content) {
	        return new Promise(function (resolve, reject) {
	          var comment = {
	            class: 'Comment',
	            uuid: (0, _uuid2.default)(),
	            annotation: annotationId,
	            content: content
	          };
	
	          var annotations = _getAnnotations(documentId);
	          annotations.push(comment);
	          updateAnnotations(documentId, annotations);
	
	          resolve(comment);
	        });
	      },
	      deleteComment: function deleteComment(documentId, commentId) {
	        return new Promise(function (resolve, reject) {
	          _getAnnotations(documentId);
	          var index = -1;
	          var annotations = _getAnnotations(documentId);
	          for (var i = 0, l = annotations.length; i < l; i++) {
	            if (annotations[i].uuid === commentId) {
	              index = i;
	              break;
	            }
	          }
	
	          if (index > -1) {
	            annotations.splice(index, 1);
	            updateAnnotations(documentId, annotations);
	          }
	
	          resolve(true);
	        });
	      },
	      exportData: function exportData() {
	        return new Promise(function (resolve, reject) {
	
	          var dataExport = {};
	
	          // Set version.
	          dataExport.version = _version2.default;
	          console.log('version:', dataExport.version, _version2.default);
	
	          // Every documents.
	          var container = _getContainer();
	
	          var _loop = function _loop(documentId) {
	
	            if (!container[documentId].annotations || container[documentId].annotations.length === 0) {
	              return 'continue';
	            }
	
	            // Every annotations.
	            var indexRect = 1;
	            var indexSpan = 1;
	            var indexRel = 1;
	            var indexText = 1;
	            var annotations = {};
	            dataExport[documentId] = annotations;
	
	            console.log('annos:', container, documentId, container[documentId].annotations);
	
	            container[documentId].annotations.forEach(function (annotation) {
	
	              // Rect
	              if (annotation.type === 'area') {
	                annotations['rect-' + indexRect++] = [annotation.page, annotation.x, annotation.y, annotation.width, annotation.height, annotation.text];
	
	                // Highlight.
	              } else if (annotation.type === 'highlight') {
	                // rectangles.
	                var data = annotation.rectangles.map(function (rectangle) {
	                  return [rectangle.page, rectangle.x, rectangle.y, rectangle.width, rectangle.height];
	                });
	                // span text.
	                var text = '';
	                if (annotation.text) {
	                  // TODO use `getAnnotations` instead.
	                  var texts = container[documentId].annotations.filter(function (a) {
	                    return a.uuid === annotation.text;
	                  });
	                  if (texts.length > 0) {
	                    text = texts[0].content;
	                  }
	                }
	                data.push(text);
	
	                var key = 'span-' + indexSpan++;
	                annotations[key] = data;
	
	                // save tmporary for arrow.
	                annotation.key = key;
	                annotation.page = pageNumber;
	
	                // Arrow.
	              } else if (annotation.type === 'arrow') {
	                var _data = [annotation.page1, annotation.direction];
	                var highlight1s = container[documentId].annotations.filter(function (a) {
	                  return a.uuid === annotation.highlight1;
	                });
	                _data.push(highlight1s[0].key);
	                var highlight2s = container[documentId].annotations.filter(function (a) {
	                  return a.uuid === annotation.highlight2;
	                });
	                _data.push(highlight2s[0].key);
	                var _texts = container[documentId].annotations.filter(function (a) {
	                  return a.uuid === annotation.text;
	                });
	                if (_texts.length > 0) {
	                  _data.push(_texts[0].content);
	                } else {
	                  _data.push('');
	                }
	                annotations['rel-' + indexRel++] = _data;
	
	                // Textbox independent.
	              } else if (annotation.type === 'textbox') {
	
	                var rels = container[documentId].annotations.filter(function (a) {
	                  // relation for arrow or highlight.
	                  return a.text === annotation.uuid;
	                });
	                if (rels.length === 0) {
	                  annotations['text-' + indexText++] = [annotation.page, annotation.x, annotation.y, annotation.content];
	                }
	              }
	            });
	          };
	
	          for (var documentId in container) {
	            var _ret = _loop(documentId);
	
	            if (_ret === 'continue') continue;
	          }
	
	          resolve(dataExport);
	        });
	      },
	      importAnnotations: function importAnnotations(data) {
	        return new Promise(function (resolve, reject) {
	          console.log('importAnnotations:', data);
	
	          var containers = data.annotations.map(function (a, i) {
	
	            var color = data.colors[i];
	            var isPrimary = i === data.primary;
	            var visible = data.visibilities[i];
	
	            if (visible) {
	              return _createContainerFromJson2(a, color, isPrimary);
	            }
	          }).filter(function (c) {
	            return c;
	          });
	
	          console.log('containers:', containers);
	
	          _saveContainers(containers);
	
	          resolve(true);
	        });
	      },
	      importData: function importData(json) {
	        return new Promise(function (resolve, reject) {
	
	          // Delete version.
	          delete json.version;
	
	          var container = _createContainerFromJson(json);
	
	          _saveContainer(container);
	
	          resolve();
	        });
	      },
	      importDataSecondary: function importDataSecondary(jsonArray) {
	        return new Promise(function (resolve, reject) {
	
	          var containers = jsonArray.map(function (json, index) {
	            return _createContainerFromJson(json, true, index);
	          });
	
	          _saveSecondaryContainer(containers);
	
	          resolve();
	        });
	      },
	      findAnnotations: function findAnnotations(documentId) {
	        var criteria = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	        return new Promise(function (resolve, reject) {
	          var annotations = _getAnnotations(documentId).filter(function (annotation) {
	            var flg = true;
	            for (var key in criteria) {
	              var value = criteria[key];
	              if (annotation[key] !== value) {
	                flg = false;
	              }
	            }
	            return flg;
	          });
	          resolve(annotations);
	        });
	      }
	    }));
	  }
	
	  return PdfannoStoreAdapter;
	}(_StoreAdapter3.default);
	
	exports.default = PdfannoStoreAdapter;
	
	
	function _createContainerFromJson2(json, color, isPrimary) {
	
	  if (!json) {
	    return null;
	  }
	
	  var readOnly = !isPrimary;
	
	  var container = {};
	
	  container.isPrimary = isPrimary;
	
	  for (var documentId in json) {
	
	    var _annotations = [];
	    container[documentId] = { annotations: _annotations };
	
	    var _loop2 = function _loop2(key) {
	
	      var data = json[documentId][key];
	
	      // Rect.
	      if (key.indexOf('rect') === 0) {
	        _annotations.push({
	          class: 'Annotation',
	          type: 'area',
	          uuid: (0, _uuid2.default)(),
	          page: data[0],
	          x: data[1],
	          y: data[2],
	          width: data[3],
	          height: data[4],
	          text: data[5],
	          readOnly: readOnly,
	          color: color
	        });
	
	        // Highlight.
	      } else if (key.indexOf('span') === 0) {
	        // rectangles.
	        var rectangles = data.slice(0, data.length - 1).map(function (d) {
	          return {
	            page: d[0],
	            x: d[1],
	            y: d[2],
	            width: d[3],
	            height: d[4]
	          };
	        });
	        // span text.
	        var spanText = data[data.length - 1];
	        var textId = null;
	        if (spanText) {
	          textId = (0, _uuid2.default)();
	          var svg = document.querySelector('.annotationLayer');
	
	          var x = rectangles[0].x;
	          var y = rectangles[0].y - 20; // 20 = circle'radius(3px) + input height(14px) + α
	
	          var _pageNumber = data[0][0];
	
	          _annotations.push({
	            class: 'Annotation',
	            type: 'textbox',
	            uuid: textId,
	            page: _pageNumber,
	            x: x,
	            y: y,
	            content: spanText,
	            readOnly: readOnly,
	            color: color
	          });
	        }
	        _annotations.push(_defineProperty({
	          class: 'Annotation',
	          type: 'highlight',
	          uuid: (0, _uuid2.default)(),
	          page: data[0][0],
	          color: '#FFFF00', // TODO なくてもOK？
	          rectangles: rectangles,
	          text: textId,
	          key: key, // tmp for arrow.
	          readOnly: readOnly
	        }, 'color', color));
	
	        // Text Independent.
	      } else if (key.indexOf('text') === 0) {
	        _annotations.push({
	          class: 'Annotation',
	          type: 'textbox',
	          uuid: (0, _uuid2.default)(),
	          page: data[0],
	          x: data[1],
	          y: data[2],
	          content: data[3],
	          readOnly: readOnly,
	          color: color
	        });
	
	        // Arrow.
	      } else if (key.indexOf('rel') === 0) {
	
	        // Find highlights.
	        var highlight1s = _annotations.filter(function (a) {
	          return a.key === data[2];
	        });
	        var highlight1 = highlight1s[0];
	        var highlight2s = _annotations.filter(function (a) {
	          return a.key === data[3];
	        });
	        var highlight2 = highlight2s[0];
	
	        // Specify startPosition and endPosition.
	        var x1 = highlight1.rectangles[0].x;
	        var y1 = highlight1.rectangles[0].y - 5;
	        var x2 = highlight2.rectangles[0].x;
	        var y2 = highlight2.rectangles[0].y - 5;
	
	        var page1 = highlight1.rectangles[0].page;
	        var page2 = highlight2.rectangles[0].page;
	
	        var textPage = page1;
	
	        // Specify textbox position.
	        // let svg = document.querySelector('.annotationLayer');
	        var _svg = document.getElementById('annoLayer'); // TODO make it const.
	        var p = (0, _utils.scaleUp)(_svg, { x1: x1, y1: y1, x2: x2, y2: y2 });
	        var rect = _svg.getBoundingClientRect();
	        p.x1 -= rect.left;
	        p.y1 -= rect.top;
	        p.x2 -= rect.left;
	        p.y2 -= rect.top;
	        var textPosition = (0, _utils.scaleDown)(_svg, (0, _relation.getRelationTextPosition)(_svg, p.x1, p.y1, p.x2, p.y2));
	
	        if (page1 !== page2) {
	
	          console.log('y1,y2=', y1, y2, page1, page2);
	
	          var y1Tmp = convertFromExportY(page1, y1);
	          var y2Tmp = convertFromExportY(page2, y2);
	
	          console.log('y1,y2=', y1Tmp, y2Tmp);
	
	          // Specify textbox position.
	          // let svg = document.querySelector('.annotationLayer');
	          var _svg2 = document.getElementById('annoLayer'); // TODO make it const.
	          var _p = (0, _utils.scaleUp)(_svg2, { x1: x1, y1Tmp: y1Tmp, x2: x2, y2Tmp: y2Tmp });
	          var _rect = _svg2.getBoundingClientRect();
	          _p.x1 -= _rect.left;
	          _p.y1Tmp -= _rect.top;
	          _p.x2 -= _rect.left;
	          _p.y2Tmp -= _rect.top;
	          textPosition = (0, _utils.scaleDown)(_svg2, (0, _relation.getRelationTextPosition)(_svg2, _p.x1, _p.y1Tmp, _p.x2, _p.y2Tmp));
	
	          var _convertToExportY = convertToExportY(textPosition.y),
	              _y = _convertToExportY.y,
	              _pageNumber3 = _convertToExportY.pageNumber;
	
	          textPosition.y = _y;
	          textPage = _pageNumber3;
	        }
	
	        // Add textbox and get the uuid of if.
	        var _textId = null;
	        var textContent = data[4];
	        if (textContent) {
	
	          _textId = (0, _uuid2.default)();
	          _annotations.push({
	            class: 'Annotation',
	            type: 'textbox',
	            uuid: _textId,
	            page: textPage,
	            x: textPosition.x,
	            y: textPosition.y,
	            content: textContent,
	            readOnly: readOnly,
	            color: color
	          });
	        }
	
	        var _pageNumber2 = data[0];
	
	        // Add arrow.
	        _annotations.push(_defineProperty({
	          class: 'Annotation',
	          type: 'arrow',
	          direction: data[1],
	          uuid: (0, _uuid2.default)(),
	          page: data[0],
	          x1: x1,
	          y1: y1,
	          x2: x2,
	          y2: y2,
	          page1: page1,
	          page2: page2,
	          text: _textId,
	          highlight1: highlight1.uuid,
	          highlight2: highlight2.uuid,
	          color: "FF0000", // TODO 要る？
	          readOnly: readOnly
	        }, 'color', color));
	      }
	    };
	
	    for (var key in json[documentId]) {
	      _loop2(key);
	    }
	  }
	
	  return container;
	}
	
	function _createContainerFromJson(json) {
	  var readOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	
	  var container = {};
	
	  for (var documentId in json) {
	
	    var _annotations2 = [];
	    container[documentId] = { annotations: _annotations2 };
	
	    var _loop3 = function _loop3(key) {
	
	      var data = json[documentId][key];
	
	      // Rect.
	      if (key.indexOf('rect') === 0) {
	        _annotations2.push({
	          class: 'Annotation',
	          type: 'area',
	          uuid: (0, _uuid2.default)(),
	          page: data[0],
	          x: data[1],
	          y: data[2],
	          width: data[3],
	          height: data[4],
	          readOnly: readOnly,
	          seq: index
	        });
	
	        // Highlight.
	      } else if (key.indexOf('span') === 0) {
	        // rectangles.
	        var rectangles = data.slice(0, data.length - 1).map(function (d) {
	          return {
	            page: d[0],
	            x: d[1],
	            y: d[2],
	            width: d[3],
	            height: d[4]
	          };
	        });
	        // span text.
	        var spanText = data[data.length - 1];
	        var textId = null;
	        if (spanText) {
	          textId = (0, _uuid2.default)();
	          var svg = document.querySelector('.annotationLayer');
	
	          var x = rectangles[0].x;
	          var y = rectangles[0].y - 20; // 20 = circle'radius(3px) + input height(14px) + α
	
	          var _pageNumber4 = data[0][0];
	
	          _annotations2.push({
	            class: 'Annotation',
	            type: 'textbox',
	            uuid: textId,
	            page: _pageNumber4,
	            x: x,
	            y: y,
	            content: spanText,
	            readOnly: readOnly,
	            seq: index
	          });
	        }
	        _annotations2.push({
	          class: 'Annotation',
	          type: 'highlight',
	          uuid: (0, _uuid2.default)(),
	          page: data[0][0],
	          color: '#FFFF00', // TODO なくてもOK？
	          rectangles: rectangles,
	          text: textId,
	          key: key, // tmp for arrow.
	          readOnly: readOnly,
	          seq: index
	        });
	
	        // Text Independent.
	      } else if (key.indexOf('text') === 0) {
	        _annotations2.push({
	          class: 'Annotation',
	          type: 'textbox',
	          uuid: (0, _uuid2.default)(),
	          page: data[0],
	          x: data[1],
	          y: data[2],
	          content: data[3],
	          readOnly: readOnly,
	          seq: index
	        });
	
	        // Arrow.
	      } else if (key.indexOf('rel') === 0) {
	
	        // Find highlights.
	        var highlight1s = _annotations2.filter(function (a) {
	          return a.key === data[2];
	        });
	        var highlight1 = highlight1s[0];
	        var highlight2s = _annotations2.filter(function (a) {
	          return a.key === data[3];
	        });
	        var highlight2 = highlight2s[0];
	
	        // Specify startPosition and endPosition.
	        var x1 = highlight1.rectangles[0].x;
	        var y1 = highlight1.rectangles[0].y - 5;
	        var x2 = highlight2.rectangles[0].x;
	        var y2 = highlight2.rectangles[0].y - 5;
	
	        var page1 = highlight1.rectangles[0].page;
	        var page2 = highlight2.rectangles[0].page;
	
	        var textPage = page1;
	
	        // Specify textbox position.
	        // let svg = document.querySelector('.annotationLayer');
	        var _svg3 = document.getElementById('annoLayer'); // TODO make it const.
	        var p = (0, _utils.scaleUp)(_svg3, { x1: x1, y1: y1, x2: x2, y2: y2 });
	        var rect = _svg3.getBoundingClientRect();
	        p.x1 -= rect.left;
	        p.y1 -= rect.top;
	        p.x2 -= rect.left;
	        p.y2 -= rect.top;
	        var textPosition = (0, _utils.scaleDown)(_svg3, (0, _relation.getRelationTextPosition)(_svg3, p.x1, p.y1, p.x2, p.y2));
	
	        if (page1 !== page2) {
	
	          console.log('y1,y2=', y1, y2, page1, page2);
	
	          var y1Tmp = convertFromExportY(page1, y1);
	          var y2Tmp = convertFromExportY(page2, y2);
	
	          console.log('y1,y2=', y1Tmp, y2Tmp);
	
	          // Specify textbox position.
	          // let svg = document.querySelector('.annotationLayer');
	          var _svg4 = document.getElementById('annoLayer'); // TODO make it const.
	          var _p2 = (0, _utils.scaleUp)(_svg4, { x1: x1, y1Tmp: y1Tmp, x2: x2, y2Tmp: y2Tmp });
	          var _rect2 = _svg4.getBoundingClientRect();
	          _p2.x1 -= _rect2.left;
	          _p2.y1Tmp -= _rect2.top;
	          _p2.x2 -= _rect2.left;
	          _p2.y2Tmp -= _rect2.top;
	          textPosition = (0, _utils.scaleDown)(_svg4, (0, _relation.getRelationTextPosition)(_svg4, _p2.x1, _p2.y1Tmp, _p2.x2, _p2.y2Tmp));
	
	          var _convertToExportY2 = convertToExportY(textPosition.y),
	              _y2 = _convertToExportY2.y,
	              _pageNumber6 = _convertToExportY2.pageNumber;
	
	          textPosition.y = _y2;
	          textPage = _pageNumber6;
	        }
	
	        // Add textbox and get the uuid of if.
	        var _textId2 = null;
	        var textContent = data[4];
	        if (textContent) {
	
	          _textId2 = (0, _uuid2.default)();
	          _annotations2.push({
	            class: 'Annotation',
	            type: 'textbox',
	            uuid: _textId2,
	            page: textPage,
	            x: textPosition.x,
	            y: textPosition.y,
	            content: textContent,
	            readOnly: readOnly,
	            seq: index
	          });
	        }
	
	        var _pageNumber5 = data[0];
	
	        // Add arrow.
	        _annotations2.push({
	          class: 'Annotation',
	          type: 'arrow',
	          direction: data[1],
	          uuid: (0, _uuid2.default)(),
	          page: data[0],
	          x1: x1,
	          y1: y1,
	          x2: x2,
	          y2: y2,
	          page1: page1,
	          page2: page2,
	          text: _textId2,
	          highlight1: highlight1.uuid,
	          highlight2: highlight2.uuid,
	          color: "FF0000", // TODO 要る？
	          readOnly: readOnly,
	          seq: index
	        });
	      }
	    };
	
	    for (var key in json[documentId]) {
	      _loop3(key);
	    }
	  }
	
	  return container;
	}
	
	function getPageSize() {
	  var viewBox = PDFView.pdfViewer.getPageView(0).viewport.viewBox;
	  var size = { width: viewBox[2], height: viewBox[3] };
	  return size;
	}
	
	function transformToRenderCoordinate(annotation) {
	
	  // console.log('transformToRenderCoordinate:', annotation);
	
	  var _type = 'render';
	
	  if (annotation.coords === _type) {
	    return annotation;
	  }
	
	  annotation.coords = _type;
	
	  // Copy for avoiding sharing.
	  annotation = (0, _deepAssign2.default)({}, annotation);
	
	  if (annotation.y) {
	    annotation.y = convertFromExportY(annotation.page, annotation.y);
	  }
	
	  if (annotation.y1) {
	    annotation.y1 = convertFromExportY(annotation.page1, annotation.y1);
	  }
	
	  if (annotation.y2) {
	    annotation.y2 = convertFromExportY(annotation.page2, annotation.y2);
	  }
	
	  if (annotation.rectangles) {
	    // Copy for avoiding sharing.
	    annotation.rectangles = annotation.rectangles.map(function (a) {
	      return (0, _deepAssign2.default)({}, a);
	    });
	    annotation.rectangles.forEach(function (r) {
	      r.y = convertFromExportY(r.page, r.y);
	    });
	  }
	
	  return annotation;
	}
	
	function transformFromRenderCoordinate(annotation) {
	
	  var _type = 'saveData';
	
	  if (annotation.coords === _type) {
	    console.log('skip: ', annotation);
	    return annotation;
	  }
	
	  // Copy for avoiding sharing.
	  annotation = (0, _deepAssign2.default)({}, annotation);
	
	  annotation.coords = _type;
	
	  if (annotation.y) {
	    var _convertToExportY3 = convertToExportY(annotation.y),
	        y = _convertToExportY3.y,
	        _pageNumber7 = _convertToExportY3.pageNumber;
	
	    annotation.y = y;
	    annotation.page = _pageNumber7;
	  }
	
	  if (annotation.y1) {
	    var _convertToExportY4 = convertToExportY(annotation.y1),
	        _y3 = _convertToExportY4.y,
	        _pageNumber8 = _convertToExportY4.pageNumber;
	
	    annotation.y1 = _y3;
	    annotation.page1 = _pageNumber8;
	  }
	
	  if (annotation.y2) {
	    var _convertToExportY5 = convertToExportY(annotation.y2),
	        _y4 = _convertToExportY5.y,
	        _pageNumber9 = _convertToExportY5.pageNumber;
	
	    annotation.y2 = _y4;
	    annotation.page2 = _pageNumber9;
	  }
	
	  if (annotation.rectangles) {
	    // Copy for avoiding sharing.
	    annotation.rectangles = annotation.rectangles.map(function (a) {
	      return (0, _deepAssign2.default)({}, a);
	    });
	    annotation.rectangles.forEach(function (r) {
	      var _convertToExportY6 = convertToExportY(r.y),
	          y = _convertToExportY6.y,
	          pageNumber = _convertToExportY6.pageNumber;
	
	      r.y = y;
	      r.page = pageNumber;
	
	      console.log('rec:', r.y, y, pageNumber);
	    });
	  }
	
	  return annotation;
	}
	
	function _getContainers() {
	  var containers = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY2) || '[]');
	  return containers;
	}
	
	function _getContainer() {
	
	  var containers = _getContainers().filter(function (c) {
	    return c.isPrimary;
	  });
	
	  if (containers.length > 0) {
	    return containers[0];
	  } else {
	    return {};
	  }
	}
	
	function _getSecondaryContainers() {
	
	  var containers = _getContainers().filter(function (c) {
	    return !c.isPrimary;
	  });
	
	  if (containers.length > 0) {
	    return containers;
	  } else {
	    return [];
	  }
	
	  // let containers = localStorage.getItem(LOCALSTORAGE_KEY_SECONDARY) || '[]';
	  // return JSON.parse(containers);
	}
	
	function _saveContainer(container) {
	
	  container.isPrimary = true;
	
	  var containers = _getContainers().filter(function (c) {
	    return c.isPrimary === false;
	  });
	
	  containers = containers.concat([container]);
	
	  _saveContainers(containers);
	
	  // localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(container));
	}
	
	function _saveContainers(containers) {
	  localStorage.setItem(LOCALSTORAGE_KEY2, JSON.stringify(containers));
	}
	
	function _saveSecondaryContainer(containers) {
	  localStorage.setItem(LOCALSTORAGE_KEY_SECONDARY, JSON.stringify(containers));
	}
	
	function _getAnnotations(documentId) {
	  // Primary annotation.
	  var container = _getContainer();
	  var annotations = (container[documentId] || {}).annotations || [];
	
	  // transform coordinate system.
	  annotations = annotations.map(function (a) {
	    return transformToRenderCoordinate(a);
	  });
	
	  return annotations;
	}
	
	function _getSecondaryAnnotations(documentId) {
	
	  var annotations = [];
	
	  var containers = _getSecondaryContainers();
	
	  containers.forEach(function (container) {
	    var tmpAnnotations = (container[documentId] || {}).annotations;
	    if (tmpAnnotations) {
	      annotations = annotations.concat(tmpAnnotations);
	    }
	  });
	
	  // transform coordinate system.
	  annotations = annotations.map(function (a) {
	    return transformToRenderCoordinate(a);
	  });
	
	  return annotations;
	}
	
	function updateAnnotations(documentId, annotations) {
	
	  // Transform coordinate system.
	  annotations = annotations.map(function (a) {
	    return transformFromRenderCoordinate(a);
	  });
	
	  var viewBox = PDFView.pdfViewer.getPageView(0).viewport.viewBox;
	
	  // TODO remove.
	  var meta = { w: viewBox[2], h: viewBox[3] };
	
	  var container = _getContainer();
	  container[documentId] = { meta: meta, annotations: annotations };
	  _saveContainer(container);
	
	  // Notifiy.
	  var event = document.createEvent('CustomEvent');
	  event.initCustomEvent('annotationUpdated', true, true, {});
	  window.dispatchEvent(event);
	}
	
	function findAnnotation(documentId, annotationId) {
	  var index = -1;
	  var annotations = _getAnnotations(documentId);
	  for (var i = 0, l = annotations.length; i < l; i++) {
	    if (annotations[i].uuid === annotationId) {
	      index = i;
	      break;
	    }
	  }
	  return index;
	}
	
	var paddingTop = 0;
	var paddingBetweenPages = 9;
	
	function convertToExportY(y, meta) {
	
	  meta = getPageSize();
	
	  y -= paddingTop;
	
	  var pageNumber = Math.floor(y / meta.height) + 1;
	  var yInPage = y - (pageNumber - 1) * (meta.height + paddingBetweenPages);
	
	  return { pageNumber: pageNumber, y: yInPage };
	}
	
	function convertFromExportY(pageNumber, yInPage, meta) {
	
	  meta = getPageSize();
	
	  var y = yInPage + paddingTop;
	
	  y += (pageNumber - 1) * (meta.height + paddingBetweenPages);
	
	  return y;
	}
	
	var paddingLeft = 0;
	
	function convertToExportX(x, meta) {
	  return x - paddingLeft;
	}
	function convertFromExportX(x, meta) {
	  return x + paddingLeft;
	}
	module.exports = exports['default'];

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var isObj = __webpack_require__(18);
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;
	
	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Sources cannot be null or undefined');
		}
	
		return Object(val);
	}
	
	function assignKey(to, from, key) {
		var val = from[key];
	
		if (val === undefined || val === null) {
			return;
		}
	
		if (hasOwnProperty.call(to, key)) {
			if (to[key] === undefined || to[key] === null) {
				throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
			}
		}
	
		if (!hasOwnProperty.call(to, key) || !isObj(val)) {
			to[key] = val;
		} else {
			to[key] = assign(Object(to[key]), from[key]);
		}
	}
	
	function assign(to, from) {
		if (to === from) {
			return to;
		}
	
		from = Object(from);
	
		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				assignKey(to, from, key);
			}
		}
	
		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(from);
	
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					assignKey(to, from, symbols[i]);
				}
			}
		}
	
		return to;
	}
	
	module.exports = function deepAssign(target) {
		target = toObject(target);
	
		for (var s = 1; s < arguments.length; s++) {
			assign(target, arguments[s]);
		}
	
		return target;
	};


/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';
	module.exports = function (x) {
		var type = typeof x;
		return x !== null && (type === 'object' || type === 'function');
	};


/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.findBezierControlPoint = findBezierControlPoint;
	exports.getRelationTextPosition = getRelationTextPosition;
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
	function findBezierControlPoint(x1, y1, x2, y2) {
	
	  var DISTANCE = 30;
	
	  // vertical line.
	  if (x1 === x2) {
	    return {
	      x: x1,
	      y: (y1 + y2) / 2
	    };
	  }
	
	  // horizontal line.
	  if (y1 === y2) {
	    return {
	      x: (x1 + x2) / 2,
	      y: y1 - DISTANCE
	    };
	  }
	
	  var center = {
	    x: (x1 + x2) / 2,
	    y: (y1 + y2) / 2
	  };
	
	  var gradient = (y1 - y2) / (x1 - x2);
	  gradient = -1 / gradient;
	
	  var theta = Math.atan(gradient);
	  var deltaX = Math.cos(theta) * DISTANCE;
	  var deltaY = Math.sin(theta) * DISTANCE;
	
	  if (x1 < x2) {
	    // right top quadrant.
	    if (y1 > y2) {
	      return {
	        x: center.x - Math.abs(deltaX),
	        y: center.y - Math.abs(deltaY)
	      };
	      // right bottom quadrant.
	    } else {
	      return {
	        x: center.x + Math.abs(deltaX),
	        y: center.y - Math.abs(deltaY)
	      };
	    }
	  } else {
	    // left top quadrant.
	    if (y1 > y2) {
	      return {
	        x: center.x + Math.abs(deltaX),
	        y: center.y - Math.abs(deltaY)
	      };
	      // left bottom quadrant.
	    } else {
	      return {
	        x: center.x - Math.abs(deltaX),
	        y: center.y - Math.abs(deltaY)
	      };
	    }
	  }
	}
	
	function getRelationTextPosition(svg, x1, y1, x2, y2) {
	
	  var textPosition = findBezierControlPoint(x1, y1, x2, y2);
	
	  var rect = svg.getBoundingClientRect();
	  textPosition.x += rect.left;
	  textPosition.y += rect.top;
	
	  if (x1 < x2) {
	    // right top quadrant.
	    if (y1 > y2) {
	      textPosition.x += 10;
	      textPosition.y -= 20;
	      // right bottom quadrant.
	    } else {
	      textPosition.x += 10;
	      textPosition.y -= 10;
	    }
	  } else {
	    // left top quadrant.
	    if (y1 > y2) {
	      textPosition.x += 10;
	      textPosition.y -= 20;
	      // left bottom quadrant.
	    } else {
	      textPosition.x += 10;
	      textPosition.y += 10;
	    }
	  }
	
	  return textPosition;
	}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var packageJson = __webpack_require__(21);
	/**
	 * Paper Anno Version.
	 * This is overwritten at build.
	 */
	var ANNO_VERSION = packageJson.version;
	exports.default = ANNO_VERSION;
	module.exports = exports["default"];

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = {
		"name": "paperanno",
		"version": "0.0.1",
		"description": "",
		"main": "index.js",
		"scripts": {
			"anno:prepare": "gulp prepare",
			"anno:build": "npm run anno:prepare && webpack",
			"anno:watch": "npm run anno:prepare && webpack-dev-server --inline",
			"anno:publish": "npm run anno:build && gulp publish"
		},
		"repository": {
			"type": "git",
			"url": "git+https://github.com/paperai/paperanno"
		},
		"author": "hshindo, yoheiMune",
		"license": "MIT",
		"bugs": {
			"url": "https://github.com/paperai/paperanno/issues"
		},
		"homepage": "https://github.com/paperai/paperanno#readme",
		"devDependencies": {
			"babel-cli": "^6.14.0",
			"babel-core": "^6.21.0",
			"babel-loader": "6.2.4",
			"babel-plugin-add-module-exports": "^0.2.1",
			"babel-preset-es2015": "^6.6.0",
			"babel-preset-stage-1": "^6.16.0",
			"copy": "^0.3.0",
			"cpr": "^2.0.0",
			"css-loader": "^0.25.0",
			"deep-assign": "^2.0.0",
			"file-loader": "^0.9.0",
			"fs-extra": "^1.0.0",
			"gulp": "^3.9.1",
			"gulp-cli": "^1.2.2",
			"style-loader": "^0.13.1",
			"vinyl-source-stream": "^1.1.0",
			"webpack": "1.12.14",
			"webpack-dev-server": "^1.14.1"
		},
		"dependencies": {
			"axios": "^0.15.2",
			"create-stylesheet": "^0.3.0",
			"express": "^4.14.0",
			"jquery": "^3.1.1",
			"json-loader": "^0.5.4",
			"requirejs": "^2.3.2"
		}
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = render;
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	var _renderScreenReaderHints = __webpack_require__(34);
	
	var _renderScreenReaderHints2 = _interopRequireDefault(_renderScreenReaderHints);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Render the response from PDFJSAnnotate.getStoreAdapter().getAnnotations to SVG
	 *
	 * @param {SVGElement} svg The SVG element to render the annotations to
	 * @param {Object} viewport The page viewport data
	 * @param {Object} data The response from PDFJSAnnotate.getStoreAdapter().getAnnotations
	 * @return {Promise} Settled once rendering has completed
	 *  A settled Promise will be either:
	 *    - fulfilled: SVGElement
	 *    - rejected: Error
	 */
	function render(svg, viewport, data) {
	  return new Promise(function (resolve, reject) {
	    // Reset the content of the SVG
	    svg.innerHTML = '';
	    svg.setAttribute('data-pdf-annotate-container', true);
	    svg.setAttribute('data-pdf-annotate-viewport', JSON.stringify(viewport));
	    svg.removeAttribute('data-pdf-annotate-document');
	    svg.removeAttribute('data-pdf-annotate-page');
	
	    // If there's no data nothing can be done
	    if (!data) {
	      return resolve(svg);
	    }
	
	    svg.setAttribute('data-pdf-annotate-document', data.documentId);
	    svg.setAttribute('data-pdf-annotate-page', data.pageNumber);
	
	    // Make sure annotations is an array
	    if (!Array.isArray(data.annotations) || data.annotations.length === 0) {
	      return resolve(svg);
	    }
	
	    // Append annotation to svg
	    var elements = [];
	    data.annotations.forEach(function (a) {
	      elements.push((0, _appendChild2.default)(svg, a, viewport));
	    });
	
	    resolve(svg, elements);
	  });
	}
	module.exports = exports['default'];

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.transform = transform;
	exports.default = appendChild;
	
	var _objectAssign = __webpack_require__(24);
	
	var _objectAssign2 = _interopRequireDefault(_objectAssign);
	
	var _renderLine = __webpack_require__(25);
	
	var _renderLine2 = _interopRequireDefault(_renderLine);
	
	var _renderPath = __webpack_require__(28);
	
	var _renderPath2 = _interopRequireDefault(_renderPath);
	
	var _renderPoint = __webpack_require__(29);
	
	var _renderPoint2 = _interopRequireDefault(_renderPoint);
	
	var _renderRect = __webpack_require__(30);
	
	var _renderRect2 = _interopRequireDefault(_renderRect);
	
	var _renderText = __webpack_require__(32);
	
	var _renderText2 = _interopRequireDefault(_renderText);
	
	var _renderArrow = __webpack_require__(33);
	
	var _renderArrow2 = _interopRequireDefault(_renderArrow);
	
	var _renderCircle = __webpack_require__(31);
	
	var _renderCircle2 = _interopRequireDefault(_renderCircle);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// **extention**
	var isFirefox = /firefox/i.test(navigator.userAgent);
	
	/**
	 * Get the x/y translation to be used for transforming the annotations
	 * based on the rotation of the viewport.
	 *
	 * @param {Object} viewport The viewport data from the page
	 * @return {Object}
	 */
	function getTranslation(viewport) {
	  var x = void 0;
	  var y = void 0;
	
	  // Modulus 360 on the rotation so that we only
	  // have to worry about four possible values.
	  switch (viewport.rotation % 360) {
	    case 0:
	      x = y = 0;
	      break;
	    case 90:
	      x = 0;
	      y = viewport.width / viewport.scale * -1;
	      break;
	    case 180:
	      x = viewport.width / viewport.scale * -1;
	      y = viewport.height / viewport.scale * -1;
	      break;
	    case 270:
	      x = viewport.height / viewport.scale * -1;
	      y = 0;
	      break;
	  }
	
	  return { x: x, y: y };
	}
	
	/**
	 * Transform the rotation and scale of a node using SVG's native transform attribute.
	 *
	 * @param {Node} node The node to be transformed
	 * @param {Object} viewport The page's viewport data
	 * @return {Node}
	 */
	function transform(node, viewport) {
	  var trans = getTranslation(viewport);
	
	  // Let SVG natively transform the element
	  node.setAttribute('transform', 'scale(' + viewport.scale + ') rotate(' + viewport.rotation + ') translate(' + trans.x + ', ' + trans.y + ')');
	
	  // Manually adjust x/y for nested SVG nodes
	  if (!isFirefox && node.nodeName.toLowerCase() === 'svg') {
	    node.setAttribute('x', parseInt(node.getAttribute('x'), 10) * viewport.scale);
	    node.setAttribute('y', parseInt(node.getAttribute('y'), 10) * viewport.scale);
	
	    var x = parseInt(node.getAttribute('x', 10));
	    var y = parseInt(node.getAttribute('y', 10));
	    var width = parseInt(node.getAttribute('width'), 10);
	    var height = parseInt(node.getAttribute('height'), 10);
	    var path = node.querySelector('path');
	    var svg = path.parentNode;
	
	    // Scale width/height
	    [node, svg, path, node.querySelector('rect')].forEach(function (n) {
	      n.setAttribute('width', parseInt(n.getAttribute('width'), 10) * viewport.scale);
	      n.setAttribute('height', parseInt(n.getAttribute('height'), 10) * viewport.scale);
	    });
	
	    // Transform path but keep scale at 100% since it will be handled natively
	    transform(path, (0, _objectAssign2.default)({}, viewport, { scale: 1 }));
	
	    switch (viewport.rotation % 360) {
	      case 90:
	        node.setAttribute('x', viewport.width - y - width);
	        node.setAttribute('y', x);
	        svg.setAttribute('x', 1);
	        svg.setAttribute('y', 0);
	        break;
	      case 180:
	        node.setAttribute('x', viewport.width - x - width);
	        node.setAttribute('y', viewport.height - y - height);
	        svg.setAttribute('y', 2);
	        break;
	      case 270:
	        node.setAttribute('x', y);
	        node.setAttribute('y', viewport.height - x - height);
	        svg.setAttribute('x', -1);
	        svg.setAttribute('y', 0);
	        break;
	    }
	  }
	
	  return node;
	}
	
	/**
	 * Append an annotation as a child of an SVG.
	 *
	 * @param {SVGElement} svg The SVG element to append the annotation to
	 * @param {Object} annotation The annotation definition to render and append
	 * @param {Object} viewport The page's viewport data
	 * @return {SVGElement} A node that was created and appended by this function
	 */
	function appendChild(svg, annotation, viewport) {
	  if (!viewport) {
	    viewport = JSON.parse(svg.getAttribute('data-pdf-annotate-viewport'));
	  }
	
	  var child = void 0,
	      point = void 0;
	  switch (annotation.type) {
	    case 'area':
	    case 'highlight':
	    case 'boundingBox':
	      // **extension**
	      child = (0, _renderRect2.default)(annotation, svg);
	      break;
	    case 'strikeout':
	      child = (0, _renderLine2.default)(annotation, svg);
	      break;
	    case 'point':
	      child = (0, _renderPoint2.default)(annotation, svg);
	      break;
	    case 'textbox':
	      child = (0, _renderText2.default)(annotation, svg);
	      break;
	    case 'drawing':
	      child = (0, _renderPath2.default)(annotation, svg);
	      break;
	    case 'arrow':
	      child = (0, _renderArrow2.default)(annotation, svg);
	      break;
	    case 'circle':
	      child = (0, _renderCircle2.default)(annotation, svg);
	      break;
	  }
	
	  // If no type was provided for an annotation it will result in node being null.
	  // Skip appending/transforming if node doesn't exist.
	  if (child) {
	    // Set attributes
	    child.setAttribute('data-pdf-annotate-id', annotation.uuid);
	    child.setAttribute('data-pdf-annotate-type', annotation.type);
	    child.setAttribute('aria-hidden', true);
	    svg.appendChild(transform(child, viewport));
	  }
	
	  // console.log('appendChild:', child);
	
	  return child;
	}

/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;
	
	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}
	
		return Object(val);
	}
	
	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}
	
			// Detect buggy property enumeration order in older V8 versions.
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}
	
			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}
	
	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;
	
		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);
	
			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}
	
			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}
	
		return to;
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderLine;
	
	var _setAttributes = __webpack_require__(26);
	
	var _setAttributes2 = _interopRequireDefault(_setAttributes);
	
	var _normalizeColor = __webpack_require__(27);
	
	var _normalizeColor2 = _interopRequireDefault(_normalizeColor);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Create SVGLineElements from an annotation definition.
	 * This is used for anntations of type `strikeout`.
	 *
	 * @param {Object} a The annotation definition
	 * @return {SVGGElement} A group of all lines to be rendered
	 */
	function renderLine(a) {
	  var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	  (0, _setAttributes2.default)(group, {
	    stroke: (0, _normalizeColor2.default)(a.color || '#f00'),
	    strokeWidth: 1
	  });
	
	  a.rectangles.forEach(function (r) {
	    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	
	    (0, _setAttributes2.default)(line, {
	      x1: r.x,
	      y1: r.y,
	      x2: r.x + r.width,
	      y2: r.y
	    });
	
	    group.appendChild(line);
	  });
	
	  return group;
	}
	module.exports = exports['default'];

/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = setAttributes;
	var UPPER_REGEX = /[A-Z]/g;
	
	// Don't convert these attributes from camelCase to hyphenated-attributes
	var BLACKLIST = ['viewBox'];
	
	var keyCase = function keyCase(key) {
	  if (BLACKLIST.indexOf(key) === -1) {
	    key = key.replace(UPPER_REGEX, function (match) {
	      return '-' + match.toLowerCase();
	    });
	  }
	  return key;
	};
	
	/**
	 * Set attributes for a node from a map
	 *
	 * @param {Node} node The node to set attributes on
	 * @param {Object} attributes The map of key/value pairs to use for attributes
	 */
	function setAttributes(node, attributes) {
	  Object.keys(attributes).forEach(function (key) {
	    node.setAttribute(keyCase(key), attributes[key]);
	  });
	}
	module.exports = exports['default'];

/***/ },
/* 27 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = normalizeColor;
	var REGEX_HASHLESS_HEX = /^([a-f0-9]{6}|[a-f0-9]{3})$/i;
	
	/**
	 * Normalize a color value
	 *
	 * @param {String} color The color to normalize
	 * @return {String}
	 */
	function normalizeColor(color) {
	  if (REGEX_HASHLESS_HEX.test(color)) {
	    color = "#" + color;
	  }
	  return color;
	}
	module.exports = exports["default"];

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderPath;
	
	var _setAttributes = __webpack_require__(26);
	
	var _setAttributes2 = _interopRequireDefault(_setAttributes);
	
	var _normalizeColor = __webpack_require__(27);
	
	var _normalizeColor2 = _interopRequireDefault(_normalizeColor);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Create SVGPathElement from an annotation definition.
	 * This is used for anntations of type `drawing`.
	 *
	 * @param {Object} a The annotation definition
	 * @return {SVGPathElement} The path to be rendered
	 */
	function renderPath(a) {
	  var d = [];
	  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	
	  for (var i = 0, l = a.lines.length; i < l; i++) {
	    var p1 = a.lines[i];
	    var p2 = a.lines[i + 1];
	    if (p2) {
	      d.push('M' + p1[0] + ' ' + p1[1] + ' ' + p2[0] + ' ' + p2[1]);
	    }
	  }
	
	  (0, _setAttributes2.default)(path, {
	    d: d.join(' ') + 'Z',
	    stroke: (0, _normalizeColor2.default)(a.color || '#000'),
	    strokeWidth: a.width || 1,
	    fill: 'none'
	  });
	
	  return path;
	}
	module.exports = exports['default'];

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderPoint;
	
	var _setAttributes = __webpack_require__(26);
	
	var _setAttributes2 = _interopRequireDefault(_setAttributes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var SIZE = 25;
	var D = 'M499.968 214.336q-113.832 0 -212.877 38.781t-157.356 104.625 -58.311 142.29q0 62.496 39.897 119.133t112.437 97.929l48.546 27.9 -15.066 53.568q-13.392 50.778 -39.06 95.976 84.816 -35.154 153.45 -95.418l23.994 -21.204 31.806 3.348q38.502 4.464 72.54 4.464 113.832 0 212.877 -38.781t157.356 -104.625 58.311 -142.29 -58.311 -142.29 -157.356 -104.625 -212.877 -38.781z';
	
	/**
	 * Create SVGElement from an annotation definition.
	 * This is used for anntations of type `comment`.
	 *
	 * @param {Object} a The annotation definition
	 * @return {SVGElement} A svg to be rendered
	 */
	function renderPoint(a) {
	  var outerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	  var innerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	
	  (0, _setAttributes2.default)(outerSVG, {
	    width: SIZE,
	    height: SIZE,
	    x: a.x,
	    y: a.y
	  });
	
	  (0, _setAttributes2.default)(innerSVG, {
	    width: SIZE,
	    height: SIZE,
	    x: 0,
	    y: SIZE * 0.05 * -1,
	    viewBox: '0 0 1000 1000'
	  });
	
	  (0, _setAttributes2.default)(rect, {
	    width: SIZE,
	    height: SIZE,
	    stroke: '#000',
	    fill: '#ff0'
	  });
	
	  (0, _setAttributes2.default)(path, {
	    d: D,
	    strokeWidth: 50,
	    stroke: '#000',
	    fill: '#fff'
	  });
	
	  innerSVG.appendChild(path);
	  outerSVG.appendChild(rect);
	  outerSVG.appendChild(innerSVG);
	
	  return outerSVG;
	}
	module.exports = exports['default'];

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderRect;
	
	var _uuid = __webpack_require__(15);
	
	var _uuid2 = _interopRequireDefault(_uuid);
	
	var _setAttributes = __webpack_require__(26);
	
	var _setAttributes2 = _interopRequireDefault(_setAttributes);
	
	var _normalizeColor = __webpack_require__(27);
	
	var _normalizeColor2 = _interopRequireDefault(_normalizeColor);
	
	var _renderCircle = __webpack_require__(31);
	
	var _renderCircle2 = _interopRequireDefault(_renderCircle);
	
	var _renderText = __webpack_require__(32);
	
	var _renderText2 = _interopRequireDefault(_renderText);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var rectSecondaryColor = ['green', 'blue', 'purple'];
	var highlightSecondaryColor = ['green', 'blue', 'purple'];
	
	/**
	 * Create SVGRectElements from an annotation definition.
	 * This is used for anntations of type `area` and `highlight`.
	 *
	 * @param {Object} a The annotation definition
	 * @return {SVGGElement|SVGRectElement} A group of all rects to be rendered
	 */
	function renderRect(a, svg) {
	
	  if (a.type === 'highlight') {
	    return createHighlight(a, svg);
	  } else {
	    return createRectBox(a, svg);
	  }
	}
	
	function createHighlight(a, svg) {
	
	  var color = a.color;
	  if (!color) {
	    if (a.readOnly) {
	      color = highlightSecondaryColor[a.seq % highlightSecondaryColor.length];
	    } else {
	      color = '#FF0';
	    }
	  }
	
	  var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	  group.setAttribute('read-only', a.readOnly === true);
	  group.setAttribute('data-text', a.text);
	
	  a.rectangles.forEach(function (r) {
	    var rect = createRect(r);
	    rect.setAttribute('fill-opacity', 0.2);
	    rect.setAttribute('fill', color);
	    rect.classList.add('anno-highlight');
	    group.appendChild(rect);
	  });
	
	  var rect = a.rectangles[0];
	  var circle = (0, _renderCircle2.default)({
	    x: rect.x,
	    y: rect.y - _renderCircle.DEFAULT_RADIUS,
	    type: 'boundingCircle'
	  });
	  group.style.visibility = 'visible';
	  group.appendChild(circle);
	
	  return group;
	}
	
	function createRectBox(a, svg) {
	
	  // console.log('createRectBox:', a);
	
	  var color = a.color;
	  if (!color) {
	    if (a.readOnly) {
	      color = rectSecondaryColor[a.seq % rectSecondaryColor.length];
	    } else {
	      color = '#f00';
	    }
	  }
	
	  var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	  group.setAttribute('read-only', a.readOnly === true);
	  group.style.visibility = 'visible';
	
	  var rect = createRect(a);
	  (0, _setAttributes2.default)(rect, {
	    stroke: color,
	    strokeWidth: 1,
	    fill: 'none',
	    class: 'anno-rect'
	  });
	  group.appendChild(rect);
	
	  if (a.text) {
	
	    var textAnnotation = {
	      x: a.x,
	      y: a.y - 20,
	      color: color,
	      content: a.text
	    };
	    var text = (0, _renderText2.default)(textAnnotation, svg);
	    text.setAttribute('data-pdf-annotate-type', 'textbox');
	    group.appendChild(text);
	
	    text.setAttribute('data-rect-id', a.uuid);
	    var textId = (0, _uuid2.default)();
	    text.setAttribute('data-pdf-annotate-id', textId);
	    group.setAttribute('data-text-id', textId);
	  }
	
	  // svg.appendChild(group);
	
	  return group;
	  // return svg;
	}
	
	function createRect(r) {
	
	  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	  (0, _setAttributes2.default)(rect, {
	    x: r.x,
	    y: r.y,
	    width: r.width,
	    height: r.height
	  });
	
	  return rect;
	}
	module.exports = exports['default'];

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.DEFAULT_RADIUS = undefined;
	exports.default = renderCircle;
	
	var _setAttributes = __webpack_require__(26);
	
	var _setAttributes2 = _interopRequireDefault(_setAttributes);
	
	var _normalizeColor = __webpack_require__(27);
	
	var _normalizeColor2 = _interopRequireDefault(_normalizeColor);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var forEach = Array.prototype.forEach;
	
	var DEFAULT_RADIUS = exports.DEFAULT_RADIUS = 3;
	
	/**
	 * Create SVGLineElements from an annotation definition.
	 * This is used for anntations of type `circle`.
	 *
	 * @param {Object} a The annotation definition
	 * @return {SVGGElement} A group of all lines to be rendered
	 */
	function renderCircle(a) {
	  var _adjustPoint = adjustPoint(a.x, a.y, a.r || DEFAULT_RADIUS),
	      x = _adjustPoint.x,
	      y = _adjustPoint.y;
	
	  // <circle cx="100" cy="100" r="100"/>
	
	
	  var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	  (0, _setAttributes2.default)(circle, {
	    cx: x,
	    cy: y,
	    r: a.r || DEFAULT_RADIUS,
	    // fill: normalizeColor(a.color || '#f00'),
	    fill: 'blue'
	  });
	  if (a.type) {
	    circle.setAttribute('type', a.type);
	  }
	
	  circle.classList.add('anno-circle');
	
	  return circle;
	}
	
	function adjustPoint(x, y, radius) {
	
	  // Avoid overlapping.
	  var circles = document.querySelectorAll('svg [type="boundingCircle"]');
	
	  while (true) {
	
	    var good = true;
	    forEach.call(circles, function (circle) {
	      var x1 = parseFloat(circle.getAttribute('cx'));
	      var y1 = parseFloat(circle.getAttribute('cy'));
	      var r1 = parseFloat(circle.getAttribute('r'));
	
	      var distance1 = Math.pow(x - x1, 2) + Math.pow(y - y1, 2);
	      var distance2 = Math.pow(radius + r1, 2);
	      if (distance1 < distance2) {
	        good = false;
	      }
	    });
	
	    if (good) {
	      break;
	    }
	    y -= 1;
	  }
	
	  return { x: x, y: y };
	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderText;
	
	var _setAttributes = __webpack_require__(26);
	
	var _setAttributes2 = _interopRequireDefault(_setAttributes);
	
	var _normalizeColor = __webpack_require__(27);
	
	var _normalizeColor2 = _interopRequireDefault(_normalizeColor);
	
	var _renderCircle = __webpack_require__(31);
	
	var _renderCircle2 = _interopRequireDefault(_renderCircle);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Default font size for Text.
	 */
	var DEFAULT_FONT_SIZE = 12;
	
	/**
	 * Annotation colors for secondary annotations.
	 */
	var textSecondaryColor = ['green', 'blue', 'purple'];
	
	/**
	 * Calculate boundingClientRect that is needed for rendering text.
	 * 
	 * @param {String} text - A text to be renderd.
	 * @param {SVGElement} svg - svgHTMLElement to be used for rendering text.
	 * @return {Object} A boundingBox of text element.
	 */
	function getRect(text, svg) {
	  svg.appendChild(text);
	  var rect = text.getBoundingClientRect();
	  text.parentNode.removeChild(text);
	  return rect;
	}
	
	/**
	 * Create SVGTextElement from an annotation definition.
	 * This is used for anntations of type `textbox`.
	 *
	 * @param {Object} a The annotation definition
	 * @return {SVGTextElement} A text to be rendered
	 */
	function renderText(a, svg) {
	
	  var color = a.color;
	  if (!color) {
	    if (a.readOnly) {
	      color = textSecondaryColor[a.seq % textSecondaryColor.length];
	    } else {
	      color = '#F00';
	    }
	  }
	
	  // Text.
	  var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	  (0, _setAttributes2.default)(text, {
	    x: a.x,
	    y: a.y + parseInt(DEFAULT_FONT_SIZE, 10),
	    fill: color,
	    fontSize: DEFAULT_FONT_SIZE
	  });
	  text.innerHTML = a.content;
	
	  // Background.
	  var box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	  var rect = getRect(text, svg);
	  (0, _setAttributes2.default)(box, {
	    x: a.x,
	    y: a.y,
	    width: rect.width,
	    height: rect.height,
	    fill: '#FFFFFF',
	    class: 'anno-text'
	  });
	
	  // Group.
	  var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	  group.setAttribute('read-only', a.readOnly === true);
	  group.style.visibility = 'visible';
	
	  group.appendChild(box);
	  group.appendChild(text);
	  return group;
	}
	module.exports = exports['default'];

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderArrow;
	exports.createArrow = createArrow;
	
	var _setAttributes = __webpack_require__(26);
	
	var _setAttributes2 = _interopRequireDefault(_setAttributes);
	
	var _normalizeColor = __webpack_require__(27);
	
	var _normalizeColor2 = _interopRequireDefault(_normalizeColor);
	
	var _renderCircle = __webpack_require__(31);
	
	var _renderCircle2 = _interopRequireDefault(_renderCircle);
	
	var _relation = __webpack_require__(19);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var arrowSecondaryColor = ['green', 'blue', 'purple'];
	
	/**
	 * Create SVGGElements from an annotation definition.
	 * This is used for anntations of type `arrow`.
	 *
	 * @param {Object} a The annotation definition
	 * @return {SVGGElement} A group of an arrow to be rendered
	 */
	function renderArrow(a) {
	
	  var arrow = createArrow(a);
	  return arrow;
	}
	
	function createArrow(a) {
	  var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	
	
	  var color = a.color;
	  if (!color) {
	    if (a.readOnly) {
	      color = arrowSecondaryColor[a.seq % arrowSecondaryColor.length];
	    } else {
	      color = '#F00';
	    }
	  }
	
	  console.log('color:', color);
	
	  // <svg viewBox="0 0 200 200">
	  //     <marker id="m_ar" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="strokeWidth" preserveAspectRatio="none" markerWidth="2" markerHeight="3" orient="auto-start-reverse">
	  //         <polygon points="0,0 0,10 10,5" fill="red" id="ms"/>
	  //     </marker>
	  //     <path d="M50,50 h100" fill="none" stroke="black" stroke-width="10" marker-start="url(#m_ar)" marker-end="url(#m_ar)"/>
	  // </svg>
	
	  var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	  (0, _setAttributes2.default)(group, {
	    fill: color,
	    stroke: color,
	    'data-highlight1': a.highlight1,
	    'data-highlight2': a.highlight2,
	    'data-text': a.text
	  });
	  group.style.visibility = 'visible';
	  group.setAttribute('read-only', a.readOnly === true);
	
	  var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
	  (0, _setAttributes2.default)(marker, {
	    viewBox: "0 0 10 10",
	    markerWidth: 2,
	    markerHeight: 3,
	    fill: color,
	    id: 'arrowhead',
	    orient: "auto-start-reverse"
	  });
	  marker.setAttribute('refX', 5);
	  marker.setAttribute('refY', 5);
	  group.appendChild(marker);
	
	  var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
	  (0, _setAttributes2.default)(polygon, {
	    points: "0,0 0,10 10,5"
	  });
	  marker.appendChild(polygon);
	
	  // Find Control points.
	  var control = (0, _relation.findBezierControlPoint)(a.x1, a.y1, a.x2, a.y2);
	
	  // Create Outline.
	  var outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	  (0, _setAttributes2.default)(outline, {
	    d: 'M ' + a.x1 + ' ' + a.y1 + ' Q ' + control.x + ' ' + control.y + ' ' + a.x2 + ' ' + a.y2,
	    class: 'anno-arrow-outline'
	  });
	  group.appendChild(outline);
	
	  /*
	    <path d="M 25 25 Q 175 25 175 175" stroke="blue" fill="none"/>
	  */
	  var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	  (0, _setAttributes2.default)(arrow, {
	    d: 'M ' + a.x1 + ' ' + a.y1 + ' Q ' + control.x + ' ' + control.y + ' ' + a.x2 + ' ' + a.y2,
	    stroke: color,
	    strokeWidth: 1,
	    fill: 'none',
	    class: 'anno-arrow'
	  });
	
	  // Triangle for the end point.
	  if (a.direction === 'one-way' || a.direction === 'two-way') {
	    arrow.setAttribute('marker-end', 'url(#arrowhead)');
	  }
	
	  // Triangle for the start point.
	  if (a.direction === 'two-way') {
	    arrow.setAttribute('marker-start', 'url(#arrowhead)');
	  }
	
	  if (id) {
	    (0, _setAttributes2.default)(arrow, { id: id });
	  }
	
	  group.appendChild(arrow);
	
	  console.log('createArrow:', group);
	
	  return group;
	}
	
	function adjustStartEndPoint(annotation) {
	
	  // TODO
	  var RADIUS = 5;
	
	  var x1 = annotation.x1;
	  var y1 = annotation.y1;
	  var x2 = annotation.x2;
	  var y2 = annotation.y2;
	
	  function sign(val) {
	    return val >= 0 ? 1 : -1;
	  }
	
	  // Verticale.
	  if (x1 === x2) {
	    annotation.y2 += RADIUS * sign(y1 - y2);
	    return annotation;
	  }
	
	  // Horizonal.
	  if (y1 === y2) {
	    annotation.x2 += RADIUS * sign(x1 - x2);
	    return annotation;
	  }
	
	  var grad = (y1 - y2) / (x1 - x2);
	  var theta = Math.atan(grad);
	  annotation.x2 += RADIUS * Math.cos(theta) * sign(x1 - x2);
	  annotation.y2 += RADIUS * Math.sin(theta) * sign(y1 - y2);
	  return annotation;
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderScreenReaderHints;
	
	var _insertScreenReaderHint = __webpack_require__(35);
	
	var _insertScreenReaderHint2 = _interopRequireDefault(_insertScreenReaderHint);
	
	var _initEventHandlers = __webpack_require__(41);
	
	var _initEventHandlers2 = _interopRequireDefault(_initEventHandlers);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// TODO This is not the right place for this to live
	(0, _initEventHandlers2.default)();
	
	/**
	 * Insert hints into the DOM for screen readers.
	 *
	 * @param {Array} annotations The annotations that hints are inserted for
	 */
	function renderScreenReaderHints(annotations) {
	  annotations = Array.isArray(annotations) ? annotations : [];
	
	  // Insert hints for each type
	  Object.keys(SORT_TYPES).forEach(function (type) {
	    var sortBy = SORT_TYPES[type];
	    annotations.filter(function (a) {
	      return a.type === type;
	    }).sort(sortBy).forEach(function (a, i) {
	      return (0, _insertScreenReaderHint2.default)(a, i + 1);
	    });
	  });
	}
	
	// Sort annotations first by y, then by x.
	// This allows hints to be injected in the order they appear,
	// which makes numbering them easier.
	function sortByPoint(a, b) {
	  if (a.y < b.y) {
	    return a.x - b.x;
	  } else {
	    return 1;
	  }
	}
	
	// Sort annotation by it's first rectangle
	function sortByRectPoint(a, b) {
	  return sortByPoint(a.rectangles[0], b.rectangles[0]);
	}
	
	// Sort annotation by it's first line
	function sortByLinePoint(a, b) {
	  var lineA = a.lines[0];
	  var lineB = b.lines[0];
	  return sortByPoint({ x: lineA[0], y: lineA[1] }, { x: lineB[0], y: lineB[1] });
	}
	
	// Arrange supported types and associated sort methods
	var SORT_TYPES = {
	  'highlight': sortByRectPoint,
	  'strikeout': sortByRectPoint,
	  'drawing': sortByLinePoint,
	  'textbox': sortByPoint,
	  'point': sortByPoint,
	  'area': sortByPoint
	};
	module.exports = exports['default'];

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = insertScreenReaderHint;
	
	var _createScreenReaderOnly = __webpack_require__(36);
	
	var _createScreenReaderOnly2 = _interopRequireDefault(_createScreenReaderOnly);
	
	var _insertElementWithinChildren = __webpack_require__(37);
	
	var _insertElementWithinChildren2 = _interopRequireDefault(_insertElementWithinChildren);
	
	var _insertElementWithinElement = __webpack_require__(38);
	
	var _insertElementWithinElement2 = _interopRequireDefault(_insertElementWithinElement);
	
	var _renderScreenReaderComments = __webpack_require__(39);
	
	var _renderScreenReaderComments2 = _interopRequireDefault(_renderScreenReaderComments);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Annotation types that support comments
	var COMMENT_TYPES = ['highlight', 'point', 'area'];
	
	/**
	 * Insert a hint into the DOM for screen readers for a specific annotation.
	 *
	 * @param {Object} annotation The annotation to insert a hint for
	 * @param {Number} num The number of the annotation out of all annotations of the same type
	 */
	function insertScreenReaderHint(annotation) {
	  var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	
	  switch (annotation.type) {
	    case 'highlight':
	    case 'strikeout':
	      var rects = annotation.rectangles;
	      var first = rects[0];
	      var last = rects[rects.length - 1];
	
	      (0, _insertElementWithinElement2.default)((0, _createScreenReaderOnly2.default)('Begin ' + annotation.type + ' annotation ' + num, annotation.uuid), first.x, first.y, annotation.page, true);
	
	      (0, _insertElementWithinElement2.default)((0, _createScreenReaderOnly2.default)('End ' + annotation.type + ' annotation ' + num, annotation.uuid + '-end'), last.x + last.width, last.y, annotation.page, false);
	      break;
	
	    case 'textbox':
	    case 'point':
	      var text = annotation.type === 'textbox' ? ' (content: ' + annotation.content + ')' : '';
	
	      (0, _insertElementWithinChildren2.default)((0, _createScreenReaderOnly2.default)(annotation.type + ' annotation ' + num + text, annotation.uuid), annotation.x, annotation.y, annotation.page);
	      break;
	
	    case 'drawing':
	    case 'area':
	      var x = typeof annotation.x !== 'undefined' ? annotation.x : annotation.lines[0][0];
	      var y = typeof annotation.y !== 'undefined' ? annotation.y : annotation.lines[0][1];
	
	      (0, _insertElementWithinChildren2.default)((0, _createScreenReaderOnly2.default)('Unlabeled drawing', annotation.uuid), x, y, annotation.page);
	      break;
	  }
	
	  // Include comments in screen reader hint
	  if (COMMENT_TYPES.includes(annotation.type)) {
	    (0, _renderScreenReaderComments2.default)(annotation.documentId, annotation.uuid);
	  }
	}
	module.exports = exports['default'];

/***/ },
/* 36 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = createScreenReaderOnly;
	/**
	 * Create a node that is only visible to screen readers
	 *
	 * @param {String} content The text content that should be read by screen reader
	 * @param {String} [annotationId] The ID of the annotation assocaited
	 * @return {Element} An Element that is only visible to screen readers
	 */
	function createScreenReaderOnly(content, annotationId) {
	  var node = document.createElement('div');
	  var text = document.createTextNode(content);
	  node.appendChild(text);
	  node.setAttribute('id', 'pdf-annotate-screenreader-' + annotationId);
	  node.style.position = 'absolute';
	  node.style.left = '-10000px';
	  node.style.top = 'auto';
	  node.style.width = '1px';
	  node.style.height = '1px';
	  node.style.overflow = 'hidden';
	  return node;
	}
	module.exports = exports['default'];

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = insertElementWithinChildren;
	
	var _insertElementWithinElement = __webpack_require__(38);
	
	var _insertElementWithinElement2 = _interopRequireDefault(_insertElementWithinElement);
	
	var _utils = __webpack_require__(12);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	/**
	 * Insert an element at a point within the document.
	 * This algorithm will try to insert between elements if possible.
	 * It will however use `insertElementWithinElement` if it is more accurate.
	 *
	 * @param {Element} el The element to be inserted
	 * @param {Number} x The x coordinate of the point
	 * @param {Number} y The y coordinate of the point
	 * @param {Number} pageNumber The page number to limit elements to
	 * @return {Boolean} True if element was able to be inserted, otherwise false
	 */
	function insertElementWithinChildren(el, x, y, pageNumber) {
	  // Try and use most accurate method of inserting within an element
	  if ((0, _insertElementWithinElement2.default)(el, x, y, pageNumber, true)) {
	    return true;
	  }
	
	  // Fall back to inserting between elements
	  // let svg = document.querySelector(`svg[data-pdf-annotate-page="${pageNumber}"]`);
	  var svg = document.querySelector('#annoLayer');
	  var rect = svg.getBoundingClientRect();
	  var nodes = [].concat(_toConsumableArray(svg.parentNode.querySelectorAll('.textLayer > div')));
	
	  y = (0, _utils.scaleUp)(svg, { y: y }).y + rect.top;
	  x = (0, _utils.scaleUp)(svg, { x: x }).x + rect.left;
	
	  // Find the best node to insert before
	  for (var i = 0, l = nodes.length; i < l; i++) {
	    var n = nodes[i];
	    var r = n.getBoundingClientRect();
	    if (y <= r.top) {
	      n.parentNode.insertBefore(el, n);
	      return true;
	    }
	  }
	
	  // If all else fails try to append to the bottom
	  var textLayer = svg.parentNode.querySelector('.textLayer');
	  if (textLayer) {
	    var textRect = textLayer.getBoundingClientRect();
	    if ((0, _utils.pointIntersectsRect)(x, y, textRect)) {
	      textLayer.appendChild(el);
	      return true;
	    }
	  }
	
	  return false;
	}
	module.exports = exports['default'];

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = insertElementWithinElement;
	
	var _utils = __webpack_require__(12);
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	/**
	 * Insert an element at a point within the document.
	 * This algorithm will only insert within an element amidst it's text content.
	 *
	 * @param {Element} el The element to be inserted
	 * @param {Number} x The x coordinate of the point
	 * @param {Number} y The y coordinate of the point
	 * @param {Number} pageNumber The page number to limit elements to
	 * @param {Boolean} insertBefore Whether the element is to be inserted before or after x
	 * @return {Boolean} True if element was able to be inserted, otherwise false
	 */
	function insertElementWithinElement(el, x, y, pageNumber, insertBefore) {
	  var OFFSET_ADJUST = 2;
	
	  // If inserting before adjust `x` by looking for element a few px to the right
	  // Otherwise adjust a few px to the left
	  // This is to allow a little tolerance by searching within the box, instead
	  // of getting a false negative by testing right on the border.
	  x = Math.max(x + OFFSET_ADJUST * (insertBefore ? 1 : -1), 0);
	
	  var node = textLayerElementFromPoint(x, y + OFFSET_ADJUST, pageNumber);
	  if (!node) {
	    return false;
	  }
	
	  // Now that node has been found inverse the adjustment for `x`.
	  // This is done to accomodate tolerance by cutting off on the outside of the
	  // text boundary, instead of missing a character by cutting off within.
	  x = x + OFFSET_ADJUST * (insertBefore ? -1 : 1);
	
	  // let svg = document.querySelector(`svg[data-pdf-annotate-page="${pageNumber}"]`);
	  var svg = document.querySelector('#annoLayer');
	  var left = (0, _utils.scaleDown)(svg, { left: node.getBoundingClientRect().left }).left - svg.getBoundingClientRect().left;
	  var temp = node.cloneNode(true);
	  var head = temp.innerHTML.split('');
	  var tail = [];
	
	  // Insert temp off screen
	  temp.style.position = 'absolute';
	  temp.style.top = '-10000px';
	  temp.style.left = '-10000px';
	  document.body.appendChild(temp);
	
	  while (head.length) {
	    // Don't insert within HTML tags
	    if (head[head.length - 1] === '>') {
	      while (head.length) {
	        tail.unshift(head.pop());
	        if (tail[0] === '<') {
	          break;
	        }
	      }
	    }
	
	    // Check if width of temp based on current head value satisfies x
	    temp.innerHTML = head.join('');
	    var width = (0, _utils.scaleDown)(svg, { width: temp.getBoundingClientRect().width }).width;
	    if (left + width <= x) {
	      break;
	    }
	    tail.unshift(head.pop());
	  }
	
	  // Update original node with new markup, including element to be inserted
	  node.innerHTML = head.join('') + el.outerHTML + tail.join('');
	  temp.parentNode.removeChild(temp);
	
	  return true;
	}
	
	/**
	 * Get a text layer element at a given point on a page
	 *
	 * @param {Number} x The x coordinate of the point
	 * @param {Number} y The y coordinate of the point
	 * @param {Number} pageNumber The page to limit elements to
	 * @return {Element} First text layer element found at the point
	 */
	function textLayerElementFromPoint(x, y, pageNumber) {
	  var svg = document.querySelector('#annoLayer');
	  var rect = svg.getBoundingClientRect();
	  y = (0, _utils.scaleUp)(svg, { y: y }).y + rect.top;
	  x = (0, _utils.scaleUp)(svg, { x: x }).x + rect.left;
	  return [].concat(_toConsumableArray(svg.parentNode.querySelectorAll('.textLayer [data-canvas-width]'))).filter(function (el) {
	    return (0, _utils.pointIntersectsRect)(x, y, el.getBoundingClientRect());
	  })[0];
	}
	module.exports = exports['default'];

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = renderScreenReaderComments;
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _insertScreenReaderComment = __webpack_require__(40);
	
	var _insertScreenReaderComment2 = _interopRequireDefault(_insertScreenReaderComment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Insert the comments into the DOM to be available by screen reader
	 *
	 * Example output:
	 *   <div class="screenReaderOnly">
	 *    <div>Begin highlight 1</div>
	 *    <ol aria-label="Comments">
	 *      <li>Foo</li>
	 *      <li>Bar</li>
	 *      <li>Baz</li>
	 *      <li>Qux</li>
	 *    </ol>
	 *  </div>
	 *  <div>Some highlighted text goes here...</div>
	 *  <div class="screenReaderOnly">End highlight 1</div>
	 *
	 * NOTE: `screenReaderOnly` is not a real class, just used for brevity
	 *
	 * @param {String} documentId The ID of the document
	 * @param {String} annotationId The ID of the annotation
	 * @param {Array} [comments] Optionally preloaded comments to be rendered
	 * @return {Promise}
	 */
	function renderScreenReaderComments(documentId, annotationId, comments) {
	  var promise = void 0;
	
	  if (Array.isArray(comments)) {
	    promise = Promise.resolve(comments);
	  } else {
	    promise = _PDFJSAnnotate2.default.getStoreAdapter().getComments(documentId, annotationId);
	  }
	
	  return promise.then(function (comments) {
	    // Node needs to be found by querying DOM as it may have been inserted as innerHTML
	    // leaving `screenReaderNode` as an invalid reference (see `insertElementWithinElement`).
	    var node = document.getElementById('pdf-annotate-screenreader-' + annotationId);
	    if (node) {
	      var list = document.createElement('ol');
	      list.setAttribute('id', 'pdf-annotate-screenreader-comment-list-' + annotationId);
	      list.setAttribute('aria-label', 'Comments');
	      node.appendChild(list);
	      comments.forEach(_insertScreenReaderComment2.default);
	    }
	  });
	}
	module.exports = exports['default'];

/***/ },
/* 40 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = insertScreenReaderComment;
	/**
	 * Insert a comment into the DOM to be available by screen reader
	 *
	 * @param {Object} comment The comment to be inserted
	 */
	function insertScreenReaderComment(comment) {
	  if (!comment) {
	    return;
	  }
	
	  var list = document.querySelector('#pdf-annotate-screenreader-' + comment.annotation + ' ol');
	  if (list) {
	    var item = document.createElement('li');
	    item.setAttribute('id', 'pdf-annotate-screenreader-comment-' + comment.uuid);
	    item.appendChild(document.createTextNode('' + comment.content));
	    list.appendChild(item);
	  }
	}
	module.exports = exports['default'];

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = initEventHandlers;
	
	var _insertScreenReaderHint = __webpack_require__(35);
	
	var _insertScreenReaderHint2 = _interopRequireDefault(_insertScreenReaderHint);
	
	var _renderScreenReaderHints = __webpack_require__(34);
	
	var _renderScreenReaderHints2 = _interopRequireDefault(_renderScreenReaderHints);
	
	var _insertScreenReaderComment = __webpack_require__(40);
	
	var _insertScreenReaderComment2 = _interopRequireDefault(_insertScreenReaderComment);
	
	var _renderScreenReaderComments = __webpack_require__(39);
	
	var _renderScreenReaderComments2 = _interopRequireDefault(_renderScreenReaderComments);
	
	var _event = __webpack_require__(10);
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Initialize the event handlers for keeping screen reader hints synced with data
	 */
	function initEventHandlers() {
	  (0, _event.addEventListener)('annotation:add', function (documentId, pageNumber, annotation) {
	    reorderAnnotationsByType(documentId, pageNumber, annotation.type);
	  });
	  (0, _event.addEventListener)('annotation:edit', function (documentId, annotationId, annotation) {
	    reorderAnnotationsByType(documentId, annotation.page, annotation.type);
	  });
	  (0, _event.addEventListener)('annotation:delete', removeAnnotation);
	  (0, _event.addEventListener)('comment:add', insertComment);
	  (0, _event.addEventListener)('comment:delete', removeComment);
	}
	
	/**
	 * Reorder the annotation numbers by annotation type
	 *
	 * @param {String} documentId The ID of the document
	 * @param {Number} pageNumber The page number of the annotations
	 * @param {Strig} type The annotation type
	 */
	function reorderAnnotationsByType(documentId, pageNumber, type) {
	  _PDFJSAnnotate2.default.getStoreAdapter().getAnnotations(documentId, pageNumber).then(function (annotations) {
	    return annotations.annotations.filter(function (a) {
	      return a.type === type;
	    });
	  }).then(function (annotations) {
	    annotations.forEach(function (a) {
	      removeAnnotation(documentId, a.uuid);
	    });
	
	    return annotations;
	  }).then(_renderScreenReaderHints2.default);
	}
	
	/**
	 * Remove the screen reader hint for an annotation
	 *
	 * @param {String} documentId The ID of the document
	 * @param {String} annotationId The Id of the annotation
	 */
	function removeAnnotation(documentId, annotationId) {
	  removeElementById('pdf-annotate-screenreader-' + annotationId);
	  removeElementById('pdf-annotate-screenreader-' + annotationId + '-end');
	}
	
	/**
	 * Insert a screen reader hint for a comment
	 *
	 * @param {String} documentId The ID of the document
	 * @param {String} annotationId The ID of tha assocated annotation
	 * @param {Object} comment The comment to insert a hint for
	 */
	function insertComment(documentId, annotationId, comment) {
	  var list = document.querySelector('pdf-annotate-screenreader-comment-list-' + annotationId);
	  var promise = void 0;
	
	  if (!list) {
	    promise = (0, _renderScreenReaderComments2.default)(documentId, annotationId, []).then(function () {
	      list = document.querySelector('pdf-annotate-screenreader-comment-list-' + annotationId);
	      return true;
	    });
	  } else {
	    promise = Promise.resolve(true);
	  }
	
	  promise.then(function () {
	    (0, _insertScreenReaderComment2.default)(comment);
	  });
	}
	
	/**
	 * Remove a screen reader hint for a comment
	 *
	 * @param {String} documentId The ID of the document
	 * @param {String} commentId The ID of the comment
	 */
	function removeComment(documentId, commentId) {
	  removeElementById('pdf-annotate-screenreader-comment-' + commentId);
	}
	
	/**
	 * Remove an element from the DOM by it's ID if it exists
	 *
	 * @param {String} elementID The ID of the element to be removed
	 */
	function removeElementById(elementId) {
	  var el = document.getElementById(elementId);
	  if (el) {
	    el.parentNode.removeChild(el);
	  }
	}
	module.exports = exports['default'];

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _event = __webpack_require__(10);
	
	var _edit = __webpack_require__(43);
	
	var _pen = __webpack_require__(44);
	
	var _point = __webpack_require__(45);
	
	var _rect = __webpack_require__(46);
	
	var _highlight = __webpack_require__(51);
	
	var _text = __webpack_require__(47);
	
	var _page = __webpack_require__(52);
	
	var _arrow = __webpack_require__(53);
	
	var _view = __webpack_require__(49);
	
	// extends.
	exports.default = {
	  addEventListener: _event.addEventListener, removeEventListener: _event.removeEventListener, fireEvent: _event.fireEvent,
	  disableEdit: _edit.disableEdit, enableEdit: _edit.enableEdit,
	  disablePen: _pen.disablePen, enablePen: _pen.enablePen, setPen: _pen.setPen,
	  disablePoint: _point.disablePoint, enablePoint: _point.enablePoint,
	  disableRect: _rect.disableRect, enableRect: _rect.enableRect,
	  disableHighlight: _highlight.disableHighlight, enableHighlight: _highlight.enableHighlight,
	  disableText: _text.disableText, enableText: _text.enableText,
	  createPage: _page.createPage, renderPage: _page.renderPage,
	
	  // extends
	  disableArrow: _arrow.disableArrow, enableArrow: _arrow.enableArrow,
	  disableViewMode: _view.disableViewMode, enableViewMode: _view.enableViewMode
	};
	module.exports = exports['default'];

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.enableEdit = enableEdit;
	exports.disableEdit = disableEdit;
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	var _event = __webpack_require__(10);
	
	var _utils = __webpack_require__(12);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var _enabled = false;
	var isDragging = false,
	    overlay = void 0;
	var dragOffsetX = void 0,
	    dragOffsetY = void 0,
	    dragStartX = void 0,
	    dragStartY = void 0;
	var OVERLAY_BORDER_SIZE = 3;
	
	/**
	 * Create an overlay for editing an annotation.
	 *
	 * @param {Element} target The annotation element to apply overlay for
	 */
	function createEditOverlay(target) {
	  destroyEditOverlay();
	
	  overlay = document.createElement('div');
	  var anchor = document.createElement('a');
	  var parentNode = (0, _utils.findSVGContainer)(target).parentNode;
	  var id = target.getAttribute('data-pdf-annotate-id');
	  var rect = (0, _utils.getAnnotationRect)(target);
	  var styleLeft = rect.left - OVERLAY_BORDER_SIZE;
	  var styleTop = rect.top - OVERLAY_BORDER_SIZE;
	
	  overlay.setAttribute('id', 'pdf-annotate-edit-overlay');
	  overlay.setAttribute('data-target-id', id);
	  overlay.style.boxSizing = 'content-box';
	  overlay.style.position = 'absolute';
	  overlay.style.top = styleTop + 'px';
	  overlay.style.left = styleLeft + 'px';
	  overlay.style.width = rect.width + 'px';
	  overlay.style.height = rect.height + 'px';
	  overlay.style.border = OVERLAY_BORDER_SIZE + 'px solid ' + _utils.BORDER_COLOR;
	  overlay.style.borderRadius = OVERLAY_BORDER_SIZE + 'px';
	
	  anchor.innerHTML = '×';
	  anchor.setAttribute('href', 'javascript://');
	  anchor.style.background = '#fff';
	  anchor.style.borderRadius = '20px';
	  anchor.style.border = '1px solid #bbb';
	  anchor.style.color = '#bbb';
	  anchor.style.fontSize = '16px';
	  anchor.style.padding = '2px';
	  anchor.style.textAlign = 'center';
	  anchor.style.textDecoration = 'none';
	  anchor.style.position = 'absolute';
	  anchor.style.top = '-13px';
	  anchor.style.right = '-13px';
	  anchor.style.width = '25px';
	  anchor.style.height = '25px';
	
	  overlay.appendChild(anchor);
	  parentNode.appendChild(overlay);
	  document.addEventListener('click', handleDocumentClick);
	  document.addEventListener('keyup', handleDocumentKeyup);
	  document.addEventListener('mousedown', handleDocumentMousedown);
	  anchor.addEventListener('click', deleteAnnotation);
	  anchor.addEventListener('mouseover', function () {
	    anchor.style.color = '#35A4DC';
	    anchor.style.borderColor = '#999';
	    anchor.style.boxShadow = '0 1px 1px #ccc';
	  });
	  anchor.addEventListener('mouseout', function () {
	    anchor.style.color = '#bbb';
	    anchor.style.borderColor = '#bbb';
	    anchor.style.boxShadow = '';
	  });
	  overlay.addEventListener('mouseover', function () {
	    if (!isDragging) {
	      anchor.style.display = '';
	    }
	  });
	  overlay.addEventListener('mouseout', function () {
	    anchor.style.display = 'none';
	  });
	}
	
	/**
	 * Destroy the edit overlay if it exists.
	 */
	function destroyEditOverlay() {
	  if (overlay) {
	    overlay.parentNode.removeChild(overlay);
	    overlay = null;
	  }
	
	  document.removeEventListener('click', handleDocumentClick);
	  document.removeEventListener('keyup', handleDocumentKeyup);
	  document.removeEventListener('mousedown', handleDocumentMousedown);
	  document.removeEventListener('mousemove', handleDocumentMousemove);
	  document.removeEventListener('mouseup', handleDocumentMouseup);
	  (0, _utils.enableUserSelect)();
	}
	
	/**
	 * Delete currently selected annotation
	 */
	function deleteAnnotation() {
	  if (!overlay) {
	    return;
	  }
	
	  var annotationId = overlay.getAttribute('data-target-id');
	  var nodes = document.querySelectorAll('[data-pdf-annotate-id="' + annotationId + '"]');
	  var svg = overlay.parentNode.querySelector('svg.annotationLayer');
	
	  var _getMetadata = (0, _utils.getMetadata)(svg),
	      documentId = _getMetadata.documentId;
	
	  [].concat(_toConsumableArray(nodes)).forEach(function (n) {
	    n.parentNode.removeChild(n);
	  });
	
	  _PDFJSAnnotate2.default.getStoreAdapter().deleteAnnotation(documentId, annotationId);
	
	  destroyEditOverlay();
	}
	
	/**
	 * Handle document.click event
	 *
	 * @param {Event} e The DOM event that needs to be handled
	 */
	function handleDocumentClick(e) {
	  if (!(0, _utils.findSVGAtPoint)(e.clientX, e.clientY)) {
	    return;
	  }
	
	  // Remove current overlay
	  var overlay = document.getElementById('pdf-annotate-edit-overlay');
	  if (overlay) {
	    if (isDragging || e.target === overlay) {
	      return;
	    }
	
	    destroyEditOverlay();
	  }
	}
	
	/**
	 * Handle document.keyup event
	 *
	 * @param {Event} e The DOM event that needs to be handled
	 */
	function handleDocumentKeyup(e) {
	  if (overlay && e.keyCode === 46 && e.target.nodeName.toLowerCase() !== 'textarea' && e.target.nodeName.toLowerCase() !== 'input') {
	    deleteAnnotation();
	  }
	}
	
	/**
	 * Handle document.mousedown event
	 *
	 * @param {Event} e The DOM event that needs to be handled
	 */
	function handleDocumentMousedown(e) {
	  if (e.target !== overlay) {
	    return;
	  }
	
	  // Highlight and strikeout annotations are bound to text within the document.
	  // It doesn't make sense to allow repositioning these types of annotations.
	  var annotationId = overlay.getAttribute('data-target-id');
	  var target = document.querySelector('[data-pdf-annotate-id="' + annotationId + '"]');
	  var type = target.getAttribute('data-pdf-annotate-type');
	
	  if (type === 'highlight' || type === 'strikeout') {
	    return;
	  }
	
	  isDragging = true;
	  dragOffsetX = e.clientX;
	  dragOffsetY = e.clientY;
	  dragStartX = overlay.offsetLeft;
	  dragStartY = overlay.offsetTop;
	
	  overlay.style.background = 'rgba(255, 255, 255, 0.7)';
	  overlay.style.cursor = 'move';
	  overlay.querySelector('a').style.display = 'none';
	
	  document.addEventListener('mousemove', handleDocumentMousemove);
	  document.addEventListener('mouseup', handleDocumentMouseup);
	  (0, _utils.disableUserSelect)();
	}
	
	/**
	 * Handle document.mousemove event
	 *
	 * @param {Event} e The DOM event that needs to be handled
	 */
	function handleDocumentMousemove(e) {
	  var annotationId = overlay.getAttribute('data-target-id');
	  var parentNode = overlay.parentNode;
	  var rect = parentNode.getBoundingClientRect();
	  var y = dragStartY + (e.clientY - dragOffsetY);
	  var x = dragStartX + (e.clientX - dragOffsetX);
	  var minY = 0;
	  var maxY = rect.height;
	  var minX = 0;
	  var maxX = rect.width;
	
	  if (y > minY && y + overlay.offsetHeight < maxY) {
	    overlay.style.top = y + 'px';
	  }
	
	  if (x > minX && x + overlay.offsetWidth < maxX) {
	    overlay.style.left = x + 'px';
	  }
	}
	
	/**
	 * Handle document.mouseup event
	 *
	 * @param {Event} e The DOM event that needs to be handled
	 */
	function handleDocumentMouseup(e) {
	  var annotationId = overlay.getAttribute('data-target-id');
	  var target = document.querySelectorAll('[data-pdf-annotate-id="' + annotationId + '"]');
	  var type = target[0].getAttribute('data-pdf-annotate-type');
	  var svg = overlay.parentNode.querySelector('svg.annotationLayer');
	
	  var _getMetadata2 = (0, _utils.getMetadata)(svg),
	      documentId = _getMetadata2.documentId;
	
	  overlay.querySelector('a').style.display = '';
	
	  function getDelta(propX, propY) {
	    return calcDelta(parseInt(target[0].getAttribute(propX), 10), parseInt(target[0].getAttribute(propY), 10));
	  }
	
	  function calcDelta(x, y) {
	    return {
	      deltaX: OVERLAY_BORDER_SIZE + (0, _utils.scaleDown)(svg, { x: overlay.offsetLeft }).x - x,
	      deltaY: OVERLAY_BORDER_SIZE + (0, _utils.scaleDown)(svg, { y: overlay.offsetTop }).y - y
	    };
	  }
	
	  _PDFJSAnnotate2.default.getStoreAdapter().getAnnotation(documentId, annotationId).then(function (annotation) {
	    if (['area', 'highlight', 'point', 'textbox'].indexOf(type) > -1) {
	      (function () {
	        var _getDelta = getDelta('x', 'y'),
	            deltaX = _getDelta.deltaX,
	            deltaY = _getDelta.deltaY;
	
	        [].concat(_toConsumableArray(target)).forEach(function (t, i) {
	          if (deltaY !== 0) {
	            var modelY = parseInt(t.getAttribute('y'), 10) + deltaY;
	            var viewY = modelY;
	
	            if (type === 'textbox') {
	              viewY += annotation.size;
	            }
	
	            if (type === 'point') {
	              viewY = (0, _utils.scaleUp)(svg, { viewY: viewY }).viewY;
	            }
	
	            t.setAttribute('y', viewY);
	            if (annotation.rectangles) {
	              annotation.rectangles[i].y = modelY;
	            } else if (annotation.y) {
	              annotation.y = modelY;
	            }
	          }
	          if (deltaX !== 0) {
	            var modelX = parseInt(t.getAttribute('x'), 10) + deltaX;
	            var viewX = modelX;
	
	            if (type === 'point') {
	              viewX = (0, _utils.scaleUp)(svg, { viewX: viewX }).viewX;
	            }
	
	            t.setAttribute('x', viewX);
	            if (annotation.rectangles) {
	              annotation.rectangles[i].x = modelX;
	            } else if (annotation.x) {
	              annotation.x = modelX;
	            }
	          }
	        });
	        // } else if (type === 'strikeout') {
	        //   let { deltaX, deltaY } = getDelta('x1', 'y1');
	        //   [...target].forEach(target, (t, i) => {
	        //     if (deltaY !== 0) {
	        //       t.setAttribute('y1', parseInt(t.getAttribute('y1'), 10) + deltaY);
	        //       t.setAttribute('y2', parseInt(t.getAttribute('y2'), 10) + deltaY);
	        //       annotation.rectangles[i].y = parseInt(t.getAttribute('y1'), 10);
	        //     }
	        //     if (deltaX !== 0) {
	        //       t.setAttribute('x1', parseInt(t.getAttribute('x1'), 10) + deltaX);
	        //       t.setAttribute('x2', parseInt(t.getAttribute('x2'), 10) + deltaX);
	        //       annotation.rectangles[i].x = parseInt(t.getAttribute('x1'), 10);
	        //     }
	        //   });
	      })();
	    } else if (type === 'drawing') {
	      (function () {
	        var rect = (0, _utils.scaleDown)(svg, (0, _utils.getAnnotationRect)(target[0]));
	
	        var _annotation$lines$ = _slicedToArray(annotation.lines[0], 2),
	            originX = _annotation$lines$[0],
	            originY = _annotation$lines$[1];
	
	        var _calcDelta = calcDelta(originX, originY),
	            deltaX = _calcDelta.deltaX,
	            deltaY = _calcDelta.deltaY;
	
	        // origin isn't necessarily at 0/0 in relation to overlay x/y
	        // adjust the difference between overlay and drawing coords
	
	
	        deltaY += originY - rect.top;
	        deltaX += originX - rect.left;
	
	        annotation.lines.forEach(function (line, i) {
	          var _annotation$lines$i = _slicedToArray(annotation.lines[i], 2),
	              x = _annotation$lines$i[0],
	              y = _annotation$lines$i[1];
	
	          annotation.lines[i][0] = x + deltaX;
	          annotation.lines[i][1] = y + deltaY;
	        });
	
	        target[0].parentNode.removeChild(target[0]);
	        (0, _appendChild2.default)(svg, annotation);
	      })();
	    }
	
	    _PDFJSAnnotate2.default.getStoreAdapter().editAnnotation(documentId, annotationId, annotation);
	  });
	
	  setTimeout(function () {
	    isDragging = false;
	  }, 0);
	
	  overlay.style.background = '';
	  overlay.style.cursor = '';
	
	  document.removeEventListener('mousemove', handleDocumentMousemove);
	  document.removeEventListener('mouseup', handleDocumentMouseup);
	  (0, _utils.enableUserSelect)();
	}
	
	/**
	 * Handle annotation.click event
	 *
	 * @param {Element} e The annotation element that was clicked
	 */
	function handleAnnotationClick(target) {
	  createEditOverlay(target);
	}
	
	/**
	 * Enable edit mode behavior.
	 */
	function enableEdit() {
	  if (_enabled) {
	    return;
	  }
	
	  _enabled = true;
	  (0, _event.addEventListener)('annotation:click', handleAnnotationClick);
	};
	
	/**
	 * Disable edit mode behavior.
	 */
	function disableEdit() {
	  destroyEditOverlay();
	
	  if (!_enabled) {
	    return;
	  }
	
	  _enabled = false;
	  (0, _event.removeEventListener)('annotation:click', handleAnnotationClick);
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.setPen = setPen;
	exports.enablePen = enablePen;
	exports.disablePen = disablePen;
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	var _utils = __webpack_require__(12);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var _enabled = false;
	var _penSize = void 0;
	var _penColor = void 0;
	var path = void 0;
	var lines = void 0;
	
	/**
	 * Handle document.mousedown event
	 */
	function handleDocumentMousedown() {
	  path = null;
	  lines = [];
	
	  document.addEventListener('mousemove', handleDocumentMousemove);
	  document.addEventListener('mouseup', handleDocumentMouseup);
	}
	
	/**
	 * Handle document.mouseup event
	 *
	 * @param {Event} e The DOM event to be handled
	 */
	function handleDocumentMouseup(e) {
	  var svg = void 0;
	  if (lines.length > 1 && (svg = (0, _utils.findSVGAtPoint)(e.clientX, e.clientY))) {
	    var _getMetadata = (0, _utils.getMetadata)(svg),
	        documentId = _getMetadata.documentId,
	        pageNumber = _getMetadata.pageNumber;
	
	    _PDFJSAnnotate2.default.getStoreAdapter().addAnnotation(documentId, pageNumber, {
	      type: 'drawing',
	      width: _penSize,
	      color: _penColor,
	      lines: lines
	    }).then(function (annotation) {
	      if (path) {
	        svg.removeChild(path);
	      }
	
	      (0, _appendChild2.default)(svg, annotation);
	    });
	  }
	
	  document.removeEventListener('mousemove', handleDocumentMousemove);
	  document.removeEventListener('mouseup', handleDocumentMouseup);
	}
	
	/**
	 * Handle document.mousemove event
	 *
	 * @param {Event} e The DOM event to be handled
	 */
	function handleDocumentMousemove(e) {
	  savePoint(e.clientX, e.clientY);
	}
	
	/**
	 * Handle document.keyup event
	 *
	 * @param {Event} e The DOM event to be handled
	 */
	function handleDocumentKeyup(e) {
	  // Cancel rect if Esc is pressed
	  if (e.keyCode === 27) {
	    lines = null;
	    path.parentNode.removeChild(path);
	    document.removeEventListener('mousemove', handleDocumentMousemove);
	    document.removeEventListener('mouseup', handleDocumentMouseup);
	  }
	}
	
	/**
	 * Save a point to the line being drawn.
	 *
	 * @param {Number} x The x coordinate of the point
	 * @param {Number} y The y coordinate of the point
	 */
	function savePoint(x, y) {
	  var svg = (0, _utils.findSVGAtPoint)(x, y);
	  if (!svg) {
	    return;
	  }
	
	  var rect = svg.getBoundingClientRect();
	  var point = (0, _utils.scaleDown)(svg, {
	    x: x - rect.left,
	    y: y - rect.top
	  });
	
	  lines.push([point.x, point.y]);
	
	  if (lines.length <= 1) {
	    return;
	  }
	
	  if (path) {
	    svg.removeChild(path);
	  }
	
	  path = (0, _appendChild2.default)(svg, {
	    type: 'drawing',
	    color: _penColor,
	    width: _penSize,
	    lines: lines
	  });
	}
	
	/**
	 * Set the attributes of the pen.
	 *
	 * @param {Number} penSize The size of the lines drawn by the pen
	 * @param {String} penColor The color of the lines drawn by the pen
	 */
	function setPen() {
	  var penSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
	  var penColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '000000';
	
	  _penSize = parseInt(penSize, 10);
	  _penColor = penColor;
	}
	
	/**
	 * Enable the pen behavior
	 */
	function enablePen() {
	  if (_enabled) {
	    return;
	  }
	
	  _enabled = true;
	  document.addEventListener('mousedown', handleDocumentMousedown);
	  document.addEventListener('keyup', handleDocumentKeyup);
	  (0, _utils.disableUserSelect)();
	}
	
	/**
	 * Disable the pen behavior
	 */
	function disablePen() {
	  if (!_enabled) {
	    return;
	  }
	
	  _enabled = false;
	  document.removeEventListener('mousedown', handleDocumentMousedown);
	  document.removeEventListener('keyup', handleDocumentKeyup);
	  (0, _utils.enableUserSelect)();
	}

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.enablePoint = enablePoint;
	exports.disablePoint = disablePoint;
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	var _utils = __webpack_require__(12);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var _enabled = false;
	var input = void 0;
	
	/**
	 * Handle document.mouseup event
	 *
	 * @param {Event} The DOM event to be handled
	 */
	function handleDocumentMouseup(e) {
	  if (input || !(0, _utils.findSVGAtPoint)(e.clientX, e.clientY)) {
	    return;
	  }
	
	  input = document.createElement('input');
	  input.setAttribute('id', 'pdf-annotate-point-input');
	  input.setAttribute('placeholder', 'Enter comment');
	  input.style.border = '3px solid ' + _utils.BORDER_COLOR;
	  input.style.borderRadius = '3px';
	  input.style.position = 'absolute';
	  input.style.top = e.clientY + 'px';
	  input.style.left = e.clientX + 'px';
	
	  input.addEventListener('blur', handleInputBlur);
	  input.addEventListener('keyup', handleInputKeyup);
	
	  document.body.appendChild(input);
	  input.focus();
	}
	
	/**
	 * Handle input.blur event
	 */
	function handleInputBlur() {
	  savePoint();
	}
	
	/**
	 * Handle input.keyup event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleInputKeyup(e) {
	  if (e.keyCode === 27) {
	    closeInput();
	  } else if (e.keyCode === 13) {
	    savePoint();
	  }
	}
	
	/**
	 * Save a new point annotation from input
	 */
	function savePoint() {
	  if (input.value.trim().length > 0) {
	    var _ret = function () {
	      var clientX = parseInt(input.style.left, 10);
	      var clientY = parseInt(input.style.top, 10);
	      var content = input.value.trim();
	      var svg = (0, _utils.findSVGAtPoint)(clientX, clientY);
	      if (!svg) {
	        return {
	          v: void 0
	        };
	      }
	
	      var rect = svg.getBoundingClientRect();
	
	      var _getMetadata = (0, _utils.getMetadata)(svg),
	          documentId = _getMetadata.documentId,
	          pageNumber = _getMetadata.pageNumber;
	
	      var annotation = Object.assign({
	        type: 'point'
	      }, (0, _utils.scaleDown)(svg, {
	        x: clientX - rect.left,
	        y: clientY - rect.top
	      }));
	
	      _PDFJSAnnotate2.default.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation).then(function (annotation) {
	        _PDFJSAnnotate2.default.getStoreAdapter().addComment(documentId, annotation.uuid, content);
	
	        (0, _appendChild2.default)(svg, annotation);
	      });
	    }();
	
	    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	  }
	
	  closeInput();
	}
	
	/**
	 * Close the input element
	 */
	function closeInput() {
	  input.removeEventListener('blur', handleInputBlur);
	  input.removeEventListener('keyup', handleInputKeyup);
	  document.body.removeChild(input);
	  input = null;
	}
	
	/**
	 * Enable point annotation behavior
	 */
	function enablePoint() {
	  if (_enabled) {
	    return;
	  }
	
	  _enabled = true;
	  document.addEventListener('mouseup', handleDocumentMouseup);
	}
	
	/**
	 * Disable point annotation behavior
	 */
	function disablePoint() {
	  if (!_enabled) {
	    return;
	  }
	
	  _enabled = false;
	  document.removeEventListener('mouseup', handleDocumentMouseup);
	}

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.enableRect = enableRect;
	exports.disableRect = disableRect;
	
	var _jquery = __webpack_require__(6);
	
	var _jquery2 = _interopRequireDefault(_jquery);
	
	var _deepAssign = __webpack_require__(17);
	
	var _deepAssign2 = _interopRequireDefault(_deepAssign);
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	var _utils = __webpack_require__(12);
	
	var _text = __webpack_require__(47);
	
	var _rect = __webpack_require__(48);
	
	var _rect2 = _interopRequireDefault(_rect);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var _type = 'area';
	
	var _enabled = false;
	var overlay = void 0;
	var originY = void 0;
	var originX = void 0;
	
	var enableArea = {
	  page: 0,
	  minX: 0,
	  maxX: 0,
	  minY: 0,
	  maxY: 0
	};
	
	/**
	 * Handle document.mousedown event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleDocumentMousedown(e) {
	  var _getXY = (0, _utils.getXY)(e),
	      x = _getXY.x,
	      y = _getXY.y;
	
	  originX = x;
	  originY = y;
	
	  enableArea = (0, _utils.getCurrentPage)(e);
	  if (!enableArea) {
	    return;
	  }
	
	  overlay = document.createElement('div');
	  overlay.style.position = 'absolute';
	  overlay.style.top = originY + 'px';
	  overlay.style.left = originX + 'px';
	  overlay.style.width = 0;
	  overlay.style.height = 0;
	  overlay.style.border = '2px solid ' + _utils.BORDER_COLOR;
	  overlay.style.boxSizing = 'border-box';
	  overlay.style.visibility = 'visible';
	  (0, _utils.getTmpLayer)().appendChild(overlay);
	
	  document.addEventListener('mousemove', handleDocumentMousemove);
	}
	
	/**
	 * Handle document.mousemove event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleDocumentMousemove(e) {
	  var _getXY2 = (0, _utils.getXY)(e),
	      curX = _getXY2.x,
	      curY = _getXY2.y;
	
	  var x = Math.min(originX, curX);
	  var y = Math.min(originY, curY);
	  var w = Math.abs(originX - curX);
	  var h = Math.abs(originY - curY);
	
	  // Restrict in page.
	  x = Math.min(enableArea.maxX, Math.max(enableArea.minX, x));
	  y = Math.min(enableArea.maxY, Math.max(enableArea.minY, y));
	  if (x > enableArea.minX) {
	    w = Math.min(w, enableArea.maxX - x);
	  } else {
	    w = originX - enableArea.minX;
	  }
	  if (y > enableArea.minY) {
	    h = Math.min(h, enableArea.maxY - y);
	  } else {
	    h = originY - enableArea.minY;
	  }
	
	  // Move and Resize.
	  overlay.style.left = x + 'px';
	  overlay.style.top = y + 'px';
	  overlay.style.width = w + 'px';
	  overlay.style.height = h + 'px';
	}
	
	/**
	 * Handle document.mouseup event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleDocumentMouseup(e) {
	
	  if (!overlay) {
	    return;
	  }
	
	  saveRect({
	    x: parseInt(overlay.style.left, 10),
	    y: parseInt(overlay.style.top, 10),
	    width: parseInt(overlay.style.width, 10),
	    height: parseInt(overlay.style.height, 10)
	  });
	
	  (0, _jquery2.default)(overlay).remove();
	  overlay = null;
	
	  document.removeEventListener('mousemove', handleDocumentMousemove);
	}
	
	/**
	 * Save a rect annotation.
	 *
	 * @param {Object} rect - The rect to use for annotation.
	 */
	function saveRect(rect) {
	
	  if (rect.width === 0 || rect.height === 0) {
	    return;
	  }
	
	  var svg = (0, _utils.getSVGLayer)();
	
	  var annotation = (0, _deepAssign2.default)((0, _utils.scaleDown)(svg, rect), {
	    type: _type
	  });
	
	  var _getMetadata = (0, _utils.getMetadata)(svg),
	      documentId = _getMetadata.documentId,
	      pageNumber = _getMetadata.pageNumber;
	
	  // Save.
	
	
	  _PDFJSAnnotate2.default.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation).then(function (annotation) {
	
	    console.log('bbbbbbbbb:', annotation);
	
	    // appendChild(svg, annotation);
	
	    var rectAnnotation = _rect2.default.newInstance(annotation);
	    rectAnnotation.render();
	    window.annotationContainer.add(rectAnnotation);
	
	    // Add an input field.
	    var x = annotation.x;
	    var y = annotation.y - 20; // 20 = circle'radius(3px) + input height(14px) + α
	    var rect = svg.getBoundingClientRect();
	
	    x = (0, _utils.scaleUp)(svg, { x: x }).x + rect.left;
	    y = (0, _utils.scaleUp)(svg, { y: y }).y + rect.top;
	
	    (0, _text.addInputField)(x, y, null, null, function (text) {
	
	      console.log('text: ', text);
	
	      if (!text) {
	        return;
	      }
	
	      annotation.text = text;
	
	      // Create a text annotation.
	      // $(`[data-pdf-annotate-id="${annotation.uuid}"]`).remove();
	      // TODO
	      // let $elmenet = appendChild(svg, annotation);
	
	      // Update data.
	      _PDFJSAnnotate2.default.getStoreAdapter().editAnnotation(documentId, annotation.uuid, annotation);
	
	      rectAnnotation.text = text;
	      rectAnnotation.render();
	
	      // Save and Update.
	
	
	      // // Move the text into the rect svg group.
	      // let $text = $(`[data-pdf-annotate-id="${textAnnotation.uuid}"]`);
	      // $(`[data-pdf-annotate-id="${annotation.uuid}"]`).append($text.children());
	      // $text.remove();
	      // // Delete text annotation.
	      // PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, textAnnotation.uuid);
	
	      // 設計変更
	      // =================================
	      // ラベルアノテーションは、いろんなアノテーションに付属する感じ。
	      // 各種アノテーションを追加したのちに、インプットフィールドを用意。
	      // 入力が終わったら、annotationではなく、テキスト文字自体をコールバックに戻すようにする。
	      // 受け取った値をDBに保存し、またレンダリングも行う（自身のアノテーションのg内に）。
	
	
	      // これが良さそうだったら、ハイライト、arrow、にも設計を展開する。
	
	
	      // // FIXME: cannot stop refarence counter. I wanna use the original `annotation`, but couldn't.
	      // PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, annotation.uuid).then(annotation => {
	
	      //   // Set relation between arrow and text.
	      //   annotation.text = textAnnotation.uuid;
	
	      //   // Update data.
	      //   PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotation.uuid, annotation);
	
	      //   // Update UI.
	      //   $(`[data-pdf-annotate-id="${annotation.uuid}"]`).attr('data-text', textAnnotation.uuid);
	
	      // });
	    }, 'text');
	  });
	}
	
	/**
	 * Enable rect behavior
	 */
	function enableRect() {
	
	  if (_enabled) {
	    return;
	  }
	
	  _enabled = true;
	  document.addEventListener('mouseup', handleDocumentMouseup);
	  document.addEventListener('mousedown', handleDocumentMousedown);
	
	  (0, _utils.disableUserSelect)();
	}
	
	/**
	 * Disable rect behavior
	 */
	function disableRect() {
	
	  if (!_enabled) {
	    return;
	  }
	
	  _enabled = false;
	  document.removeEventListener('mouseup', handleDocumentMouseup);
	  document.removeEventListener('mousedown', handleDocumentMousedown);
	
	  (0, _utils.enableUserSelect)();
	}

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.addInputField = addInputField;
	exports.closeInput = closeInput;
	exports.enableText = enableText;
	exports.disableText = disableText;
	
	var _jquery = __webpack_require__(6);
	
	var _jquery2 = _interopRequireDefault(_jquery);
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	var _utils = __webpack_require__(12);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * The text size at editing.
	 */
	var TEXT_SIZE = 12;
	
	/**
	 * The text color at editing.
	 */
	var TEXT_COLOR = '#FF0000';
	
	/**
	 * The status of text annotation UI.
	 */
	var _enabled = false;
	
	/*
	 * The input field for adding/editing a text.
	 */
	var input = null;
	
	/*
	 * The callback called at finishing to add/edit a text.
	 */
	var _finishCallback = null;
	
	var _returnType = null;
	
	/**
	 * Handle document.mouseup event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleDocumentMouseup(e) {
	  if (input) {
	    return;
	  }
	  addInputField(e.clientX, e.clientY);
	}
	
	/**
	 * Show an input field for adding a text annotation.
	 *
	 * @param {Number} x - The x-axis position to show.
	 * @param {Number} y - The y-axis position to show.
	 * @param {String} selfId - The annotation id used for registration.
	 * @param {Function} finishCallback - The callback function will be called after registration.
	 */
	function addInputField(x, y) {
	  var selfId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	  var text = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	  var finishCallback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
	  var returnType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'annotation';
	
	
	  // This is a dummy form for adding autocomplete candidates at finishing adding/editing.
	  // At the time to finish editing, submit via the submit button, then regist an autocomplete content.
	  var $form = (0, _jquery2.default)('<form id="autocompleteform" action="./"/>').css({
	    position: 'absolute',
	    top: '0',
	    left: '0'
	  });
	  $form.on('submit', handleSubmit);
	  $form.append('<input type="submit" value="submit"/>'); // needs for Firefox emulating submit event.
	  (0, _jquery2.default)(document.body).append($form);
	
	  input = document.createElement('input');
	  input.setAttribute('id', 'pdf-annotate-text-input');
	  input.setAttribute('placeholder', 'Enter text');
	  input.setAttribute('name', 'paperannotext');
	  input.style.border = '3px solid ' + _utils.BORDER_COLOR;
	  input.style.borderRadius = '3px';
	  input.style.position = 'absolute';
	  input.style.top = y + 'px';
	  input.style.left = x + 'px';
	  input.style.fontSize = TEXT_SIZE + 'px';
	  input.style.width = '150px';
	  input.style.zIndex = 2;
	
	  if (selfId) {
	    input.setAttribute('data-self-id', selfId);
	  }
	
	  if (text) {
	    input.value = text;
	  }
	
	  _finishCallback = finishCallback;
	
	  _returnType = returnType;
	
	  input.addEventListener('blur', handleInputBlur);
	  input.addEventListener('keyup', handleInputKeyup);
	
	  $form.append(input);
	  input.focus();
	}
	
	/*
	 * Handle form.submit event.
	 * @param {Event} e - Submit event.
	 */
	function handleSubmit(e) {
	  e.preventDefault();
	  return false;
	}
	
	/**
	 * Handle input.blur event.
	 */
	function handleInputBlur() {
	  saveText();
	}
	
	/**
	 * Handle input.keyup event.
	 * @param {Event} e The DOM event to handle
	 */
	function handleInputKeyup(e) {
	  if (e.keyCode === 27) {
	    closeInput();
	  }
	}
	
	/**
	 * Save a text annotation from input.
	 */
	function saveText() {
	
	  if (!input) {
	    return;
	  }
	
	  var content = input.value.trim();
	  if (!content) {
	    return closeInput();
	  }
	
	  var clientX = parseInt(input.style.left, 10);
	  var clientY = parseInt(input.style.top, 10);
	  var svg = (0, _utils.getSVGLayer)();
	
	  var _getMetadata = (0, _utils.getMetadata)(svg),
	      documentId = _getMetadata.documentId,
	      pageNumber = _getMetadata.pageNumber;
	
	  var rect = svg.getBoundingClientRect();
	  var annotation = Object.assign({
	    type: 'textbox',
	    content: content
	  }, (0, _utils.scaleDown)(svg, {
	    x: clientX - rect.left,
	    y: clientY - rect.top,
	    width: input.offsetWidth,
	    height: input.offsetHeight
	  }));
	
	  // RelationId.
	  var selfId = input.getAttribute('data-self-id');
	  if (selfId) {
	    annotation.uuid = selfId;
	  }
	
	  // Add an autocomplete candidate. (Firefox, Chrome)
	  (0, _jquery2.default)('#autocompleteform [type="submit"]').click();
	
	  if (_returnType === 'annotation') {
	    _PDFJSAnnotate2.default.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation).then(function (annotation) {
	      (0, _appendChild2.default)(svg, annotation);
	
	      closeInput(annotation);
	    });
	  } else {
	    closeInput(content);
	  }
	}
	
	/**
	 * Close the input.
	 * @param {Object} textAnnotation - the annotation registerd.
	 */
	function closeInput(textAnnotationOrText) {
	
	  if (input) {
	
	    (0, _jquery2.default)(input).parents('form').remove();
	    input = null;
	
	    if (_finishCallback) {
	      _finishCallback(textAnnotationOrText);
	    }
	  }
	
	  _finishCallback = null;
	  _returnType = null;
	}
	
	/**
	 * Enable text behavior.
	 */
	function enableText() {
	  if (_enabled) {
	    return;
	  }
	
	  _enabled = true;
	  document.addEventListener('mouseup', handleDocumentMouseup);
	}
	
	/**
	 * Disable text behavior.
	 */
	function disableText() {
	  if (!_enabled) {
	    return;
	  }
	
	  _enabled = false;
	  document.removeEventListener('mouseup', handleDocumentMouseup);
	  closeInput();
	}

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _deepAssign = __webpack_require__(17);
	
	var _deepAssign2 = _interopRequireDefault(_deepAssign);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	var _utils = __webpack_require__(12);
	
	var _text = __webpack_require__(47);
	
	var _view = __webpack_require__(49);
	
	var _abstract = __webpack_require__(50);
	
	var _abstract2 = _interopRequireDefault(_abstract);
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	// TODO Text should be an another annotation class.
	
	
	/**
	 * Rect Annotation.
	 */
	var RectAnnotation = function (_AbstractAnnotation) {
	    _inherits(RectAnnotation, _AbstractAnnotation);
	
	    function RectAnnotation() {
	        _classCallCheck(this, RectAnnotation);
	
	        var _this = _possibleConstructorReturn(this, (RectAnnotation.__proto__ || Object.getPrototypeOf(RectAnnotation)).call(this));
	
	        _this.uuid = null;
	        _this.type = 'area';
	        _this.x = 0;
	        _this.y = 0;
	        _this.width = 0;
	        _this.height = 0;
	        _this.text = 0;
	        _this.color = null;
	        _this.readOnly = false;
	        _this.$element = $('<div class="dummy"/>');
	        return _this;
	    }
	
	    _createClass(RectAnnotation, [{
	        key: 'render',
	        value: function render() {
	            // TODO Refactoring.
	            this.$element.remove();
	            this.$element = $((0, _appendChild2.default)((0, _utils.getSVGLayer)(), this));
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            this.$element.remove();
	            window.annotationContainer.remove(this);
	        }
	    }, {
	        key: 'createAnnotation',
	        value: function createAnnotation() {
	            // TODO Refactring.
	            return {
	                uuid: this.uuid,
	                type: this.type,
	                x: this.x,
	                y: this.y,
	                width: this.width,
	                height: this.height,
	                text: this.text,
	                color: this.color,
	                readyOnly: this.readOnly
	            };
	        }
	    }, {
	        key: 'save',
	        value: function save() {
	            var _this2 = this;
	
	            // TODO Competible to insert and update.
	            var _getMetadata = (0, _utils.getMetadata)(),
	                documentId = _getMetadata.documentId;
	
	            _PDFJSAnnotate2.default.getStoreAdapter().getAnnotation(documentId, this.uuid).then(function (a) {
	                if (a) {
	                    // update.
	                    a = _this2.createAnnotation(a);
	                    console.log('save:', a);
	                    _PDFJSAnnotate2.default.getStoreAdapter().editAnnotation(documentId, _this2.uuid, a);
	                } else {
	                    // insert.
	                    a = _this2.createAnnotation();
	                    _PDFJSAnnotate2.default.getStoreAdapter().addAnnotation(documentId, 1, a);
	                }
	            });
	        }
	    }, {
	        key: 'deleteSelectedAnnotation',
	        value: function deleteSelectedAnnotation() {
	            console.log('deleteSelectedAnnotation');
	            // TODO Refactoring.
	            if (this.$element.find('.anno-rect').hasClass('--selected')) {
	                this.$element.remove();
	
	                var _getMetadata2 = (0, _utils.getMetadata)(),
	                    documentId = _getMetadata2.documentId;
	
	                _PDFJSAnnotate2.default.getStoreAdapter().deleteAnnotation(documentId, this.uuid).then(function () {
	                    console.log('deleted');
	                });
	            } else if (this.$element.find('.anno-text').hasClass('--selected')) {
	                this.text = null;
	                this.save();
	                this.render();
	                this.enableViewMode();
	            }
	        }
	    }, {
	        key: 'handleHoverInEvent',
	        value: function handleHoverInEvent() {
	            this.$element.find('rect, text').addClass('--hover');
	            // TODO Refactoring.
	            this.$element.css('opacity', 1);
	        }
	    }, {
	        key: 'handleHoverOutEvent',
	        value: function handleHoverOutEvent() {
	            this.$element.find('rect, text').removeClass('--hover');
	            // TODO Refactoring.
	            this.$element.css('opacity', 0.5);
	        }
	    }, {
	        key: 'handleClickRectEvent',
	        value: function handleClickRectEvent() {
	            console.log('handleClickRectEvent!!!!!');
	            // TODO Refactoring.
	            this.$element.find('.anno-rect').toggleClass('--selected');
	            if (this.$element.find('.anno-rect').hasClass('--selected')) {
	                this.$element.css('opacity', 1);
	            } else {
	                this.$element.css('opacity', 0.5);
	            }
	        }
	    }, {
	        key: 'handleClickTextEvent',
	        value: function handleClickTextEvent() {
	            console.log('handleClickTextEvent');
	            // TODO Refactoring.
	            this.$element.find('.anno-text').toggleClass('--selected');
	
	            // Check double click.
	            var currentTime = new Date().getTime();
	            if (this.prevClickTime && currentTime - this.prevClickTime < 400) {
	                this.handleDoubleClickTextEvent();
	            }
	            this.prevClickTime = currentTime;
	        }
	    }, {
	        key: 'handleDoubleClickTextEvent',
	        value: function handleDoubleClickTextEvent() {
	            var _this3 = this;
	
	            console.log('handleDoubleClickTextEvent');
	
	            var svg = (0, _utils.getSVGLayer)();
	            var pos = (0, _utils.scaleUp)(svg, {
	                x: this.x,
	                y: this.y
	            });
	            var rect = svg.getBoundingClientRect();
	            pos.x += rect.left;
	            pos.y += rect.top;
	
	            (0, _view.disableViewMode)(); // TODO Refactoring.
	
	            (0, _text.addInputField)(pos.x, pos.y - 20, this.uuid, this.text, function (text) {
	
	                if (text) {
	                    _this3.text = text;
	                    _this3.save();
	                    _this3.render();
	                    // TODO Refactoring.
	                    _this3.enableViewMode();
	                }
	
	                (0, _view.enableViewMode)(); // TODO Refactoring.
	            }, 'text');
	        }
	    }, {
	        key: 'handleMouseDownOnRect',
	        value: function handleMouseDownOnRect() {
	            console.log('handleMouseDownOnRect');
	
	            this.originalX = this.x;
	            this.originalY = this.y;
	
	            (0, _utils.disableUserSelect)();
	
	            // $(document).on('mousemove', this.handleMouseMoveOnDocument);
	            // $(document).on('mouseup', this.handleMouseUpOnDocument);
	            document.addEventListener('mousemove', this.handleMouseMoveOnDocument);
	            document.addEventListener('mouseup', this.handleMouseUpOnDocument);
	        }
	
	        // handleMouseUpOnRect() {
	        //     console.log('handleMouseUpOnRect:', this._dragging);
	
	        //     // Click.
	        //     if (!this._dragging) {
	        //         this.handleClickRectEvent();
	        //     }
	        // }
	
	    }, {
	        key: 'handleMouseMoveOnDocument',
	        value: function handleMouseMoveOnDocument(e) {
	
	            this._dragging = true;
	
	            if (!this.startX) {
	                // this.startX = parseInt(e.originalEvent.clientX);
	                // this.startY = parseInt(e.originalEvent.clientY);
	                this.startX = parseInt(e.clientX);
	                this.startY = parseInt(e.clientY);
	            }
	            // this.endX = parseInt(e.originalEvent.clientX);
	            // this.endY = parseInt(e.originalEvent.clientY);
	            this.endX = parseInt(e.clientX);
	            this.endY = parseInt(e.clientY);
	
	            var diff = (0, _utils.scaleDown)({
	                x: this.endX - this.startX,
	                y: this.endY - this.startY
	            });
	
	            this.x = this.originalX + diff.x;
	            this.y = this.originalY + diff.y;
	
	            this.render(); // heavy?
	        }
	    }, {
	        key: 'handleMouseUpOnDocument',
	        value: function handleMouseUpOnDocument() {
	            console.log('handleMouseUpOnDocument');
	
	            if (this._dragging) {
	                this._dragging = false;
	
	                this.originalX = null;
	                this.originalY = null;
	                this.startX = null;
	                this.startY = null;
	                this.endX = null;
	                this.endY = null;
	
	                this.save();
	                this.enableViewMode();
	            }
	
	            (0, _utils.enableUserSelect)();
	
	            // $(document).off('mousemove', this.handleMouseMoveOnDocument);
	            // $(document).off('mouseup', this.handleMouseUpOnDocument);
	            document.removeEventListener('mousemove', this.handleMouseMoveOnDocument);
	            document.removeEventListener('mouseup', this.handleMouseUpOnDocument);
	        }
	    }, {
	        key: 'enableViewMode',
	        value: function enableViewMode() {
	
	            this.$element.find('rect, text').hover(this.handleHoverInEvent.bind(this), this.handleHoverOutEvent.bind(this));
	
	            if (!this.readOnly) {
	
	                this.$element.find('.anno-rect').off('click', this.handleClickRectEvent).on('click', this.handleClickRectEvent);
	                this.$element.find('text').off('click', this.handleClickTextEvent).on('click', this.handleClickTextEvent);
	                this.$element.find('text').off('dbclick', this.handleDoubleClickTextEvent).on('dbclick', this.handleDoubleClickTextEvent);
	
	                this.$element.find('.anno-rect').off('mousedown', this.handleMouseDownOnRect).on('mousedown', this.handleMouseDownOnRect);
	                // this.$element.find('.anno-rect').off('mouseup', this.handleMouseUpOnRect).on('mouseup', this.handleMouseUpOnRect);            
	            }
	        }
	    }, {
	        key: 'disableViewMode',
	        value: function disableViewMode() {
	            this.$element.find('rect, text').off('mouseenter mouseleave');
	            this.$element.find('.anno-rect').off('click', this.handleClickRectEvent);
	            this.$element.find('text').off('click', this.handleClickTextEvent);
	            this.$element.find('text').off('dbclick', this.handleDoubleClickTextEvent);
	
	            this.$element.find('.anno-rect').off('mousedown', this.handleMouseDownOnRect);
	            // this.$element.find('.anno-rect').off('mouseup', this.handleMouseUpOnRect);        
	        }
	    }], [{
	        key: 'newInstance',
	        value: function newInstance(annotation) {
	            var rect = new RectAnnotation();
	            rect.uuid = annotation.uuid;
	            rect.x = annotation.x;
	            rect.y = annotation.y;
	            rect.width = annotation.width;
	            rect.height = annotation.height;
	            rect.text = annotation.text;
	            rect.color = annotation.color;
	            rect.readOnly = annotation.readOnly;
	            return rect;
	        }
	    }]);
	
	    return RectAnnotation;
	}(_abstract2.default);
	
	exports.default = RectAnnotation;
	module.exports = exports['default'];

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.enableViewMode = enableViewMode;
	exports.disableViewMode = disableViewMode;
	
	var _jquery = __webpack_require__(6);
	
	var _jquery2 = _interopRequireDefault(_jquery);
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _utils = __webpack_require__(12);
	
	var _text = __webpack_require__(47);
	
	var _rect = __webpack_require__(48);
	
	var _rect2 = _interopRequireDefault(_rect);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var filter = Array.prototype.filter;
	var forEach = Array.prototype.forEach;
	
	var _enable = false;
	
	var OPACITY_VISIBLE = 1;
	var OPACITY_TRANSLUCENT = 0.5;
	
	var monitoringRects = []; // rect
	var monitoringTexts = []; // textbox
	var monitoringArrows = []; // arrow
	var monitoringCircles = []; // boundingCircle for highlight.
	
	var rects = [];
	
	var hitComponent = null;
	
	var rectDraggingWillStart = false;
	var rectDragging = false;
	var rectDraggingComponent = null;
	var rectDraggingStartPos = null;
	
	function handleDoubleClick(e) {
	
	    var component = findHitElement(e, true);
	    if (component && isTextComponent(component)) {
	
	        // Add text input filed.
	        var svg = (0, _utils.findSVGAtPoint)(e.clientX, e.clientY);
	        var pos = (0, _utils.scaleUp)(svg, {
	            x: parseFloat(component.getAttribute('x')),
	            y: parseFloat(component.getAttribute('y'))
	        });
	        var rect = svg.getBoundingClientRect();
	        pos.x += rect.left;
	        pos.y += rect.top;
	        var id = component.parentNode.getAttribute('data-pdf-annotate-id');
	        var text = component.parentNode.querySelector('text').textContent;
	        (0, _text.addInputField)(pos.x, pos.y, id, text, function () {
	            // wait for save finished, and enable.
	            setTimeout(function () {
	                enableViewMode();
	            }, 500);
	        });
	
	        // Remove current text from data.
	
	        var _getMetadata = (0, _utils.getMetadata)(svg),
	            documentId = _getMetadata.documentId,
	            pageNumber = _getMetadata.pageNumber;
	
	        var annotationId = component.parentNode.getAttribute('data-pdf-annotate-id');
	        deleteAnnotation(documentId, [annotationId]);
	
	        // Remove from UI.
	        (0, _jquery2.default)(component).closest('g').remove();
	
	        // disable
	        disableViewMode();
	    }
	}
	
	function handleDocumentMouseup(e) {
	
	    // Save rect position if dragging ended.
	    if (rectDragging) {
	
	        console.log('handleDocumentMouseup:rectDragging');
	
	        var svg = (0, _utils.findSVGAtPoint)(e.clientX, e.clientY);
	        if (svg) {
	            (function () {
	                moveRectComponent(svg, rectDraggingStartPos, getClientXY(e), rectDraggingComponent);
	
	                // Update annotation, and save it.
	
	                var _getMetadata2 = (0, _utils.getMetadata)(svg),
	                    documentId = _getMetadata2.documentId,
	                    pageNumber = _getMetadata2.pageNumber;
	
	                var annotationId = rectDraggingComponent.parentNode.getAttribute('data-pdf-annotate-id');
	                _PDFJSAnnotate2.default.getStoreAdapter().getAnnotation(documentId, annotationId).then(function (annotation) {
	                    annotation.x = parseFloat(rectDraggingComponent.getAttribute('x'));
	                    annotation.y = parseFloat(rectDraggingComponent.getAttribute('y'));
	                    _PDFJSAnnotate2.default.getStoreAdapter().editAnnotation(documentId, annotationId, annotation);
	                });
	            })();
	        }
	
	        // Reset.
	        rectDragging = false;
	        rectDraggingWillStart = false;
	        (0, _utils.enableUserSelect)();
	
	        return;
	    }
	
	    rectDraggingWillStart = false;
	
	    // Set component state to selected if exists.
	    var element = findHitElement(e, true);
	    if (element) {
	        var g = element.parentNode;
	        if (g.getAttribute('data-selected') === 'true') {
	            g.setAttribute('data-selected', false);
	            setSelectedVisibility(element, 'hide');
	        } else {
	            g.setAttribute('data-selected', true);
	            setSelectedVisibility(element, 'show');
	        }
	    }
	}
	
	function handleDocumentMousedown(e) {
	
	    // Start rect dragging if exists.
	    var component = findHitElement(e, true);
	    if (component && isRectComponent(component)) {
	        rectDraggingWillStart = true;
	        rectDraggingComponent = component;
	        var x = rectDraggingComponent.getAttribute('x');
	        var y = rectDraggingComponent.getAttribute('y');
	        rectDraggingComponent.setAttribute('data-original-x', x);
	        rectDraggingComponent.setAttribute('data-original-y', y);
	        rectDraggingStartPos = getClientXY(e);
	    }
	}
	
	function handleDocumentMousemove(e) {
	
	    // Drag a rect if now dragging.
	    if (rectDraggingWillStart) {
	        rectDraggingWillStart = false;
	        rectDragging = true;
	        (0, _utils.disableUserSelect)();
	    }
	    if (rectDragging) {
	        var svg = (0, _utils.findSVGAtPoint)(e.clientX, e.clientY);
	        if (svg) {
	            moveRectComponent(svg, rectDraggingStartPos, getClientXY(e), rectDraggingComponent);
	        }
	        return;
	    }
	
	    // Set component state to visible if exists.
	    var element = findHitElement(e);
	    if (element) {
	        if (!hitComponent) {
	            hitComponent = element;
	            setVisibility(hitComponent, OPACITY_VISIBLE);
	        }
	    } else {
	        if (hitComponent) {
	            setVisibility(hitComponent, OPACITY_TRANSLUCENT);
	            hitComponent = null;
	        }
	    }
	}
	
	function handleDocumentKeydown(e) {
	    console.log('handleDocumentKeydown');
	    // Delete or BackSpace.
	    if (e.keyCode == 46 || e.keyCode == 8) {
	        e.preventDefault();
	        return false;
	    }
	}
	
	function handleDocumentKeyup(e) {
	    // Delete or BackSpace.
	    if (e.keyCode == 46 || e.keyCode == 8) {
	        deleteSelectedAnnotations();
	        e.preventDefault();
	        return false;
	    }
	}
	
	function moveRectComponent(svg, startPos, currentPos, rect) {
	
	    var diff = (0, _utils.scaleDown)(svg, {
	        x: startPos.x - currentPos.x,
	        y: startPos.y - currentPos.y
	    });
	
	    var originalX = parseFloat(rect.getAttribute('data-original-x'));
	    var originalY = parseFloat(rect.getAttribute('data-original-y'));
	
	    rect.setAttribute('x', originalX - diff.x);
	    rect.setAttribute('y', originalY - diff.y);
	
	    // Move related text.
	    // let textId = $(rect).parents('g').data('text');
	    // let $text = $(`[data-pdf-annotate-id="${textId}"]`);
	    // if (!$text.data('original-x')) {
	    //     $text.data('original-x', $text.)
	    // }
	}
	
	/**
	 * Delete annotations selected.
	 */
	function deleteSelectedAnnotations() {
	
	    // New type.
	    window.annotationContainer.getAllAnnotations().forEach(function (r) {
	        r.deleteSelectedAnnotation();
	    });
	
	    var annotationIds = [];
	    var documentId = document.querySelector('svg').getAttribute('data-pdf-annotate-document');
	
	    forEach.call(document.querySelectorAll('svg [data-selected="true"]'), function (g) {
	
	        // Delete it.
	        var annotationId = g.getAttribute('data-pdf-annotate-id');
	        annotationIds.push(annotationId);
	        g.parentNode.removeChild(g);
	
	        // Delete relations.
	
	        var type = g.getAttribute('data-pdf-annotate-type');
	
	        if (type === 'arrow') {
	            var criteria = {
	                type: 'arrow',
	                uuid: annotationId
	            };
	            _PDFJSAnnotate2.default.getStoreAdapter().findAnnotations(documentId, criteria).then(function (annotations) {
	                if (annotations.length > 0) {
	                    annotationIds.push(annotations[0].text);
	                }
	                deleteAnnotation(documentId, annotationIds, initializeMonitoringAnnotations);
	            });
	        } else if (type === 'textbox') {
	            var _criteria = {
	                type: 'arrow',
	                text: annotationId
	            };
	            _PDFJSAnnotate2.default.getStoreAdapter().findAnnotations(documentId, _criteria).then(function (annotations) {
	                if (annotations.length > 0) {
	                    annotationIds.push(annotations[0].uuid);
	                }
	                deleteAnnotation(documentId, annotationIds, initializeMonitoringAnnotations);
	            });
	        } else if (type === 'highlight') {
	            // Span text.
	            var textId = (0, _jquery2.default)(g).attr('data-text');
	            if (textId) {
	                annotationIds.push(textId);
	            }
	            // Arrow relations.
	            var _criteria2 = {
	                type: 'arrow',
	                highlight1: annotationId
	            };
	            _PDFJSAnnotate2.default.getStoreAdapter().findAnnotations(documentId, _criteria2).then(function (annotations) {
	                if (annotations.length > 0) {
	                    annotationIds.push(annotations[0].uuid);
	                    annotationIds.push(annotations[0].text);
	                }
	                var criteria = {
	                    type: 'arrow',
	                    highlight2: annotationId
	                };
	                _PDFJSAnnotate2.default.getStoreAdapter().findAnnotations(documentId, criteria).then(function (annotations) {
	                    if (annotations.length > 0) {
	                        annotationIds.push(annotations[0].uuid);
	                        annotationIds.push(annotations[0].text);
	                    }
	                    deleteAnnotation(documentId, annotationIds, initializeMonitoringAnnotations);
	                });
	            });
	        } else {
	            deleteAnnotation(documentId, annotationIds, initializeMonitoringAnnotations);
	        }
	    });
	}
	
	function deleteAnnotation(documentId, ids, callback) {
	    if (ids.length === 0) {
	        return callback && callback();
	    }
	    var annotationId = ids.shift();
	    _PDFJSAnnotate2.default.getStoreAdapter().deleteAnnotation(documentId, annotationId).then(function () {
	        deleteAnnotation(documentId, ids);
	    }).catch(function () {
	        deleteAnnotation(documentId, ids);
	    });
	
	    var element = document.querySelector('[data-pdf-annotate-id="' + annotationId + '"]');
	    if (element && element.parentNode) {
	        element.parentNode.removeChild(element);
	    }
	}
	
	function setSelectedVisibility(component, state) {
	
	    console.log('setSelectedVisibility:', component);
	
	    var $g = (0, _jquery2.default)(component.tagName.toLowerCase() === 'g' ? component : component.parentNode);
	
	    // For highlight, rect, text, arrow.
	    if (state === 'show') {
	        $g.find('rect,path').addClass('--selected');
	    } else {
	        $g.find('rect,path').removeClass('--selected');
	    }
	}
	
	function setVisibility(component, opacity) {
	    setComponentVisibility(component, opacity);
	}
	
	function isHighlightComponent(component) {
	    if (component.tagName.toLowerCase() === 'g') {
	        return component.getAttribute('data-pdf-annotate-type') === 'highlight';
	    }
	    return component.parentNode && component.parentNode.getAttribute('data-pdf-annotate-type') === 'highlight';
	}
	
	function isRectComponent(component) {
	    if (component.tagName.toLowerCase() === 'g') {
	        return component.getAttribute('data-pdf-annotate-type') === 'area';
	    }
	    return component.parentNode && component.parentNode.getAttribute('data-pdf-annotate-type') === 'area';
	}
	
	function isTextComponent(component) {
	    if (component.tagName.toLowerCase() === 'g') {
	        return component.getAttribute('data-pdf-annotate-type') === 'textbox';
	    }
	    return component.parentNode && component.parentNode.getAttribute('data-pdf-annotate-type') === 'textbox';
	}
	
	function isArrowComponent(component) {
	    if (component.tagName.toLowerCase() === 'g') {
	        return component.getAttribute('data-pdf-annotate-type') === 'arrow';
	    }
	    return component.parentNode && component.parentNode.getAttribute('data-pdf-annotate-type') === 'arrow';
	}
	
	function setComponentVisibility(component, opacity) {
	    console.log('setComponentVisibility', component.tagName, opacity);
	
	    // let g = (component.tagName.toLowerCase() === 'g' ? component : component.parentNode);
	    var g = void 0;
	    if (component.tagName.toLowerCase() === 'g') {
	        g = component;
	    } else {
	        g = (0, _jquery2.default)(component).parents('g[data-pdf-annotate-id]')[0];
	    }
	
	    g.style.opacity = opacity;
	
	    if (!g.parentNode) {
	        return;
	    }
	
	    // For circle.
	    if (opacity === OPACITY_VISIBLE) {
	        (0, _jquery2.default)(g).find('circle').addClass('--hover');
	    } else {
	        (0, _jquery2.default)(g).find('circle').removeClass('--hover');
	    }
	
	    // For highlight, rect.
	    if (opacity === OPACITY_VISIBLE) {
	        (0, _jquery2.default)(g).find('rect').addClass('--hover');
	    } else {
	        (0, _jquery2.default)(g).find('rect').removeClass('--hover');
	    }
	
	    // For Arrow.
	    if (opacity === OPACITY_VISIBLE) {
	        (0, _jquery2.default)(g).find('path').addClass('--hover');
	    } else {
	        (0, _jquery2.default)(g).find('path').removeClass('--hover');
	    }
	
	    // Also set to relation items.
	    var documentId = g.parentNode.getAttribute('data-pdf-annotate-document');
	    var uuid = g.getAttribute('data-pdf-annotate-id');
	    var type = g.getAttribute('data-pdf-annotate-type');
	
	    if (type === 'arrow') {
	        [g.getAttribute('data-highlight1'), g.getAttribute('data-highlight2'), g.getAttribute('data-text')].forEach(function (id) {
	            var element = document.querySelector('g[data-pdf-annotate-id="' + id + '"]');
	            if (element) {
	                element.style.opacity = opacity;
	            }
	        });
	    } else if (type === 'highlight' || type === 'textbox') {
	        _PDFJSAnnotate2.default.getStoreAdapter().getAnnotations(documentId, null).then(function (_ref) {
	            var documentId = _ref.documentId,
	                pageNumber = _ref.pageNumber,
	                annotations = _ref.annotations;
	
	            var arrowAnnotations = annotations.filter(function (annotation) {
	                return annotation.highlight1 === uuid || annotation.highlight2 === uuid || annotation.text === uuid;
	            });
	            arrowAnnotations.forEach(function (arrowAnnotation) {
	                var arrowElement = document.querySelector('g[data-pdf-annotate-id="' + arrowAnnotation.uuid + '"]');
	                setComponentVisibility(arrowElement, opacity);
	            });
	        });
	
	        if (type === 'highlight') {
	            var textId = (0, _jquery2.default)(g).attr('data-text');
	            if (textId) {
	                var $g = (0, _jquery2.default)('g[data-pdf-annotate-id="' + textId + '"]');
	                if (opacity === OPACITY_VISIBLE) {
	                    $g.find('rect').addClass('--hover');
	                    $g.css('opacity', opacity);
	                } else {
	                    $g.find('rect').removeClass('--hover');
	                    $g.css('opacity', opacity);
	                }
	            }
	        }
	    }
	}
	
	function findHitElement(e) {
	    var canEdit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	
	
	    var svg = (0, _utils.findSVGAtPoint)(e.clientX, e.clientY);
	    if (!svg) {
	        return null;
	    }
	
	    // Mouse Point.
	    var point = (0, _utils.scaleDown)(svg, getClientXY(e));
	
	    // highlight.
	    for (var i = 0; i < monitoringCircles.length; i++) {
	        if (isHit(point, monitoringCircles[i], 'boundingCircle')) {
	            if (canEdit) {
	                var readOnly = (0, _jquery2.default)(monitoringCircles[i]).closest('g').attr('read-only') === 'true';
	                if (!readOnly) {
	                    return monitoringCircles[i];
	                }
	            } else {
	                return monitoringCircles[i];
	            }
	        }
	    }
	
	    // rect.
	    for (var _i = 0; _i < monitoringRects.length; _i++) {
	        if (isHit(point, monitoringRects[_i], 'rect')) {
	            if (canEdit) {
	                var _readOnly = (0, _jquery2.default)(monitoringRects[_i]).closest('g').attr('read-only') === 'true';
	                if (!_readOnly) {
	                    return monitoringRects[_i];
	                }
	            } else {
	                return monitoringRects[_i];
	            }
	        }
	    }
	
	    // textbox.
	    for (var _i2 = 0; _i2 < monitoringTexts.length; _i2++) {
	        if (isHit(point, monitoringTexts[_i2], 'text')) {
	            if (canEdit) {
	                var _readOnly2 = (0, _jquery2.default)(monitoringTexts[_i2]).closest('g').attr('read-only') === 'true';
	                if (!_readOnly2) {
	                    return monitoringTexts[_i2];
	                }
	            } else {
	                return monitoringTexts[_i2];
	            }
	        }
	    }
	
	    // arrow.
	    for (var _i3 = 0; _i3 < monitoringArrows.length; _i3++) {
	        if (isHit(point, monitoringArrows[_i3], 'arrow')) {
	            if (canEdit) {
	                var _readOnly3 = (0, _jquery2.default)(monitoringArrows[_i3]).closest('g').attr('read-only') === 'true';
	                if (!_readOnly3) {
	                    return monitoringArrows[_i3];
	                }
	            } else {
	                return monitoringArrows[_i3];
	            }
	        }
	    }
	}
	
	function isHit(pos, element, type) {
	
	    if (type === 'boundingCircle') {
	        var r = parseFloat(element.getAttribute('r'));
	        var x = parseFloat(element.getAttribute('cx'));
	        var y = parseFloat(element.getAttribute('cy'));
	        var distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
	        return distance <= r;
	    }
	
	    if (type === 'rect') {
	        var top = parseFloat(element.getAttribute('y'));
	        var bottom = top + parseFloat(element.getAttribute('height'));
	        var left = parseFloat(element.getAttribute('x'));
	        var right = left + parseFloat(element.getAttribute('width'));
	
	        var _x2 = pos.x;
	        var _y = pos.y;
	        return (
	            // left
	            left - 2 <= _x2 && _x2 <= left + 2 && top <= _y && _y <= bottom ||
	            // right
	            right - 2 <= _x2 && _x2 <= right + 2 && top <= _y && _y <= bottom
	            // top
	            || left <= _x2 && _x2 <= right && top - 2 <= _y && _y <= top + 2
	            // bottom
	            || left <= _x2 && _x2 <= right && bottom - 2 <= _y && _y <= bottom + 2
	        );
	        // return left <= pos.x && pos.x <= right && top <= pos.y && pos.y <= bottom;        
	    }
	
	    if (type === 'text') {
	        var _top = parseFloat(element.getAttribute('y'));
	        var _bottom = _top + parseFloat(element.getAttribute('height'));
	        var _left = parseFloat(element.getAttribute('x'));
	        var _right = _left + parseFloat(element.getAttribute('width'));
	        return _left <= pos.x && pos.x <= _right && _top <= pos.y && pos.y <= _bottom;
	    }
	
	    if (type === 'arrow') {
	
	        // Judge using triangle in-out.
	
	        // test.
	        var d = element.getAttribute('d').split(' ');
	        // d: `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
	        // M 400.12120426203285 88.13763102725366 Q 318.94806886179947 118.75219077638972 277.05534651364843 194.7214542557652
	        var x1 = parseFloat(d[1]);
	        var y1 = parseFloat(d[2]);
	        var x2 = parseFloat(d[6]);
	        var y2 = parseFloat(d[7]);
	        var x3 = parseFloat(d[4]);
	        var y3 = parseFloat(d[5]);
	
	        var vecAB = {
	            x: x1 - x2,
	            y: y1 - y2
	        };
	        var vecBP = {
	            x: x2 - pos.x,
	            y: y2 - pos.y
	        };
	
	        var vecBC = {
	            x: x2 - x3,
	            y: y2 - y3
	        };
	        var vecCP = {
	            x: x3 - pos.x,
	            y: y3 - pos.y
	        };
	
	        var vecCA = {
	            x: x3 - x1,
	            y: y3 - y1
	        };
	        var vecAP = {
	            x: x1 - pos.x,
	            y: y1 - pos.y
	        };
	
	        var c1 = vecAB.x * vecBP.y - vecAB.y * vecBP.x;
	        var c2 = vecBC.x * vecCP.y - vecBC.y * vecCP.x;
	        var c3 = vecCA.x * vecAP.y - vecCA.y * vecAP.x;
	
	        return c1 > 0 && c2 > 0 && c3 > 0 || c1 < 0 && c2 < 0 && c3 < 0;
	    }
	}
	
	function getClientXY(e) {
	    var svg = (0, _utils.findSVGAtPoint)(e.clientX, e.clientY);
	    if (!svg) {
	        return null;
	    }
	    var rect = svg.getBoundingClientRect();
	    var x = e.clientX - rect.left;
	    var y = e.clientY - rect.top;
	    return { x: x, y: y };
	}
	
	function initializeMonitoringAnnotations() {
	
	    monitoringRects = [];
	    monitoringTexts = [];
	    monitoringArrows = [];
	    monitoringCircles = [];
	
	    // Components for monitoring.
	    forEach.call(document.querySelectorAll('svg > g > [type="boundingCircle"]'), function (boundingCircle) {
	        monitoringCircles.push(boundingCircle);
	    });
	    // Texts.
	    forEach.call(document.querySelectorAll('svg > [data-pdf-annotate-type="textbox"] > rect'), function (rect) {
	        monitoringTexts.push(rect);
	    });
	    // Arrows.
	    forEach.call(document.querySelectorAll('svg > [data-pdf-annotate-type="arrow"] > path'), function (path) {
	        monitoringArrows.push(path);
	    });
	    // // Highlights.
	    // forEach.call(document.querySelectorAll('svg > [data-pdf-annotate-type="highlight"] > rect'), rect => {
	    //     monitoringRects.push(rect);
	    // });
	
	
	    // Rects.
	    // let rects = window.annotationContainer.getAllAnnotations().filter(a => {
	    //     return a.type === 'area';
	    // });
	    // rects.forEach(r => {
	    //     r.enableViewMode();
	    // });
	
	    window.annotationContainer.getAllAnnotations().forEach(function (r) {
	        r.enableViewMode();
	    });
	}
	
	function enableMouseListening() {
	
	    initializeMonitoringAnnotations();
	
	    document.addEventListener('mousedown', handleDocumentMousedown);
	    document.addEventListener('mousemove', handleDocumentMousemove);
	    document.addEventListener('mouseup', handleDocumentMouseup);
	    document.addEventListener('keyup', handleDocumentKeyup);
	    document.addEventListener('keydown', handleDocumentKeydown);
	    document.addEventListener('dblclick', handleDoubleClick);
	}
	
	function disableMouseListening() {
	    console.log('disableMouseListening');
	
	    monitoringRects = [];
	    monitoringArrows = [];
	    monitoringCircles = [];
	
	    window.annotationContainer.getAllAnnotations().forEach(function (r) {
	        r.disableViewMode();
	    });
	
	    document.removeEventListener('mousedown', handleDocumentMousedown);
	    document.removeEventListener('mousemove', handleDocumentMousemove);
	    document.removeEventListener('mouseup', handleDocumentMouseup);
	    document.removeEventListener('keyup', handleDocumentKeyup);
	    document.removeEventListener('keydown', handleDocumentKeydown);
	    document.removeEventListener('dblclick', handleDoubleClick);
	}
	
	function setComponenTranslucent(opacity) {
	    forEach.call(document.querySelectorAll('svg > *'), function (svgComponent) {
	        svgComponent.style.opacity = opacity;
	    });
	}
	
	function enableViewMode() {
	    console.log('enableViewMode');
	
	    if (_enable) {
	        return;
	    }
	    _enable = true;
	
	    enableMouseListening();
	    setComponenTranslucent(OPACITY_TRANSLUCENT);
	}
	function disableViewMode() {
	    console.log('disableViewMode');
	
	    if (!_enable) {
	        return;
	    }
	    _enable = false;
	
	    disableMouseListening();
	    setComponenTranslucent(OPACITY_VISIBLE);
	}

/***/ },
/* 50 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 *
	 */
	var AbstractAnnotation = function () {
	    function AbstractAnnotation() {
	        _classCallCheck(this, AbstractAnnotation);
	
	        this.autoBind();
	    }
	
	    /**
	     * クラスのメソッドのthisをクラスインスタンスにバインドします。
	     */
	
	
	    _createClass(AbstractAnnotation, [{
	        key: 'autoBind',
	        value: function autoBind() {
	            var _this = this;
	
	            Object.getOwnPropertyNames(this.constructor.prototype).filter(function (prop) {
	                return typeof _this[prop] === 'function';
	            }).forEach(function (method) {
	                _this[method] = _this[method].bind(_this);
	            });
	        }
	    }]);
	
	    return AbstractAnnotation;
	}();
	
	exports.default = AbstractAnnotation;
	module.exports = exports['default'];

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.enableHighlight = enableHighlight;
	exports.disableHighlight = disableHighlight;
	
	var _jquery = __webpack_require__(6);
	
	var _jquery2 = _interopRequireDefault(_jquery);
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	var _utils = __webpack_require__(12);
	
	var _text = __webpack_require__(47);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var _type = 'highlight';
	
	var _enabled = false;
	var overlay = void 0;
	var originY = void 0;
	var originX = void 0;
	
	/**
	 * Get the current window selection as rects
	 *
	 * @return {Array} An Array of rects
	 */
	function getSelectionRects() {
	  try {
	    var selection = window.getSelection();
	    var range = selection.getRangeAt(0);
	    var rects = range.getClientRects();
	
	    if (rects.length > 0 && rects[0].width > 0 && rects[0].height > 0) {
	      return rects;
	    }
	  } catch (e) {}
	
	  return null;
	}
	
	/**
	 * Handle document.mouseup event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleDocumentMouseup(e) {
	
	  var rects = getSelectionRects();
	  if (rects) {
	    var svg = (0, _utils.getSVGLayer)();
	    saveRect([].concat(_toConsumableArray(rects)).map(function (r) {
	      return {
	        top: r.top,
	        left: r.left,
	        width: r.width,
	        height: r.height
	      };
	    }));
	  }
	
	  removeSelection();
	}
	
	function removeSelection() {
	  var selection = window.getSelection();
	  // Firefox
	  selection.removeAllRanges && selection.removeAllRanges();
	  // Chrome
	  selection.empty && selection.empty();
	}
	
	/**
	 * Save a rect annotation
	 *
	 * @param {String} type The type of rect (area, highlight, strikeout)
	 * @param {Array} rects The rects to use for annotation
	 * @param {String} color The color of the rects
	 */
	function saveRect(rects) {
	
	  var svg = (0, _utils.getSVGLayer)();
	  var node = void 0;
	  var annotation = void 0;
	
	  var boundingRect = svg.getBoundingClientRect();
	
	  // Initialize the annotation
	  annotation = {
	    type: _type,
	    rectangles: [].concat(_toConsumableArray(rects)).map(function (r) {
	      return (0, _utils.scaleDown)(svg, {
	        x: r.left - boundingRect.left,
	        y: r.top - boundingRect.top,
	        width: r.width,
	        height: r.height
	      });
	    }).filter(function (r) {
	      return r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1;
	    })
	  };
	
	  var _getMetadata = (0, _utils.getMetadata)(svg),
	      documentId = _getMetadata.documentId,
	      pageNumber = _getMetadata.pageNumber;
	
	  // Add the annotation
	
	
	  _PDFJSAnnotate2.default.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation).then(function (annotation) {
	
	    console.log('annotation:', annotation);
	
	    (0, _appendChild2.default)(svg, annotation);
	
	    // Add an input field.
	    var x = annotation.rectangles[0].x + 5; // 5 = boundingRadius(3) + 2
	    var y = annotation.rectangles[0].y - 20; // 20 = circle'radius(3px) + input height(14px) + α
	    var rect = svg.getBoundingClientRect();
	
	    x = (0, _utils.scaleUp)(svg, { x: x }).x + rect.left;
	    y = (0, _utils.scaleUp)(svg, { y: y }).y + rect.top;
	
	    (0, _text.addInputField)(x, y, null, null, function (textAnnotation) {
	
	      if (!textAnnotation) {
	        return;
	      }
	
	      // FIXME: cannot stop refarence counter. I wanna use the original `annotation`, but couldn't.
	      _PDFJSAnnotate2.default.getStoreAdapter().getAnnotation(documentId, annotation.uuid).then(function (annotation) {
	
	        // Set relation between arrow and text.
	        annotation.text = textAnnotation.uuid;
	
	        // Update data.
	        _PDFJSAnnotate2.default.getStoreAdapter().editAnnotation(documentId, annotation.uuid, annotation);
	
	        // Update UI.
	        (0, _jquery2.default)('[data-pdf-annotate-id="' + annotation.uuid + '"]').attr('data-text', textAnnotation.uuid);
	      });
	    });
	  });
	}
	
	/**
	 * Enable rect behavior
	 */
	function enableHighlight() {
	
	  if (_enabled) {
	    return;
	  }
	
	  _enabled = true;
	  document.addEventListener('mouseup', handleDocumentMouseup);
	}
	
	/**
	 * Disable rect behavior
	 */
	function disableHighlight() {
	
	  if (!_enabled) {
	    return;
	  }
	
	  _enabled = false;
	  document.removeEventListener('mouseup', handleDocumentMouseup);
	}

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.createPage = createPage;
	exports.renderPage = renderPage;
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _renderScreenReaderHints = __webpack_require__(34);
	
	var _renderScreenReaderHints2 = _interopRequireDefault(_renderScreenReaderHints);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Template for creating a new page
	var PAGE_TEMPLATE = '\n  <div style="visibility: hidden;" class="page" data-loaded="false">\n    <div class="canvasWrapper">\n      <canvas></canvas>\n    </div>\n    <svg class="annotationLayer"></svg>\n    <div class="textLayer"></div>\n  </div>\n';
	
	/**
	 * Create a new page to be appended to the DOM.
	 *
	 * @param {Number} pageNumber The page number that is being created
	 * @return {HTMLElement}
	 */
	function createPage(pageNumber) {
	  var temp = document.createElement('div');
	  temp.innerHTML = PAGE_TEMPLATE;
	
	  var page = temp.children[0];
	  var canvas = page.querySelector('canvas');
	
	  page.setAttribute('id', 'pageContainer' + pageNumber);
	  page.setAttribute('data-page-number', pageNumber);
	
	  canvas.mozOpaque = true;
	  canvas.setAttribute('id', 'page' + pageNumber);
	
	  return page;
	}
	
	/**
	 * Render a page that has already been created.
	 *
	 * @param {Number} pageNumber The page number to be rendered
	 * @param {Object} renderOptions The options for rendering
	 * @return {Promise} Settled once rendering has completed
	 *  A settled Promise will be either:
	 *    - fulfilled: [pdfPage, annotations]
	 *    - rejected: Error
	 */
	function renderPage(pageNumber, renderOptions) {
	  var documentId = renderOptions.documentId,
	      pdfDocument = renderOptions.pdfDocument,
	      scale = renderOptions.scale,
	      rotate = renderOptions.rotate;
	
	  // Load the page and annotations
	
	  return Promise.all([pdfDocument.getPage(pageNumber), _PDFJSAnnotate2.default.getAnnotations(documentId, pageNumber)]).then(function (_ref) {
	    var _ref2 = _slicedToArray(_ref, 2),
	        pdfPage = _ref2[0],
	        annotations = _ref2[1];
	
	    var page = document.getElementById('pageContainer' + pageNumber);
	    var svg = page.querySelector('.annotationLayer');
	    var canvas = page.querySelector('.canvasWrapper canvas');
	    var canvasContext = canvas.getContext('2d', { alpha: false });
	    var viewport = pdfPage.getViewport(scale, rotate);
	    var transform = scalePage(pageNumber, viewport, canvasContext);
	
	    // Render the page
	    return Promise.all([pdfPage.render({ canvasContext: canvasContext, viewport: viewport, transform: transform }), _PDFJSAnnotate2.default.render(svg, viewport, annotations)]).then(function () {
	      // Text content is needed for a11y, but is also necessary for creating
	      // highlight and strikeout annotations which require selecting text.
	      return pdfPage.getTextContent({ normalizeWhitespace: true }).then(function (textContent) {
	        return new Promise(function (resolve, reject) {
	          // Render text layer for a11y of text content
	          var textLayer = page.querySelector('.textLayer');
	          var textLayerFactory = new PDFJS.DefaultTextLayerFactory();
	          var textLayerBuilder = textLayerFactory.createTextLayerBuilder(textLayer, pageNumber - 1, viewport);
	          textLayerBuilder.setTextContent(textContent);
	          textLayerBuilder.render();
	
	          // Enable a11y for annotations
	          // Timeout is needed to wait for `textLayerBuilder.render`
	          setTimeout(function () {
	            try {
	              (0, _renderScreenReaderHints2.default)(annotations.annotations);
	              resolve();
	            } catch (e) {
	              reject(e);
	            }
	          });
	        });
	      });
	    }).then(function () {
	      // Indicate that the page was loaded
	      page.setAttribute('data-loaded', 'true');
	
	      return [pdfPage, annotations];
	    });
	  });
	}
	
	/**
	 * Scale the elements of a page.
	 *
	 * @param {Number} pageNumber The page number to be scaled
	 * @param {Object} viewport The viewport of the PDF page (see pdfPage.getViewport(scale, rotate))
	 * @param {Object} context The canvas context that the PDF page is rendered to
	 * @return {Array} The transform data for rendering the PDF page
	 */
	function scalePage(pageNumber, viewport, context) {
	  var page = document.getElementById('pageContainer' + pageNumber);
	  var canvas = page.querySelector('.canvasWrapper canvas');
	  var svg = page.querySelector('.annotationLayer');
	  var wrapper = page.querySelector('.canvasWrapper');
	  var textLayer = page.querySelector('.textLayer');
	  var outputScale = getOutputScale(context);
	  var transform = !outputScale.scaled ? null : [outputScale.sx, 0, 0, outputScale.sy, 0, 0];
	  var sfx = approximateFraction(outputScale.sx);
	  var sfy = approximateFraction(outputScale.sy);
	
	  // Adjust width/height for scale
	  page.style.visibility = '';
	  canvas.width = roundToDivide(viewport.width * outputScale.sx, sfx[0]);
	  canvas.height = roundToDivide(viewport.height * outputScale.sy, sfy[0]);
	  canvas.style.width = roundToDivide(viewport.width, sfx[1]) + 'px';
	  canvas.style.height = roundToDivide(viewport.height, sfx[1]) + 'px';
	  svg.setAttribute('width', viewport.width);
	  svg.setAttribute('height', viewport.height);
	  svg.style.width = viewport.width + 'px';
	  svg.style.height = viewport.height + 'px';
	  page.style.width = viewport.width + 'px';
	  page.style.height = viewport.height + 'px';
	  wrapper.style.width = viewport.width + 'px';
	  wrapper.style.height = viewport.height + 'px';
	  textLayer.style.width = viewport.width + 'px';
	  textLayer.style.height = viewport.height + 'px';
	
	  return transform;
	}
	
	/**
	 * The following methods are taken from mozilla/pdf.js and as such fall under
	 * the Apache License (http://www.apache.org/licenses/).
	 *
	 * Original source can be found at mozilla/pdf.js:
	 * https://github.com/mozilla/pdf.js/blob/master/web/ui_utils.js
	 */
	
	/**
	 * Approximates a float number as a fraction using Farey sequence (max order
	 * of 8).
	 *
	 * @param {Number} x Positive float number
	 * @return {Array} Estimated fraction: the first array item is a numerator,
	 *                 the second one is a denominator.
	 */
	function approximateFraction(x) {
	  // Fast path for int numbers or their inversions.
	  if (Math.floor(x) === x) {
	    return [x, 1];
	  }
	
	  var xinv = 1 / x;
	  var limit = 8;
	  if (xinv > limit) {
	    return [1, limit];
	  } else if (Math.floor(xinv) === xinv) {
	    return [1, xinv];
	  }
	
	  var x_ = x > 1 ? xinv : x;
	
	  // a/b and c/d are neighbours in Farey sequence.
	  var a = 0,
	      b = 1,
	      c = 1,
	      d = 1;
	
	  // Limit search to order 8.
	  while (true) {
	    // Generating next term in sequence (order of q).
	    var p = a + c,
	        q = b + d;
	    if (q > limit) {
	      break;
	    }
	    if (x_ <= p / q) {
	      c = p;d = q;
	    } else {
	      a = p;b = q;
	    }
	  }
	
	  // Select closest of neighbours to x.
	  if (x_ - a / b < c / d - x_) {
	    return x_ === x ? [a, b] : [b, a];
	  } else {
	    return x_ === x ? [c, d] : [d, c];
	  }
	}
	
	function getOutputScale(ctx) {
	  var devicePixelRatio = window.devicePixelRatio || 1;
	  var backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
	  var pixelRatio = devicePixelRatio / backingStoreRatio;
	  return {
	    sx: pixelRatio,
	    sy: pixelRatio,
	    scaled: pixelRatio !== 1
	  };
	}
	
	function roundToDivide(x, div) {
	  var r = x % div;
	  return r === 0 ? x : Math.round(x - r + div);
	}

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.enableArrow = enableArrow;
	exports.disableArrow = disableArrow;
	
	var _jquery = __webpack_require__(6);
	
	var _jquery2 = _interopRequireDefault(_jquery);
	
	var _PDFJSAnnotate = __webpack_require__(7);
	
	var _PDFJSAnnotate2 = _interopRequireDefault(_PDFJSAnnotate);
	
	var _appendChild = __webpack_require__(23);
	
	var _appendChild2 = _interopRequireDefault(_appendChild);
	
	var _utils = __webpack_require__(12);
	
	var _relation = __webpack_require__(19);
	
	var _text = __webpack_require__(47);
	
	var _uuid = __webpack_require__(15);
	
	var _uuid2 = _interopRequireDefault(_uuid);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var filter = Array.prototype.filter;
	var forEach = Array.prototype.forEach;
	
	var _enabled = false;
	
	var _arrowType = void 0;
	
	var arrow = void 0;
	var lines = void 0;
	
	var dragging = false;
	
	var svg = void 0;
	
	var BORDER_COLOR = '#FF0000';
	var BGCOLOR = '#FFFF00';
	var BGCOLOR_SELECTED = '#FF0000';
	
	var boundingCircles = [];
	var hitBoundingCircle = void 0;
	var startBoundingCircle = void 0;
	var endBoundingCircle = void 0;
	
	/**
	 * Handle document.mousedown event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleDocumentMousedown(e) {
	  var svg = (0, _utils.findSVGAtPoint)(e.clientX, e.clientY);
	  if (!svg) {
	    return;
	  }
	
	  arrow = null;
	  lines = [];
	
	  (0, _utils.disableUserSelect)();
	
	  if (hitBoundingCircle) {
	    startBoundingCircle = hitBoundingCircle;
	    dragging = true;
	  }
	}
	
	function getClientXY(e) {
	  var rect = svg.getBoundingClientRect();
	  var x = e.clientX - rect.left;
	  var y = e.clientY - rect.top;
	  return { x: x, y: y };
	}
	
	/**
	 * Handle document.mousemove event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleDocumentMousemove(e) {
	
	  var circle = findHitBoundingCircle(e);
	  if (circle) {
	    if (!hitBoundingCircle) {
	      hitBoundingCircle = circle;
	      setVisibility(hitBoundingCircle, BGCOLOR_SELECTED);
	    }
	  } else {
	    if (hitBoundingCircle) {
	      setVisibility(hitBoundingCircle, BGCOLOR);
	      hitBoundingCircle = null;
	    }
	  }
	
	  if (dragging) {
	    saveArrow(e.clientX, e.clientY);
	  }
	}
	
	function setVisibility(circle, style) {
	  if (style === BGCOLOR_SELECTED) {
	    // <animatetransform attributetype="xml" attributename="transform" type="scale" begin="0.7s" dur="0.5s" values="1 1;1.7 1;1 1" calcmode="spline" keysplines=".2,0 .8,.4; .2,.6 .8,1" additive="sum">
	    (0, _jquery2.default)(circle.parentNode).find('rect').addClass('--hover');
	  } else {
	    (0, _jquery2.default)(circle.parentNode).find('rect').removeClass('--hover');
	  }
	}
	
	function findHitBoundingCircle(e) {
	
	  // Mouse Point.
	  var point = (0, _utils.scaleDown)(svg, getClientXY(e));
	
	  for (var i = 0; i < boundingCircles.length; i++) {
	    if (isCircleHit(point, boundingCircles[i])) {
	      return boundingCircles[i];
	    }
	  }
	
	  // Notfound.
	  return null;
	}
	
	function isCircleHit(pos, element) {
	  // <circle cx="100" cy="100" r="100"/>
	  var r = parseFloat(element.getAttribute('r'));
	  var x = parseFloat(element.getAttribute('cx'));
	  var y = parseFloat(element.getAttribute('cy'));
	  var distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
	  return distance <= r;
	}
	
	/**
	 * Handle document.mouseup event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleDocumentMouseup(e) {
	
	  dragging = false;
	
	  cancelArrow();
	
	  var svg = (0, _utils.findSVGAtPoint)(e.clientX, e.clientY);
	  if (!svg) {
	    console.log('not found svg.');
	    return;
	  }
	
	  // End point.
	  endBoundingCircle = hitBoundingCircle;
	
	  // Check valid.
	  if (!endBoundingCircle) {
	    return console.log('not specified end point.');
	  }
	  if (!startBoundingCircle) {
	    return console.log('not specified start point.');
	  }
	  if (startBoundingCircle === endBoundingCircle) {
	    return console.log('start/end are same.');
	  }
	
	  // Create annotation.
	  var startPos = {
	    x: parseFloat(startBoundingCircle.getAttribute('cx')),
	    y: parseFloat(startBoundingCircle.getAttribute('cy'))
	  };
	  var endPos = {
	    x: parseFloat(endBoundingCircle.getAttribute('cx')),
	    y: parseFloat(endBoundingCircle.getAttribute('cy'))
	  };
	  var annotation = {
	    x1: startPos.x,
	    y1: startPos.y,
	    x2: endPos.x,
	    y2: endPos.y,
	    type: 'arrow',
	    direction: _arrowType,
	    highlight1: startBoundingCircle.parentNode.getAttribute('data-pdf-annotate-id'),
	    highlight2: endBoundingCircle.parentNode.getAttribute('data-pdf-annotate-id')
	  };
	
	  var _getMetadata = (0, _utils.getMetadata)(svg),
	      documentId = _getMetadata.documentId,
	      pageNumber = _getMetadata.pageNumber;
	
	  _PDFJSAnnotate2.default.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation).then(function (annotation) {
	    var arrow = (0, _appendChild2.default)(svg, annotation);
	
	    var arrowId = annotation.uuid;
	
	    // add text input.
	    var s = (0, _utils.scaleUp)(svg, startPos);
	    var e = (0, _utils.scaleUp)(svg, endPos);
	    showTextInput(s, e, annotation);
	  });
	}
	
	function showTextInput(start, end, arrowAnnotation) {
	
	  var textPosition = (0, _relation.getRelationTextPosition)(svg, start.x, start.y, end.x, end.y);
	
	  (0, _text.addInputField)(textPosition.x, textPosition.y, null, null, function (textAnnotation) {
	
	    if (!textAnnotation) {
	      return;
	    }
	
	    var svg = (0, _utils.getSVGLayer)();
	
	    var _getMetadata2 = (0, _utils.getMetadata)(svg),
	        documentId = _getMetadata2.documentId,
	        pageNumber = _getMetadata2.pageNumber;
	
	    // FIXME: cannot stop refarence counter. I wanna use the original `annotation`, but couldn't.
	
	
	    _PDFJSAnnotate2.default.getStoreAdapter().getAnnotation(documentId, arrowAnnotation.uuid).then(function (arrowAnnotation) {
	
	      // Set relation between arrow and text.
	      arrowAnnotation.text = textAnnotation.uuid;
	
	      // Update.
	      // let element = document.querySelector('.annotationLayer');
	      var element = document.getElementById('annoLayer'); // TODO make it const.
	      var documentId = element.getAttribute('data-pdf-annotate-document'); // 共通化
	      _PDFJSAnnotate2.default.getStoreAdapter().editAnnotation(documentId, arrowAnnotation.uuid, arrowAnnotation);
	
	      // Update UI.
	      console.log('arrow:', (0, _jquery2.default)('[data-pdf-annotate-id="' + arrowAnnotation.uuid + '"]'));
	      (0, _jquery2.default)('[data-pdf-annotate-id="' + arrowAnnotation.uuid + '"]').attr('data-text', textAnnotation.uuid);
	    });
	  });
	}
	
	/**
	 * Handle document.keyup event
	 *
	 * @param {Event} e The DOM event to handle
	 */
	function handleDocumentKeyup(e) {
	  // Cancel arrow if Esc is pressed
	  if (e.keyCode === 27) {
	    cancelArrow();
	  }
	}
	
	function cancelArrow() {
	  lines = null;
	  if (arrow) {
	    arrow.parentNode.removeChild(arrow);
	    arrow = null;
	  }
	}
	
	/**
	  Save arrow information(x1,y1,x2,y2) and show an arrow.
	
	  @param {Float} x : the point of x.
	  @param {Float} y : the point of y.
	*/
	function saveArrow(x, y) {
	  var svg = (0, _utils.findSVGAtPoint)(x, y);
	  if (!svg) {
	    return;
	  }
	
	  var rect = svg.getBoundingClientRect();
	  var point = (0, _utils.scaleDown)(svg, {
	    x: x - rect.left,
	    y: y - rect.top
	  });
	
	  lines.push([point.x, point.y]);
	  if (lines.length > 1) {
	    lines = [lines[0], lines[lines.length - 1]];
	  }
	
	  if (lines.length <= 1) {
	    return;
	  }
	
	  if (arrow) {
	    svg.removeChild(arrow);
	  }
	
	  arrow = (0, _appendChild2.default)(svg, {
	    x1: lines[0][0],
	    y1: lines[0][1],
	    x2: lines[1][0],
	    y2: lines[1][1],
	    type: 'arrow',
	    direction: _arrowType
	  });
	}
	
	/**
	  Show BoundingBox on highlight objects.
	*/
	function showBoundingBox() {
	
	  // svg = document
	  //             .querySelector('#pageContainer' + PDFView.page)
	  //             .querySelector('svg');
	
	  svg = document.getElementById('annoLayer'); // TODO make it const.
	
	  // Collect boundingCircles for highlight.
	  boundingCircles = [];
	  forEach.call(svg.querySelectorAll('g > [type="boundingCircle"]'), function (boundingCircle) {
	    if ((0, _jquery2.default)(boundingCircle).closest('g').attr('read-only') !== 'true') {
	      boundingCircles.push(boundingCircle);
	    } else {
	      (0, _jquery2.default)(boundingCircle).hide();
	    }
	  });
	}
	
	function disableTextlayer() {
	  var currentPage = PDFView.page;
	  var textLayer = document.querySelector('#pageContainer' + currentPage + ' .textLayer');
	  textLayer.style.pointerEvents = 'None';
	}
	
	function enableTextlayer() {
	  var currentPage = PDFView.page;
	  var textLayer = document.querySelector('#pageContainer' + currentPage + ' .textLayer');
	  textLayer.style.pointerEvents = 'Auto';
	}
	
	function deleteBoundingBoxes() {
	  boundingCircles = [];
	
	  // Collect boundingCircles for highlight.
	  forEach.call(svg.querySelectorAll('g > [type="boundingCircle"]'), function (boundingCircle) {
	    if ((0, _jquery2.default)(boundingCircle).closest('g').attr('read-only') === 'true') {
	      (0, _jquery2.default)(boundingCircle).show();
	    }
	  });
	}
	
	/**
	 * Enable arrow behavior.
	 */
	function enableArrow() {
	  var arrowType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'one-way';
	
	  if (_enabled) {
	    return;
	  }
	
	  _enabled = true;
	  _arrowType = arrowType;
	
	  console.log('enableArrow: ', _arrowType);
	
	  showBoundingBox();
	  (0, _utils.disableUserSelect)();
	  disableTextlayer();
	
	  document.addEventListener('mouseup', handleDocumentMouseup);
	  document.addEventListener('mousedown', handleDocumentMousedown);
	  document.addEventListener('mousemove', handleDocumentMousemove);
	}
	
	/**
	 * Disable arrow behavior.
	 */
	function disableArrow() {
	  if (!_enabled) {
	    return;
	  }
	
	  _enabled = false;
	  document.removeEventListener('mouseup', handleDocumentMouseup);
	  document.removeEventListener('mousedown', handleDocumentMousedown);
	  document.removeEventListener('keyup', handleDocumentKeyup);
	  document.removeEventListener('mousemove', handleDocumentMousemove);
	
	  (0, _utils.enableUserSelect)();
	  enableTextlayer();
	
	  deleteBoundingBoxes();
	}

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(55);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./pdfanno.css", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./pdfanno.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, "/**\n    各種アノテーション\n*/\n.anno-circle {\n    transition:0.2s;\n    transform-origin: center center;\n}\n.anno-circle:hover, .anno-circle.\\--hover {\n  box-shadow: rgba(113,135,164,.6) 1px 1px 1px 1px;\n  /*transform: scale(2);*/\n  stroke: blue;\n  stroke-width: 5px;\n}\n\n.anno-highlight:hover, .anno-highlight.\\--hover {\n  /*html*/\n  box-shadow: 0 0 0 1px #ccc inset;\n  /*svg*/\n  stroke: #ccc;\n  stroke-width: 1px;\n}\n.anno-highlight.\\--selected {\n  stroke: black;\n  stroke-width: 1px;\n  stroke-dasharray: 3;\n}\n\n/**\n  Arrow.\n*/\n.anno-arrow {\n  /*TODO CSSに移した方がソースが綺麗になる*/\n  transition:0.2s;\n}\n.anno-arrow:hover, .anno-arrow.\\--hover {\n  stroke-width: 2px;\n}\n.anno-arrow-outline {\n  fill: none;\n  stroke: black;\n  visibility: hidden;\n  stroke-width: 4px;\n  stroke-dasharray: 2.5;\n  pointer-events: stroke;\n}\n.anno-arrow-outline.\\--selected {\n  visibility: visible;\n}\n\n/**\n  Rect.\n*/\n.anno-rect {\n  transition: 0.2s;\n}\n.anno-rect:hover, .anno-rect.\\--hover {\n  stroke-width: 2px;\n}\n.anno-rect.\\--selected {\n  stroke: black;\n  stroke-width: 4px;\n  stroke-dasharray: 3;\n}\n\n/**\n  Text.\n*/\n.anno-text {\n  transition: 0.2s;\n}\n.anno-text:hover, .anno-text.\\--hover {\n  stroke: red;\n  stroke-width: 0.5px;\n}\n.anno-text.\\--selected {\n  stroke: black;\n  stroke-width: 2px;\n  stroke-dasharray: 3;\n}\n", ""]);
	
	// exports


/***/ },
/* 56 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Annotation Container.
	 */
	var AnnotationContainer = function () {
	    function AnnotationContainer() {
	        _classCallCheck(this, AnnotationContainer);
	
	        this.list = [];
	    }
	
	    _createClass(AnnotationContainer, [{
	        key: "add",
	        value: function add(annotation) {
	            this.list.push(annotation);
	        }
	    }, {
	        key: "remove",
	        value: function remove(annotation) {
	            var newList = [];
	            this.list.forEach(function (a) {
	                if (annotation !== a) {
	                    newList.push(a);
	                }
	            });
	            this.list = newList;
	        }
	    }, {
	        key: "getAllAnnotations",
	        value: function getAllAnnotations() {
	            return this.list;
	        }
	    }]);
	
	    return AnnotationContainer;
	}();
	
	exports.default = AnnotationContainer;
	module.exports = exports["default"];

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(58);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./pdf-annotate.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./pdf-annotate.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, ".annotationLayer {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n", ""]);
	
	// exports


/***/ }
/******/ ])
});
;
//# sourceMappingURL=pdf-annotate.bundle.js.map