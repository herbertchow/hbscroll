//感谢 东哥 支持 scroll_v2 版 滚动条出炉

/******
需要在css中加入以下代码,可以设置样式，暂时所有滚动条都共用一个样式
如有需要不一样的样式，可根据具体滚动条用 ID选择器 选择，再调节样式
.hbScroll-wrap{
    position: absolute;
    width: 50px;
    height: 100%;
    right: 0;
    top: 0;
    display: block;
    background: blue;
}
.hbScroll-wrap .hbScroll-silde{
    position: absolute;
    width: 100%;
    height: 30px;
    top: 0;
    left: 0;
    display: block;
    background: red;
}
****/



/*********
父容器只是用于绑定滚动条位置，父容器和$con滚动区需要设置position属性，父容器最好也设一下宽高
$con滚动区内容要设置高度height，overflow:hidden

参考
.xxxx{
    position: absolute;
    top: 50%;
    left: 50%;
    height: 500px;
    width: 500px;
    background: red;
    z-index: 10000;
    
    .yyyy{
        position: relative;
        padding-top: 10px;
        overflow: hidden;
        height: 100px;
        background: green;
    }
}

****/




/*********
* 调用方式
* var a = hbScroll('.rule-pop','.pop-main',1); //hbScroll(...)会默认执行一次函数，不止是声明 ,参数为：父容器，滚动区块，独立id
* var b = hbScroll('.xxxx','.yyyy',2);
* a.reInit(); 重置滚动条
* 如果id一样，第二次就会返回false不执行;如果前两者一样，会创建多一个同样的对象，不报错但不建议
*******/

var hbScroll = function(parentSelectorA,contSelectorA,gid){//这个方法要用JQ
    var Scroll = {};
    if($('#hbScroll-wrap'+gid).length>0){
        return false;
    }
    (function(win,doc,$){
        function CusScrollBar(options){
            //初始化
            this._init(options);
        }

        $.extend(CusScrollBar.prototype,{
            _init : function(options){
                if($('#hbScroll-wrap'+gid).length>0){
                    return false;
                }
                var self = this;
                self.options = {
                    contSelector: "",   // 滑动内容区选择器
                    barSelector: "",    // 滑动条选择器
                    sliderSelector: "", // 滑动块选择器
                    parentSelector: "",//父元素
                    selfId:"",//唯一id
                    wheelStep: 20       // 滚动步幅
                };

                $.extend(true,self.options,options || {});


                //插入滚动条
                self._initAppend();
                // Dom选择函数
                self._initDomEvent();
                // 绑定滑块点击拖动事件
                self._initSliderDragEvent();
                // 绑定滚轮事件
                self._bandMouseWheel();
                // 监听内容滚动，同步滑块移动
                self._bandContScroll();
                //如果无需滚动条，则隐藏滚动条
                self.checkShowHide();
                return self;
            },

            /*
             * 初始化插入滚动条
             * @method _initAppend
             */
            _initAppend : function(){
                var opts = this.options;
                //父元素，必填
                this.$par = $(opts.parentSelector);
                this.$selfId = opts.selfId;

                var _html = '<div class="hbScroll-wrap" id="hbScroll-wrap'+this.$selfId+'"><div class="hbScroll-silde"></div></div>';
                this.$par.append(_html);
            },

            /*
             * 初始化DOM引用
             * @method _initDomEvent
             */
            _initDomEvent : function(){
                var opts = this.options;

                //父元素，必填
                this.$par = $(opts.parentSelector);
                // 滑动内容区对象，必须填
                this.$cont = $(opts.contSelector);
                // 滑动条滑块对象，必须填
                // this.$slider = $(opts.sliderSelector);
                this.$slider = $('#hbScroll-wrap'+this.$selfId+' .hbScroll-silde');
                // 滑动条对象
                // this.$bar = opts.barSelector ? $(opts.barSelector) : this.$slider.parent();
                this.$bar = $('#hbScroll-wrap'+this.$selfId);
                // 文档对象
                this.$doc = $(doc);
            },

            /*
             * 初始化滑动块滑动功能
             */
            _initSliderDragEvent : function(){
                var self = this,
                    slider = self.$slider,//滑块
                    cont = self.$cont,//内容区
                    doc = self.$doc,//document
                    dragStartPagePosition,
                    dragStartScrollPosition,
                    dragContBarRate;

                function mousemoveHandler(e){
                    if(dragStartPagePosition == null){
                        return;
                    }
                    self.scrollContTo(dragStartScrollPosition + (e.pageY - dragStartPagePosition)*dragContBarRate);
                }

                slider.on("mousedown", function (event){
                    event.preventDefault();
                    dragStartPagePosition = event.pageY;
                    dragStartScrollPosition = cont[0].scrollTop;
                    dragContBarRate = self.getMaxScrollPosition()/self.getMaxSliderPosition();

                    doc.on("mousemove.scroll", function(event){
                        event.preventDefault();
                        mousemoveHandler(event);
                    }).on("mouseup.scroll", function(event){
                        event.preventDefault();
                        doc.off(".scroll");
                    });
                });
            },

            // 监听内容滚动事件，同步滑块位置
            _bandContScroll : function() {
                var self = this;
                self.$cont.on("scroll", function(e) {
                    e.preventDefault();
                    self.$slider.css( 'top', self.getSliderPosition() + 'px');
                });
            },

            // 绑定鼠标滚轮事件
            _bandMouseWheel : function() {
                var self = this;
                self.$cont.on("mousewheel DOMMouseScroll", function(e) {
                    // e.preventDefault();
                    // var oEv = e.originalEvent;
                    // var wheelRange = oEv.wheelDelta ? -oEv.wheelDelta/120 : (oEv.detail || 0)/3;
                    // self.scrollContTo(self.$cont[0].scrollTop + wheelRange * self.options.wheelStep);
                    if( self.$cont[0].scrollTop>0 &&
                        !(self.$cont[0].scrollTop
                        >=(self.$cont[0].scrollHeight 
                        -$.trim(self.$cont.css("padding-top").match(/\d+(\.\d+)?/g))
                        -$.trim(self.$cont.css("padding-bottom").match(/\d+(\.\d+)?/g))
                        -$.trim(self.$cont.css("height").match(/\d+(\.\d+)?/g)) ) )  ){
                        e.preventDefault();
                    }
                    
                    var oEv = e.originalEvent;
                    var wheelRange = oEv.wheelDelta ? -oEv.wheelDelta/120 : (oEv.detail || 0)/3;
                    self.scrollContTo(self.$cont[0].scrollTop + wheelRange * self.options.wheelStep);

                    if( !(self.$cont[0].scrollTop<=0) &&
                        !(self.$cont[0].scrollTop
                        >=(self.$cont[0].scrollHeight 
                        -$.trim(self.$cont.css("padding-top").match(/\d+(\.\d+)?/g))
                        -$.trim(self.$cont.css("padding-bottom").match(/\d+(\.\d+)?/g))
                        -$.trim(self.$cont.css("height").match(/\d+(\.\d+)?/g)) ) )  ){
                        e.preventDefault();
                    }
                });
                return self;
            },

            // 获取滑块位置
            getSliderPosition : function() {
                var self = this;
                return self.$cont[0].scrollTop/(self.getMaxScrollPosition()/self.getMaxSliderPosition());
            },

            // 文档可滚动最大距离
            getMaxScrollPosition : function() {
                var self = this;
                return Math.max(self.$cont.height(),self.$cont[0].scrollHeight) - self.$cont.height() -parseInt($.trim(self.$cont.css("padding-top").match(/\d+(\.\d+)?/g)))-parseInt($.trim(self.$cont.css("padding-bottom").match(/\d+(\.\d+)?/g)));
            },

            // 滑块可移动最大距离
            getMaxSliderPosition : function() {
                var self = this;
                return self.$bar.height() - self.$slider.height();
            },

            // 滚动文档内容
            scrollContTo : function(positionVal) {
                var self = this;
                self.$cont.scrollTop(positionVal);
            },

            //检测滚动条是否隐藏
            checkShowHide : function(){
                var self = this;
                if(Math.max(self.$cont.height(),self.$cont[0].scrollHeight) - self.$cont.height() -$.trim(self.$cont.css("padding-top").match(/\d+(\.\d+)?/g))-$.trim(self.$cont.css("padding-bottom").match(/\d+(\.\d+)?/g))==0){
                    console.log(Math.max(self.$cont.height(),self.$cont[0].scrollHeight) - self.$cont.height() -$.trim(self.$cont.css("padding-top").match(/\d+(\.\d+)?/g))-$.trim(self.$cont.css("padding-bottom").match(/\d+(\.\d+)?/g)))
                    self.$slider.hide();
                    self.$bar.hide();
                }
            },

            /**
            *重置滚动条
            */
            reInit : function(){
                var self = this;
                $('#hbScroll-wrap'+self.options.selfId).remove();
                self._init(self.options);
            }
        });

        Scroll.CusScrollBar = CusScrollBar;
    })(window,document,jQuery);

    var _scroll = new Scroll.CusScrollBar({
        parentSelector : parentSelectorA,//父容器 用于放置滚动条 必填
        contSelector   : contSelectorA,//".fignav",   // 滑动内容区选择器(必须)
        selfId: gid//唯一id，用于选择器 必填
    });

    return _scroll;
}
