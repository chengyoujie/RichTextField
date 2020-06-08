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
     * made by cyj
     * 富文本表情
     * 支持属性[align:center|bottom|top; width:xxx, height:xxx ]资源id
     * create on 2019-10-25 17:42:58
    */
    var EmojiBase = (function (_super) {
        __extends(EmojiBase, _super);
        function EmojiBase() {
            var _this = _super.call(this) || this;
            var s = _this;
            s.touchChildren = false;
            return _this;
        }
        EmojiBase.prototype.setData = function (emojiId, richText, async) {
            var s = this;
            s.richText = richText;
            s._emojiId = emojiId;
            var resId = emojiId;
            EmojiBase.PropReg.lastIndex = 0;
            var props = EmojiBase.PropReg.exec(emojiId);
            var emojiProp;
            if (props) {
                resId = resId.replace(EmojiBase.PropReg, "");
                var parr = props[1].split(";");
                emojiProp = {};
                for (var i = 0; i < parr.length; i++) {
                    if (!parr[i])
                        continue;
                    var p = parr[i].split(":");
                    if (!p || p.length < 2)
                        continue;
                    emojiProp[p[0]] = p[1];
                }
                s._prop = emojiProp;
            }
            s.setRes(resId, async);
            s.setProp(s._prop);
        };
        /**设置资源   需要子类去实现 */
        EmojiBase.prototype.setRes = function (resId, async) {
        };
        /**设置属性   需要子类去实现 */
        EmojiBase.prototype.setProp = function (prop) {
        };
        Object.defineProperty(EmojiBase.prototype, "emojiId", {
            get: function () {
                return this._emojiId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EmojiBase.prototype, "width", {
            get: function () {
                return this._w;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EmojiBase.prototype, "height", {
            get: function () {
                return this._h;
            },
            enumerable: true,
            configurable: true
        });
        EmojiBase.prototype.reset = function () {
            var s = this;
            s.scale = 1;
            s._emojiId = null;
            s.richText = null;
            s._prop = null;
        };
        Object.defineProperty(EmojiBase.prototype, "scale", {
            /**设置缩放值 */
            set: function (value) {
                var s = this;
                s.scaleX = s.scaleY = value;
            },
            enumerable: true,
            configurable: true
        });
        EmojiBase.pushPool = function (emoji) {
            if (emoji.parent)
                emoji.parent.removeChild(emoji);
            emoji.reset();
            var type = emoji["__proto__"].type;
            if (!EmojiBase._pool[type]) {
                EmojiBase._pool[type] = [];
            }
            if (EmojiBase._pool[type].length < EmojiBase._poolSize)
                EmojiBase._pool[type].push(emoji);
        };
        EmojiBase.getEmojiBase = function (emoji) {
            var type = EmojiBase.getEmojiType(emoji);
            if (EmojiBase._pool[type] && EmojiBase._pool[type].length > 0) {
                return EmojiBase._pool[type].shift();
            }
            var cls = EmojiBase._type2Emoji[type];
            return new cls();
        };
        EmojiBase.getEmojiType = function (emojiId) {
            emojiId = (emojiId + "").replace(this.PropReg, ""); //现将属性去掉
            var dic = EmojiBase._type2Emoji;
            for (var key in dic) {
                if (emojiId.lastIndexOf(key) + key.length == emojiId.length) {
                    return key;
                }
            }
            return cyj.EmojiImage.type; //默认为图片
        };
        EmojiBase.registEmojiType = function (emoji) {
            var type = emoji.type;
            EmojiBase._type2Emoji[type] = emoji;
        };
        // 属性正则
        EmojiBase.PropReg = /\[([^\]]*?)\]/gi;
        EmojiBase._poolSize = 80;
        EmojiBase._pool = {};
        EmojiBase._type2Emoji = {};
        return EmojiBase;
    }(egret.Sprite));
    cyj.EmojiBase = EmojiBase;
    __reflect(EmojiBase.prototype, "cyj.EmojiBase");
})(cyj || (cyj = {}));
//# sourceMappingURL=EmojiBase.js.map