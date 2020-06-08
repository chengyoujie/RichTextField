var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var cyj;
(function (cyj) {
    /**
     * 富文本
     * made by cyj
     * create on 2019-10-24 16:17:4
    */
    var RichTextField = (function (_super) {
        __extends(RichTextField, _super);
        /**
         * 图文混排
         * 和普通的eui.Label使用方法一样，重写text , textFlow 支持通过#imgId或img_name#的方式图文混排
         */
        function RichTextField() {
            var _this = _super.call(this) || this;
            _this._autoScale = true;
            _this._useMask = true;
            // egret.DisplayObjectContainer.call(this);
            _this.init();
            return _this;
        }
        RichTextField.prototype.init = function (label) {
            var s = this;
            s._htmlParse = new egret.HtmlTextParser();
            s.$children = []; //DisplayObjectContainer初始化 子对象列表
            s._spriteContain = new egret.Sprite();
            s._spriteContain.touchChildren = s._spriteContain.touchEnabled = false; //需设置不可点击，否则影响input时候的处理
            s.addChild(s._spriteContain);
            s._maskRect = new egret.Rectangle(0, 0, this.width, this.height);
        };
        Object.defineProperty(RichTextField.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (msg) {
                var s = this;
                if (s.text == msg)
                    return;
                s.$setText(msg);
            },
            enumerable: true,
            configurable: true
        });
        RichTextField.prototype.$setText = function (msg) {
            var s = this;
            while (s._spriteContain.numChildren > 0) {
                var child = s._spriteContain.removeChildAt(0);
                if (child instanceof cyj.EmojiBase) {
                    cyj.EmojiBase.pushPool(child);
                }
            }
            s._text = msg;
            s._textFlow = undefined;
            if (!msg) {
                _super.prototype.$setText.call(this, "");
                return true;
            }
            var reg = RichTextField.EMOJI_REG;
            reg.lastIndex = 0;
            var arr = reg.exec(msg);
            if (!arr) {
                _super.prototype.$setText.call(this, msg);
                return true;
            }
            msg = msg.replace(/</gi, RichTextField.LEFT_TAG_BLOCK);
            msg = msg.replace(/>/gi, RichTextField.RIGHT_TAG_BLOCK);
            var tempArr = [];
            var index = 0;
            while (arr) {
                tempArr = tempArr.concat(s._htmlParse.parse(msg.substring(index, reg.lastIndex - arr[0].length)));
                index = reg.lastIndex;
                s.addEmoji(tempArr, arr[1], arr[0]);
                arr = reg.exec(msg);
            }
            tempArr = tempArr.concat(s._htmlParse.parse(msg.substr(index)));
            var tempFlow;
            for (var i = 0; i < tempArr.length; i++) {
                tempFlow = tempArr[i];
                tempFlow.text = tempFlow.text.replace(RichTextField.LEFT_TAG_REG, "<").replace(RichTextField.RIGH_TAG_REG, ">");
            }
            s.$textFlow = tempArr;
            s._maskRect.width = s.width;
            s._maskRect.height = s.height;
            if (s._useMask) {
                s._spriteContain.mask = s._maskRect;
            }
            return true;
        };
        RichTextField.prototype.$onAddToStage = function (stage, nestLevel) {
            _super.prototype.$onAddToStage.call(this, stage, nestLevel);
            //TextField 
            this["addEvent"]();
            if (this.$TextField[24 /* type */] == egret.TextFieldType.INPUT) {
                this.inputUtils._addStageText();
            }
            //DisplayObjectContainer 
            var children = this.$children;
            var length = children.length;
            nestLevel++;
            for (var i = 0; i < length; i++) {
                var child = this.$children[i];
                child.$onAddToStage(stage, nestLevel);
                if (child.$maskedObject) {
                    child.$maskedObject.$updateRenderMode();
                }
            }
        };
        /**
        * @private
        *
        */
        RichTextField.prototype.$onRemoveFromStage = function () {
            _super.prototype.$onRemoveFromStage.call(this);
            //TextField
            this["removeEvent"]();
            if (this.$TextField[24 /* type */] == egret.TextFieldType.INPUT) {
                this.inputUtils._removeStageText();
            }
            if (this["textNode"]) {
                this["textNode"].clean();
                if (egret.nativeRender) {
                    egret_native.NativeDisplayObject.disposeTextData(this);
                }
            }
            //DisplayObjectContainer
            var children = this.$children;
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var child = children[i];
                child.$onRemoveFromStage();
            }
        };
        Object.defineProperty(RichTextField.prototype, "textFlow", {
            set: function (textArr) {
                var temp;
                var s = this;
                s._textFlow = textArr;
                s._text = undefined;
                while (s._spriteContain.numChildren > 0) {
                    var child = s._spriteContain.removeChildAt(0);
                    if (child instanceof cyj.EmojiBase) {
                        cyj.EmojiBase.pushPool(child);
                    }
                }
                var tempArr = [];
                var emojieLineDic = {};
                for (var i = 0; i < textArr.length; i++) {
                    temp = textArr[i].text;
                    var reg = RichTextField.EMOJI_REG;
                    reg.lastIndex = 0;
                    var arr = reg.exec(temp);
                    if (!arr) {
                        tempArr.push(textArr[i]);
                        continue;
                    }
                    var index = 0;
                    var item = void 0;
                    while (arr) {
                        if (index != reg.lastIndex - arr[0].length) {
                            tempArr.push({ style: textArr[i].style, text: temp.substring(index, reg.lastIndex - arr[0].length) });
                        }
                        index = reg.lastIndex;
                        item = s.addEmoji(tempArr, arr[1], arr[0]);
                        if (!emojieLineDic[item.line])
                            emojieLineDic[item.line] = [];
                        emojieLineDic[item.line].push(item);
                        arr = reg.exec(temp);
                    }
                    var endstr = temp.substr(index);
                    if (endstr) {
                        tempArr.push({ style: textArr[i].style, text: endstr });
                    }
                }
                s.$textFlow = tempArr;
                var hAlign = egret.TextFieldUtils.$getHalign(this);
                var vAlign = egret.TextFieldUtils.$getValign(this);
                if (hAlign != 0 || vAlign != 0) {
                    var textHeight = egret.TextFieldUtils.$getTextHeight(this);
                    var textFieldHeight = this.$TextField[4 /* textFieldHeight */];
                    var drawY = 0;
                    if (!isNaN(textFieldHeight) && textFieldHeight > textHeight) {
                        var vAlign_1 = egret.TextFieldUtils.$getValign(this);
                        drawY += vAlign_1 * (textFieldHeight - textHeight);
                    }
                    var maxWidth = !isNaN(this.$TextField[3 /* textFieldWidth */]) ? this.$TextField[3 /* textFieldWidth */] : this.$TextField[5 /* textWidth */];
                    var lines = s.$getLinesArr();
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];
                        // let h: number = line.height;
                        var drawX = Math.round((maxWidth - line.width) * hAlign);
                        var arr = emojieLineDic[i];
                        if (arr) {
                            for (var m = 0; m < arr.length; m++) {
                                arr[m].x += drawX;
                                arr[m].y += drawY;
                            }
                        }
                    }
                }
                s._maskRect.width = s.width;
                s._maskRect.height = s.height;
                if (s._useMask) {
                    s._spriteContain.mask = s._maskRect;
                }
            },
            enumerable: true,
            configurable: true
        });
        RichTextField.prototype.addEmoji = function (curText, emoji, orginEmojiStr) {
            var s = this;
            // if(!EmojiBase.canParse(emoji))
            // {
            //     curText.push({text:orginEmojiStr})
            //     return;
            // }
            var item = cyj.EmojiBase.getEmojiBase(emoji);
            item.setData(emoji, s);
            var w = item.width;
            var h = item.height;
            if (s._autoScale && s.height > 0 && s.height < h) {
                var scale = s.height / h;
                h = s.height;
                item.scale = scale;
                w = scale * w;
            }
            s.$textFlow = curText;
            var lines = s.$getLinesArr();
            var line = lines[lines.length - 1];
            if (line) {
                if (s.width - line.width < w) {
                    curText.push({ text: "\n" });
                }
            }
            if (w <= h) {
                curText.push({ style: { size: w }, text: RichTextField.EMOJI_BLOCK });
            }
            else {
                var fontSize = w;
                while (fontSize > 0) {
                    curText.push({ style: { size: Math.min(fontSize, h) }, text: RichTextField.EMOJI_BLOCK });
                    fontSize -= h;
                }
            }
            s.$textFlow = curText;
            lines = s.$getLinesArr();
            line = lines[lines.length - 1];
            item.line = lines.length - 1;
            if (line) {
                item.x = line.width - w;
                item.y = s.getLineY();
            }
            else {
                item.x = 0;
                item.y = s.getLineY();
            }
            s._spriteContain.addChild(item);
            return item;
        };
        Object.defineProperty(RichTextField.prototype, "autoScale", {
            /**是否根据文本高度自动缩放图片 */
            get: function () {
                return this._autoScale;
            },
            // $textFlow?:Array<egret.ITextElement>;
            /**是否根据文本高度自动缩放图片 */
            set: function (value) {
                var s = this;
                s._autoScale = value;
                s.refush();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RichTextField.prototype, "useMask", {
            /**是否将图片中超出宽高 的剪切掉 */
            get: function () {
                return this._useMask;
            },
            /**是否将图片中超出宽高 的剪切掉 */
            set: function (value) {
                var s = this;
                s._useMask = value;
                if (s._useMask) {
                    s._spriteContain.mask = s._maskRect;
                }
                else {
                    s._spriteContain.mask = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        RichTextField.prototype.refush = function () {
            var s = this;
            if (s._textFlow) {
                s.textFlow = s._textFlow;
            }
            else {
                s.$setText(s._text);
            }
        };
        RichTextField.prototype.$setWidth = function (value) {
            var s = this;
            var bol = _super.prototype.$setWidth.call(this, value);
            s.refush();
            return bol;
        };
        RichTextField.prototype.$setHeight = function (value) {
            var s = this;
            var bol = _super.prototype.$setHeight.call(this, value);
            s.refush();
            return bol;
        };
        /**获取当前文本的Y值 */
        RichTextField.prototype.getLineY = function () {
            var s = this;
            var lines = s.$getLinesArr();
            if (!lines)
                return 0;
            var lineY = 0;
            var space = s.lineSpacing;
            var len = lines.length;
            for (var i = 0; i < len - 1; i++) {
                lineY += lines[i].height + space;
            }
            return lineY;
        };
        RichTextField.EMOJI_REG = /#([\[:\]\w;]+)#/gi;
        RichTextField.EMOJI_BLOCK = String.fromCharCode(12288);
        RichTextField.LEFT_TAG_BLOCK = String.fromCharCode(391); //Ƈ
        RichTextField.RIGHT_TAG_BLOCK = String.fromCharCode(390); // Ɔ
        RichTextField.LEFT_TAG_REG = new RegExp(RichTextField.LEFT_TAG_BLOCK, "gi");
        RichTextField.RIGH_TAG_REG = new RegExp(RichTextField.RIGHT_TAG_BLOCK, "gi");
        return RichTextField;
    }(eui.Label));
    cyj.RichTextField = RichTextField;
    __reflect(RichTextField.prototype, "cyj.RichTextField");
    var prototype = RichTextField.prototype;
    var protoBase = egret.TextField.prototype;
    var value = Object.getOwnPropertyDescriptor(protoBase, "textFlow");
    Object.defineProperty(prototype, "$textFlow", value);
    eui.sys.mixin(RichTextField, egret.DisplayObjectContainer);
})(cyj || (cyj = {}));
//# sourceMappingURL=RichTextField.js.map