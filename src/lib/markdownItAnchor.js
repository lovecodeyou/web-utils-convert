var e = !1, n = {false: "push", true: "unshift", after: "push", before: "unshift"}, t = {isPermalinkSymbol: !0};

function r(r, a, i, l) {
    var o;
    if (!e) {
        var c = "Using deprecated markdown-it-anchor permalink option, see https://github.com/valeriangalliat/markdown-it-anchor#todo-anchor-or-file";
        "object" == typeof process && process && process.emitWarning ? process.emitWarning(c) : console.warn(c), e = !0
    }
    var s = [Object.assign(new i.Token("link_open", "a", 1), {attrs: [].concat(a.permalinkClass ? [["class", a.permalinkClass]] : [], [["href", a.permalinkHref(r, i)]], Object.entries(a.permalinkAttrs(r, i)))}), Object.assign(new i.Token("html_block", "", 0), {
        content: a.permalinkSymbol,
        meta: t
    }), new i.Token("link_close", "a", -1)];
    a.permalinkSpace && i.tokens[l + 1].children[n[a.permalinkBefore]](Object.assign(new i.Token("text", "", 0), {content: " "})), (o = i.tokens[l + 1].children)[n[a.permalinkBefore]].apply(o, s)
}

function a(e) {
    return "#" + e
}

function i(e) {
    return {}
}

var l = {class: "header-anchor", symbol: "#", renderHref: a, renderAttrs: i};

function o(e) {
    function n(t) {
        return t = Object.assign({}, n.defaults, t), function (n, r, a, i) {
            return e(n, t, r, a, i)
        }
    }

    return n.defaults = Object.assign({}, l), n.renderPermalinkImpl = e, n
}

var c = o(function (e, r, a, i, l) {
    var o,
        c = [Object.assign(new i.Token("link_open", "a", 1), {attrs: [].concat(r.class ? [["class", r.class]] : [], [["href", r.renderHref(e, i)]], r.ariaHidden ? [["aria-hidden", "true"]] : [], Object.entries(r.renderAttrs(e, i)))}), Object.assign(new i.Token("html_inline", "", 0), {
            content: r.symbol,
            meta: t
        }), new i.Token("link_close", "a", -1)];
    if (r.space) {
        var s = "string" == typeof r.space ? r.space : " ";
        i.tokens[l + 1].children[n[r.placement]](Object.assign(new i.Token("string" == typeof r.space ? "html_inline" : "text", "", 0), {content: s}))
    }
    (o = i.tokens[l + 1].children)[n[r.placement]].apply(o, c)
});
Object.assign(c.defaults, {space: !0, placement: "after", ariaHidden: !1});
var s = o(c.renderPermalinkImpl);
s.defaults = Object.assign({}, c.defaults, {ariaHidden: !0});
var u = o(function (e, n, t, r, a) {
    var i = [Object.assign(new r.Token("link_open", "a", 1), {attrs: [].concat(n.class ? [["class", n.class]] : [], [["href", n.renderHref(e, r)]], Object.entries(n.renderAttrs(e, r)))})].concat(n.safariReaderFix ? [new r.Token("span_open", "span", 1)] : [], r.tokens[a + 1].children, n.safariReaderFix ? [new r.Token("span_close", "span", -1)] : [], [new r.Token("link_close", "a", -1)]);
    r.tokens[a + 1] = Object.assign(new r.Token("inline", "", 0), {children: i})
});
Object.assign(u.defaults, {safariReaderFix: !1});
var d = o(function (e, r, a, i, l) {
    var o;
    if (!["visually-hidden", "aria-label", "aria-describedby", "aria-labelledby"].includes(r.style)) throw new Error("`permalink.linkAfterHeader` called with unknown style option `" + r.style + "`");
    if (!["aria-describedby", "aria-labelledby"].includes(r.style) && !r.assistiveText) throw new Error("`permalink.linkAfterHeader` called without the `assistiveText` option in `" + r.style + "` style");
    if ("visually-hidden" === r.style && !r.visuallyHiddenClass) throw new Error("`permalink.linkAfterHeader` called without the `visuallyHiddenClass` option in `visually-hidden` style");
    var c = i.tokens[l + 1].children.filter(function (e) {
        return "text" === e.type || "code_inline" === e.type
    }).reduce(function (e, n) {
        return e + n.content
    }, ""), s = [], u = [];
    if (r.class && u.push(["class", r.class]), u.push(["href", r.renderHref(e, i)]), u.push.apply(u, Object.entries(r.renderAttrs(e, i))), "visually-hidden" === r.style) {
        if (s.push(Object.assign(new i.Token("span_open", "span", 1), {attrs: [["class", r.visuallyHiddenClass]]}), Object.assign(new i.Token("text", "", 0), {content: r.assistiveText(c)}), new i.Token("span_close", "span", -1)), r.space) {
            var d = "string" == typeof r.space ? r.space : " ";
            s[n[r.placement]](Object.assign(new i.Token("string" == typeof r.space ? "html_inline" : "text", "", 0), {content: d}))
        }
        s[n[r.placement]](Object.assign(new i.Token("span_open", "span", 1), {attrs: [["aria-hidden", "true"]]}), Object.assign(new i.Token("html_inline", "", 0), {
            content: r.symbol,
            meta: t
        }), new i.Token("span_close", "span", -1))
    } else s.push(Object.assign(new i.Token("html_inline", "", 0), {content: r.symbol, meta: t}));
    "aria-label" === r.style ? u.push(["aria-label", r.assistiveText(c)]) : ["aria-describedby", "aria-labelledby"].includes(r.style) && u.push([r.style, e]);
    var f = [Object.assign(new i.Token("link_open", "a", 1), {attrs: u})].concat(s, [new i.Token("link_close", "a", -1)]);
    (o = i.tokens).splice.apply(o, [l + 3, 0].concat(f)), r.wrapper && (i.tokens.splice(l, 0, Object.assign(new i.Token("html_block", "", 0), {content: r.wrapper[0] + "\n"})), i.tokens.splice(l + 3 + f.length + 1, 0, Object.assign(new i.Token("html_block", "", 0), {content: r.wrapper[1] + "\n"})))
});

function f(e, n, t, r) {
    var a = e, i = r;
    if (t && Object.prototype.hasOwnProperty.call(n, a)) throw new Error("User defined `id` attribute `" + e + "` is not unique. Please fix it in your Markdown to continue.");
    for (; Object.prototype.hasOwnProperty.call(n, a);) a = e + "-" + i, i += 1;
    return n[a] = !0, a
}

function b(e, n) {
    n = Object.assign({}, b.defaults, n), e.core.ruler.push("anchor", function (e) {
        for (var t, a = {}, i = e.tokens, l = Array.isArray(n.level) ? (t = n.level, function (e) {
            return t.includes(e)
        }) : function (e) {
            return function (n) {
                return n >= e
            }
        }(n.level), o = 0; o < i.length; o++) {
            var c = i[o];
            if ("heading_open" === c.type && l(Number(c.tag.substr(1)))) {
                var s = n.getTokensText(i[o + 1].children), u = c.attrGet("id");
                u = null == u ? f(n.slugify(s), a, !1, n.uniqueSlugStartIndex) : f(u, a, !0, n.uniqueSlugStartIndex), c.attrSet("id", u), !1 !== n.tabIndex && c.attrSet("tabindex", "" + n.tabIndex), "function" == typeof n.permalink ? n.permalink(u, n, e, o) : (n.permalink || n.renderPermalink && n.renderPermalink !== r) && n.renderPermalink(u, n, e, o), o = i.indexOf(c), n.callback && n.callback(c, {
                    slug: u,
                    title: s
                })
            }
        }
    })
}

Object.assign(d.defaults, {
    style: "visually-hidden",
    space: !0,
    placement: "after",
    wrapper: null
}), b.permalink = {
    __proto__: null,
    legacy: r,
    renderHref: a,
    renderAttrs: i,
    makePermalink: o,
    linkInsideHeader: c,
    ariaHidden: s,
    headerLink: u,
    linkAfterHeader: d
}, b.defaults = {
    level: 1,
    slugify: function (e) {
        return encodeURIComponent(String(e).trim().toLowerCase().replace(/\s+/g, "-"))
    },
    uniqueSlugStartIndex: 1,
    tabIndex: "-1",
    getTokensText: function (e) {
        return e.filter(function (e) {
            return ["text", "code_inline"].includes(e.type)
        }).map(function (e) {
            return e.content
        }).join("")
    },
    permalink: !1,
    renderPermalink: r,
    permalinkClass: s.defaults.class,
    permalinkSpace: s.defaults.space,
    permalinkSymbol: "¶",
    permalinkBefore: "before" === s.defaults.placement,
    permalinkHref: s.defaults.renderHref,
    permalinkAttrs: s.defaults.renderAttrs
}, b.default = b, module.exports = b;
//# sourceMappingURL=markdownItAnchor.js.map
