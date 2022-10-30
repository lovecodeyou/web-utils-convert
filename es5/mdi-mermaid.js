'use strict';

var _markdownIt = require('markdown-it');

var _markdownIt2 = _interopRequireDefault(_markdownIt);

var _mdiMermaid = require('mdi-mermaid');

var _mdiMermaid2 = _interopRequireDefault(_mdiMermaid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mdi = (0, _markdownIt2.default)();
mdi.use(_mdiMermaid2.default);

window.mdToHtml = function (content) {
    return content ? mdi.render(content) : null;
};
