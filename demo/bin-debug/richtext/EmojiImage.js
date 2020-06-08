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
    var EmojiImage = (function (_super) {
        __extends(EmojiImage, _super);
        function EmojiImage() {
            var _this = _super.call(this) || this;
            var s = _this;
            s._img = new eui.Image();
            s.touchChildren = false;
            s.addChild(s._img);
            return _this;
        }
        EmojiImage.prototype.setRes = function (resId, async) {
            var s = this;
            if (!resId) {
                s._img.source = "";
                return;
            }
            var isNum = /^\d+$/.test(resId);
            if (isNum) {
                if (+resId < 10)
                    resId = "0" + resId;
                s._img.source = resId = "eomji_" + resId + "_png";
            }
            else {
                s._img.source = resId;
            }
            var res = RES.getRes(resId);
            if (res instanceof egret.Texture) {
                s._w = res.textureWidth; //默认宽高
                s._h = res.textureHeight;
                if (s._prop)
                    s.setProp(s._prop);
            }
            else {
                if (async != false)
                    RES.getResByUrl(resId, s.handleGetRes, s, RES.ResourceItem.TYPE_IMAGE);
                s._w = 46;
                s._h = 46;
                if (s._prop)
                    s.setProp(s._prop);
            }
        };
        EmojiImage.prototype.setProp = function (prop) {
            var s = this;
            var size = 20;
            if (s.richText) {
                size = s.richText.size;
            }
            for (var key in prop) {
                var value = prop[key];
                if (key == "align") {
                    if (value == "center") {
                        s._img.y = size / 2 - s.height / 2;
                    }
                    else if (value == "bottom") {
                        s._img.y = size - s.height;
                    }
                    else if (value == "top") {
                        s._img.y = 0;
                    }
                }
                else if (key == "width") {
                    s._w = value;
                }
                else if (key == "height") {
                    s._h = value;
                }
                else if (key == "x") {
                    s._img.x = +value;
                }
                else if (key == "y") {
                    s._img.y = +value;
                }
            }
            s._img.width = s._w;
            s._img.height = s._h;
        };
        EmojiImage.prototype.handleGetRes = function (e) {
            var s = this;
            s.setData(s._emojiId, s.richText, false);
            if (s.richText)
                s.richText.refush();
        };
        EmojiImage.prototype.reset = function () {
            _super.prototype.reset.call(this);
            var s = this;
            s._img.x = 0;
            s._img.y = 0;
            s._img.source = null;
        };
        EmojiImage.type = "img";
        return EmojiImage;
    }(cyj.EmojiBase));
    cyj.EmojiImage = EmojiImage;
    __reflect(EmojiImage.prototype, "cyj.EmojiImage");
    cyj.EmojiBase.registEmojiType(EmojiImage);
})(cyj || (cyj = {}));
//# sourceMappingURL=EmojiImage.js.map