var GameLoop =  Framework.Class(Framework.Level , {
    initializeProgressResource: function() {
    },
    loadingProgress: function(ctx, requestInfo) {
        Framework.Game.isBackwardCompatiable = false;
    },
    load: function(){
        this._point=0;
        this._gameMap = new GameMap();
        this._gameUIs = new UICanvas();
        this._actManager = new ActionManager(this);
        this.playerTurn = 0;
        this._gameMap.load();
        this._gameUIs.load();
        this._actManager.load();
        this._mouseSprite = new Framework.Sprite(define.imageSpritesPath+"cursor.png");
        this._mouseSprite.scale = 0.2;
        this._mouseSprite.rotation = -25;
        this.root = new Framework.Scene();
        this.root.attach(this._gameMap.GetMapScene());
        this._gameUIs.GetScene();
        this.rootScene.attach(this.root);
        this.rootScene.attach( this._gameUIs.GetScene());
        this.ainmSw = false;
        this.animTimer = 0;
        this.anim = function(){
            this.ainmSw = true;
        }
        this.isPlayed = false;
        this.rootScene.attach(this._mouseSprite);
        this.audio = new Framework.Audio({
            bgmusic: {
                mp3: define.musicPath + 'bg.mp3',
            },
            Hit:{
                mp3: define.musicPath + "kick2.mp3",
            },
            Change:{
                wav: define.musicPath + "Sun.wav",
            },
            death:{
                wav: define.musicPath + "death1.wav",
            },
            pop:{
                wav: define.musicPath + "pop.wav",
            },
            create:{
                wav: define.musicPath + "Barrack.wav",
            }
            ,
            walking:{
                mp3: define.musicPath + "walking.mp3",
            }
            ,
            negative:{
                wav: define.musicPath + "negative.wav",
            },ch12 :{
                wav:define.musicPath + "player1/" + "Archer.wav",
            },
            ch13 :{
                wav:define.musicPath + "player1/" + "Dragon.wav",
            },
            ch15:{
                wav:define.musicPath + "player1/" + "King.wav",
            },
            ch11 :{
                wav:define.musicPath + "player1/" + "Knight.wav",
            },ch22 :{
                wav:define.musicPath + "player2/" + "Archer.wav",
            },
            ch23 :{
                wav:define.musicPath + "player2/" + "Dragon.wav",
            },
            ch25 :{
                wav:define.musicPath + "player2/" + "King.wav",
            },
            ch21 :{
                wav:define.musicPath + "player2/" + "Knight.wav",
            },
        });
        //播放時, 需要給name, 其餘參數可參考W3C
        this.audio.play({name: 'bgmusic', loop: true});
    },
    initialize: function() {
        this._gameMap.initialize();
        this._gameUIs.initialize();
        this._gameUIs.UpateTurn(this.playerTurn);
        this._gameMap.ChangeTurn(this.playerTurn);
    },
    update: function() {
        this.rootScene.update();
        this._gameUIs.update();
        this._gameMap.update();
        this._actManager.update();
        if(this._actManager.GameOver()){
            Winner.mode = 0;
            Winner.val = this._actManager.GameOver();
            Framework.Game.goToLevel("end");
       }
       if(this.ainmSw){
           let scene = this._gameUIs.GetScene();
            if(this.animTimer==0){
                scene.position = {x:scene.position.x-50,y:scene.position.y-50};
                scene.scale = 1.05;
                scene.rotation = 0.05;
            }
            this.animTimer++;
            if(this.animTimer>=10){
                scene.position = {x:0,y:0};
                scene.scale = 1;
                this.animTimer = 0;
                scene.rotation = 0;
                this.ainmSw = false;
            }
        }
    },
    draw:function(parentCtx){
       // this._gameUIs.draw(parentCtx);
        this.rootScene.draw(parentCtx);
        if(this._mousePos!=null)
            this._gameMap.DrawHealth(parentCtx,this._mousePos);
        this._actManager.draw(parentCtx);
        parentCtx.canvas.style.cursor =  "none";
        //this._mouseSprite.draw(parentCtx);
    },
    keydown:function(e, list){
        if(e.key == "Space"){
            //this.anim();     
            if (this.playerTurn == 1){
                this.playerTurn = 0;
            }
            else{
                this.playerTurn = 1;
            }
            this.audio.play({name:'Change',loop:false});
            this._gameUIs.UpateTurn(this.playerTurn );
            this._gameMap.ChangeTurn(this.playerTurn);
        }
        if(e.key === 'F11') {
            if(!this.isFullScreen) {
                Framework.Game.fullScreen();
                this.isFullScreen = true;
            } else {
                Framework.Game.exitFullScreen();
                this.isFullScreen = false;
            }
        }
    },
    mousemove: function(e) {
        this._actManager.OnHover(e);
        this._mousePos =e;
        this._mouseSprite.position =  {x:e.x+25,y:e.y+35};
    },
    mousedown: function(e) {
        //console.log為Browser提供的function, 可以在debugger的console內看到被印出的訊息         
        let event = window.event;
        if (event.which==1) {
            console.log(e.x, e.y);
            this._actManager.OnClick(e);
        }  
        if (event.which==3) {
            this._actManager.OnRightClickDown(e);
        } 
    },
    mouseup: function(e){
        let event = window.event;
        if (event.which==3) {
            this._actManager.OnRightClickUp(e);
        }
    },
    touchstart: function (e) {
        //為了要讓Mouse和Touch都有一樣的事件
        //又要減少Duplicated code, 故在Touch事件被觸發時, 去Trigger Mouse事件
        this.mousedown({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    },
}
)

let Winner = {mode:1,val:0};