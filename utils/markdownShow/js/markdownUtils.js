/**
 * 字符串是否不为空
 * @param content 字符串内容
 */
function strIsNotEmpty(content) {
    let result = content && content.length > 0;
    if( (typeof result) === 'string' ) {
        return result.length > 0;
    }else {
        return result ? true : false ;
    }
}

/**
 * 字符串是否为空
 * @param content 字符串内容
 */
function strIsEmpty(content) {
    return !strIsNotEmpty(content);
}

/**
 * 日志打印=由前端开关进行控制
 * @param logContents
 */
function log(...logContents) {
    // if (getGlobalLogSwitch()) {
    if (true) {
        console.log(...logContents);
    }
}


/**
 * markdown-it配置初始化
 */
let mdToHtmlGenerator2 = null;
function mdToHtml2ConfigInit() {
    //初始化配置信息
    if(!mdToHtmlGenerator2) {
        //流程图mermaid初始化配置
        mermaid.initialize({startOnLoad:true, theme: 'forest'});

        //markdown-it配置初始化
        mdToHtmlGenerator2 = new markdownit({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true,  //开启自动换行符
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre class="hljs"><code>' +
                            hljs.highlight(str, {language: lang, ignoreIllegals: true}).value +
                            '</code></pre>';
                    } catch (__) {
                    }
                }
                return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
            },

        })
            .use(markdownItAnchor, {permalink: true, permalinkBefore: true, permalinkSymbol: '§'})
            .use(markdownItTocDoneRight)
            .use(markdownItTextualUml)
            .use(markdownItCodeCopy)
            .use(markdownitEmoji);
    }
}


/**
 * md转HTML之后样式修正添加侧边导航栏、以及修改侧边导航栏样式
 * @param mdContentHtml
 * @returns {*|jQuery}
 */
function mdContentHtml2AddSlideNav(mdContentHtml) {

    let articleSlideNavJq = $(mdContentHtml)
        .find(".table-of-contents")
        .clone(true)
        .addClass("article-slide-nav")
        .css({
            "position": "fixed",
            "white-space": "nowrap",
            "text-overflow": "ellipsis",
            "width": "14%",
            "right": "0",
            "top": "0",
            "margin-top": "var(--articleDetailPage-margintop)",
            "margin-right": "var(--articleDetailPage-marginright)",
            "overflow-x": "hidden",
            "padding": "0.5rem",
            "box-shadow": "0px 0px 12px rgba(0, 0, 0, 0.12)",
            "line-height": "var(--default-a-lineheight)",
        })
        .prepend("<p class='article-slide-nav-title'>目录</p>")
        .find(".article-slide-nav-title")
        .css({
            "border-bottom": "1px solid #e4e6eb",
            "margin":"0px",
            "line-height":"3rem",
            "font-weight":"500",
        })
        .end()
        .find("li")
        .css({
            "overflow": "hidden",
        })
        .end();

    articleSlideNavJq.find("ol").css({
        "padding-inline-start": "1.2rem",
    })

    articleSlideNavJq.find("ol:first").css({
        "padding-inline-start": "0rem",
    })

    return $(mdContentHtml)
        .append(articleSlideNavJq)
        .prop("outerHTML")

}


/**
 * md转HTML之后样式修正
 * @param mdContentHtml
 * @returns {*|jQuery}
 */
function mdContentHtml2StyleCorrection(mdContentHtml) {

    //表格样式修正
    //页面未渲染并不能获取到高度
    // let tdHeight = $(mdContentHtml).find("table th").css("height")
    let mdContentHtmlJq = $(mdContentHtml)
        .find("td:empty")
        .css({height: '2rem'})
        .end()
        .find("table")
        .css({
            'margin-top': '4rem',
            'border-collapse': 'collapse'
        })
        .end()
        .find("table th")
        .css({
            'font-weight': 'bold',
            'background': '#7B8184',
            'color': 'white',
            'border': '1px solid #EAEAEA'
        })
        .end()
        .find("table td")
        .css({
            'border': '1px solid #EAEAEA'
        })
        .end()

    //文章内的导航栏样式修正
    mdContentHtmlJq = mdContentHtmlJq.find(".table-of-contents:not(.article-slide-nav)")
        .css({"margin-bottom":"5rem"})
        .find("a")
        .css({
            "text-decoration": "underline",
            "color": "var(--default-a-clicked-color)"
        })
        .end()
        .end();

    //图片样式修正
    mdContentHtmlJq = mdContentHtmlJq.find("img")
        .css({"width":"80%"})
        .end();

    //代码样式修正
    mdContentHtmlJq = mdContentHtmlJq.find("pre")
        .css({
            "font-family":"Menlo, Monaco, Consolas, 'Courier New', monospace",
            "line-height":"1.5rem",
            "border-radius":"1%",
            "padding":"1rem",
            "padding-top":"2rem",
            "overflow-x":"scroll",
            "font-weight":"bold",
        })
        .end();

    //引用快样式
    mdContentHtmlJq = mdContentHtmlJq.find("blockquote")
        .css({
            "display":"block",
            "padding":"1rem",
            "border-left":"0.5rem solid #dddfe4",
            "background":"#eef0f4",
            "overflow":"auto",
            "word-break":"break-word",
        })
        .end();


    //删除mermaid语法内的复制按钮
    mdContentHtmlJq = mdContentHtmlJq.find(".mermaid")
        .siblings(".markdown-it-code-copy")
        .remove()
        .end()
        .end();

    //复制按钮添加标题
    mdContentHtmlJq = mdContentHtmlJq.find(".markdown-it-code-copy")
        .text("复制")
        .end();


    return mdContentHtmlJq.prop("outerHTML");
}

/**
 * md转HTML之后事件处理修正
 * @param mdContentHtml
 * @returns {*|jQuery}
 */
function mdContentHtml2EventCorrection(mdContentHtml) {
    //复制成功后的提示
    $(document).delegate(".markdown-it-code-copy", "click", function() {
        layer.msg('复制成功', {time: 1000, icon:6});
    })

    //文章导航栏页面跳转
    $(document).delegate(".articleDetailPage .content-wrapper a", "click", function() {
        let anchorId = $(this).attr('href')
        if(strIsNotEmpty(anchorId)) {
            anchorId = anchorId.substr(1)
            log(`文章锚点跳转：${anchorId}`)
            $(`:header[id='${anchorId}']`)[0].scrollIntoView(true)
        }
        return false;
    })


    //侧边导航栏页面样式逻辑
    $(document).delegate(".article-slide-nav a", "click", function() {
        $(this)
            .parents(".article-slide-nav")
            .find("a")
            .css({
                color: 'var(--default-a-color)'
            });
        $(this).css({
            color: 'var(--default-a-clicked-color)'
        })
        return false;
    })


    return mdContentHtml;
}

/**
 * md转HTML-markdown-it方式
 * <a href="https://www.npmjs.com/package/markdown-it" />
 * @param mdContent
 * @returns {null|*|Window.jQuery}
 */
function mdToHtml2(mdContent) {

    mdToHtml2ConfigInit();

    if(strIsNotEmpty(mdContent)) {
        log('原始markdown内容：', mdContent)

        let mdContentHtml = mdToHtmlGenerator2.render(mdContent)


        mdContentHtmlJquery = $("<div class='content-wrapper' />")
            .append(mdContentHtml);

        //mermaid语法转换成svg在页面显示
        mdContentHtml = $(mdContentHtmlJquery).find(".mermaid").each(function(mermaidIndex) {
            let content = $(this).text();
            log('mermaid语法内容：', content)
            let renderContent = mermaid.render('mermaid' + mermaidIndex, content)
            log('mermaid语法渲染后的内容：', renderContent)
            $(this).html(renderContent)
        }).end().prop("outerHTML")


        mdContentHtml = mdContentHtml2AddSlideNav(mdContentHtml)
        mdContentHtml = mdContentHtml2EventCorrection(mdContentHtml)
        mdContentHtml = mdContentHtml2StyleCorrection(mdContentHtml)

        log('渲染后markdown内容：', mdContentHtml)
        return mdContentHtml;
    }


    return null;
}
