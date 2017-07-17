var hbScroll = function(contSelectorA,barSelectorA,sliderSelectorA){//这个方法要用JQ
    var Scroll = {};
    (function(win,doc,$){
        function CusScrollBar(options){
            //初始化
            this._init(options);
        }

        $.extend(CusScrollBar.prototype,{
            _init : function(options){
                var self = this;
                self.options = {
                    contSelector: "",   // 滑动内容区选择器
                    barSelector: "",    // 滑动条选择器
                    sliderSelector: "", // 滑动块选择器
                    wheelStep: 20       // 滚动步幅
                };

                $.extend(true,self.options,options || {});

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
             * 初始化DOM引用
             * @method _initDomEvent
             */
            _initDomEvent : function(){
                var opts = this.options;

                // 滑动内容区对象，必须填
                this.$cont = $(opts.contSelector);
                // 滑动条滑块对象，必须填
                this.$slider = $(opts.sliderSelector);
                // 滑动条对象
                this.$bar = opts.barSelector ? $(opts.barSelector) : this.$slider.parent();
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
                    self.$slider.hide();
                    self.$bar.hide();
                }
            }
        });

        Scroll.CusScrollBar = CusScrollBar;
    })(window,document,jQuery);

    var _scroll = new Scroll.CusScrollBar({
        contSelector   : contSelectorA,//".fignav",   // 滑动内容区选择器(必须)
        barSelector    : barSelectorA,//".sildenav",    // 滑动条选择器（必须）
        sliderSelector : sliderSelectorA//".scroll-slider" // 滑动快选择器
    });

    return _scroll;
}
