var mdContent = "[toc]\n" +
    "## 项目背景以及思路\n" +
    "\n" +
    "1. **项目背景**\n" +
    "> 有些文章的链接太长（比如微信推文、github的仓库文章），但是又需要分享给出去，这时候就需要短链一下，然后分享给朋友，国内的短链都需要审核域名实属麻烦，所以写一个方便自己\n" +
    "\n" +
    "&emsp;\n" +
    "2. **项目思路（更多细节自行去仓库看源码）**\n" +
    "    + ***短链生成器：*** 用户在界面填写一个需要短链的链接，然后后台判断链接是否是http、或者https链接，如果符合则生成一个结构是【个人服务器的IP:项目端口号/UUID】，存入缓存（1天时间），并且持久化到数据库。每次用户进入短链时自动将短链放入缓存中加快响应速度，而不是都查数据库\n" +
    "    + ***图床：***\n" +
    "\n" +
    "\n" +
    "## 技术栈\n" +
    "\n" +
    "**后端：** mybatisplus、ehcache、springboot\n" +
    "\n" +
    "\n" +
    "**前端：** vue3、elementui-plus\n" +
    "\n" +
    "\n" +
    "\n" +
    "## 在线演示\n" +
    "\n" +
    "[个人服务器部署演示](http://qq.linruchang.work/lrc-short-chain)\n" +
    "\n" +
    "\n" +
    "\n" +
    "## 界面\n" +
    "\n" +
    "### 短链生成器\n" +
    "\n" +
    "**功能首页**\n" +
    "![在这里插入图片描述](https://img-blog.csdnimg.cn/f8ce02e5f3d1462caad02d3b035e21eb.png)\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "**短链生成**\n" +
    "![在这里插入图片描述](https://img-blog.csdnimg.cn/131fe67363e1406d92330e0c0069d02b.png)\n" +
    "\n" +
    "\n" +
    "**合法短链跳转**\n" +
    "[上图的短链](http://qq.linruchang.work:8888/830fd28eeb3849608e92c2f13b469ace)\n" +
    "![在这里插入图片描述](https://img-blog.csdnimg.cn/21fa32130078463381cfc1d9eb9f5013.png)\n" +
    "\n" +
    "&emsp;\n" +
    "**不合法短链跳转**\n" +
    "[上图的短链](http://qq.linruchang.work:8888/830fd28eeb3849608e92c2f13b469acefsadfdsfsdfds)\n" +
    "\n" +
    "![在这里插入图片描述](https://img-blog.csdnimg.cn/0ac1bc2f4816457e91bd3170c36cb07c.png)\n" +
    "\n" +
    "### 图床\n" +
    "\n" +
    "## 部署\n" +
    "\n" +
    "### IDEA开发调试\n" +
    "\n" +
    "> 拉下来代码，刷新Maven库下载好依赖，在直接点击启动即可，打包也是同理（侧边栏按maven的package即可）\n" +
    "\n" +
    "### 服务器\n" +
    "\n" +
    "&emsp;\n" +
    "1. 解压打包好后的zip压缩包\n" +
    "```sh\n" +
    "unzip lrc-short-chain-0.0.1-SNAPSHOT-bin.zip -d lrc-short-chain-0.0.1-SNAPSHOT-bin\n" +
    "```\n" +
    "\n" +
    "&emsp;\n" +
    "2. 进入解压目录\n" +
    "```sh\n" +
    "cd lrc-short-chain-0.0.1-SNAPSHOT-bin\n" +
    "```\n" +
    "\n" +
    "&emsp;\n" +
    "3. 执行下面脚本启动部署项目即可\n" +
    "```bash\n" +
    "nohup java -jar lrc-short-chain-0.0.1-SNAPSHOT.jar >nohup.out 2>&1&\n" +
    "```\n" +
    "\n" +
    "&emsp;\n" +
    "4. Java代码\n" +
    "\n" +
    "```java\n" +
    "@AllArgsConstructor\n" +
    "@Getter\n" +
    "@ToString\n" +
    "public enum GenerateCodeTypeEnum {\n" +
    "\n" +
    "    JSON2POJO(DictTypeEnum.GenerateCodeType.value, \"json2pojo\", \"json转pojo\"),\n" +
    "    POJO2JSON(DictTypeEnum.GenerateCodeType.value, \"pojo2json\", \"pojo转json（Mock数据）\"),\n" +
    "    POJO2STRUCTURE(DictTypeEnum.GenerateCodeType.value, \"pojo2structure\", \"pojo转structure\"),\n" +
    "\n" +
    "    CONTENT2QRCODE(DictTypeEnum.GenerateCodeType.value, \"content2qrCode\", \"二维码生成\"),\n" +
    "\n" +
    "    QRCODE2CONTENT(DictTypeEnum.GenerateCodeType.value, \"qrCode2content\", \"二维码解码\");\n" +
    "\n" +
    "    /**\n" +
    "     * 字典的{@link SysDict#getType()}\n" +
    "     */\n" +
    "    String dictType;\n" +
    "\n" +
    "    /**\n" +
    "     * 代码生成器类型\n" +
    "     * 字典的{@link SysDict#getGroupCode}\n" +
    "     */\n" +
    "    String type;\n" +
    "\n" +
    "    /**\n" +
    "     * 描述\n" +
    "     */\n" +
    "    String desc;\n" +
    "\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "| 序号 | 国籍 | 作者 | 书名 | 已阅日期 |感受|\n" +
    "| :---: | :--- | :---: | :---: | --- | :---:|\n" +
    "| 1 | 法国 |  古斯塔夫·勒庞 | 乌合之众：大众心理研究 | 2020/7/26 | 垃圾书，网上吹上天了这本书 |\n" +
    "||\n" +
    "| 2 | 中国 |  何崚 | 阿里巴巴中文站架构设计实践 | 2020/7/26 | 还行 |\n" +
    "||\n" +
    "| 3 | 日本 |  矢泽久雄 | 程序是怎样跑起来的 | 2020/7/30 | 轻松 |\n" +
    "||\n" +
    "| 4 | 中国 |  李智慧 | 大型网站技术架构：核心原理与案例分析 | 2020/8/2 | 还行 |\n" +
    "||\n" +
    "| 5 | 美国 |  Martin Fowler | 重构：改善既有代码的设计 | 2020/8/9 | 有难度 |\n" +
    "||\n" +
    "| 6 | 中国 |  边芹 | 被颠覆的文明：我们怎么会落到这一步 | 2020/8/10 | 触目惊心 |\n" +
    "||\n" +
    "| 7 | 中国 |  边芹 | 谁在导演世界 | 2020/8/15 | 触目惊心 |\n" +
    "||\n" +
    "| 8 | 美国 |  D·Q·麦克伦尼 | 简单的逻辑学 | 2020/8/16 | 书如其名，学过初中数学就懂的逻辑 |\n" +
    "||\n" +
    "| 9 | 中国 |  九边 | 向上生长 | 2020/8/16 | 讲的通俗易懂，好看，受益匪浅 ，作者也是程序员，它熬的鸡汤还不错，哈哈 |\n" +
    "||\n" +
    "| 10 | 中国 |  阿里官方 | Java开发手册-嵩山版 | 2020/8/18 | 看完，遵守它的编码准则就完事了 |\n" +
    "||\n" +
    "| 11 | 中国 |  文一 |伟大的中国工业革命 -“发展政治经济学”一般原理批判纲要 | 2020/9/18 | 好书，了解中国自从改革开放以后为什么发展那么快  |\n" +
    "||\n" +
    "| 12 | 中国 |  阿里官方 |Java开发手册灵魂15问（嵩山版） | 2020/9/20 | 好书，通俗易懂  |\n" +
    "||\n" +
    "| 13 | 美国 |  罗伯特.T.清崎 |富爸爸辞职创业前的10堂课 | 2020/10/18 | 还行，但对我没用，没打算创业，感觉创业也不适合自己，没有商业细胞  |\n" +
    "||\n" +
    "| 14 | 美国 |  罗伯特.T.清崎 |富爸爸，穷爸爸 | 2020/10/23 | 一般般，反正叫你去炒股就完事  |\n" +
    "||\n" +
    "| 15 | 美国 |  Ben Forta |正则表达式必知必会 | 2020/10/27 | 好书，绝对是搞清楚正则的一本书，比网上的任何一份在线文档好  |\n" +
    "||\n" +
    "| 16 | 英国/意大利 |  拉乌尔-加布里埃尔 • 乌尔玛 |Java8实战 | 2020/11/2 | 好书，系统的学习Java8的新特性，流、函数式编程、CompletedFuture、新日期类等 - 后面的70页象征性的翻一下功力不够理解不了，功力够了再看  |\n" +
    "||\n" +
    "| 17 | 中国 |  王小波 |一只特立独行的猪 | 2020/11/6 | 一般般，很多观点不敢苟同  |\n" +
    "||\n" +
    "| 18 | 中国 |  码猿技术专栏 |Mybatis进阶 | 2020/11/9 | 讲的非常好，不会像其他书上来就是很难懂的设计模式说一波，作者中心思想是直接就叫你一个个断点进行调试，教你看重点核心的代码  |\n" +
    "||\n" +
    "| 19 | 法国 |  弗雷德里克.皮耶鲁齐 |美国陷阱 | 2020/11/9 | 美国果然世界警察，别国公司贿赂别国的政府人员，以求得到项目开发权，就把该公司的副总裁抓了，牛逼。更气的是法国总统居然还同意收购，说到底还是法国自己活该，情况给此时的华为非常像，扣押人家华为老总女儿做人质，不过呢人家华为的强大并不是收买别国政要官员而强大的   |\n" +
    "||\n" +
    "| 20 | 中国 |  西乔 |神秘的程序员们（漫画） | 2020/11/13 | 工作累了，看一下漫画作者吐槽程序员的方方面面，一天的疲惫就缓解了一点点   |\n" +
    "||\n" +
    "| 21 | 白俄罗斯 |   S. A. 阿列克谢耶维奇 | 二手时间 | 2020/11/22 | 人们总是记住军事强大的苏联，却不知苏联也有集中营，大清洗，跟文化大革命差不多。苏联分裂，它国内的人互相虐杀，实在是太可怕。希望中国不要走苏联的老路   |\n" +
    "||\n" +
    "| 22 | 中国 |  曹德旺 | 心若菩提 | 2020/11/25 | 很佩服这样的企业家，是属于你赚的钱不多拿一分，不贿赂，不贪污，一身正气   |\n" +
    "||\n" +
    "| 23 | 中国 |  许晓斌 | Maven实战 | 2020/12/06 | 书一般，这本书380页左右，其实真正重要的只有前面150页左右+加上后面附录的两页，后面大量的贴代码，讲解插件的使用，插件可以直接一句话告诉有什么作用功能即可，完全不用每个插件花7-8页进行讲解使用，若读者有需求，自行百度使用插件即可，完全不必要写每个插件具体怎么使用 - 建议看到100多页之后直接初略大致看看就好  |\n" +
    "||\n" +
    "| 24 | 中国 |  邓一光 | 人，或所有的士兵 | 2020/12/22 | 实体书的话感觉是非常非常的厚，因为我是用电子书看的，40分钟才读2.5%的进度。这本书整体读起来的感觉是一般般，没有什么能让我高潮的情节而且主人公佛系抗日，主人公整天想一些类似人生的意义是什么这一些幼稚的问题。但也从小说中看出国名党真的是百年烂党，背靠老美，富的流水，居然还能让老共夺的天下，抗日结束，不收回香港而是准备反共打内战，真tm无语  |\n" +
    "||\n" +
    "| 25 | 美国 |   傅高义 | 邓小平时代 | 2020/12/30 | 非常非常非常值的看的一本书，可以了解邓小平如何一步一步的进行改革开放。只要军权在手即使退休依然能影响中国的政治。原来中国1989天安门事件，居然有将近20多万学生抗议政府，要求西式民主，最终邓小平不同意学生要求，导致几百人死去，假若政府同意学生要求估计也没有这十几年的快速发展。   |\n" +
    "||\n" +
    "| 26 | 中国 |   魏梦舒 | 漫画算法：小灰的算法之旅 | 2020/01/10 | 这本书说实话算法并没有很高深，虽然页数是500多页怪吓人的，但是每个内容都需要至少10页以上的憨憨人物的对话进行填充，所以字数并没有多少，还是非常值的看但不推荐买纸质书，没啥收藏价值，都是非常非常初级的算法书，如果你看懂它的思路并且不敲代码验证，估计需要一个星期应该可以看完。如果按着它提供的思路但不看它提供的代码敲出来，我看了一个月，说明自己敲代码能力有待提升，仍需努力 |\n" +
    "\n" +
    "\n" +
    "\n" +
    "```mermaid\n" +
    "graph TD;\n" +
    "    A-->B;\n" +
    "    A-->C;\n" +
    "    B-->D;\n" +
    "    C-->D;\n" +
    "```\n"