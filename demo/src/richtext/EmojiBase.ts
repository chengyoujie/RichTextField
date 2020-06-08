namespace cyj {
    /**
     * made by cyj
     * 富文本表情
     * 支持属性[align:center|bottom|top; width:xxx, height:xxx ]资源id
     * create on 2019-10-25 17:42:58 
    */
    export class EmojiBase  extends egret.Sprite {

        protected _w:number;
        protected _h:number;
        protected _emojiId:string;
        /**表情所在的行 */
        public line:number;
        // 属性正则
        public static PropReg = /\[([^\]]*?)\]/gi;
        /**保存当前所属的富文本引用 */
        protected richText:RichTextField;
        /**当前表情的属性 */
        protected _prop:{[key:string]:any};

        constructor(){
            super();
            let s = this;
            s.touchChildren = false;
        }


        public setData(emojiId:any, richText:RichTextField, async?:boolean)
        {
            let s = this;
            s.richText = richText;
            s._emojiId = emojiId;
            let resId = emojiId;
            EmojiBase.PropReg.lastIndex = 0;
            let props = EmojiBase.PropReg.exec(emojiId);
            let emojiProp;
            if(props)
            {
                resId = resId.replace(EmojiBase.PropReg, "");
                let parr = props[1].split(";");
                emojiProp = {};
                for(let i=0; i<parr.length; i++)
                {
                    if(!parr[i])continue;
                    let p = parr[i].split(":");
                    if(!p || p.length<2)continue;
                    emojiProp[p[0]] = p[1];
                }
                s._prop = emojiProp;
            }
            s.setRes(resId, async);
            s.setProp(s._prop);
        }

        /**设置资源   需要子类去实现 */
        protected setRes(resId:any, async?:boolean)
        {
        }

        /**设置属性   需要子类去实现 */
        protected setProp(prop:Object)
        {
            
        }

        public get emojiId()
        {
            return this._emojiId;
        }


       

        public get width(){
            return this._w;
        }
        public get height(){
            return this._h;
        }

        public reset(){
            let s = this;
            s.scale = 1;
            s._emojiId = null;
            s.richText = null;
            s._prop = null;
        }

        /**设置缩放值 */
        public set scale(value:number)
        {
            let s = this;
            s.scaleX = s.scaleY = value;
        }

        private static _poolSize:number = 80;
        private static _pool:{[type:string]:EmojiBase[]} = {};
        public static pushPool(emoji:EmojiBase)
        {
            if(emoji.parent)emoji.parent.removeChild(emoji);
            emoji.reset();
            let type = emoji["__proto__"].type;
            if(!EmojiBase._pool[type])
            {
                EmojiBase._pool[type] = [];
            }
            if(EmojiBase._pool[type].length<EmojiBase._poolSize)
                EmojiBase._pool[type].push(emoji);
        }
        public static getEmojiBase(emoji:string):EmojiBase
        {
            let type = EmojiBase.getEmojiType(emoji);
            if(EmojiBase._pool[type] && EmojiBase._pool[type].length>0)
            {
                return EmojiBase._pool[type].shift();
            }
            let cls = EmojiBase._type2Emoji[type];
            return new cls();
        }

        public static getEmojiType(emojiId:string)
        {
            emojiId = (emojiId+"").replace(this.PropReg, "")//现将属性去掉
            let dic = EmojiBase._type2Emoji;
            for(let key in dic)
            {
                if(emojiId.lastIndexOf(key)+key.length == emojiId.length)//判断最后的字符是否是对应的类型
                {
                    return key;
                }
            }
            return EmojiImage.type;//默认为图片
        }

        private static _type2Emoji:{[type:string]:{new():EmojiBase}} = {};
        public static registEmojiType(emoji:{new():EmojiBase, type:string})
        {
            let type = emoji.type;
            EmojiBase._type2Emoji[type] = emoji;
        }
    }
}