<p align="center"><img src="https://github.com/paperai/pdfanno/blob/master/pdfanno.gif" width="850"></p>

# PDFAnno
PDFAnno is a browser-based linguistic annotation tool for PDF documents.  
It offers functions for annotating PDF with labels and relations.  
For natural language processing, it is suitable for development of gold-standard data with named entity spans, dependency relations, and coreference chains.  

[Online Demo](https://paperai.github.io/pdfanno/) (version 0.2)  
**It is highly recommended to use the latest version of Chrome.** (Firefox will also be supported in future.)

If you install PDFAnno locally,
```
git clone https://github.com/paperai/pdfanno.git
cd pdfanno
npm install
```
or
```
npm install pdfanno
```
See the developer's guide for more details.

## Usage
1. Visit the [online demo](https://paperai.github.io/pdfanno/) with the latest version of Chrome.
1. Load your PDF and annotation file (if any). Sample PDFs and annotations are downloadable from [here](https://cl.naist.jp/%7Eshindo/pdfanno_material.zip).
    * For PDFs located on your computer:  
    Put the PDFs and annotation files (if any) in the same directory, then specify the directory via `Browse` button.
    * For PDF available on the Web:  
    Access 'https://paperai.github.io/pdfanno/?pdf=' + `<URL of the PDF>`  
    For example, https://paperai.github.io/pdfanno/?pdf=http://www.aclweb.org/anthology/P12-1046.pdf.  
1. Annotate the PDF as you like.
1. Save your annotations via <img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-download.png" width="2%"> button.  
If you continue the annotation, respecify your directory via `Browse` button to reload the PDF and anno file.

For security reasons, PDFAnno does NOT automatically save your annotations.  
Don't forget to download your current annotations!  

## Annotation Tools
| Icon | Description |
|:---:|:---:|
| <img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-pencil.png" width="7%"> | Span highlighting. It is disallowed to cross page boundaries. |
| <img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-long-arrow-right.png" width="7%"> | One-way relation. This is used for annotating dependency relation between spans. |
| <img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-arrows-h.png" width="7%"> | Two-way relation. |
| <img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-minus.png" width="7%"> | Link relation. If you want to add non-directional relation between spans, use this. |
| <img src="https://github.com/paperai/pdfanno/blob/master/icons/fa-square-o.png" width="7%"> | Rectangle. It is disallowed to cross page boundaries. |

## Annotation File (.anno)
In PDFAnno, the annotation file (.anno) follows [TOML](https://github.com/toml-lang/toml) format.  
Here is an example of anno file:
```
version = 0.2

[1]
type = "span"
page = 1
position = [["95.818", "252.977", "181.761", "10.909"], ["95.818", "264.806", "107.136", "10.909"]]
label = "label-1"

[2]
type = "span"
page = 1
position = [["323.863", "230.715", "213.988", "11.590"], ["313.125", "244.522", "224.829", "10.795"]]
label = "label-2"

[3]
type = "rect"
page = 1
position = ["323.863", "230.715", "213.988", "11.590"]
label = "label-3"

[4]
type = "relation"
dir = "two-way"
ids = ["1", "2"]
label = "label-4"
```
where `position` indicates `(x, y, width, height)` of the annotation.  

## Reference Anno File
To support multi-user annotation, PDFAnno allows to load `reference anno file`.  
For example, if you create `a.anno` and an another annotator creates `b.anno` for the same PDF, load `a.anno` as usual, and load `b.anno` as a reference file. Then PDFAnno renders `a.anno` and `b.anno` with different colors each other. Rendering more than one reference file is also supported.   
This is useful to check inter-annotator agreement and resolving annotation conflicts.  
Note that the reference files are rendered as read-only.

## Annotation API
`PDFAnno` provides annotation API.

### Span
```
var span = new SpanAnnotation({
  page: 1,
  position:
 [["139.03536681054345","60.237086766202694","155.97302418023767","14.366197183098592"]],
  label: 'orange',
  text: 'Ready?',
  id: 1
});
window.add(span);
window.delete(span);
```

### Relation
```
var rel = new RelationAnnotation({
  dir: 'link',
  ids: ["1","2"],
  label: 'sample'
});
window.add(rel);
window.delete(rel);
```

### Rectangle
```
var rect = new RectAnnotation({
  page:1,
  position:["9.24324324324326","435.94054054054055","235.7027027027027","44.65945945945946"],
  label: 'rect-label',
  id: 2
});
window.add(rect);
window.delete(rect);
```

### Read from TOML or JSON
```
var toml = `

version = 0.2

[1]
type = "span"
page = 1
position = [["139.03536681054345","60.237086766202694","155.97302418023767","14.366197183098592"]]
label = "orange"
text = "Ready?"
`;

var anno = readTOML(toml);
var annoObj = window.addAll(anno);
window.delete(annoObj["1"]);

// delete all annotations
window.clear();
```

## Developer's Guide
PDFAnno is built upon [pdf.js](https://github.com/mozilla/pdf.js) for PDF viewer.
We implement custom layers for rendering annotations on pdf.js.

### Install and Build
First, install [Node.js](https://nodejs.org/) and npm. The version of Node.js must be 6+.  
Then, run the following commands:
```
npm install
npm run publish
```
where the output is on `docs/`, and you can access PDFAnno via `docs/index.html`.  

For developing,
```
npm run dev
```
This command starts Webpack Dev Server and you can access  [http://localhost:8080/dist/index.html](http://localhost:8080/dist/index.html) in your browser.

## Authors
* [hshindo](https://github.com/hshindo)
* [yoheiMune](https://github.com/yoheiMune)

## LICENSE
MIT
