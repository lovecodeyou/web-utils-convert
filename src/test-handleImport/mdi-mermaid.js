import markdownIt from 'markdown-it'
import markdownItMermaid from 'mdi-mermaid'


const mdi = markdownIt()
mdi.use(markdownItMermaid)


window.mdToHtml = function (content) {
    return content ? mdi.render(content) : null;
}