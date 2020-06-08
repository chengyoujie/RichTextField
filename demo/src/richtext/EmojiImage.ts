namespace cyj {
    /**
     * made by cyj
     * 富文本表情
     * 支持属性[align:center|bottom|top; width:xxx, height:xxx ]资源id
     * create on 2019-10-25 17:42:58 
    */
    export class EmojiImage extends EmojiBase {
        
        protected _img:eui.Image;
        public static type:string = "img";

        constructor(){
            super();
            let s = this;
            s._img = new eui.Image();
            s.touchChildren = false;
            s.addChild(s._img);
        }

        protected setRes(resId:any, async?:boolean)
        {
            let s = this;
            if(!resId)
            {
                s._img.source = "";
                return;
            }
            let isNum = /^\d+$/.test(resId);
            if(isNum)
            {
                if(+resId<10)resId = "0"+resId;
                s._img.source = resId = "eomji_"+resId+"_png";
            }else{
                s._img.source = resId;
            }
            let res = RES.getRes(resId);
            if(res instanceof egret.Texture)
            {
                s._w = res.textureWidth;//默认宽高
                s._h = res.textureHeight;
                if(s._prop)
                    s.setProp(s._prop);
            }else{//处理未加载的图片
                if(async!=false)
                    RES.getResByUrl(resId, s.handleGetRes, s, RES.ResourceItem.TYPE_IMAGE);
                s._w = 46;
                s._h = 46;
                if(s._prop)
                    s.setProp(s._prop);
            }
        }

        protected setProp(prop:Object)
        {
            let s = this;
            let size = 20;
            if(s.richText)
            {
                size = s.richText.size;
            }
            for(var key in prop)
            {
                let value = prop[key];
                if(key == "align")
                {
                    if(value=="center")
                    {
                        s._img.y = size/2 - s.height/2;
                    }else if(value == "bottom"){
                        s._img.y = size - s.height;
                    }else if(value == "top"){
                        s._img.y = 0;
                    }
                }else if(key == "width")
                {
                    s._w = value;
                }else if(key == "height"){
                    s._h = value;
                }else if(key == "x"){
                    s._img.x = +value;
                }else if(key == "y"){
                    s._img.y = +value;
                }
            }
            s._img.width = s._w;
            s._img.height = s._h;
        }

         private handleGetRes(e: string)
        {
            let s = this;
            s.setData(s._emojiId, s.richText, false);
            if(s.richText)
                s.richText.refush();
        }

        public reset()
        {
            super.reset();
            let s = this;
            s._img.x = 0;
            s._img.y = 0;
            s._img.source = null;
        }

    }


    EmojiBase.registEmojiType(EmojiImage);
    
}