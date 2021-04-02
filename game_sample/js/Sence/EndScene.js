var GameEnd =  Framework.Class(Framework.Level , {
    //初始化loadingProgress需要用到的圖片
    
    initializeProgressResource: function() {
        Framework.Game.isBackwardCompatiable = true;
    },
    //在initialize時會觸發的事件
    loadingProgress: function(ctx, requestInfo) {
        //console.log(Framework.ResourceManager.getFinishedRequestPercent())
        ctx.font ='90px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
    },
    load: function(){
        this.backgroundColor = new Framework.Sprite(define.imagePath + 'black.png');
        this.backgroundColor.position = {
            x: Framework.Game.getCanvasWidth() / 2, 
            y: Framework.Game.getCanvasHeight() / 2 
        }
       
        this.decortaionCastle = new Framework.Sprite(define.imageSpritesPath + 'BG.png');
        this.decortaionCastle.position = {
            x: Framework.Game.getCanvasHeight() / 2,
            y: Framework.Game.getCanvasWidth() / 2
        }
        this.button = new Framework.Sprite(define.imageSpritesPath+"/restart.png");
        this.button.scale = 0.5;
        this.button.position ={
            x: Framework.Game.getCanvasWidth() / 2, 
            y: Framework.Game.getCanvasHeight() / 2+100 
        } ;
        this.rootScene.attach(this.backgroundColor);
        if(Winner.mode == 0){
            this.flag = new Framework.Sprite(define.imageSpritesPath+"player"+Winner.val + "/Players.png");
            this.flag.position ={
                x: Framework.Game.getCanvasWidth() / 2, 
                y: Framework.Game.getCanvasHeight() / 2-200 
            } ;
            this.flag.scale = 0.5;
            this.rootScene.attach(this.flag);
        }
        this.rootScene.attach(this.button);
        //this.rootScene.attach(this.decortaionCastle);
        this._mouseSprite = new Framework.Sprite(define.imageSpritesPath+"cursor.png");
        this._mouseSprite.scale = 0.2;
        this._mouseSprite.rotation = -25;
    },
    update: function() {
        this.button.scale+=0.0000000001;
        if(this.button.scale>=0.50001){
            this.button.scale = 0.5;
        }
        if(this._mousePos!=null)
            this._mouseSprite.position =  {x:this._mousePos.x+25,y:this._mousePos.y+35};
    },
    draw: function(parentCtx) {
        this.rootScene.draw(parentCtx);
        this._mouseSprite.draw(parentCtx);
        if(Winner.mode ==1){
            parentCtx.font = '60pt Algerian';
            parentCtx.fillStyle = 'White';
            parentCtx.textAlign = "middle";
            parentCtx.fillText("Game Over!", Framework.Game.getCanvasWidth() / 2,300);
            parentCtx.font = '40pt Algerian';
            parentCtx.fillText("Point："+Winner.val, Framework.Game.getCanvasWidth() / 2,400);
        }
        //parentCtx.fillText('Player'+Winner+' Win!',Framework.Game.getCanvasWidth()/2,Framework.Game.getCanvasHeight()/2);
    },
    mousedown: function(e) {
        if(this.button.OnClick(e)){
            Framework.Game.goToLevel("Level0");
        }
    },
    mousemove: function(e) {
        this._mousePos = e;
        console.log(e);
    },
    touchstart: function(e) {
        this.mousedown({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
} ) 