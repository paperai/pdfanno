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
	
	var _browseButton = __webpack_require__(2);
	
	var browseButton = _interopRequireWildcard(_browseButton);
	
	var _pdfDropdown = __webpack_require__(4);
	
	var pdfDropdown = _interopRequireWildcard(_pdfDropdown);
	
	var _primaryAnnoDropdown = __webpack_require__(6);
	
	var primaryAnnoDropdown = _interopRequireWildcard(_primaryAnnoDropdown);
	
	var _annoListDropdown = __webpack_require__(7);
	
	var annoListDropdown = _interopRequireWildcard(_annoListDropdown);
	
	var _referenceAnnoDropdown = __webpack_require__(9);
	
	var referenceAnnoDropdown = _interopRequireWildcard(_referenceAnnoDropdown);
	
	var _annotationTools = __webpack_require__(10);
	
	var annotationsTools = _interopRequireWildcard(_annotationTools);
	
	var _display = __webpack_require__(3);
	
	var _window = __webpack_require__(11);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	__webpack_require__(12);
	__webpack_require__(13);
	
	/**
	 * The data which is loaded via `Browse` button.
	 */
	window.fileMap = {};
	
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
	    });
	
	    iframeWindow.addEventListener('annotationrendered', function () {
	
	        // Restore the status of AnnoTools.
	        (0, _anno.disableAnnotateTools)();
	        (0, _anno.enableAnnotateTool)(window.currentAnnoToolType);
	    });
	
	    // Set the confirm dialog when leaving a page.
	    iframeWindow.addEventListener('annotationUpdated', _window.listenWindowLeaveEvent);
	}
	
	/**
	 *  The entry point.
	 */
	window.addEventListener('DOMContentLoaded', function (e) {
	
	    // Delete prev annotations.
	    if (location.search.indexOf('debug') === -1) {
	        (0, _anno.clearAllAnnotations)();
	    }
	
	    // Start application.
	    startApplication();
	
	    // Setup UI parts.
	    browseButton.setup();
	    pdfDropdown.setup();
	    primaryAnnoDropdown.setup();
	    referenceAnnoDropdown.setup();
	    annoListDropdown.setup();
	    annotationsTools.setup();
	
	    window.addEventListener('restartApp', startApplication);
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
	    window.iframeWindow.PDFAnnoCore.UI.disableRelation();
	    window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
	}
	
	/**
	 * Enable an annotation tool.
	 */
	function enableAnnotateTool(type) {
	
	    if (type === 'span') {
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
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	
	var _display = __webpack_require__(3);
	
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
	    var pdfName = text !== 'Select PDF file' ? text : null;
	
	    // a Primary anno.
	    text = $('#dropdownAnnoPrimary .js-text').text();
	    var primaryAnnotationName = text !== 'Select Anno file' ? text : null;
	
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
	
	    $('#dropdownPdf .js-text').text('Select PDF file');
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
	    $('#dropdownAnnoPrimary .js-text').text('Select Anno file');
	    $('#dropdownAnnoReference .js-text').text('Select reference files');
	
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
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.displayAnnotation = displayAnnotation;
	exports.reloadPDFViewer = reloadPDFViewer;
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
	
	    // Reload pdf.js.
	    $('#viewer iframe').remove();
	    $('#viewer').html('<iframe src="./pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');
	
	    // Restart.
	    var event = document.createEvent('CustomEvent');
	    event.initCustomEvent('restartApp', true, true, null);
	    window.dispatchEvent(event);
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	        value: true
	});
	exports.setup = setup;
	
	var _display = __webpack_require__(3);
	
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
	    $('#dropdownAnnoPrimary .js-text').text('Select Anno file');
	    $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
	}
	
	function resetCheckReferenceAnnoDropdown() {
	    $('#dropdownAnnoReference .js-text').text('Select reference files');
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
	
	var _display = __webpack_require__(3);
	
	/**
	 * Setup a click action of the Primary Annotation Dropdown.
	 */
	function setup() {
	
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
	
	                // if (!fileMap[annoName]) {
	                //     return false;
	                // }
	
	                // reload.
	                (0, _display.displayAnnotation)(true);
	
	                // Close
	                $('#dropdownAnnoPrimary').click();
	
	                return false;
	        });
	} /**
	   * UI parts - Primary Annotation Dropdown.
	   */

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setup = setup;
	
	var _position = __webpack_require__(8);
	
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
	
	            var _convertToExportY = (0, _position.convertToExportY)(y),
	                pageNumber = _convertToExportY.pageNumber;
	
	            var snipet = '\n                <li>\n                    <a href="#" data-page="' + pageNumber + '" data-id="' + a.uuid + '">\n                        ' + icon + '&nbsp;&nbsp;\n                        <span>' + (a.text || '') + '</span>\n                    </a>\n                </li>\n            ';
	
	            return snipet;
	        });
	
	        $('#dropdownAnnoList ul').html(elements);
	    });
	
	    // Jump to the page that the selected annotation is at.
	    $('#dropdownAnnoList').on('click', 'a', function (e) {
	
	        // Jump to the page anno rendered at.
	        var page = $(e.currentTarget).data('page');
	        console.log('page:', page);
	        iframeWindow.PDFView.page = page;
	
	        // Highlight.
	        var id = $(e.currentTarget).data('id');
	        var annotation = iframeWindow.annotationContainer.findById(id);
	        if (annotation) {
	            annotation.highlight();
	            setTimeout(function () {
	                annotation.dehighlight();
	            }, 1000);
	        }
	
	        // Close the dropdown.
	        $('#dropdownAnnoList').click();
	    });
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
	/**
	 * The padding of page top.
	 */
	var paddingTop = 9;
	
	/**
	 * The padding between pages.
	 */
	var paddingBetweenPages = 9;
	
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
	
	var _display = __webpack_require__(3);
	
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
	            $('#dropdownAnnoReference .js-text').text('Select reference files');
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
	
	var _display = __webpack_require__(3);
	
	var _window = __webpack_require__(11);
	
	var _anno = __webpack_require__(1);
	
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
	}
	
	// /**
	//     Disable annotation tool buttons.
	// */
	// function disableAnnotateTools() {
	//     window.iframeWindow.PDFAnnoCore.UI.disableRect();
	//     window.iframeWindow.PDFAnnoCore.UI.disableSpan();
	//     window.iframeWindow.PDFAnnoCore.UI.disableRelation();
	//     window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
	// }
	
	/**
	 * Delete all annotations.
	 */
	/**
	 * UI parts - Annotations Tools.
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
	        (0, _display.reloadPDFViewer)();
	    });
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
	
	    (0, _window.unlistenWindowLeaveEvent)();
	}
	
	/**
	 * Get the anno file name for download.
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
	/**
	 * Utility for window.
	 */
	
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
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "dist/index.html";

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(14);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(16)(content, {});
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(15)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset 'utf-8';\r\n\r\n.no-visible {\r\n    visibility: hidden;\r\n}\r\n\r\n/**\r\n * Viewer size.\r\n * This height will be override to fit the browser height (by app.js).\r\n */\r\n.anno-viewer {\r\n    width: 100%;\r\n    height: 500px;\r\n}\r\n\r\n/**\r\n * Annotation Select UI Layout.\r\n */\r\n.anno-select-layout {}\r\n.anno-select-layout .row:first-child {\r\n    margin-bottom: 10px;\r\n}\r\n.anno-select-layout [type=\"radio\"] {\r\n    margin-right: 5px;\r\n}\r\n.anno-select-layout [type=\"file\"] {\r\n    display: inline-block;\r\n    margin-left: 5px;\r\n    line-height: 1em;\r\n}\r\n.anno-select-layout .sp-replacer {\r\n    padding: 0;\r\n    border: none;\r\n}\r\n.anno-select-layout .sp-dd {\r\n    display: none;\r\n}\r\n\r\n/**\r\n * Dropdown.\r\n */\r\n.dropdown-menu {\r\n    overflow: scroll;\r\n}\r\n\r\n/**\r\n * Color picker.\r\n */\r\n.anno-ui .sp-replacer {\r\n    padding: 0;\r\n    border: none;\r\n}\r\n.anno-ui .sp-dd {\r\n    display: none;\r\n}\r\n.anno-ui .sp-preview {\r\n    margin-right: 0;\r\n}\r\n\r\n", ""]);
	
	// exports


/***/ },
/* 15 */
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
/* 16 */
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