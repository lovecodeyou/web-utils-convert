let MarkdownIt = require('./lib/markdown-it.13.0.1')
let markdownItAnchor = require('./lib/markdownItAnchor.js')
let markdownItTocDoneRight = require('./lib/markdownItTocDoneRight.js')


let md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})
    .use(markdownItAnchor, {permalink: true, permalinkBefore: true, permalinkSymbol: '§'})
    .use(markdownItTocDoneRight);

window.mdToHtml = function (content) {
    return content ? md.render(content) : null;
}