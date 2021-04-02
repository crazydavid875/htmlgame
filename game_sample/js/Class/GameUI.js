
var UICanvas= function(){
    this.chessDatas = new ChessDatas();
    var canvas = this;
    this._scene = new Framework.Scene();
    this._textScene = new Framework.Scene();
    this._textScene2 = new Framework.Scene();
    this._playerTurn = 0;
    this._playerInfo  = {
        first:{
            index:0,
            coin:{pos:{x:0,y:0},val:50},
            hart:{pos:{x:0,y:0},val:10},
            scene: new Framework.Scene(),
            uis:null
        },
        second:{
            index:1 ,
            coin:{pos:{x:0,y:0},val:50},
            hart:{pos:{x:0,y:0},val:10},
            scene: new Framework.Scene(),
            uis: null
        }
    };
    this.coinIncrease = 10;
    this.title =new Array(2) ;
//framework
    
    this.load = function(){
        this._scene.id = "UICanvas";
        this._textScene.parent = this;
        this.titlepos = { x: Framework.Game.getCanvasWidth() / 2, y: 140 };
        this._DrawPlayer("player1",{x:110,y:140},this._playerInfo.first,1);
        this._DrawPlayer("player2", {x:Framework.Game.getCanvasWidth()-120,y:140},this._playerInfo.second,-1);
        this._scene.attach(this._playerInfo.first.scene);
        this._scene.attach(this._playerInfo.second.scene);
        this.UpateTurn(0);
        this._ismenuOpen = false;
        this._scene.attach(this._textScene);
    }
    this.load2 = function(){
        this._scene.id = "UICanvas";
        this._textScene2.parent = this;
        this.titlepos = { x: Framework.Game.getCanvasWidth() / 2, y: 140 };
        this._DrawPlayer("player1",{x:110,y:140},this._playerInfo.first,1);
        this._DrawPlayer("player2", {x:Framework.Game.getCanvasWidth()-120,y:140},this._playerInfo.second,-1);
        this._scene.attach(this._playerInfo.first.scene);
        this.UpateTurn(0);
        this._ismenuOpen = false;
        this._scene.attach(this._textScene2);
    }
    this.initialize = function(){
    }
    this.update = function(){
        this._playerInfo.first.uis.flag.GetSprite().scale -=0.0000000001;
        this._scene.update();
    }
    this.BuyChess = function(e,playerIndex){
        if (this.SelectPlayer(playerIndex).uis.button.OnClick(e)){
            return this.SelectPlayer(playerIndex).uis.button;
        }
        else {
            return null;
        }
    }
//public
    
    this.GetScene = function () {
        return this._scene;
    }
    this.UpdateCoin = function (playerIndex, val) {
        var player = this.SelectPlayer(playerIndex)
        player.coin.val = val;
    }
    this.AddCoin = function (playerIndex, val) {
        var player = this.SelectPlayer(playerIndex)
        player.coin.val += val*this.coinIncrease;
    }
    this.UpdateHart = function (playerIndex, val) {
        var player = this.SelectPlayer(playerIndex)
        player.hart.val = val;
    }
    //  0= redplayer,1= blueplayer
    this.UpateTurn = function (playerIndex) {
        this.SelectPlayer(0).uis.title.GetSprite().scale = 0.0000001;
        this.SelectPlayer(1).uis.title.GetSprite().scale = 0.0000001;
        this._playerTurn = playerIndex;
        this.SelectPlayer(playerIndex).uis.title.GetSprite().scale = 0.4;
    }
    this.OpenMenu = function(playerIndex){
        this.SelectPlayer(playerIndex).uis.menu.scale = 1;
        this._ismenuOpen = true;
    }
    this.CloseMenu = function(playerIndex){
        this.SelectPlayer(playerIndex).uis.menu.scale = 0.0001;
        this._ismenuOpen = false;
    }
    this.OnSelectMenu = function(e,playerIndex){
        let target = null;
        this.SelectPlayer(playerIndex).uis.Selecter.forEach(function(element,index) {
            if(element.GetSprite().OnClick(e)){
                target =  index+1;
            }
        });
        return target;
    }
//private
    
    this.SelectPlayer = function (index) {
        if (index == 0) return canvas._playerInfo.first;
        else if (index == 1) return canvas._playerInfo.second;
        else return null;
    }
    this._DrawTexts = function(ctx,player){
        ctx.font = '30pt Algerian';
        ctx.fillStyle = 'black';
        ctx.textAlign = "start";
        ctx.fillText(player.coin.val, player.coin.pos.x + 50, player.coin.pos.y + 10);
        ctx.fillText(player.hart.val, player.hart.pos.x + 50, player.hart.pos.y + 10);
    }
    this.DrawCost = function(ctx,player){
        if(this._ismenuOpen&&player.index==this._playerTurn){
            ctx.font = '20pt Algerian';
            ctx.fillStyle = 'white';
            ctx.textAlign = "start";
            let data = this.chessDatas;
            player.uis.Selecter.forEach(function(element,index)  {
                ctx.fillText(data.GetCost(index+1).toString()+'$', element.pos.x+50,element.pos.y+11);
            });
        }
    }
    this._DrawPlayer = function(folder,pos,player,side){
        var title = new GameUI(folder + "/Players.png", this.titlepos, 0.4);
        var flag = new GameUI(folder+"/Flag.png",{x:0,y:0},0.37);
        var coin = new GameUI("coin.png",{x:-40,y:200},0.3);
        var hart = new GameUI("hart.png",{x:-40,y:300},0.3);
        var button = new GameUI(folder+"/button.png",{x:0,y:450},0.3);
        var menu =  new Framework.Scene();
        var menuUI = new GameUI(folder+"/menu.png",{x:side*60,y:550},0.5);
        var selectUI = [new GameUI(folder+"/s1.png",{x:side*60,y:470},0.44),
                        new GameUI(folder+"/s2.png",{x:side*60,y:530},0.44),
                        new GameUI(folder+"/s3.png",{x:side*60,y:590},0.44),
                        new GameUI(folder+"/s4.png",{x:side*60,y:660},0.44)];
        player.scene.position = pos;
        let scence = this._scene;
        menu.attach( menuUI.GetSprite());
        selectUI.forEach(function(element,index){
            element.pos = {x:element.GetPostion().x+pos.x+scence.position.x,y:element.GetPostion().y+pos.y+scence.position.y};
            menu.attach(element.GetSprite());
        });
        menu.scale = 0.0001;
        this._scene.attach(title.GetSprite());
        player.scene.attach(flag.GetSprite());
        player.scene.attach(coin.GetSprite());
        player.scene.attach(hart.GetSprite());
        player.scene.attach(button.GetSprite());
        player.scene.attach(menu);
        player.coin.pos.x = coin.GetPostion().x+pos.x+this._scene.position.x;
        player.coin.pos.y = coin.GetPostion().y+pos.y+this._scene.position.y;
        player.hart.pos.x = hart.GetPostion().x+pos.x+this._scene.position.x;
        player.hart.pos.y = hart.GetPostion().y+pos.y+this._scene.position.y;
        player.uis = {title:title, flag: flag, coin: coin, hart: hart, button: button, menu: menu,Selecter:selectUI ,selection: selectUI};
    }   
//override
    this._textScene.draw = function (ctx) {
        var _UICanvas = this.parent;
        var player = _UICanvas._playerInfo.first;
        _UICanvas._DrawTexts(ctx, player);
        _UICanvas.DrawCost(ctx, player);
        player = _UICanvas._playerInfo.second;
        _UICanvas._DrawTexts(ctx, player);
        _UICanvas.DrawCost(ctx, player);
    }
    this._textScene2.draw = function (ctx) {
        var _UICanvas = this.parent;
        var player = _UICanvas._playerInfo.first;
        _UICanvas._DrawTexts(ctx, player);
        _UICanvas.DrawCost(ctx, player);
    }
}
class GameUI {
    constructor(src, pos, scale) {
        this._sprite = new Framework.Sprite(define.imageSpritesPath + src);
        this._position = pos;
        this._sprite.position = this._position;
        this._sprite.scale = scale;
    }
    //public
    OnClick(e) {
        return this._sprite.OnClick(e);
    }
    GetPostion() {
        return this._position;
    }
    GetSprite() {
        return this._sprite;
    }
}