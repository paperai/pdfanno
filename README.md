<p align="center"><img src="https://github.com/paperai/pdfanno/blob/master/pdfanno.gif" width="850"></p>

# PDFAnno
PDFAnno is a browser-based linguistic annotation tool for PDF documents.  
It offers functions for annotating labels and relations on PDF.  
For natural language processing, it is suitable for annotating named entity spans, dependency relation, and coreference chain.  

[Online Demo](https://paperai.github.io/pdfanno/) (version 0.2)  
**It is highly recommended to use the latest version of Google Chrome.**

You can also install PDFAnno via npm:
```
npm install pdfanno
```

## Features
* Simple and easy-to-use interface.
* No installation is required.
* Client-only application, i.e., no communication with a server.

## Usage
1. Visit the [online demo](https://paperai.github.io/pdfanno/) with the latest version of Chrome.
1. Put PDF files and annotation files (if any) in your directory, then specify the root directory via `Browse` button.  
You can download sample PDFs and annotations from [here](https://cl.naist.jp/%7Eshindo/pdfanno_material.zip).  
1. Load the target PDF. If you have anno file for the PDF, load it as well.
1. Annotate the PDF as you like.
1. Save your annotations via `download` button.  
If you continue the annotation, respecify your directory via `Browse` button to reload the PDF and anno file.

For security reasons, PDFAnno does NOT automatically save your annotations.  
Don't forget to download your current annotations!  

### Annotation Tools
<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-pencil.png" width="2%"> Span highlighting. It is disallowed to cross page boundaries.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-long-arrow-right.png" width="2%"> One-way relation. This is used for annotating dependency relation between spans.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-arrows-h.png" width="2%"> Two-way relation.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-minus.png" width="2%"> Link relation. If you want to add non-directional relation between spans, use this. This is also useful for grouping multiple spans.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-square-o.png" width="2%"> Rectangle. It is disallowed to cross page boundaries.

<img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-download.png" width="2%"> Download the annotation file.

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
where `position` indicates `(x, y, width, height)` of the annotation.

### Reference Anno File
To support multi-user annotation, PDFAnno allows to load `reference anno file`.  
For example, if you create `a.anno` and an another annotator creates `b.anno` for the same PDF, load `a.anno` as usual, and load `b.anno` as a reference file. Then PDFAnno renders `a.anno` and `b.anno` with different colors each other. Rendering more than one reference file is also supported.   
This is useful to check inter-annotator agreement and resolving annotation conflicts.  
Note that the reference files are rendered as read-only.

### Authors
* [hshindo](https://github.com/hshindo)
* [yoheiMune](https://github.com/yoheiMune)

## Developer's Guide
PDFAnno is built upon [pdf.js](https://github.com/mozilla/pdf.js) for PDF viewer.
We implement custom layers for rendering annotations on pdf.js.

### Install and Build
First, install [Node.js](https://nodejs.org/) and npm. The version of Node.js must be 6+.  
Then, run the following commands:
```
npm install
npm run anno:publish
```
where the output is on `docs/`, and you can access PDFAnno via `docs/index.html`.  

For developing,
```
npm run anno:watch
```
This command starts Webpack Dev Server and you can access  [http://localhost:8080/dist/index.html](http://localhost:8080/dist/index.html) in your browser.

## LICENSE
MIT
