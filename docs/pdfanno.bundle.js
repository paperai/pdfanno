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
	 * The data which is loaded via `Browse` button.
	 */
	var fileMap = {};
	
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
	    window.iframeWindow.PDFAnnoCore.UI.disableSpan();
	    window.iframeWindow.PDFAnnoCore.UI.disableRelation();
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
	        } else if (type === 'span') {
	            window.iframeWindow.PDFAnnoCore.UI.enableSpan();
	        } else if (type === 'one-way') {
	            window.iframeWindow.PDFAnnoCore.UI.enableRelation('one-way');
	        } else if (type === 'two-way') {
	            window.iframeWindow.PDFAnnoCore.UI.enableRelation('two-way');
	        } else if (type === 'link') {
	            window.iframeWindow.PDFAnnoCore.UI.enableRelation('link');
	        } else if (type === 'rect') {
	            window.iframeWindow.PDFAnnoCore.UI.enableRect();
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
	
	function _getDownloadFileName() {
	
	    // The name of Primary Annotation.
	    var primaryAnnotationName = void 0;
	    $('#dropdownAnnoPrimary a').each(function (index, element) {
	        var $elm = $(element);
	        if ($elm.find('.fa-check').hasClass('no-visible') === false) {
	            primaryAnnotationName = $elm.find('.js-annoname').text();
	        }
	    });
	    if (primaryAnnotationName) {
	        return primaryAnnotationName;
	    }
	
	    // The name of PDF.
	    var pdfFileName = iframeWindow.getFileName(iframeWindow.PDFView.url);
	    return pdfFileName.split('.')[0] + '.anno';
	}
	
	/**
	 * Export the primary annotation data for download.
	 */
	function downloadAnnotation() {
	
	    window.iframeWindow.PDFAnnoCore.getStoreAdapter().exportData().then(function (annotations) {
	        var blob = new Blob([annotations]);
	        var blobURL = window.URL.createObjectURL(blob);
	        var a = document.createElement('a');
	        document.body.appendChild(a); // for firefox working correctly.
	        a.download = _getDownloadFileName();
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
	
	    iframeWindow.annotationContainer.destroy();
	
	    var documentId = window.iframeWindow.getFileName(window.iframeWindow.PDFView.url);
	    window.iframeWindow.PDFAnnoCore.getStoreAdapter().deleteAnnotations(documentId).then(function () {
	        reloadPDFViewer();
	    });
	}
	
	/**
	 * Setup the color pickers.
	 */
	function setupColorPicker() {
	
	    var colors = ['rgb(255, 128, 0)', 'hsv 100 70 50', 'yellow', 'blanchedalmond', 'red', 'green', 'blue', 'violet'];
	
	    // Setup colorPickers.
	    $('.js-anno-palette').spectrum({
	        showPaletteOnly: true,
	        showPalette: true,
	        hideAfterPaletteSelect: true,
	        palette: [colors.slice(0, Math.floor(colors.length / 2)), colors.slice(Math.floor(colors.length / 2), colors.length)]
	    });
	    // Set initial color.
	    $('.js-anno-palette').each(function (i, elm) {
	        $(elm).spectrum('set', colors[i % colors.length]);
	    });
	
	    // Setup behavior.
	    $('.js-anno-palette').off('change').on('change', displayAnnotation.bind(null, false));
	}
	
	/**
	 * Load annotation data and display.
	 */
	function displayAnnotation(isPrimary) {
	
	    var annotations = [];
	    var colors = [];
	    var primaryIndex = -1;
	
	    // Primary annotation.
	    if (isPrimary) {
	        $('#dropdownAnnoPrimary a').each(function (index, element) {
	            var $elm = $(element);
	            if ($elm.find('.fa-check').hasClass('no-visible') === false) {
	                var annoPath = $elm.find('.js-annoname').text();
	                if (!fileMap[annoPath]) {
	                    console.log('ERROR');
	                    return;
	                }
	                primaryIndex = 0;
	                annotations.push(fileMap[annoPath]);
	                var color = null; // Use the default color used for edit.
	                colors.push(color);
	
	                var filename = annoPath.split('/')[annoPath.split('/').length - 1];
	                localStorage.setItem('_pdfanno_primary_annoname', filename);
	                console.log('filename:', filename);
	            }
	        });
	    }
	
	    // Reference annotations.
	    if (!isPrimary) {
	        $('#dropdownAnnoReference a').each(function (index, element) {
	            var $elm = $(element);
	            if ($elm.find('.fa-check').hasClass('no-visible') === false) {
	                var annoPath = $elm.find('.js-annoname').text();
	                if (!fileMap[annoPath]) {
	                    console.log('ERROR');
	                    return;
	                }
	                annotations.push(fileMap[annoPath]);
	                var color = $elm.find('.js-anno-palette').spectrum('get').toHexString();
	                console.log(color);
	                colors.push(color);
	            }
	        });
	    }
	
	    console.log('colors:', colors);
	
	    // Create import data.
	    var paperData = {
	        primary: primaryIndex,
	        colors: colors,
	        annotations: annotations
	    };
	
	    // Pass the data to pdf-annotatejs.
	    window.iframeWindow.PDFAnnoCore.getStoreAdapter().importAnnotations(paperData, isPrimary).then(function (result) {
	
	        // Reload the viewer.
	        reloadPDFViewer();
	
	        // Reset tools to viewMode.
	        $('.js-tool-btn[data-type="view"]').click();
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
	 * Clear the dropdowns of annotations.
	 */
	function clearAnnotationDropdowns() {
	    $('#dropdownAnnoPrimary ul').html('');
	    $('#dropdownAnnoReference ul').html('');
	    $('#dropdownAnnoPrimary .js-text').text('Select Anno file');
	    $('#dropdownAnnoReference .js-text').text('Select reference Anno files');
	}
	
	function _excludeBaseDirName(filePath) {
	    var frgms = filePath.split('/');
	    return frgms[frgms.length - 1];
	}
	
	/**
	 * Clear the dropdown of a PDF file.
	 */
	function setupBrowseButton() {
	
	    $('.js-file :file').on('change', function (ev) {
	
	        console.log('Browse button starts to work.');
	
	        var files = ev.target.files;
	        if (!files || files.length === 0) {
	            console.log('ev.target.files', ev.target.files);
	            console.log('Not files specified');
	            return;
	        }
	
	        var pdfs = [];
	        var annos = [];
	
	        for (var i = 0; i < files.length; i++) {
	
	            var file = ev.target.files[i];
	            var relativePath = file.webkitRelativePath;
	            if (!relativePath) {
	                alert('Please select a directory, NOT a file');
	                return;
	            }
	
	            var frgms = relativePath.split('/');
	            if (frgms.length > 2) {
	                console.log('SKIP:', relativePath);
	                continue;
	            }
	            console.log('relativePath:', relativePath);
	
	            // Get files only PDFs or Anno files.
	            if (relativePath.match(/\.pdf$/i)) {
	                pdfs.push(file);
	            } else if (relativePath.match(/\.anno$/i)) {
	                annos.push(file);
	            }
	        }
	
	        // pdf.
	        $('#dropdownPdf .js-text').text('Select PDF file');
	        $('#dropdownPdf li').remove();
	        pdfs.forEach(function (file) {
	            var pdfPath = _excludeBaseDirName(file.webkitRelativePath);
	            var snipet = "\n                <li>\n                    <a href=\"#\">\n                        <i class=\"fa fa-check no-visible\" aria-hidden=\"true\"></i>&nbsp;\n                        <span class=\"js-pdfname\">" + pdfPath + "</span>\n                    </a>\n                </li>\n            ";
	            $('#dropdownPdf ul').append(snipet);
	        });
	
	        // Clear anno dropdowns.
	        clearAnnotationDropdowns();
	
	        // Initialize PDF Viewer.
	        clearAllAnnotations();
	        localStorage.removeItem('_pdfanno_pdf');
	        localStorage.removeItem('_pdfanno_pdfname');
	        reloadPDFViewer();
	
	        fileMap = {};
	
	        // Load pdfs.
	        pdfs.forEach(function (file) {
	            var fileReader = new FileReader();
	            fileReader.onload = function (event) {
	                var pdf = event.target.result;
	                var fileName = _excludeBaseDirName(file.webkitRelativePath);
	                fileMap[fileName] = pdf;
	            };
	            fileReader.readAsDataURL(file);
	        });
	
	        // Load annos.
	        annos.forEach(function (file) {
	            var fileReader = new FileReader();
	            fileReader.onload = function (event) {
	                var annotation = event.target.result;
	                var fileName = _excludeBaseDirName(file.webkitRelativePath);
	                fileMap[fileName] = annotation;
	            };
	            fileReader.readAsText(file);
	        });
	    });
	}
	
	/**
	 * Setup the dropdown of PDFs.
	 */
	function setupPdfDropdown() {
	
	    $('#dropdownPdf').on('click', 'a', function (e) {
	
	        var $this = $(e.currentTarget);
	        var pdfPath = $this.find('.js-pdfname').text();
	
	        var currentPDFName = $('#dropdownPdf .js-text').text();
	        if (currentPDFName === pdfPath) {
	            console.log('Not reload. the pdf are same.');
	            return;
	        }
	
	        // Confirm to override.
	        if (currentPDFName !== 'Select PDF file') {
	            if (!window.confirm('Are you sure to load another PDF ?')) {
	                return;
	            }
	        }
	
	        $('#dropdownPdf .js-text').text(pdfPath);
	
	        $('#dropdownPdf .fa-check').addClass('no-visible');
	        $this.find('.fa-check').removeClass('no-visible');
	
	        if (!fileMap[pdfPath]) {
	            return false;
	        }
	
	        // reload.
	        window.pdf = fileMap[pdfPath];
	        var fileName = pdfPath.split('/')[pdfPath.split('/').length - 1];
	        window.pdfName = fileName;
	
	        reloadPDFViewer();
	
	        // Clear anno dropdowns.
	        clearAnnotationDropdowns();
	
	        // Clear the all annotations.
	        clearAllAnnotations();
	
	        // Setup anno dropdown.
	        var pdfName = pdfPath.replace(/\.pdf$/i, '');
	        Object.keys(fileMap).forEach(function (filePath) {
	
	            if (!filePath.match(/\.anno$/i)) {
	                return;
	            }
	
	            if (filePath.indexOf(pdfName) === 0) {
	
	                var snipet1 = "\n                    <li>\n                        <a href=\"#\">\n                            <i class=\"fa fa-check no-visible\" aria-hidden=\"true\"></i>\n                            <span class=\"js-annoname\">" + filePath + "</span>\n                        </a>\n                    </li>\n                ";
	                $('#dropdownAnnoPrimary ul').append(snipet1);
	
	                var snipet2 = "\n                    <li>\n                        <a href=\"#\">\n                            <i class=\"fa fa-check no-visible\" aria-hidden=\"true\"></i>\n                            <input type=\"text\"  name=\"color\" class=\"js-anno-palette\"  autocomplete=\"off\">\n                            <span class=\"js-annoname\">" + filePath + "</span>\n                        </a>\n                    </li>\n                ";
	                $('#dropdownAnnoReference ul').append(snipet2);
	            }
	        });
	
	        // Setup color pallets.
	        setupColorPicker();
	
	        // Close dropdown.
	        $('#dropdownPdf').click();
	
	        return false;
	    });
	}
	
	/**
	 * Setup the dropdown of a primary annotation.
	 */
	function setupPrimaryAnnoDropdown() {
	
	    $('#dropdownAnnoPrimary').on('click', 'a', function (e) {
	
	        var $this = $(e.currentTarget);
	        var annoName = $this.find('.js-annoname').text();
	
	        var currentAnnoName = $('#dropdownAnnoPrimary .js-text').text();
	        if (currentAnnoName === annoName) {
	            console.log('Not reload. the anno are same.');
	            return;
	        }
	
	        // Confirm to override.
	        if (currentAnnoName !== 'Select Anno file') {
	            if (!window.confirm('Are you sure to load another Primary Annotation ?')) {
	                return;
	            }
	        }
	
	        $('#dropdownAnnoPrimary .js-text').text(annoName);
	        console.log(annoName);
	
	        $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
	        $this.find('.fa-check').removeClass('no-visible');
	
	        if (!fileMap[annoName]) {
	            return false;
	        }
	
	        // reload.
	        displayAnnotation(true);
	
	        // Close
	        $('#dropdownAnnoPrimary').click();
	
	        return false;
	    });
	}
	
	/**
	 * Setup the dropdown of reference annotations.
	 */
	function setupReferenceAnnoDropdown() {
	
	    $('#dropdownAnnoReference').on('click', 'a', function (e) {
	
	        var $this = $(e.currentTarget);
	
	        $this.find('.fa-check').toggleClass('no-visible');
	
	        var annoNames = [];
	        $('#dropdownAnnoReference a').each(function (index, element) {
	            var $elm = $(element);
	            if ($elm.find('.fa-check').hasClass('no-visible') === false) {
	                annoNames.push($elm.find('.js-annoname').text());
	            }
	        });
	        if (annoNames.length > 0) {
	            $('#dropdownAnnoReference .js-text').text(annoNames.join(','));
	        } else {
	            $('#dropdownAnnoReference .js-text').text('Select reference Anno files');
	        }
	
	        displayAnnotation(false);
	
	        return false;
	    });
	}
	
	/**
	 * Clear the all annotations from the view and storage.
	 */
	function clearAllAnnotations() {
	    localStorage.removeItem('_pdfanno_containers');
	    localStorage.removeItem('_pdfanno_primary_annoname');
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
	
	    // Set the confirm dialog at page leaving.
	    iframeWindow.addEventListener('annotationUpdated', listenWindowLeaveEvent);
	}
	
	/**
	 *  The entry point.
	 */
	window.addEventListener('DOMContentLoaded', function (e) {
	
	    // Delete prev annotations.
	    if (location.search.indexOf('debug') === -1) {
	        clearAllAnnotations();
	    }
	
	    // Start application.
	    startApplication();
	
	    // Setup loading tools for PDFs and Anno files.
	    setupBrowseButton();
	    setupPdfDropdown();
	    setupPrimaryAnnoDropdown();
	    setupReferenceAnnoDropdown();
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
	exports.push([module.id, "@charset 'utf-8';\n\n.no-visible {\n    visibility: hidden;\n}\n\n/**\n * Viewer size.\n * This height will be override to fit the browser height (by app.js).\n */\n.anno-viewer {\n    width: 100%;\n    height: 500px;\n}\n\n/**\n * Annotation Select UI Layout.\n */\n.anno-select-layout {}\n.anno-select-layout .row:first-child {\n    margin-bottom: 10px;\n}\n.anno-select-layout [type=\"radio\"] {\n    margin-right: 5px;\n}\n.anno-select-layout [type=\"file\"] {\n    display: inline-block;\n    margin-left: 5px;\n    line-height: 1em;\n}\n.anno-select-layout .sp-replacer {\n    padding: 0;\n    border: none;\n}\n.anno-select-layout .sp-dd {\n    display: none;\n}\n\n\n\n.anno-ui .sp-replacer {\n    padding: 0;\n    border: none;\n}\n.anno-ui .sp-dd {\n    display: none;\n}\n.anno-ui .sp-preview {\n    margin-right: 0;\n}\n\n", ""]);
	
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