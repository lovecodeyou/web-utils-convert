var mdContentHtml = "<div class=\"articleContent\"><nav class=\"table-of-contents\"><ol><li><a href=\"#%E7%AE%80%E5%8D%95%E4%BD%BF%E7%94%A8---%E6%B3%A8%E6%84%8Fhttp%E4%BC%A0%E7%9A%84%E5%8F%82%E6%95%B0%E6%98%AFjson%E6%A0%BC%E5%BC%8F%EF%BC%8C%E9%9C%80%E8%A6%81%E9%80%9A%E8%BF%87qs%E8%BF%9B%E8%A1%8C%E8%BD%AC%E6%8D%A2%E6%88%90from-data%E7%9A%84%E5%8F%82%E6%95%B0\"> 简单使用 - 注意http传的参数是json格式，需要通过qs进行转换成from-data的参数</a><ol><li><a href=\"#1.-%E4%BC%A0%E7%9A%84%E5%8F%82%E6%95%B0%E6%98%AFjson\"> 1. 传的参数是json</a></li><li><a href=\"#2.-%E4%BC%A0%E5%8F%82%E4%B8%BAform-data%E6%95%B0%E6%8D%AE---post%E3%80%81put%E3%80%81delete%E8%AF%B7%E6%B1%82%E6%96%B9%E5%BC%8F\"> 2. 传参为form-data数据 - post、put、delete请求方式</a></li><li><a href=\"#3.-%E6%B3%A8%E6%84%8Fasync%2Fawait%E6%94%BE%E7%9A%84%E4%BD%8D%E7%BD%AE\"> 3. 注意async/await放的位置</a></li><li><a href=\"#4.-%E4%BC%A0%E5%8F%82%E4%B8%BAform-data%E6%95%B0%E6%8D%AE---post%E3%80%81put%E3%80%81delete%E8%AF%B7%E6%B1%82%E6%96%B9%E5%BC%8F\"> 4. 传参为form-data数据 - post、put、delete请求方式</a></li></ol></li></ol></nav><blockquote>\n" +
    "<p><em><strong>背景：ES7引入的新语法 - 更加方便的进行异步操作</strong></em></p>\n" +
    "</blockquote>\n" +
    "<div class=\"mermaid\">\n" +
    "graph LR\n" +
    "    a[\"关键字\"] --&gt; b[\"async：修饰函数 - 表明功能是异步请求服务器获取数据\"]\n" +
    "    a[\"关键字\"] --&gt; c[\"await：用在函数里面 - 获取响应的Promise对象\"]\n" +
    "</div>\n" +
    "<h3 id=\"%E7%AE%80%E5%8D%95%E4%BD%BF%E7%94%A8---%E6%B3%A8%E6%84%8Fhttp%E4%BC%A0%E7%9A%84%E5%8F%82%E6%95%B0%E6%98%AFjson%E6%A0%BC%E5%BC%8F%EF%BC%8C%E9%9C%80%E8%A6%81%E9%80%9A%E8%BF%87qs%E8%BF%9B%E8%A1%8C%E8%BD%AC%E6%8D%A2%E6%88%90from-data%E7%9A%84%E5%8F%82%E6%95%B0\" tabindex=\"-1\"><a class=\"header-anchor\" href=\"#%E7%AE%80%E5%8D%95%E4%BD%BF%E7%94%A8---%E6%B3%A8%E6%84%8Fhttp%E4%BC%A0%E7%9A%84%E5%8F%82%E6%95%B0%E6%98%AFjson%E6%A0%BC%E5%BC%8F%EF%BC%8C%E9%9C%80%E8%A6%81%E9%80%9A%E8%BF%87qs%E8%BF%9B%E8%A1%8C%E8%BD%AC%E6%8D%A2%E6%88%90from-data%E7%9A%84%E5%8F%82%E6%95%B0\">§</a> 简单使用 - 注意http传的参数是json格式，需要通过qs进行转换成from-data的参数</h3>\n" +
    "<h4 id=\"1.-%E4%BC%A0%E7%9A%84%E5%8F%82%E6%95%B0%E6%98%AFjson\" tabindex=\"-1\"><a class=\"header-anchor\" href=\"#1.-%E4%BC%A0%E7%9A%84%E5%8F%82%E6%95%B0%E6%98%AFjson\">§</a> 1. 传的参数是json</h4>\n" +
    "<pre class=\"hljs\"><code><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">script</span> <span class=\"hljs-attr\">src</span>=<span class=\"hljs-string\">\"node_modules/axios/dist/axios.min.js\"</span>&gt;</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">script</span>&gt;</span>\n" +
    "<span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">script</span> <span class=\"hljs-attr\">type</span>=<span class=\"hljs-string\">\"text/javascript\"</span>&gt;</span><span class=\"language-javascript\">\n" +
    "\n" +
    "    <span class=\"hljs-comment\">//请求超时的时间</span>\n" +
    "    axios.<span class=\"hljs-property\">defaults</span>.<span class=\"hljs-property\">timeout</span> = <span class=\"hljs-number\">3000</span>;\n" +
    "    <span class=\"hljs-comment\">//自动拼接该字符串</span>\n" +
    "    axios.<span class=\"hljs-property\">defaults</span>.<span class=\"hljs-property\">baseURL</span>=<span class=\"hljs-string\">\"http://localhost:4040/\"</span>;\n" +
    "    <span class=\"hljs-comment\">//设置请求头的信息</span>\n" +
    "    axios.<span class=\"hljs-property\">defaults</span>.<span class=\"hljs-property\">headers</span>[<span class=\"hljs-string\">\"mytoken\"</span>]= <span class=\"hljs-string\">\"fsdfdsfdsfs\"</span>\n" +
    "\n" +
    "    <span class=\"hljs-comment\">// 返回的promise对象</span>\n" +
    "    <span class=\"hljs-keyword\">async</span> <span class=\"hljs-keyword\">function</span> <span class=\"hljs-title function_\">queryData</span>(<span class=\"hljs-params\">url</span>) {\n" +
    "\n" +
    "        <span class=\"hljs-keyword\">var</span> promise = <span class=\"hljs-keyword\">await</span> axios.<span class=\"hljs-title function_\">get</span>(url)\n" +
    "\n" +
    "        <span class=\"hljs-keyword\">return</span> promise\n" +
    "    }\n" +
    "    \n" +
    "    <span class=\"hljs-comment\">//实际访问http://localhost:4040/products 地址获取数据</span>\n" +
    "    <span class=\"hljs-title function_\">queryData</span>(<span class=\"hljs-string\">\"products\"</span>).<span class=\"hljs-title function_\">then</span>(<span class=\"hljs-keyword\">function</span>(<span class=\"hljs-params\">data</span>){\n" +
    "        <span class=\"hljs-comment\">//真实数据</span>\n" +
    "        <span class=\"hljs-variable language_\">console</span>.<span class=\"hljs-title function_\">log</span>(data.<span class=\"hljs-property\">data</span>);\n" +
    "    })\n" +
    "\n" +
    "</span><span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">script</span>&gt;</span>\n" +
    "</code></pre>\n" +
    "<h4 id=\"2.-%E4%BC%A0%E5%8F%82%E4%B8%BAform-data%E6%95%B0%E6%8D%AE---post%E3%80%81put%E3%80%81delete%E8%AF%B7%E6%B1%82%E6%96%B9%E5%BC%8F\" tabindex=\"-1\"><a class=\"header-anchor\" href=\"#2.-%E4%BC%A0%E5%8F%82%E4%B8%BAform-data%E6%95%B0%E6%8D%AE---post%E3%80%81put%E3%80%81delete%E8%AF%B7%E6%B1%82%E6%96%B9%E5%BC%8F\">§</a> 2. 传参为form-data数据 - post、put、delete请求方式</h4>\n" +
    "<p><strong>main.js</strong></p>\n" +
    "<pre class=\"hljs\"><code><span class=\"hljs-keyword\">import</span> axios from <span class=\"hljs-string\">'axios'</span>\n" +
    "<span class=\"hljs-keyword\">import</span> qs from <span class=\"hljs-string\">'qs'</span>\n" +
    "\n" +
    "Vue.prototype.$http = axios;\n" +
    "Vue.prototype.$qs = qs;\n" +
    "</code></pre>\n" +
    "<p> \n" +
    " </p>\n" +
    "<p><strong>Vue组件内使用</strong></p>\n" +
    "<pre class=\"hljs\"><code>\n" +
    "commit: async <span class=\"hljs-title function_\">function</span><span class=\"hljs-params\">()</span> {\n" +
    "\n" +
    "    <span class=\"hljs-type\">var</span> <span class=\"hljs-variable\">params</span> <span class=\"hljs-operator\">=</span> {\n" +
    "        loginName: <span class=\"hljs-string\">'root'</span>,\n" +
    "        password: <span class=\"hljs-string\">'root'</span>\n" +
    "    }\n" +
    "    \n" +
    "    <span class=\"hljs-type\">var</span> <span class=\"hljs-variable\">formData</span> <span class=\"hljs-operator\">=</span> <span class=\"hljs-built_in\">this</span>.$qs.stringify( params )\n" +
    "    <span class=\"hljs-type\">var</span> <span class=\"hljs-variable\">header</span> <span class=\"hljs-operator\">=</span>  {\n" +
    "              headers: { <span class=\"hljs-string\">\"Content-Type\"</span>: <span class=\"hljs-string\">\"application/x-www-form-urlencoded; charset=UTF-8\"</span>}\n" +
    "            }\n" +
    "\n" +
    "    \n" +
    "    <span class=\"hljs-keyword\">var</span> { data: result } = await <span class=\"hljs-built_in\">this</span>.$http.post(<span class=\"hljs-string\">\"http:loaclhost:2020/login\"</span>, formData, header);\n" +
    "    \n" +
    "    <span class=\"hljs-comment\">//var result= await this.$http.post(\"http:loaclhost:2020/login\", formData, header);</span>\n" +
    "    <span class=\"hljs-comment\">//return result.data</span>\n" +
    "        \n" +
    "    \n" +
    "    <span class=\"hljs-keyword\">return</span> result;\n" +
    "}\n" +
    "\n" +
    "\n" +
    "</code></pre>\n" +
    "<p> </p>\n" +
    "<p><strong>这是不使用 - async/await关键字的结果</strong>\n" +
    "<img src=\"https://img0.baidu.com/it/u=1472391233,99561733&amp;fm=253&amp;app=138&amp;size=w931&amp;n=0&amp;f=JPEG&amp;fmt=auto?sec=1667149200&amp;t=63dfc3730d01995ca7dd6b8ba4bfa0bb\" alt=\"202bf16b151adbdd114f9767beb0af42.png\"></p>\n" +
    "<p> \n" +
    "<strong>这是注释写法的返回结果</strong>\n" +
    "<img src=\"https://img0.baidu.com/it/u=4008146120,512111027&amp;fm=253&amp;app=138&amp;size=w931&amp;n=0&amp;f=JPEG&amp;fmt=auto?sec=1667149200&amp;t=bd1f81df88445224a1b98c92f317ef32\" alt=\"cd06d58d9c0de6689a5c55597009d8e0.png\"></p>\n" +
    "<p> \n" +
    "<strong>这是上述代码运行结果</strong>\n" +
    "<img src=\"https://img1.baidu.com/it/u=3009731526,373851691&amp;fm=253&amp;fmt=auto&amp;app=138&amp;f=JPEG?w=800&amp;h=500\" alt=\"a2514f1f5dc11eda2c0b1c77f09940ed.png\"></p>\n" +
    "<p> </p>\n" +
    "<h4 id=\"3.-%E6%B3%A8%E6%84%8Fasync%2Fawait%E6%94%BE%E7%9A%84%E4%BD%8D%E7%BD%AE\" tabindex=\"-1\"><a class=\"header-anchor\" href=\"#3.-%E6%B3%A8%E6%84%8Fasync%2Fawait%E6%94%BE%E7%9A%84%E4%BD%8D%E7%BD%AE\">§</a> 3. 注意async/await放的位置</h4>\n" +
    "<p> </p>\n" +
    "<p><strong>将请求写在方法里，使用的地方也必须加上async/await</strong></p>\n" +
    "<pre class=\"hljs\"><code><span class=\"hljs-attr\">methods</span>: {\n" +
    "      <span class=\"hljs-keyword\">async</span> <span class=\"hljs-title function_\">getOrderMaster</span>(<span class=\"hljs-params\"></span>) {\n" +
    "\n" +
    "        <span class=\"hljs-keyword\">var</span> user_id = <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-property\">$store</span>.<span class=\"hljs-property\">state</span>.<span class=\"hljs-property\">user</span>.<span class=\"hljs-property\">user_id</span>;\n" +
    "\n" +
    "        <span class=\"hljs-keyword\">var</span> {<span class=\"hljs-attr\">data</span>:result} = <span class=\"hljs-keyword\">await</span> <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-property\">$http</span>.<span class=\"hljs-title function_\">get</span>(<span class=\"hljs-string\">\"http://localhost:6060/books/?user_id=\"</span>+ <span class=\"hljs-number\">1</span> +<span class=\"hljs-string\">\"&amp;all=true\"</span>);\n" +
    "        <span class=\"hljs-variable language_\">console</span>.<span class=\"hljs-title function_\">log</span>(<span class=\"hljs-string\">\"===============OrdersAll用户订单\"</span>)\n" +
    "        <span class=\"hljs-variable language_\">console</span>.<span class=\"hljs-title function_\">log</span>(result.<span class=\"hljs-property\">data</span>);\n" +
    "\n" +
    "        <span class=\"hljs-keyword\">if</span>(result.<span class=\"hljs-property\">effective</span>) {\n" +
    "          <span class=\"hljs-keyword\">return</span> result.<span class=\"hljs-property\">data</span>;\n" +
    "        }<span class=\"hljs-keyword\">else</span> {\n" +
    "          <span class=\"hljs-keyword\">return</span> [];\n" +
    "        }\n" +
    "\n" +
    "      }\n" +
    "    },\n" +
    "    \n" +
    "    <span class=\"hljs-keyword\">async</span> <span class=\"hljs-title function_\">created</span>(<span class=\"hljs-params\"></span>) {\n" +
    "\n" +
    "      <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-property\">orderMasters</span> = <span class=\"hljs-keyword\">await</span> <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-title function_\">getOrderMaster</span>();\n" +
    "\n" +
    "    }\n" +
    "</code></pre>\n" +
    "<p> </p>\n" +
    "<h4 id=\"4.-%E4%BC%A0%E5%8F%82%E4%B8%BAform-data%E6%95%B0%E6%8D%AE---post%E3%80%81put%E3%80%81delete%E8%AF%B7%E6%B1%82%E6%96%B9%E5%BC%8F\" tabindex=\"-1\"><a class=\"header-anchor\" href=\"#4.-%E4%BC%A0%E5%8F%82%E4%B8%BAform-data%E6%95%B0%E6%8D%AE---post%E3%80%81put%E3%80%81delete%E8%AF%B7%E6%B1%82%E6%96%B9%E5%BC%8F\">§</a> 4. 传参为form-data数据 - post、put、delete请求方式</h4>\n" +
    "<pre class=\"hljs\"><code><span class=\"hljs-keyword\">var</span> { <span class=\"hljs-attr\">data</span>: result } = <span class=\"hljs-keyword\">await</span> <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-property\">$http</span>.<span class=\"hljs-title function_\">get</span>(<span class=\"hljs-string\">'http://localhost:8080/apiGateway/memberService/members/'</span>, { <span class=\"hljs-attr\">params</span>: <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-property\">queryParam</span> })\n" +
    "</code></pre>\n" +
    "</div>";