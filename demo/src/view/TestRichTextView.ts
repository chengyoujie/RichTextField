namespace cyj {
    /**
     * AutoCodeEui 生成的界面 
     * euiPath:resource\skin\TestRichTextSkin.exml 
     * made by cyj
     * create on 2020-6-8 11:11:48 
    */
    export class TestRichTextView extends eui.Component {

        constructor(){
            super();
            this.skinName = 'TestRichTextSkin';
        }

        childrenCreated()
        {
            super.childrenCreated();
            let s = this;
            s.lbl_content.text = "测试#20#文本聊天#1#asddd\n第二行#2#end\n第三行#5#\n"
            s.input.addEventListener(egret.TextEvent.CHANGE, s.handleInputChange, s);
        }

        private handleInputChange(e:egret.TextEvent)
        {
            let s = this;
            s.lbl_content.text = s.input.text;
        }

    }
}