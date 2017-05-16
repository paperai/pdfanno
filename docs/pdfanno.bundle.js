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
	
	var _anno = __webpack_require__(1);
	
	var _display = __webpack_require__(2);
	
	var _browseButton = __webpack_require__(3);
	
	var browseButton = _interopRequireWildcard(_browseButton);
	
	var _pdfDropdown = __webpack_require__(4);
	
	var pdfDropdown = _interopRequireWildcard(_pdfDropdown);
	
	var _primaryAnnoDropdown = __webpack_require__(6);
	
	var primaryAnnoDropdown = _interopRequireWildcard(_primaryAnnoDropdown);
	
	var _annoListDropdown = __webpack_require__(7);
	
	var annoListDropdown = _interopRequireWildcard(_annoListDropdown);
	
	var _referenceAnnoDropdown = __webpack_require__(9);
	
	var referenceAnnoDropdown = _interopRequireWildcard(_referenceAnnoDropdown);
	
	var _downloadButton = __webpack_require__(10);
	
	var downloadButton = _interopRequireWildcard(_downloadButton);
	
	var _uploadButton = __webpack_require__(12);
	
	var uploadButton = _interopRequireWildcard(_uploadButton);
	
	var _annotationTools = __webpack_require__(13);
	
	var annotationsTools = _interopRequireWildcard(_annotationTools);
	
	var _inputLabel = __webpack_require__(15);
	
	var inputLabel = _interopRequireWildcard(_inputLabel);
	
	var _window = __webpack_require__(11);
	
	var _public = __webpack_require__(16);
	
	var publicApi = _interopRequireWildcard(_public);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	__webpack_require__(20);
	__webpack_require__(21);
	
	/**
	 * Expose public APIs.
	 */
	window.add = publicApi.addAnnotation;
	window.addAll = publicApi.addAllAnnotations;
	window.delete = publicApi.deleteAnnotation;
	window.RectAnnotation = publicApi.PublicRectAnnotation;
	window.SpanAnnotation = publicApi.PublicSpanAnnotation;
	window.RelationAnnotation = publicApi.PublicRelationAnnotation;
	window.readTOML = publicApi.readTOML;
	
	/**
	 * The data which is loaded via `Browse` button.
	 */
	window.fileMap = {};
	
	// Check Ctrl or Cmd button clicked.
	// ** ATTENTION!! ALSO UPDATED by core/index.js **
	$(document).on('keydown', function (e) {
	    if (e.keyCode === 17 || e.keyCode === 91) {
	        // 17:ctrlKey, 91:cmdKey
	        window.iframeWindow.ctrlPressed = true;
	        console.log('ctrl press!!2');
	    }
	}).on('keyup', function (e) {
	    window.iframeWindow.ctrlPressed = false;
	    console.log('ctrl release!!2');
	});
	
	/**
	    Adjust the height of viewer according to window height.
	*/
	function adjustViewerSize() {
	    window.removeEventListener('resize', _window.resizeHandler);
	    window.addEventListener('resize', _window.resizeHandler);
	    (0, _window.resizeHandler)();
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
	
	        // Reset the confirm dialog at leaving page.
	        (0, _window.unlistenWindowLeaveEvent)();
	
	        var event = document.createEvent('CustomEvent');
	        event.initCustomEvent('iframeDOMContentLoaded', true, true, null);
	        window.dispatchEvent(event);
	    });
	
	    iframeWindow.addEventListener('annotationrendered', function () {
	
	        // Restore the status of AnnoTools.
	        (0, _anno.disableAnnotateTools)();
	        (0, _anno.enableAnnotateTool)(window.currentAnnoToolType);
	
	        var event = document.createEvent('CustomEvent');
	        event.initCustomEvent('annotationrendered', true, true, null);
	        window.dispatchEvent(event);
	    });
	
	    // Set the confirm dialog when leaving a page.
	    iframeWindow.addEventListener('annotationUpdated', function () {
	        (0, _window.listenWindowLeaveEvent)();
	
	        var event = document.createEvent('CustomEvent');
	        event.initCustomEvent('annotationUpdated', true, true, null);
	        window.dispatchEvent(event);
	    });
	
	    // enable text input.
	    iframeWindow.addEventListener('enableTextInput', function (e) {
	        console.log('enableTextInput:', e.detail);
	        inputLabel.enable(e.detail);
	    });
	
	    // disable text input.
	    iframeWindow.addEventListener('disappearTextInput', function () {
	        console.log('disappearTextInput');
	        inputLabel.disable(e.detail);
	    });
	
	    iframeWindow.addEventListener('annotationDeleted', function (e) {
	        console.log('annotationDeleted:', e.detail);
	        inputLabel.treatAnnotationDeleted(e.detail);
	    });
	
	    iframeWindow.addEventListener('annotationHoverIn', function (e) {
	        console.log('annotationHoverIn:', e.detail);
	        inputLabel.handleAnnotationHoverIn(e.detail);
	    });
	
	    iframeWindow.addEventListener('annotationHoverOut', function (e) {
	        console.log('annotationHoverOut:', e.detail);
	        inputLabel.handleAnnotationHoverOut(e.detail);
	    });
	
	    iframeWindow.addEventListener('annotationSelected', function (e) {
	        console.log('annotationSelected:', e.detail);
	        inputLabel.handleAnnotationSelected(e.detail);
	    });
	
	    iframeWindow.addEventListener('annotationDeselected', function () {
	        console.log('annotationDeselected');
	        inputLabel.handleAnnotationDeselected();
	    });
	}
	
	/**
	 *  The entry point.
	 */
	window.addEventListener('DOMContentLoaded', function (e) {
	
	    // Delete prev annotations.
	    if (location.search.indexOf('debug') === -1) {
	        (0, _anno.clearAllAnnotations)();
	    }
	
	    // Reset PDFViwer settings.
	    (0, _display.resetPDFViewerSettings)();
	
	    // Start application.
	    startApplication();
	
	    // Setup UI parts.
	    browseButton.setup();
	    pdfDropdown.setup();
	    primaryAnnoDropdown.setup();
	    referenceAnnoDropdown.setup();
	    annoListDropdown.setup();
	    downloadButton.setup();
	    uploadButton.setup();
	    annotationsTools.setup();
	
	    window.addEventListener('restartApp', startApplication);
	
	    // enable text input.
	    window.addEventListener('enableTextInput', function (e) {
	        console.log('enableTextInput2:', e.detail);
	        inputLabel.enable(e.detail);
	    });
	
	    // disable text input.
	    window.addEventListener('disappearTextInput', function (e) {
	        console.log('disappearTextInput2:', e.detail);
	        inputLabel.disable(e.detail);
	    });
	
	    // resizable.
	    (0, _window.setupResizableColumns)();
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.disableAnnotateTools = disableAnnotateTools;
	exports.enableAnnotateTool = enableAnnotateTool;
	exports.clearAllAnnotations = clearAllAnnotations;
	/**
	 * Annotations.
	 */
	
	/**
	    Disable annotation tool buttons.
	*/
	function disableAnnotateTools() {
	    window.iframeWindow.PDFAnnoCore.UI.disableRect();
	    window.iframeWindow.PDFAnnoCore.UI.disableSpan();
	    window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
	}
	
	/**
	 * Enable an annotation tool.
	 */
	function enableAnnotateTool(type) {
	
	    if (type === 'rect') {
	        window.iframeWindow.PDFAnnoCore.UI.enableRect();
	    }
	}
	
	/**
	 * Clear the all annotations from the view and storage.
	 */
	function clearAllAnnotations() {
	    localStorage.removeItem('_pdfanno_containers');
	    localStorage.removeItem('_pdfanno_primary_annoname');
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.displayAnnotation = displayAnnotation;
	exports.reloadPDFViewer = reloadPDFViewer;
	exports.resetPDFViewerSettings = resetPDFViewerSettings;
	exports.setupColorPicker = setupColorPicker;
	
	
	/**
	 * Display annotations an user selected.
	 */
	function displayAnnotation(isPrimary) {
	    var reload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	
	
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
	
	        if (reload) {
	            // Reload the viewer.
	            reloadPDFViewer();
	        }
	
	        return true;
	    });
	}
	
	/**
	 * Reload PDF Viewer.
	 */
	function reloadPDFViewer() {
	
	    // Reset setting.
	    resetPDFViewerSettings();
	
	    // Reload pdf.js.
	    $('#viewer iframe').remove();
	    $('#viewer').html('<iframe src="./pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');
	
	    // Restart.
	    var event = document.createEvent('CustomEvent');
	    event.initCustomEvent('restartApp', true, true, null);
	    window.dispatchEvent(event);
	
	    // Catch the event iframe is ready.
	    function iframeReady() {
	        console.log('iframeReady');
	        window.removeEventListener('annotationrendered', iframeReady);
	    }
	    window.addEventListener('annotationrendered', iframeReady);
	}
	
	/**
	 * Reset PDF Viewer settings.
	 */
	function resetPDFViewerSettings() {
	    localStorage.removeItem('database');
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

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	
	var _display = __webpack_require__(2);
	
	var _anno = __webpack_require__(1);
	
	/**
	 * Setup the behavior of a Browse Button.
	 */
	/**
	 * UI parts - Browse button.
	 */
	function setup() {
	
	    // Enable to select the same directory twice.
	    $('.js-file :file').on('click', function (ev) {
	        $('input[type="file"]').val(null);
	    });
	
	    $('.js-file :file').on('change', function (ev) {
	
	        var files = ev.target.files;
	
	        var error = isValidDirectorySelect(files);
	        if (error) {
	            return alert(error);
	        }
	
	        // Get current visuals.
	        var current = getCurrentFileNames();
	
	        // Get contents.
	
	        var _getContents = getContents(files),
	            pdfs = _getContents.pdfs,
	            annos = _getContents.annos;
	
	        // Setup PDF Dropdown.
	
	
	        setPDFDropdownList(pdfs);
	
	        // Setup Anno Dropdown.
	        setAnnoDropdownList(annos);
	
	        // Initialize PDF Viewer.
	        (0, _anno.clearAllAnnotations)();
	
	        // Load data.
	        loadData(pdfs, annos).then(function () {
	
	            // Display a PDF and annotations.
	            display(current, fileMap);
	        });
	    });
	}
	
	function display(currentDisplay, newFileMap) {
	
	    console.log('files:', Object.keys(newFileMap));
	
	    var name = void 0;
	
	    // PDF.
	    name = currentDisplay.pdfName;
	    if (name && newFileMap[name]) {
	        window.pdf = fileMap[name];
	        window.pdfName = currentDisplay.pdfName;
	
	        $('#dropdownPdf .js-text').text(name);
	        $('#dropdownPdf a').each(function (index, element) {
	            var $elm = $(element);
	            if ($elm.find('.js-pdfname').text() === name) {
	                $elm.find('.fa-check').removeClass('no-visible');
	            }
	        });
	    } else {
	        delete window.pdf;
	        delete window.pdfName;
	    }
	
	    // Primary Annotation.
	    name = currentDisplay.primaryAnnotationName;
	    var promise1 = Promise.resolve();
	    if (name && newFileMap[name]) {
	
	        $('#dropdownAnnoPrimary .js-text').text(name);
	        $('#dropdownAnnoPrimary a').each(function (index, element) {
	            var $elm = $(element);
	            if ($elm.find('.js-annoname').text() === name) {
	                $elm.find('.fa-check').removeClass('no-visible');
	            }
	        });
	
	        promise1 = (0, _display.displayAnnotation)(true, false);
	    }
	
	    // Reference Annotations.
	    var names = currentDisplay.referenceAnnotationNames;
	    var colors = currentDisplay.referenceAnnotationColors;
	    var changed = false;
	    names = names.filter(function (name, i) {
	        var found = false;
	        if (newFileMap[name]) {
	            $('#dropdownAnnoReference a').each(function (index, element) {
	                var $elm = $(element);
	                if ($elm.find('.js-annoname').text() === name) {
	                    $elm.find('.fa-check').removeClass('no-visible');
	                    $elm.find('.js-anno-palette').spectrum('set', colors[i]);
	
	                    console.log('color: ', colors[i]);
	
	                    found = true;
	                }
	            });
	        }
	        return found;
	    });
	    var promise2 = Promise.resolve();
	    if (names.length > 0) {
	        $('#dropdownAnnoReference .js-text').text(names.join(','));
	        promise2 = (0, _display.displayAnnotation)(false, false);
	    }
	
	    // Reload page.
	    Promise.all([promise1, promise2]).then(_display.reloadPDFViewer);
	}
	
	/**
	 * Get a filename from a path.
	 */
	function _excludeBaseDirName(filePath) {
	    var frgms = filePath.split('/');
	    return frgms[frgms.length - 1];
	}
	
	/**
	 * Get the file names which currently are displayed.
	 */
	function getCurrentFileNames() {
	
	    var text = void 0;
	
	    // a PDF name.
	    text = $('#dropdownPdf .js-text').text();
	    var pdfName = text !== 'PDF File' ? text : null;
	
	    // a Primary anno.
	    text = $('#dropdownAnnoPrimary .js-text').text();
	    var primaryAnnotationName = text !== 'Anno File' ? text : null;
	
	    var referenceAnnotationNames = [];
	    var referenceAnnotationColors = [];
	    $('#dropdownAnnoReference a').each(function (index, element) {
	        var $elm = $(element);
	        if ($elm.find('.fa-check').hasClass('no-visible') === false) {
	            var annoName = $elm.find('.js-annoname').text(); // TODO こういうのはJS変数として持っておいたほうがいいかも（選択済のものについて）
	            referenceAnnotationNames.push(annoName);
	            var color = $elm.find('.js-anno-palette').spectrum('get').toHexString();
	            referenceAnnotationColors.push(color);
	        }
	    });
	
	    return {
	        pdfName: pdfName,
	        primaryAnnotationName: primaryAnnotationName,
	        referenceAnnotationNames: referenceAnnotationNames,
	        referenceAnnotationColors: referenceAnnotationColors
	    };
	}
	
	/**
	 * Check whether the directory the user specified is valid.
	 */
	function isValidDirectorySelect(files) {
	
	    // Error, if no contents exits.
	    if (!files || files.length === 0) {
	        return 'Not files specified';
	    }
	
	    // Error, if the user select a file - not a directory.
	    var relativePath = files[0].webkitRelativePath;
	    if (!relativePath) {
	        return 'Please select a directory, NOT a file';
	    }
	
	    // OK.
	    return null;
	}
	
	/**
	 * Extract PDFs and annotations from files the user specified.
	 */
	function getContents(files) {
	    var pdfs = [];
	    var annos = [];
	
	    for (var i = 0; i < files.length; i++) {
	
	        var file = files[i];
	        var relativePath = file.webkitRelativePath;
	
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
	
	    return {
	        pdfs: pdfs,
	        annos: annos
	    };
	}
	
	/**
	 * Setup the contents of the dropdown for PDFs.
	 */
	function setPDFDropdownList(pdfs) {
	
	    $('#dropdownPdf .js-text').text('PDF File');
	    $('#dropdownPdf li').remove();
	    pdfs.forEach(function (file) {
	        var pdfPath = _excludeBaseDirName(file.webkitRelativePath);
	        var snipet = '\n            <li>\n                <a href="#">\n                    <i class="fa fa-check no-visible" aria-hidden="true"></i>&nbsp;\n                    <span class="js-pdfname">' + pdfPath + '</span>\n                </a>\n            </li>\n        ';
	        $('#dropdownPdf ul').append(snipet);
	    });
	}
	
	/**
	 * Setup the contents of the dropdowns for primary/reference annotations.
	 */
	function setAnnoDropdownList(annos) {
	
	    // Reset.
	    $('#dropdownAnnoPrimary ul').html('');
	    $('#dropdownAnnoReference ul').html('');
	    $('#dropdownAnnoPrimary .js-text').text('Anno File');
	    $('#dropdownAnnoReference .js-text').text('Reference Files');
	
	    // Setup anno / reference dropdown.
	    annos.forEach(function (file) {
	
	        var fileName = _excludeBaseDirName(file.webkitRelativePath);
	
	        var snipet1 = '\n            <li>\n                <a href="#">\n                    <i class="fa fa-check no-visible" aria-hidden="true"></i>\n                    <span class="js-annoname">' + fileName + '</span>\n                </a>\n            </li>\n        ';
	        $('#dropdownAnnoPrimary ul').append(snipet1);
	
	        var snipet2 = '\n            <li>\n                <a href="#">\n                    <i class="fa fa-check no-visible" aria-hidden="true"></i>\n                    <input type="text" name="color" class="js-anno-palette" autocomplete="off">\n                    <span class="js-annoname">' + fileName + '</span>\n                </a>\n            </li>\n        ';
	        $('#dropdownAnnoReference ul').append(snipet2);
	    });
	
	    // Setup color pallets.
	    (0, _display.setupColorPicker)();
	}
	
	/**
	 * Load PDFs and Annotations from the directory the user specified.
	 */
	function loadData(pdfs, annos) {
	
	    window.fileMap = {};
	
	    return new Promise(function (resolve, reject) {
	
	        var promises = [];
	
	        // Load pdfs.
	        var p = pdfs.map(function (file) {
	            return new Promise(function (resolve, reject) {
	                var fileReader = new FileReader();
	                fileReader.onload = function (event) {
	                    var pdf = event.target.result;
	                    var fileName = _excludeBaseDirName(file.webkitRelativePath);
	                    fileMap[fileName] = pdf;
	                    resolve();
	                };
	                fileReader.readAsDataURL(file);
	            });
	        });
	        promises = promises.concat(p);
	
	        // Load annos.
	        p = annos.map(function (file) {
	            return new Promise(function (resolve, reject) {
	                var fileReader = new FileReader();
	                fileReader.onload = function (event) {
	                    var annotation = event.target.result;
	                    var fileName = _excludeBaseDirName(file.webkitRelativePath);
	                    fileMap[fileName] = annotation;
	                    resolve();
	                };
	                fileReader.readAsText(file);
	            });
	        });
	        promises = promises.concat(p);
	
	        // Wait for complete.
	        Promise.all(promises).then(resolve);
	    });
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	
	var _display = __webpack_require__(2);
	
	var _anno = __webpack_require__(1);
	
	var _dropdown = __webpack_require__(5);
	
	/**
	 * Setup the dropdown of PDFs.
	 */
	function setup() {
	
	    $('#dropdownPdf').on('click', 'a', function (e) {
	
	        var $this = $(e.currentTarget);
	        var pdfPath = $this.find('.js-pdfname').text();
	
	        var currentPDFName = $('#dropdownPdf .js-text').text();
	        if (currentPDFName === pdfPath) {
	            console.log('Not reload. the pdf are same.');
	            return;
	        }
	
	        // Confirm to override.
	        if (currentPDFName !== 'PDF File') {
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
	
	        // Reset Primary/Reference anno dropdowns, and data.
	        (0, _anno.clearAllAnnotations)();
	        (0, _dropdown.resetCheckPrimaryAnnoDropdown)();
	        (0, _dropdown.resetCheckReferenceAnnoDropdown)();
	
	        // reload.
	        window.pdf = fileMap[pdfPath];
	        var fileName = pdfPath.split('/')[pdfPath.split('/').length - 1];
	        window.pdfName = fileName;
	        (0, _display.reloadPDFViewer)();
	
	        // Close dropdown.
	        $('#dropdownPdf').click();
	
	        return false;
	    });
	} /**
	   * UI parts - PDF Dropdown.
	   */

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.resetCheckPrimaryAnnoDropdown = resetCheckPrimaryAnnoDropdown;
	exports.resetCheckReferenceAnnoDropdown = resetCheckReferenceAnnoDropdown;
	/**
	 * Utility functions for dropdown UIs.
	 */
	
	function resetCheckPrimaryAnnoDropdown() {
	    $('#dropdownAnnoPrimary .js-text').text('Anno File');
	    $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
	}
	
	function resetCheckReferenceAnnoDropdown() {
	    $('#dropdownAnnoReference .js-text').text('Reference Files');
	    $('#dropdownAnnoReference .fa-check').addClass('no-visible');
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	
	var _display = __webpack_require__(2);
	
	/**
	 * Setup a click action of the Primary Annotation Dropdown.
	 */
	function setup() {
	
	    $('#dropdownAnnoPrimary').on('click', 'a', function (e) {
	
	        var $this = $(e.currentTarget);
	        var annoName = $this.find('.js-annoname').text();
	
	        var currentAnnoName = $('#dropdownAnnoPrimary .js-text').text();
	        if (currentAnnoName === annoName) {
	
	            var userAnswer = window.confirm('Are you sure to clear the current annotations?');
	            if (!userAnswer) {
	                return;
	            }
	
	            $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
	            $('#dropdownAnnoPrimary .js-text').text('Anno File');
	
	            deleteAllAnnotations();
	
	            // Close
	            $('#dropdownAnnoPrimary').click();
	
	            return false;
	        }
	
	        // Confirm to override.
	        if (currentAnnoName !== 'Anno File') {
	            if (!window.confirm('Are you sure to load another Primary Annotation ?')) {
	                return;
	            }
	        }
	
	        $('#dropdownAnnoPrimary .js-text').text(annoName);
	
	        $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
	        $this.find('.fa-check').removeClass('no-visible');
	
	        // reload.
	        (0, _display.displayAnnotation)(true);
	
	        // Close
	        $('#dropdownAnnoPrimary').click();
	
	        return false;
	    });
	}
	
	/**
	 * Delete all annotations.
	 */
	/**
	 * UI parts - Primary Annotation Dropdown.
	 */
	function deleteAllAnnotations() {
	
	    // Comfirm to user.
	    // let userAnswer = window.confirm('Are you sure to clear the current annotations?');
	    // if (!userAnswer) {
	    //     return;
	    // }
	
	    iframeWindow.annotationContainer.destroy();
	
	    var documentId = window.iframeWindow.getFileName(window.iframeWindow.PDFView.url);
	    window.iframeWindow.PDFAnnoCore.getStoreAdapter().deleteAnnotations(documentId).then(function () {
	        (0, _display.reloadPDFViewer)();
	    });
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	
	var _coords = __webpack_require__(8);
	
	/**
	 * Setup the dropdown for Anno list.
	 */
	function setup() {
	
	    // Show the list of primary annotations.
	    $('#dropdownAnnoList').on('click', function () {
	
	        // Get displayed annotations.
	        var annotations = iframeWindow.annotationContainer.getAllAnnotations();
	
	        // Filter only Primary.
	        annotations = annotations.filter(function (a) {
	            return !a.readOnly;
	        });
	
	        // Sort by offsetY.
	        annotations = annotations.sort(function (a1, a2) {
	            return _getY(a1) - _getY(a2);
	        });
	
	        // Create elements.
	        var elements = annotations.map(function (a) {
	
	            var icon = void 0;
	            if (a.type === 'span') {
	                icon = '<i class="fa fa-pencil"></i>';
	            } else if (a.type === 'relation' && a.direction === 'one-way') {
	                icon = '<i class="fa fa-long-arrow-right"></i>';
	            } else if (a.type === 'relation' && a.direction === 'two-way') {
	                icon = '<i class="fa fa-arrows-h"></i>';
	            } else if (a.type === 'relation' && a.direction === 'link') {
	                icon = '<i class="fa fa-minus"></i>';
	            } else if (a.type === 'area') {
	                icon = '<i class="fa fa-square-o"></i>';
	            }
	
	            var y = _getY(a);
	
	            var _convertToExportY = (0, _coords.convertToExportY)(y),
	                pageNumber = _convertToExportY.pageNumber;
	
	            var snipet = '\n                <li>\n                    <a href="#" data-page="' + pageNumber + '" data-id="' + a.uuid + '">\n                        ' + icon + '&nbsp;&nbsp;\n                        <span>' + (a.text || '') + '</span>\n                    </a>\n                </li>\n            ';
	
	            return snipet;
	        });
	
	        $('#dropdownAnnoList ul').html(elements);
	    });
	
	    // Jump to the page that the selected annotation is at.
	    $('#dropdownAnnoList').on('click', 'a', function (e) {
	
	        var id = $(e.currentTarget).data('id');
	        var annotation = iframeWindow.annotationContainer.findById(id);
	
	        if (annotation) {
	
	            // scroll to.
	            var _y = annotation.y || annotation.y1 || annotation.rectangles[0].y;
	
	            var _convertToExportY2 = (0, _coords.convertToExportY)(_y),
	                pageNumber = _convertToExportY2.pageNumber,
	                y = _convertToExportY2.y;
	
	            var pageHeight = iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.height;
	            var scale = iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.scale;
	            _y = (pageHeight + _coords.paddingBetweenPages) * (pageNumber - 1) + y * scale;
	            _y -= 100;
	            $('#viewer iframe').contents().find('#viewer').parent()[0].scrollTop = _y;
	
	            // highlight.
	            annotation.highlight();
	            setTimeout(function () {
	                annotation.dehighlight();
	            }, 1000);
	        }
	
	        // Close the dropdown.
	        $('#dropdownAnnoList').click();
	    });
	
	    // Watch the number of primary annos.
	    function watchPrimaryAnno(e) {
	        var primaryAnnos = iframeWindow.annotationContainer.getAllAnnotations().filter(function (a) {
	            return !a.readOnly;
	        });
	        $('#dropdownAnnoList .js-count').text(primaryAnnos.length);
	    }
	    $(window).off('annotationrendered annotationUpdated', watchPrimaryAnno).on('annotationrendered annotationUpdated', watchPrimaryAnno);
	}
	
	/**
	 * Get the y position in the annotation.
	 */
	/**
	 * UI parts - Anno List Dropdown.
	 */
	function _getY(annotation) {
	
	    if (annotation.rectangles) {
	        return annotation.rectangles[0].y;
	    } else if (annotation.y1) {
	        return annotation.y1;
	    } else {
	        return annotation.y;
	    }
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.convertToExportY = convertToExportY;
	exports.convertFromExportY = convertFromExportY;
	exports.getPageSize = getPageSize;
	/**
	 * Convert the `y` position from the local coords to exported json.
	 */
	function convertToExportY(y) {
	
	  var meta = getPageSize();
	
	  y -= paddingTop;
	
	  var pageHeight = meta.height + paddingBetweenPages;
	
	  var pageNumber = Math.floor(y / pageHeight) + 1;
	  var yInPage = y - (pageNumber - 1) * pageHeight;
	
	  return { pageNumber: pageNumber, y: yInPage };
	}
	
	/**
	 * Convert the `y` position from exported json to local coords.
	 */
	function convertFromExportY(pageNumber, yInPage) {
	
	  var meta = getPageSize();
	
	  var y = yInPage + paddingTop;
	
	  var pagePadding = paddingBetweenPages;
	
	  y += (pageNumber - 1) * (meta.height + pagePadding);
	
	  return y;
	}
	
	/**
	 * The padding of page top.
	 */
	var paddingTop = 9;
	
	/**
	 * The padding between pages.
	 */
	var paddingBetweenPages = exports.paddingBetweenPages = 9;
	
	/**
	 * Get a page size of a single PDF page.
	 */
	function getPageSize() {
	
	  var pdfView = window.PDFView || iframeWindow.PDFView;
	
	  var viewBox = pdfView.pdfViewer.getPageView(0).viewport.viewBox;
	  var size = { width: viewBox[2], height: viewBox[3] };
	  return size;
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	
	var _display = __webpack_require__(2);
	
	/**
	 * Setup a click action of the Reference Annotation Dropdown.
	 */
	function setup() {
	
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
	            $('#dropdownAnnoReference .js-text').text('Reference Files');
	        }
	
	        (0, _display.displayAnnotation)(false);
	
	        return false;
	    });
	} /**
	   * UI parts - Reference Annotation Dropdown.
	   */

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	
	var _window = __webpack_require__(11);
	
	/**
	 * Setup the behavior of a Download Button.
	 */
	function setup() {
	
	    $('#downloadButton').off('click').on('click', function (e) {
	
	        $(e.currentTarget).blur();
	
	        downloadAnnotation();
	
	        return false;
	    });
	}
	
	/**
	 * Export the primary annotation data for download.
	 */
	/**
	 * UI parts - Download Button.
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
	
	    (0, _window.unlistenWindowLeaveEvent)();
	}
	
	/**
	 * Get the file name for download.
	 */
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

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.listenWindowLeaveEvent = listenWindowLeaveEvent;
	exports.unlistenWindowLeaveEvent = unlistenWindowLeaveEvent;
	exports.resizeHandler = resizeHandler;
	exports.setupResizableColumns = setupResizableColumns;
	/**
	 * Utility for window.
	 */
	
	/**
	 * Set the confirm dialog at leaving the page.
	 */
	function listenWindowLeaveEvent() {
	    window.annotationUpdated = true;
	    $(window).off('beforeunload').on('beforeunload', function () {
	        return 'You don\'t save the annotations yet.\nAre you sure to leave ?';
	    });
	}
	
	/**
	 * Unset the confirm dialog at leaving the page.
	 */
	function unlistenWindowLeaveEvent() {
	    window.annotationUpdated = false;
	    $(window).off('beforeunload');
	}
	
	/**
	 * Resize the height of elements adjusting to the window.
	 */
	function resizeHandler() {
	
	    // PDFViewer.
	    var height = $(window).innerHeight() - $('#viewer').offset().top;
	    $('#viewer iframe').css('height', height + 'px');
	
	    // Dropdown for PDF.
	    var height1 = $(window).innerHeight() - ($('#dropdownPdf ul').offset().top || 120);
	    $('#dropdownPdf ul').css('max-height', height1 - 20 + 'px');
	
	    // Dropdown for Primary Annos.
	    var height2 = $(window).innerHeight() - ($('#dropdownAnnoPrimary ul').offset().top || 120);
	    $('#dropdownAnnoPrimary ul').css('max-height', height2 - 20 + 'px');
	
	    // Dropdown for Anno list.
	    var height3 = $(window).innerHeight() - ($('#dropdownAnnoList ul').offset().top || 120);
	    $('#dropdownAnnoList ul').css('max-height', height3 - 20 + 'px');
	
	    // Dropdown for Reference Annos.
	    var height4 = $(window).innerHeight() - ($('#dropdownAnnoReference ul').offset().top || 120);
	    $('#dropdownAnnoReference ul').css('max-height', height4 - 20 + 'px');
	
	    // Tools.
	    var height5 = $(window).innerHeight() - $('#tools').offset().top;
	    $('#tools').css('height', height5 + 'px');
	}
	
	function setupResizableColumns() {
	
	    // Make resizable.
	    $('#tools').resizable({
	        handles: 'e',
	        alsoResizeReverse: '#viewerWrapper',
	        start: function start() {
	            console.log('resize start');
	            $('#viewer iframe').css({
	                'pointer-events': 'none'
	            });
	        },
	        stop: function stop() {
	            console.log('resize stop');
	            $('#viewer iframe').css({
	                'pointer-events': 'auto'
	            });
	        }
	    });
	
	    // Customize.
	    $.ui.plugin.add("resizable", "alsoResizeReverse", {
	
	        start: function start() {
	            var that = $(this).resizable("instance"),
	                o = that.options;
	
	            $(o.alsoResizeReverse).each(function () {
	                var el = $(this);
	                el.data("ui-resizable-alsoresizeReverse", {
	                    width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
	                    left: parseInt(el.css("left"), 10), top: parseInt(el.css("top"), 10)
	                });
	            });
	        },
	
	        resize: function resize(event, ui) {
	            var that = $(this).resizable("instance"),
	                o = that.options,
	                os = that.originalSize,
	                op = that.originalPosition,
	                delta = {
	                height: that.size.height - os.height || 0,
	                width: that.size.width - os.width || 0,
	                top: that.position.top - op.top || 0,
	                left: that.position.left - op.left || 0
	            };
	
	            $(o.alsoResizeReverse).each(function () {
	                var el = $(this),
	                    start = $(this).data("ui-resizable-alsoresize-reverse"),
	                    style = {},
	                    css = el.parents(ui.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"];
	
	                $.each(css, function (i, prop) {
	                    var sum = (start[prop] || 0) - (delta[prop] || 0);
	                    if (sum && sum >= 0) {
	                        style[prop] = sum || null;
	                    }
	                });
	
	                el.css(style);
	            });
	        },
	
	        stop: function stop() {
	            $(this).removeData("resizable-alsoresize-reverse");
	        }
	    });
	}

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	/**
	 * UI parts - Upload Button.
	 */
	
	function setup() {
	    $('.js-btn-upload').off('click').on('click', function () {
	
	        var pdfFileName = $('#dropdownPdf .js-text').text();
	        if (!pdfFileName || pdfFileName === 'PDF File') {
	            return alert('Display a PDF, before upload.');
	        }
	        var contentBase64 = window.fileMap[pdfFileName];
	
	        var $progressBar = $('.js-upload-progress');
	
	        $.ajax({
	            xhr: function xhr() {
	                var xhr = new window.XMLHttpRequest();
	                //Upload progress
	                xhr.upload.addEventListener("progress", function (evt) {
	                    if (evt.lengthComputable) {
	                        var percentComplete = evt.loaded / evt.total;
	                        //Do something with upload progress
	                        console.log('uploadProgress:', percentComplete);
	
	                        var percent = Math.floor(percentComplete * 100);
	                        $progressBar.find('.progress-bar').css('width', percent + '%').attr('aria-valuenow', percent).text(percent + '%');
	                        if (percent === 100) {
	                            setTimeout(function () {
	                                $progressBar.addClass('hidden');
	                            }, 2000);
	                        }
	                    }
	                }, false);
	                //Download progress
	                xhr.addEventListener("progress", function (evt) {
	                    if (evt.lengthComputable) {
	                        var percentComplete = evt.loaded / evt.total;
	                        //Do something with download progress
	                        console.log('downloadProgress:', percentComplete);
	                    }
	                }, false);
	                return xhr;
	            },
	            url: '/api/pdf_upload',
	            method: 'POST',
	            dataType: 'json',
	            data: { name: pdfFileName, content: contentBase64 }
	        }).then(function (result) {
	            console.log('result:', result);
	            setTimeout(function () {
	                // alert('Upload completed.');
	                $('#uploadResult').text(result.status);
	            }, 500); // wait for progress bar animation.
	        });
	
	        // Show.
	        $progressBar.removeClass('hidden').find('.progress-bar').css('width', '0%').attr('aria-valuenow', 0).text('0%');
	
	        return false;
	    });
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	
	var _display = __webpack_require__(2);
	
	var _anno = __webpack_require__(1);
	
	var _util = __webpack_require__(14);
	
	/**
	    Set the behavior of the tool buttons for annotations.
	*/
	function setup() {
	
	    window.currentAnnoToolType = 'view';
	
	    $('.js-tool-btn').off('click').on('click', function (e) {
	
	        (0, _anno.disableAnnotateTools)();
	
	        var $button = $(e.currentTarget);
	
	        if ($button.hasClass('active')) {
	            $button.removeClass('active').blur();
	            return false;
	        }
	
	        $('.js-tool-btn.active').removeClass('active');
	        $button.addClass('active');
	
	        var type = $button.data('type');
	
	        window.currentAnnoToolType = type;
	
	        (0, _anno.enableAnnotateTool)(type);
	
	        return false;
	    });
	
	    $('.js-tool-btn-span').off('click').on('click', function (e) {
	        $(e.currentTarget).blur();
	
	        var rects = window.iframeWindow.PDFAnnoCore.UI.getRectangles();
	
	        // Check empty.
	        if (!rects) {
	            return alert('Please select a text span first.');
	        }
	
	        // Check duplicated.
	        var annos = window.iframeWindow.annotationContainer.getAllAnnotations().filter(function (a) {
	            return a.type === 'span';
	        }).filter(function (a) {
	            console.log('aaaaa:', rects, a);
	            if (rects.length !== a.rectangles.length) {
	                return false;
	            }
	            for (var i = 0; i < rects.length; i++) {
	                if (rects[i].x !== a.rectangles[i].x || rects[i].y !== a.rectangles[i].y || rects[i].width !== a.rectangles[i].width || rects[i].height !== a.rectangles[i].height) {
	                    return false;
	                }
	            }
	            return true;
	        });
	
	        if (annos.length > 0) {
	            // Show label input.
	            var event = document.createEvent('CustomEvent');
	            event.initCustomEvent('enableTextInput', true, true, {
	                uuid: annos[0].uuid,
	                text: annos[0].text
	            });
	            window.dispatchEvent(event);
	            return;
	        }
	
	        // Create a new rectAnnotation.
	        var anno = window.iframeWindow.PDFAnnoCore.UI.createSpan();
	    });
	
	    $('.js-tool-btn-rel').off('click').on('click', function (e) {
	
	        var $button = $(e.currentTarget);
	        var type = $button.data('type');
	
	        var selectedAnnotations = window.iframeWindow.annotationContainer.getSelectedAnnotations();
	        selectedAnnotations = selectedAnnotations.filter(function (a) {
	            return a.type === 'area' || a.type === 'span';
	        }).sort(function (a1, a2) {
	            return a1.selectedTime - a2.selectedTime; // asc
	        });
	
	        if (selectedAnnotations.length < 2) {
	            return alert('Please select two annotations first.');
	        }
	
	        var first = selectedAnnotations[selectedAnnotations.length - 2];
	        var second = selectedAnnotations[selectedAnnotations.length - 1];
	        console.log('first:second,', first, second);
	
	        // Check duplicated.
	        var arrows = window.iframeWindow.annotationContainer.getAllAnnotations().filter(function (a) {
	            return a.type === 'relation';
	        }).filter(function (a) {
	            return (0, _util.anyOf)(a.rel1Annotation.uuid, [first.uuid, second.uuid]) && (0, _util.anyOf)(a.rel2Annotation.uuid, [first.uuid, second.uuid]);
	        });
	
	        if (arrows.length > 0) {
	            console.log('same found!!!');
	            // Update!!
	            arrows[0].direction = type;
	            arrows[0].rel1Annotation = first;
	            arrows[0].rel2Annotation = second;
	            arrows[0].save();
	            arrows[0].render();
	            arrows[0].enableViewMode();
	            // Show label input.
	            var event = document.createEvent('CustomEvent');
	            event.initCustomEvent('enableTextInput', true, true, {
	                uuid: arrows[0].uuid,
	                text: arrows[0].text
	            });
	            window.dispatchEvent(event);
	            return;
	        }
	
	        window.iframeWindow.PDFAnnoCore.UI.createRelation(type, first, second);
	
	        $button.blur();
	    });
	} /**
	   * UI parts - Annotations Tools.
	   */

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.anyOf = anyOf;
	/**
	 * Utility.
	 */
	
	function anyOf(target, candidates) {
	  return candidates.filter(function (c) {
	    return c === target;
	  }).length > 0;
	}

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.enable = enable;
	exports.disable = disable;
	exports.treatAnnotationDeleted = treatAnnotationDeleted;
	exports.handleAnnotationHoverIn = handleAnnotationHoverIn;
	exports.handleAnnotationHoverOut = handleAnnotationHoverOut;
	exports.handleAnnotationSelected = handleAnnotationSelected;
	exports.handleAnnotationDeselected = handleAnnotationDeselected;
	/**
	 * UI parts - Input Label.
	 */
	
	var $inputLabel = void 0;
	var $form = void 0;
	window.addEventListener('DOMContentLoaded', function () {
	    $inputLabel = $('#inputLabel');
	    $form = $('#autocompleteform');
	});
	
	var _blurListener = void 0;
	
	var currentUUID = void 0;
	
	function enable(_ref) {
	    var uuid = _ref.uuid,
	        text = _ref.text,
	        _ref$disable = _ref.disable,
	        disable = _ref$disable === undefined ? false : _ref$disable,
	        _ref$autoFocus = _ref.autoFocus,
	        autoFocus = _ref$autoFocus === undefined ? false : _ref$autoFocus,
	        _ref$blurListener = _ref.blurListener,
	        blurListener = _ref$blurListener === undefined ? null : _ref$blurListener;
	
	    console.log('enableInputLabel:', uuid, text);
	
	    currentUUID = uuid;
	
	    if (_blurListener) {
	        _blurListener();
	        _blurListener = null;
	        console.log('old _blurListener is called.');
	    }
	
	    $form.off('submit').on('submit', cancelSubmit);
	
	    $inputLabel.attr('disabled', 'disabled').val(text || '').off('blur').off('keyup');
	
	    if (disable === false) {
	        $inputLabel.removeAttr('disabled').on('keyup', function () {
	            saveText(uuid);
	        });
	    }
	
	    if (autoFocus) {
	        $inputLabel.focus();
	    }
	
	    $inputLabel.on('blur', function () {
	
	        if (blurListener) {
	            blurListener();
	            _blurListener = blurListener;
	        }
	
	        saveText(uuid);
	
	        // Add an autocomplete candidate. (Firefox, Chrome)
	        $form.find('[type="submit"]').click();
	    });
	};
	
	function disable() {
	    console.log('disableInputLabel');
	
	    currentUUID = null;
	
	    $inputLabel.attr('disabled', 'disabled').val('');
	}
	
	function treatAnnotationDeleted(_ref2) {
	    var uuid = _ref2.uuid;
	
	    console.log('treatAnnotationDeleted:', uuid);
	
	    if (currentUUID === uuid) {
	        disable.apply(undefined, arguments);
	    }
	}
	
	function handleAnnotationHoverIn(annotation) {
	    if (getSelectedAnnotations().length === 0) {
	        enable({ uuid: annotation.uuid, text: annotation.text, disable: true });
	    }
	}
	
	function handleAnnotationHoverOut(annotation) {
	    if (getSelectedAnnotations().length === 0) {
	        disable();
	    }
	}
	
	function handleAnnotationSelected(annotation) {
	    if (getSelectedAnnotations().length === 1) {
	        enable({ uuid: annotation.uuid, text: annotation.text });
	    } else {
	        disable();
	    }
	}
	
	function handleAnnotationDeselected() {
	    var annos = getSelectedAnnotations();
	    if (annos.length === 1) {
	        enable({ uuid: annos[0].uuid, text: annos[0].text });
	    } else {
	        disable();
	    }
	}
	
	function getSelectedAnnotations() {
	    return iframeWindow.annotationContainer.getSelectedAnnotations();
	}
	
	function cancelSubmit(e) {
	    e.preventDefault();
	    return false;
	}
	
	function saveText(uuid) {
	
	    var text = $inputLabel.val() || '';
	
	    var annotation = window.iframeWindow.annotationContainer.findById(uuid);
	    if (annotation) {
	        annotation.text = text;
	        // annotation.setTextForceDisplay();
	        // annotation.render();
	        annotation.save();
	        annotation.enableViewMode();
	
	        // setTimeout(() => {
	        //     annotation.resetTextForceDisplay();
	        //     annotation.render();
	        //     annotation.enableViewMode();
	        // }, 1000);
	    }
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.readTOML = exports.PublicRelationAnnotation = exports.PublicSpanAnnotation = exports.PublicRectAnnotation = undefined;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.addAllAnnotations = addAllAnnotations;
	exports.addAnnotation = addAnnotation;
	exports.deleteAnnotation = deleteAnnotation;
	
	var _coords = __webpack_require__(8);
	
	var _anno = __webpack_require__(1);
	
	var _toml = __webpack_require__(17);
	
	var _toml2 = _interopRequireDefault(_toml);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Add all annotations.
	 *
	 * This method expect to get argument made from a TOML file parsed by `window.readTOML`.
	 */
	function addAllAnnotations(tomlObject) {
	
	    for (var key in tomlObject) {
	
	        var data = tomlObject[key];
	
	        if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {
	            continue;
	        }
	
	        data.id = key;
	
	        if (data.type === 'span') {
	            addAnnotation(new PublicSpanAnnotation(data));
	        } else if (data.type === 'rect') {
	            addAnnotation(new PublicRectAnnotation(data));
	        } else if (data.type === 'relation') {
	            addAnnotation(new PublicRelationAnnotation(data));
	        } else {
	            console.log('Unknown: ', key, data);
	        }
	    }
	}
	
	/**
	 * Add an annotation, and render it.
	 */
	function addAnnotation(publicAnnotation) {
	
	    var a = publicAnnotation.annotation;
	    window.iframeWindow.annotationContainer.add(a);
	    a.render();
	    a.enableViewMode();
	    a.save();
	
	    // Restore the status of AnnoTools.
	    (0, _anno.disableAnnotateTools)();
	    (0, _anno.enableAnnotateTool)(window.currentAnnoToolType);
	}
	
	/**
	 * Delete an annotation, and also detach it from view.
	 */
	function deleteAnnotation(publicAnnotation) {
	
	    publicAnnotation.annotation.destroy();
	}
	
	/**
	 * Rect Annotation Class wrapping the core.
	 */
	
	var PublicRectAnnotation =
	
	/**
	 * Create a rect annotation from a TOML data.
	 */
	exports.PublicRectAnnotation = function PublicRectAnnotation(_ref) {
	    var page = _ref.page,
	        position = _ref.position,
	        _ref$label = _ref.label,
	        label = _ref$label === undefined ? '' : _ref$label,
	        _ref$id = _ref.id,
	        id = _ref$id === undefined ? 0 : _ref$id;
	
	    _classCallCheck(this, PublicRectAnnotation);
	
	    // Check inputs.
	    if (!page || typeof page !== 'number') {
	        throw 'Set the page as number.';
	    }
	    if (!position || position.length !== 4) {
	        throw 'Set the position which includes `x`, `y`, `width` and `height`.';
	    }
	
	    var rect = iframeWindow.PDFAnnoCore.RectAnnotation.newInstance({
	        uuid: id && String(id), // annotationid must be string.
	        x: position[0],
	        y: (0, _coords.convertFromExportY)(page, position[1]),
	        width: position[2],
	        height: position[3],
	        text: label,
	        color: "#FF0000", // TODO 固定で良い？
	        readOnly: false // TODO 固定で良い？
	    });
	
	    this.annotation = rect;
	};
	
	/**
	 * Rect Annotation Class wrapping the core.
	 */
	
	
	var PublicSpanAnnotation = exports.PublicSpanAnnotation = function PublicSpanAnnotation(_ref2) {
	    var page = _ref2.page,
	        position = _ref2.position,
	        _ref2$label = _ref2.label,
	        label = _ref2$label === undefined ? '' : _ref2$label,
	        _ref2$text = _ref2.text,
	        text = _ref2$text === undefined ? '' : _ref2$text,
	        _ref2$id = _ref2.id,
	        id = _ref2$id === undefined ? 0 : _ref2$id;
	
	    _classCallCheck(this, PublicSpanAnnotation);
	
	    // Check inputs.
	    if (!page || typeof page !== 'number') {
	        throw 'Set the page as number.';
	    }
	    if (!position) {
	        throw 'Set the position.';
	    }
	
	    // Convert.
	    position = position.map(function (p) {
	        return {
	            page: page,
	            x: p[0],
	            y: (0, _coords.convertFromExportY)(page, p[1]),
	            width: p[2],
	            height: p[3]
	        };
	    });
	
	    var span = window.iframeWindow.PDFAnnoCore.SpanAnnotation.newInstance({
	        uuid: id && String(id), // annotationid must be string.
	        rectangles: position,
	        text: label,
	        color: '#FFFF00', // TODO 固定で良い？
	        readOnly: false, // TODO 固定で良い？
	        selectedText: text
	    });
	
	    this.annotation = span;
	};
	
	/**
	 * Rect Annotation Class wrapping the core.
	 */
	
	
	var PublicRelationAnnotation = exports.PublicRelationAnnotation = function PublicRelationAnnotation(_ref3) {
	    var dir = _ref3.dir,
	        ids = _ref3.ids,
	        _ref3$label = _ref3.label,
	        label = _ref3$label === undefined ? '' : _ref3$label;
	
	    _classCallCheck(this, PublicRelationAnnotation);
	
	    // Check inputs.
	    if (!dir) {
	        throw 'Set the dir.';
	    }
	    if (!ids || ids.length !== 2) {
	        throw 'Set the ids.';
	    }
	
	    var r = iframeWindow.PDFAnnoCore.RelationAnnotation.newInstance({
	        direction: dir,
	        rel1: ids[0],
	        rel2: ids[1],
	        text: label,
	        color: "#FF0000", // TODO 固定で良い？
	        readOnly: false // TODO 固定で良い？
	    });
	
	    this.annotation = r;
	};
	
	/**
	 * TOML parser.
	 */
	
	
	var readTOML = exports.readTOML = _toml2.default.parse;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var parser = __webpack_require__(18);
	var compiler = __webpack_require__(19);
	
	module.exports = {
	  parse: function(input) {
	    var nodes = parser.parse(input.toString());
	    return compiler.compile(nodes);
	  }
	};


/***/ },
/* 18 */
/***/ function(module, exports) {

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


/***/ },
/* 19 */
/***/ function(module, exports) {

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
	      } else if ((node.type === 'Integer' || node.type === 'Float') && (firstType === 'Integer' || firstType === 'Float')) {
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


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "dist/index.html";

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(22);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(24)(content, {});
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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(23)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset 'utf-8';\n\n/* Super Hack to disable autofill style for Chrome. */\ninput:-webkit-autofill,\ninput:-webkit-autofill:hover,\ninput:-webkit-autofill:focus,\ninput:-webkit-autofill:active {\n    transition: background-color 5000s ease-in-out 0s;\n}\n\n.u-mt-10 {margin-top: 10px;}\n.u-mt-20 {margin-top: 20px;}\n\n.no-visible {\n    visibility: hidden;\n}\n\n/**\n * Viewer size.\n * This height will be override to fit the browser height (by app.js).\n */\n.anno-viewer {\n    width: 100%;\n    height: 500px;\n}\n\n/**\n * Annotation Select UI Layout.\n */\n.anno-select-layout {}\n.anno-select-layout .row:first-child {\n    margin-bottom: 10px;\n}\n.anno-select-layout [type=\"radio\"] {\n    margin-right: 5px;\n}\n.anno-select-layout [type=\"file\"] {\n    display: inline-block;\n    margin-left: 5px;\n    line-height: 1em;\n}\n.anno-select-layout .sp-replacer {\n    padding: 0;\n    border: none;\n}\n.anno-select-layout .sp-dd {\n    display: none;\n}\n\n/**\n * Dropdown.\n */\n.dropdown-menu {\n    overflow: scroll;\n}\n\n/**\n * Color picker.\n */\n.anno-ui .sp-replacer {\n    padding: 0;\n    border: none;\n}\n.anno-ui .sp-dd {\n    display: none;\n}\n.anno-ui .sp-preview {\n    margin-right: 0;\n}\n\n", ""]);
	
	// exports


/***/ },
/* 23 */
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
/* 24 */
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