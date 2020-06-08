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
     * AutoCodeEui 生成的界面
     * euiPath:resource\skin\TestRichTextSkin.exml
     * made by cyj
     * create on 2020-6-8 11:11:48
    */
    var TestRichTextView = (function (_super) {
        __extends(TestRichTextView, _super);
        function TestRichTextView() {
            var _this = _super.call(this) || this;
            _this.skinName = 'TestRichTextSkin';
            return _this;
        }
        TestRichTextView.prototype.childrenCreated = function () {
            _super.prototype.childrenCreated.call(this);
            var s = this;
            s.lbl_content.text = "测试#20#文本聊天#1#asddd\n第二行#2#end\n第三行#5#\n";
            s.input.addEventListener(egret.TextEvent.CHANGE, s.handleInputChange, s);
        };
        TestRichTextView.prototype.handleInputChange = function (e) {
            var s = this;
            s.lbl_content.text = s.input.text;
        };
        return TestRichTextView;
    }(eui.Component));
    cyj.TestRichTextView = TestRichTextView;
    __reflect(TestRichTextView.prototype, "cyj.TestRichTextView");
})(cyj || (cyj = {}));
//# sourceMappingURL=TestRichTextView.js.map