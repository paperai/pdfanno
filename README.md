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

PDFAnno does NOT automatically save the user's annotation.  

### Annotation Tools
* ![](https://github.com/paperai/pdfanno/blob/master/icons/fa-mouse-pointer.png): Selection tool.
* ![](https://github.com/paperai/pdfanno/blob/master/icons/fa-pencil.png): Span highlighting.
* ![](https://github.com/paperai/pdfanno/blob/master/icons/fa-long-arrow-right.png): One-way relation. This is used for annotating dependency relation between spans.
* ![](https://github.com/paperai/pdfanno/blob/master/icons/fa-arrows-h.png): Two-way relation.
* ![](https://github.com/paperai/pdfanno/blob/master/icons/fa-minus.png): Link relation. If you want to add non-directional relation between spans, use this.
* ![](https://github.com/paperai/pdfanno/blob/master/icons/fa-square-o.png): Rectangle.
* ![](https://github.com/paperai/pdfanno/blob/master/icons/fa-download.png): Download the annotation file.
* DEL: Delete all of current annotations.

### Annotation File (.anno)
In PDFAnno, the annotation file (.anno) follows JSON format.  
Here is an example of the .anno file:
```
{
  "version": "0.0.1",
  "P12-1046.pdf": {
    "span-1": [
      [1, 95.818, 252.977, 181.761, 10.909],
      [1, 95.818, 264.806, 107.136, 10.909],
      "label1"
    ],
    "span-2": [
      [1, 323.863, 230.715, 213.988, 11.590],
      [1, 313.125, 244.522, 224.829, 10.795],
      "label2"
    ],
    "rel-1": [
      1, "two-way", "span-1", "span-2", "label3"
    ],
  },
}
```

### Multi-user Annotation
PDFAnno allows simultaneous visualization of multi-user's annotation files on the single PDF, which is useful for checking inter-annotator agreement and resolving annotation conflicts.  
To be written...

## Developer's Guide
PDFAnno uses the following libraries:
* [pdf.js](https://github.com/mozilla/pdf.js)
* [pdf-annotate.js](https://github.com/instructure/pdf-annotate.js/)

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
