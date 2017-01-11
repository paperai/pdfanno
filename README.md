<p align="center"><img src="https://github.com/paperai/paperanno/blob/master/paperanno.png" width="750"></p>

# PaperAnno
PaperAnno is a web-based annotation tool for PDF documents.  
It offers functions for various types of linguistic annotations, including part-of-speech, named entity, dependency relation, and coreference chain.  
[demo](https://paperai.github.io/paperanno/)

## Features
* Simple and easy-to-use user interface
* No installation is required.
* Client-only application. No communication with server.
* Multi-user support

## Usage
Visit our [demo](https://paperai.github.io/paperanno/).

## Developer's Guide
PaperAnno is an extension of the following libraries:
* [pdf.js](https://github.com/mozilla/pdf.js)
* [pdf-annotate.js](https://github.com/instructure/pdf-annotate.js/)

### Install and Build
First, install [Node.js](https://nodejs.org/) and npm. The version of Node.js must be 6+.  
Then, run the following commands:
```
npm install
npm run anno:publish
```
where the output is on `docs/`, and you can access paperanno via `docs/index.html`.  

For develop, 
```
npm run anno:watch
```
This command starts Webpack Dev Server and you can access  [http://localhost:8080/dist/index.html](http://localhost:8080/dist/index.html) in your browser.
