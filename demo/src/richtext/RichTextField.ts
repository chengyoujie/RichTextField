namespace cyj {

    /**
     * 富文本
     * made by cyj
     * create on 2019-10-24 16:17:4 
    */
    export class RichTextField extends eui.Label {
        public static EMOJI_REG = /#([\[:\]\w;]+)#/gi;
        public static EMOJI_BLOCK = String.fromCharCode(12288);
        public static LEFT_TAG_BLOCK = String.fromCharCode(391);//Ƈ
        public static RIGHT_TAG_BLOCK = String.fromCharCode(390);// Ɔ
        public static LEFT_TAG_REG = new RegExp(RichTextField.LEFT_TAG_BLOCK, "gi");
        public static RIGH_TAG_REG = new RegExp(RichTextField.RIGHT_TAG_BLOCK, "gi");
        // private _label:eui.Label;
        private _text:string;
        private _textFlow:Array<egret.ITextElement>;
        private _spriteContain:egret.Sprite;
        private _maskRect:egret.Rectangle;

        private _autoScale:boolean = true;
        private _useMask:boolean = true;

        private _htmlParse:egret.HtmlTextParser;
        
        /**
         * 图文混排
         * 和普通的eui.Label使用方法一样，重写text , textFlow 支持通过#imgId或img_name#的方式图文混排
         */
        constructor()
        {
            super();
            // egret.DisplayObjectContainer.call(this);
            this.init();
        }

        protected init(label?:eui.Label)
        {
            let s = this;
            s._htmlParse = new egret.HtmlTextParser();
            s.$children = [];//DisplayObjectContainer初始化 子对象列表
            s._spriteContain = new egret.Sprite();
            s._spriteContain.touchChildren = s._spriteContain.touchEnabled = false;//需设置不可点击，否则影响input时候的处理
            s.addChild(s._spriteContain);
            s._maskRect = new egret.Rectangle(0, 0, this.width, this.height)
        }

        public set text(msg:string)
        {
            let s= this;
            if(s.text == msg)return;
            s.$setText(msg);
        }
        $setText(msg:string): boolean
        {
            let s= this;
            while(s._spriteContain.numChildren>0)//放到回收池
            {
                let child = s._spriteContain.removeChildAt(0);
                if(child instanceof cyj.EmojiBase)
                {
                    cyj.EmojiBase.pushPool(child);
                }
            }
            s._text = msg;
            s._textFlow= undefined;
            if(!msg)
            {
                super.$setText("");
                return true;
            }
            let reg = RichTextField.EMOJI_REG;
            reg.lastIndex = 0;
            let arr = reg.exec(msg);
            if(!arr)
            {
                super.$setText(msg);
                return true;
            }
            msg = msg.replace(/</gi, RichTextField.LEFT_TAG_BLOCK)
            msg = msg.replace(/>/gi, RichTextField.RIGHT_TAG_BLOCK)
            let tempArr:Array<egret.ITextElement> = [];
            let index = 0;
            while(arr)
            {
            
                tempArr = tempArr.concat(s._htmlParse.parse(msg.substring(index, reg.lastIndex-arr[0].length)));
                index = reg.lastIndex;
                s.addEmoji(tempArr, arr[1], arr[0]);
                arr = reg.exec(msg);
            }
            tempArr = tempArr.concat(s._htmlParse.parse( msg.substr(index)));
            let tempFlow;
            for(let i=0; i<tempArr.length; i++)
            {
                tempFlow = tempArr[i];
                tempFlow.text = tempFlow.text.replace(RichTextField.LEFT_TAG_REG, "<").replace(RichTextField.RIGH_TAG_REG, ">");
            }
            s.$textFlow = tempArr;
            s._maskRect.width = s.width;
            s._maskRect.height = s.height;
            if(s._useMask)
            {
                s._spriteContain.mask = s._maskRect;    
            }
            return true;
        }

        public $onAddToStage(stage: egret.Stage, nestLevel: number): void {
            super.$onAddToStage(stage, nestLevel);
            //TextField 
            this["addEvent"]();

            if (this.$TextField[egret.sys.TextKeys.type] == egret.TextFieldType.INPUT) {
                this.inputUtils._addStageText();
            }
            //DisplayObjectContainer 
            let children = this.$children;
            let length = children.length;
            nestLevel++;
            for (let i = 0; i < length; i++) {
                let child: egret.DisplayObject = this.$children[i];
                child.$onAddToStage(stage, nestLevel);
                if (child.$maskedObject) {
                    child.$maskedObject.$updateRenderMode();
                }
            }

        }

         /**
         * @private
         *
         */
        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            //TextField
            this["removeEvent"]();

            if (this.$TextField[egret.sys.TextKeys.type] == egret.TextFieldType.INPUT) {
                this.inputUtils._removeStageText();
            }

            if (this["textNode"]) {
                this["textNode"].clean();
                if (egret.nativeRender) {
                    egret_native.NativeDisplayObject.disposeTextData(this);
                }
            }
            //DisplayObjectContainer
            let children = this.$children;
            let length = children.length;
            for (let i = 0; i < length; i++) {
                let child: egret.DisplayObject = children[i];
                child.$onRemoveFromStage();
            }

        }

        public set textFlow(textArr: Array<egret.ITextElement>)
        {
            let temp:string;
            let s = this;
            s._textFlow = textArr;
            s._text = undefined;
            while(s._spriteContain.numChildren>0)//放到回收池
            {
                let child = s._spriteContain.removeChildAt(0);
                if(child instanceof cyj.EmojiBase)
                {
                    cyj.EmojiBase.pushPool(child);
                }
            }
            let tempArr:Array<egret.ITextElement> = [];
            let emojieLineDic:{[line:number]:EmojiBase[]} = {};
            for(let i=0; i<textArr.length; i++)
            {
                temp = textArr[i].text;
                let reg = RichTextField.EMOJI_REG;
                reg.lastIndex = 0;
                let arr = reg.exec(temp);
                if(!arr)
                {
                    tempArr.push(textArr[i]);
                    continue;
                }
                let index = 0;
                let item:EmojiBase;
                while(arr)
                {
                    if(index != reg.lastIndex-arr[0].length)//如果push的text为空， egret的getTextArray2()会计算textHeight 错误（为2行的值）
                    {
                        tempArr.push({style:textArr[i].style, text:temp.substring(index, reg.lastIndex-arr[0].length)})
                    }
                    index = reg.lastIndex;
                    item = s.addEmoji(tempArr, arr[1], arr[0]);
                    if(!emojieLineDic[item.line])emojieLineDic[item.line] = [];
                    emojieLineDic[item.line].push(item);
                    arr = reg.exec(temp);
                }
                let endstr = temp.substr(index);
                if(endstr)
                {
                    tempArr.push({style:textArr[i].style, text:endstr})
                }
            }
            s.$textFlow = tempArr;
            let hAlign: number = egret.TextFieldUtils.$getHalign(this);
            let vAlign: number = egret.TextFieldUtils.$getValign(this);
            
            if(hAlign != 0 || vAlign != 0)//对于居中， 右对齐  垂直居中  等位置的处理 
            {
                let textHeight: number = egret.TextFieldUtils.$getTextHeight(this);
                let textFieldHeight: number = this.$TextField[egret.sys.TextKeys.textFieldHeight];
                let drawY = 0;
                 if (!isNaN(textFieldHeight) && textFieldHeight > textHeight) {
                    let vAlign: number = egret.TextFieldUtils.$getValign(this);
                    drawY += vAlign * (textFieldHeight - textHeight);
                }
                let maxWidth: number = !isNaN(this.$TextField[egret.sys.TextKeys.textFieldWidth]) ? this.$TextField[egret.sys.TextKeys.textFieldWidth] : this.$TextField[egret.sys.TextKeys.textWidth];
                let lines = s.$getLinesArr();
                for(let i=0; i<lines.length; i++)
                {
                    let line = lines[i];
                    // let h: number = line.height;
                    let drawX = Math.round((maxWidth - line.width) * hAlign);
                    let arr = emojieLineDic[i];
                    if(arr)
                    {
                        for(let m=0; m<arr.length; m++)
                        {
                            arr[m].x += drawX;
                            arr[m].y += drawY;
                        }
                    }
                }
                
            }
            s._maskRect.width = s.width;
            s._maskRect.height = s.height;
            if(s._useMask)
            {
                s._spriteContain.mask = s._maskRect;    
            }
        }

        private addEmoji(curText:Array<egret.ITextElement>, emoji:any, orginEmojiStr:string){
            let s = this;
            // if(!EmojiBase.canParse(emoji))
            // {
            //     curText.push({text:orginEmojiStr})
            //     return;
            // }
            let item = cyj.EmojiBase.getEmojiBase(emoji);
            item.setData(emoji, s);
            let w = item.width;
            let h = item.height;
            if(s._autoScale && s.height>0 && s.height<h)//如果图片高度大于文本高度进行缩放
            {
                let scale = s.height/h;
                h = s.height;
                item.scale = scale;
                w = scale*w;
            }
            s.$textFlow = curText;
            let lines = s.$getLinesArr();
            let line = lines[lines.length-1];
            if(line)
            {
                if(s.width-line.width<w)//剩余的宽度小于图片的宽度则换行显示
                {
                    curText.push({text:"\n"});
                }
            }
            if(w<=h)
            {
                curText.push({style:{size:w}, text:RichTextField.EMOJI_BLOCK})
            }else{
                let fontSize = w;
                while(fontSize>0)
                {
                    curText.push({style:{size:Math.min(fontSize, h)}, text:RichTextField.EMOJI_BLOCK})
                    fontSize -= h;
                }
            }
            s.$textFlow = curText;
            lines = s.$getLinesArr();
            line = lines[lines.length-1];
            item.line = lines.length-1;
            if(line)
            {
                item.x = line.width-w;
                item.y = s.getLineY();
            }else{
                item.x = 0;
                item.y = s.getLineY();
            }
            s._spriteContain.addChild(item);
            return item;
        }




        // $textFlow?:Array<egret.ITextElement>;

        /**是否根据文本高度自动缩放图片 */
        public set autoScale(value:boolean)
        {
            let s = this;
            s._autoScale = value;
            s.refush();
        }

        /**是否根据文本高度自动缩放图片 */
        public get autoScale():boolean
        {
            return this._autoScale;
        }

        /**是否将图片中超出宽高 的剪切掉 */
        public set useMask(value:boolean)
        {
            let s = this;
            s._useMask = value;
             if(s._useMask)
            {
                s._spriteContain.mask = s._maskRect;    
            }else{
                s._spriteContain.mask = null;
            }
        }
        /**是否将图片中超出宽高 的剪切掉 */
        public get useMask():boolean{
            return this._useMask;
        }

        public get text()
        {
            return this._text;
        }
 
        public refush()
        {
            let s = this;
            if(s._textFlow)
            {
                s.textFlow = s._textFlow;
            }else{
                s.$setText(s._text);
            }
        }

         $setWidth(value: number): boolean {
            let s = this;
            let bol = super.$setWidth(value);
            s.refush();
            return bol;
         }

         $setHeight(value: number): boolean {
            let s = this;
            let bol = super.$setHeight(value);
            s.refush();
            return bol;
         }

        /**获取当前文本的Y值 */
        private getLineY(){
            let s = this;
            let lines = s.$getLinesArr();
            if(!lines)return 0;
            let lineY = 0;
            let space = s.lineSpacing;
            let len = lines.length;
            for(let i=0; i<len-1; i++)
            {
                lineY += lines[i].height + space; 
            }
            return lineY;
        }
        
        addChild: (child: egret.DisplayObject) => egret.DisplayObject;

    } 

    export interface RichTextField{
        /**父类的富文本处理 */
         $textFlow:Array<egret.ITextElement>;
     }
    let prototype = RichTextField.prototype;
    let protoBase = egret.TextField.prototype;
    let value = Object.getOwnPropertyDescriptor(protoBase, "textFlow");
     Object.defineProperty(prototype, "$textFlow", value);
     
    eui.sys.mixin(RichTextField, egret.DisplayObjectContainer);
}