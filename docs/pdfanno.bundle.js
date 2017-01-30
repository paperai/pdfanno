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

	"use strict";
	
	__webpack_require__(1);
	__webpack_require__(2);
	
	/**
	 * Resize the height of PDFViewer adjusting to the window.
	 */
	function resizeHandler() {
	    var height = $(window).innerHeight() - $('#viewer').offset().top;
	    $('#viewer iframe').css('height', height + "px");
	}
	
	/**
	    Adjust the height of viewer according to window height.
	*/
	function adjustViewerSize() {
	    window.removeEventListener('resize', resizeHandler);
	    window.addEventListener('resize', resizeHandler);
	    resizeHandler();
	}
	
	/**
	    Disable annotation tool buttons.
	*/
	function disableAnnotateTools() {
	    window.iframeWindow.PDFAnnoCore.UI.disableRect();
	    window.iframeWindow.PDFAnnoCore.UI.disableHighlight();
	    window.iframeWindow.PDFAnnoCore.UI.disableArrow();
	    window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
	}
	
	/**
	    Set the behavior of the tool buttons for annotations.
	*/
	function initializeAnnoToolButtons() {
	
	    $('.js-tool-btn').off('click').on('click', function (e) {
	
	        var $button = $(e.currentTarget);
	        var type = $button.data('type');
	
	        $('.js-tool-btn').removeClass('active');
	        $button.addClass('active');
	
	        disableAnnotateTools();
	
	        if (type === 'view') {
	            window.iframeWindow.PDFAnnoCore.UI.enableViewMode();
	        } else if (type === 'highlight') {
	            window.iframeWindow.PDFAnnoCore.UI.enableHighlight();
	        } else if (type === 'arrow') {
	            window.iframeWindow.PDFAnnoCore.UI.enableArrow('one-way');
	        } else if (type === 'arrow-two-way') {
	            window.iframeWindow.PDFAnnoCore.UI.enableArrow('two-way');
	        } else if (type === 'link') {
	            window.iframeWindow.PDFAnnoCore.UI.enableArrow('link');
	        } else if (type === 'rect') {
	            window.iframeWindow.PDFAnnoCore.UI.enableRect();
	        } else if (type === 'text') {
	            window.iframeWindow.PDFAnnoCore.UI.enableText();
	        }
	
	        return false;
	    });
	
	    $('.js-tool-btn2').off('click').on('click', function (e) {
	
	        var $button = $(e.currentTarget);
	        var type = $button.data('type');
	
	        $button.blur();
	
	        if (type === 'download') {
	            downloadAnnotation();
	        } else if (type === 'delete') {
	            deleteAllAnnotations();
	        }
	
	        return false;
	    });
	
	    $('.js-tool-btn[data-type="view"]').click();
	}
	
	/**
	 * Export the primary annotation data for download.
	 */
	function downloadAnnotation() {
	
	    window.iframeWindow.PDFAnnoCore.getStoreAdapter().exportData().then(function (annotations) {
	        annotations = JSON.stringify(annotations, null, '\t');
	        var blob = new Blob([annotations]);
	        var blobURL = window.URL.createObjectURL(blob);
	        var a = document.createElement('a');
	        document.body.appendChild(a); // for firefox working correctly.
	        a.download = 'pdf.anno';
	        a.href = blobURL;
	        a.click();
	        a.parentNode.removeChild(a);
	    });
	
	    unlistenWindowLeaveEvent();
	}
	
	/**
	 * Reload PDF Viewer.
	 */
	function reloadPDFViewer() {
	
	    // Reload pdf.js.
	    $('#viewer iframe').remove();
	    $('#viewer').html('<iframe src="./pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');
	
	    // Restart.
	    startApplication();
	}
	
	/**
	 * Delete all annotations.
	 */
	function deleteAllAnnotations() {
	
	    // Comfirm to user.
	    var userAnswer = window.confirm('Are you sure to clear the current annotations?');
	    if (!userAnswer) {
	        return;
	    }
	
	    var documentId = window.iframeWindow.getFileName(window.iframeWindow.PDFView.url);
	    window.iframeWindow.PDFAnnoCore.getStoreAdapter().deleteAnnotations(documentId).then(function () {
	        reloadPDFViewer();
	    });
	}
	
	/**
	 * Check the filename which user dropped in.
	 */
	function checkFileCompatibility(fileName, ext) {
	    var fragments = fileName.split('.');
	    if (fragments.length < 2) {
	        return false;
	    }
	    return fragments[1].toLowerCase() === ext;
	}
	
	/**
	 * Load user's pdf file.
	 */
	function handleDroppedFile(file) {
	
	    // Confirm dialog.
	    var userAnswer = window.confirm('Are you sure to load a new pdf file? Please save your current annotations.');
	    if (!userAnswer) {
	        return;
	    }
	
	    var fileName = file.name;
	
	    // Check compatibility.
	    if (!checkFileCompatibility(fileName, 'pdf')) {
	        return alert("FILE NOT COMPATIBLE. \"*.pdf\" can be loaded.\n actual = \"" + fileName + "\".");
	    }
	
	    // Load pdf data, and reload.
	    var fileReader = new FileReader();
	    fileReader.onload = function (event) {
	        var data = event.target.result;
	        localStorage.setItem('_pdfanno_pdf', data);
	        localStorage.setItem('_pdfanno_pdfname', fileName);
	
	        reloadPDFViewer();
	    };
	    fileReader.readAsDataURL(file);
	}
	
	/**
	 * Setup the UI for loading and selecting annotations.
	 */
	function setupAnnotationSelectUI() {
	
	    // Setup colorPickers.
	    $('.js-anno-palette').spectrum({
	        showPaletteOnly: true,
	        showPalette: true,
	        hideAfterPaletteSelect: true,
	        palette: [['blanchedalmond', 'rgb(255, 128, 0)', 'hsv 100 70 50', 'yellow'], ['red', 'green', 'blue', 'violet']]
	    });
	    // Set initial color.
	    $('.js-anno-palette').eq(0).spectrum('set', 'red');
	    $('.js-anno-palette').eq(1).spectrum('set', 'green');
	    $('.js-anno-palette').eq(2).spectrum('set', 'blue');
	    $('.js-anno-palette').eq(3).spectrum('set', 'violet');
	
	    // Setup behavior.
	    $('.js-anno-radio, .js-anno-visibility, .js-anno-palette, .js-anno-file').on('change', displayAnnotation);
	}
	
	/**
	 * The data which has annotations, colors, primaryIndex.
	 */
	var paperData = null;
	
	/**
	 * Load annotation data and display.
	 */
	function displayAnnotation(e) {
	
	    var updateTarget = $(e.target).attr('name');
	
	    // Get the primary index which indicates the editable annotation.
	    var primaryIndex = parseInt($('.js-anno-radio:checked').val(), 10);
	
	    // Get annotation visibilities.
	    var visibilities = [$('.js-anno-visibility').eq(0).is(':checked'), $('.js-anno-visibility').eq(1).is(':checked'), $('.js-anno-visibility').eq(2).is(':checked'), $('.js-anno-visibility').eq(3).is(':checked')];
	
	    // Get annotation colors.
	    var colors = [$('.js-anno-palette').eq(0).spectrum('get').toHexString(), $('.js-anno-palette').eq(1).spectrum('get').toHexString(), $('.js-anno-palette').eq(2).spectrum('get').toHexString(), $('.js-anno-palette').eq(3).spectrum('get').toHexString()];
	
	    // Get annotation data.
	    var actions = [];
	    $('.js-anno-file').each(function () {
	        var files = this.files;
	
	        actions.push(new Promise(function (resolve, reject) {
	
	            if (files.length === 0) {
	                return resolve(null);
	            }
	
	            var fileReader = new FileReader();
	            fileReader.onload = function (event) {
	                var annotation = event.target.result;
	                // TODO JSON scheme check ?
	                resolve(JSON.parse(annotation));
	            };
	            fileReader.readAsText(files[0]);
	        }));
	    });
	    Promise.all(actions).then(function (annotations) {
	
	        annotations = annotations.map(function (a) {
	            return a ? a : {};
	        });
	
	        // Create import data.
	        paperData = {
	            num: 4,
	            primary: primaryIndex,
	            visibilities: visibilities,
	            colors: colors,
	            annotations: annotations,
	            updateTarget: updateTarget
	        };
	
	        // Pass the data to pdf-annotatejs.
	        window.iframeWindow.PDFAnnoCore.getStoreAdapter().importAnnotations(paperData).then(function (result) {
	
	            // Reload the viewer.
	            reloadPDFViewer();
	
	            // Reset tools to viewMode.
	            $('.js-tool-btn[data-type="view"]').click();
	        });
	    });
	}
	
	/**
	 * Set the confirm dialog at leaving the page.
	 */
	function listenWindowLeaveEvent() {
	    $(window).off('beforeunload').on('beforeunload', function () {
	        return 'You don\'t save the annotations yet.\nAre you sure to leave ?';
	    });
	}
	
	/**
	 * Unset the confirm dialog at leaving the page.
	 */
	function unlistenWindowLeaveEvent() {
	    $(window).off('beforeunload');
	}
	
	/**
	 * Start PDFAnno Application.
	 */
	function startApplication() {
	
	    // Alias for convenience.
	    window.iframeWindow = $('#viewer iframe').get(0).contentWindow;
	
	    iframeWindow.addEventListener('DOMContentLoaded', function () {
	
	        // Adjust the height of viewer.
	        adjustViewerSize();
	
	        // Initialize tool buttons' behavior.
	        initializeAnnoToolButtons();
	
	        // Reset the confirm dialog at leaving page.
	        unlistenWindowLeaveEvent();
	    });
	
	    // Set viewMode behavior after annotations rendered.
	    iframeWindow.addEventListener('annotationrendered', function () {
	        window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
	        window.iframeWindow.PDFAnnoCore.UI.enableViewMode();
	    });
	
	    // Handle the pdf user dropped in.
	    iframeWindow.addEventListener('pdfdropped', function (ev) {
	        handleDroppedFile(ev.detail.file);
	    });
	
	    // Set the confirm dialog at page leaving.
	    iframeWindow.addEventListener('annotationUpdated', listenWindowLeaveEvent);
	}
	
	/**
	    The entry point.
	*/
	window.addEventListener('DOMContentLoaded', function (e) {
	
	    // Delete prev annotations.
	    if (location.search.indexOf('debug') === -1) {
	        var LOCALSTORAGE_KEY2 = '_pdfanno_containers';
	        localStorage.removeItem(LOCALSTORAGE_KEY2);
	    }
	
	    // Start application.
	    startApplication();
	
	    // Setup the annotation load and select UI.
	    setupAnnotationSelectUI();
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "dist/index.html";

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(3);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./pdfanno.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./pdfanno.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset 'utf-8';\n\n/**\n * Viewer size.\n * This height will be override to fit the browser height (by app.js).\n */\n.anno-viewer {\n    width: 100%;\n    height: 500px;\n}\n\n/**\n * Annotation Select UI Layout.\n */\n.anno-select-layout {}\n.anno-select-layout .row:first-child {\n    margin-bottom: 10px;\n}\n.anno-select-layout [type=\"radio\"] {\n    margin-right: 5px;\n}\n.anno-select-layout [type=\"file\"] {\n    display: inline-block;\n    margin-left: 5px;\n    line-height: 1em;\n}\n.anno-select-layout .sp-replacer {\n    padding: 0;\n    border: none;\n}\n.anno-select-layout .sp-dd {\n    display: none;\n}\n", ""]);
	
	// exports


/***/ },
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


/***/ }
/******/ ])
});
;
//# sourceMappingURL=pdfanno.bundle.js.map