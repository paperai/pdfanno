let packageJson = require("json-loader!../../../package.json");
/**
 * Paper Anno Version.
 * This is overwritten at build.
 */
let ANNO_VERSION = packageJson.version;
export default ANNO_VERSION;