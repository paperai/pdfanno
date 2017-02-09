<p align="center"><img src="https://github.com/paperai/pdfanno/blob/master/pdfanno.png" width="750"></p>

# PDFAnno
PDFAnno is a browser-based linguistic annotation tool for PDF documents.  
It offers functions for various types of linguistic annotations, including part-of-speech, named entity, dependency relation, and coreference chain.

[online demo](https://paperai.github.io/pdfanno/)

## Features
* Simple and easy-to-use interface
* No installation is required.
* Client-only application. No communication with server.

## Usage
First, visit our online demo.  
Then,

1. Load your PDF by drag & drop.
2. Load your annotation file (.anno) if you already have.
3. Annotate the PDF.
4. Save your annotation file.

For security reasons, PDFAnno does NOT automatically save the user's annotation.  

### Annotation Tools
<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-mouse-pointer.png" width="2%"> Selection tool.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-pencil.png" width="2%"> Span highlighting.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-long-arrow-right.png" width="2%"> One-way relation. This is used for annotating dependency relation between spans.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-arrows-h.png" width="2%"> Two-way relation.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-minus.png" width="2%"> Link relation. If you want to add non-directional relation between spans, use this.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-square-o.png" width="2%"> Rectangle

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-download.png" width="2%"> Download the annotation file.

DEL: Delete all of current annotations.

### Annotation File (.anno)
In PDFAnno, the annotation file (.anno) follows [TOML](https://github.com/toml-lang/toml) format.  
Here is an example of the .anno file:
```
version = 0.1

[1]
type = "span"
page = 1
position = [[95.818, 252.977, 181.761, 10.909], [95.818, 264.806, 107.136, 10.909]]
label = "label-1"

[2]
type = "span"
page = 1
position = [[323.863, 230.715, 213.988, 11.590], [313.125, 244.522, 224.829, 10.795]]
label = "label-2"

[3]
type = "rect"
page = 1
position = [323.863, 230.715, 213.988, 11.590]
label = "label-3"

[4]
type = "relation"
dir = "two-way"
ids = ["1", "2"]
label = "label-4"
```

### Multi-user Annotation
To support multi-user annotation, PDFAnno allows simultaneous visualization of multiple annotations on the single PDF, which is useful for checking inter-annotator agreement and resolving annotation conflicts.  

## Developer's Guide
PDFAnno is built on [pdf.js](https://github.com/mozilla/pdf.js) for PDF viewer.
We implement custom layers for rendering annotations.

### Install and Build
First, install [Node.js](https://nodejs.org/) and npm. The version of Node.js must be 6+.  
Then, run the following commands:
```
npm install
npm run anno:publish
```
where the output is on `docs/`, and you can access PDFAnno via `docs/index.html`.  

For develop,
```
npm run anno:watch
```
This command starts Webpack Dev Server and you can access  [http://localhost:8080/dist/index.html](http://localhost:8080/dist/index.html) in your browser.
