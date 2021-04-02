
let ChessDatas = function(){ //各種棋子的資料
    this.Knight = {
        step:2,//移動步數
        fight:{
            range: 1 ,//攻擊範圍
            val: { max: 4, min: 2 },//攻擊數值 亂數  ex 2~4 
            back: { max:2, min: 0 } //反擊數值 亂數  ex 0~2
            },
        health:10,//生命值
        cost:50,//價格
        view:2//視野(適用於單人模式)
    }
    this.Archer = {
        step:4,
        fight:{
            range: { max: 4, min: 2 } ,
            val: { max: 4, min: 1 }, 
            back: { max:1, min: 0 } 
            },
        health:5,
        cost:25,
        view:3
    }
    this.Bat = {
        step:4,
        fight:{
            range: 2 ,
            val: { max: 2, min: 1 }, 
            back: { max:1, min: 0 } 
            },
        health:3,
        cost:10,
        view:5
    }
    this.Village = {
        step:0,
        fight:{
            range: 0 ,
            val: { max: 0, min: 0 }, 
            back: { max:0, min: 0 } 
            },
        health:20,
        cost:50,
        view:3
    }
    this.King = {
        step:2,
        fight:{
            range: 4 ,
            val: { max: 2, min: 0 }, 
            back: { max:2, min: 0 } 
            },
        health:10   ,
        cost:1000,
        view:4
    }
    this.Tree = {
        step:0,
        fight:{
            range: 0 ,
            val: { max: 1, min: 0 }, 
            back: { max:0, min: 0 } 
            },
        health:1   ,
        cost:0,
        view:0
    }
    this.GetCost = function(type){
        switch (type) {
            case 1:
                return this.Knight.cost;
                break;
            case 2:
                return this.Archer.cost;
                break;
            case 3:
                return this.Bat.cost;
                break;
            case 4:
                return this.Village.cost;
                break;
            case 5:
                return this.King.cost;
                break;
            case 6:
                return this.Tree.cost;
                break;
            default:
                break;
        }
    }
}
class BaseChess {//棋子的base class
    constructor(playerIndex, type, realPos) {
        this.data = new ChessDatas();
        this._spriteScale = {max:0.4,min:0.24,mid:0.3,no:0.1};
        this._fightIconScale = {max:0.29,min:0.15,mid:0.1};
        this._setup(playerIndex, realPos);
        let data = this.data;
        this._step = data.step;
        this._view = data.view;
        this._fight = { range: data.fight.range, val: { max: data.fight.val.max, min: data.fight.val.min }, back: { max: data.fight.back.max, min: data.fight.back.min } };
        this._health = data.health;
        this._moveable = false;
        this._cost =data.cost;
        this._type = type;
        this._fightIcon =  new Framework.Sprite(define.imageSpritesPath + "/Sword.png");
        this._fightIcon.scale =  0.00001;
        this._fightIcon.position = realPos;
        this._activeFight = false;
    }
    update(){}
    InViewRange(view) {//是否在視野範圍
        return this._view == view+1 || this._view > view + 0.5;
    }
    GetView(){//視野
        return this._view;
    }
    GetFightIcon(){//受到攻擊的icon
        return this._fightIcon;
    }
    ActiveFight(){//顯示受攻擊之icon
        this._fightIcon.scale= this._fightIconScale.min;
        this._activeFight = true;
    }
    InActiveFight(){//取消顯示受攻擊之icon
        this._fightIcon.scale =  0.00001;
        this._activeFight = false;
    }
    _setup(playerIndex, realPos){//init
        
        this.data = this.data.Bat;
        let player = new Array("player1", "player2");
        this._player = playerIndex;
        this._sprite = new Framework.Sprite(define.imageSpritesPath + player[playerIndex] + "/BatHead.png");
        this._sprite.scale = this._spriteScale.min;
        this._sprite.position = realPos;
    }
    IsOnMouse(e){
        return this._sprite.OnClick(e);
    }
    OnHover(sw){//滑鼠hover事件
        if(sw){
            this._sprite.scale=this._spriteScale.max;
            if(this._activeFight) this._fightIcon.scale= this._fightIconScale.max;
        }
        else{
            this._sprite.scale=this._spriteScale.min;   
            if(this._activeFight) this._fightIcon.scale= this._fightIconScale.min;
        }
    }
    GetScene(){
        return this._scene;
    }
    TurnStart(player){//切換玩家
        if(this._player == player){
            this._moveable = true;
        }
        else{
            this._moveable = false;
        }
    }
    IsMoveable(){
        return this._moveable;
    }
    Move(){
        this._moveable = false;
    }
    Copy() {//copy constructer
        let newChess = new BaseChess(this._player, this._type, this._sprite.position);
        newChess._sprite.scale = this._sprite.scale;
        newChess._health = this._health;
        return newChess;
    }
    Draw(ctx) {
        this._sprite.draw(ctx);
    }
    DrawText(ctx,pos){
  
            ctx.font = '30pt Algerian';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";
            ctx.fillText(this._health, pos.x,pos.y+30);
            this._helthTime--;
    }
    DrawDamageText(ctx,pos,val){//顯示受攻擊的數值
        let icon = new Framework.Sprite(define.imageSpritesPath + (val==0?"missIcon.png":"damageIcon.png"));
        ctx.font = (val==0?"20":"30")+'pt Algerian';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center";
        icon.position = {x:pos.x,y:pos.y};
        icon.scale = 0.25;
        icon.draw(ctx);
        ctx.fillText((val==0?"Miss":val), pos.x-5,pos.y+25);
    }
    GetCost() {
        return this._cost;
    }
    GetWorldPostion() {
        return this._sprite.position;
    }
    GetSprite() {
        return this._sprite;
    }
    InWalkRange(step) {
        return this._step == step || this._step > step + 0.5;
    }
    GetPlayerIndex() {
        return this._player;
    }
    GetType() {
        return this._type;
    }
    InAttackRange(range) {//是否在攻擊範圍
        return this._fight.range == range || this._fight.range > range+0.5  ;
    }
    BeAttack(chess) {//反擊
        if (chess != null) {
            let damage = chess.FightBack();
            this.Damage(damage);
            if (this._health <= 0)
                this.Die();
            return damage;
        }
        return 0;
    }
    Attack(chess) {//攻擊
        if (chess != null) {
            let damage = this.Fight();
            chess.Damage(damage);
            if (this._health <= 0)
                this.Die();
            console.log(this._player + ":" + this._health);
            return damage;
        }
        return 0;
    }
    Fight() {
        return (Math.floor(Math.random() * (this._fight.val.max+1)) + this._fight.val.min);
    }
    FightBack() {
        return (Math.floor(Math.random() * (this._fight.back.max+1)) + this._fight.back.min);
    }
    Damage(val) {
        this._health = Math.max(this._health - val, 0);
    }
    Die(){}
    GetHealth() {
        return this._health;
    }
}
class Knight extends BaseChess{
    constructor(playerIndex, type, realPos) {
        super(playerIndex, type, realPos);
        this._type = type;
    }
    _setup(playerIndex, realPos){
  
        this.data = this.data.Knight;
        let player = new Array("player1", "player2");
        this._player = playerIndex;
        this._sprite = new Framework.Sprite(define.imageSpritesPath + player[playerIndex] + "/Knight.png");
        this._sprite.scale =this._spriteScale.min;
        this._sprite.position = realPos;
    }
    Copy() {
        let newChess = new Knight(this._player, this._type, this._sprite.position);
        newChess._sprite.scale = this._sprite.scale;
        newChess._health = this._health;
        return newChess;
    }
}
class Archer extends BaseChess{
    constructor(playerIndex, type, realPos) {
        super(playerIndex, type, realPos);
        this._type = type;
    }
    InAttackRange(range) {
        return (this._fight.range.max == range || this._fight.range.max > range+0.5)
              && this._fight.range.min < range  ;
    }
    _setup(playerIndex, realPos){
        this.data = this.data.Archer;
        let player = new Array("player1", "player2");
        this._player = playerIndex;
        this._sprite = new Framework.Sprite(define.imageSpritesPath + player[playerIndex] + "/Archer.png");
        this._sprite.scale =this._spriteScale.min;
        this._sprite.position = realPos;
    }
    Copy() {
        let newChess = new Archer(this._player, this._type, this._sprite.position);
        newChess._sprite.scale = this._sprite.scale;
        newChess._health = this._health;
        return newChess;
    }
}
class Village extends BaseChess{
    constructor(playerIndex, type, realPos) {
        super(playerIndex, type, realPos);
        this._spriteScale = {max:0.25,min:0.15};
        this._type = type;
    }
    _setup(playerIndex, realPos){
        this.data = this.data.Village;
        let player = new Array("player1", "player2");
        this._player = playerIndex;
        this._sprite = new Framework.Sprite(define.imageSpritesPath + player[playerIndex] + "/Village.png");
        this._sprite.scale =this._spriteScale.min;
        this._CoinSprite = new Framework.Sprite(define.imageSpritesPath  + "/coin.png");
        this._CoinSprite.scale = 0.00001;
        this._AddCoin = false;
        this.Scene = new Framework.Scene();
        this.Scene.position = realPos;
        this.Scene.attach(this._sprite);
        this.Scene.attach(this._CoinSprite);
        this.counter = 0;
    }
    Copy() {
        let newChess = new Village(this._player, this._type, this._sprite.position);
        newChess._sprite.scale = this._sprite.scale;
        newChess._health = this._health;
        return newChess;
    }
    IsMoveable(){
        return false;
    }
    GetSprite(){
        return this.Scene;
    }
    update(){
        this.drawCoinAnim();
    }
    drawCoinAnim(){
        if(this._AddCoin){
            this.counter++;
            if(this.counter<25){
                this._CoinSprite.position.y -= 3;
                if(this._CoinSprite.scale<=0.2) this._CoinSprite.scale += 0.02;
            }
            else if(this.counter>=30){
                this._CoinSprite.position.y += 3 ;
                if(this.counter>=40&&this._CoinSprite.scale>=0)this._CoinSprite.scale -= 0.03;
            }
            if(this.counter>=50){
                this._CoinSprite.scale = 0.0001;
                this._CoinSprite.position = this._sprite.position;
                this._AddCoin = false;
                this.counter = 0;
            }
        }
    }
    AddCoin(){
        this._AddCoin = true ;
    }
}
class Bat extends BaseChess{
    constructor(playerIndex, type, realPos) {
        super(playerIndex, type, realPos);
        this._type = type;
    }
    _setup(playerIndex, realPos){
        this.data = this.data.Bat;
        let player = new Array("player1", "player2");
        this._player = playerIndex;
        this._sprite = new Framework.Sprite(define.imageSpritesPath + player[playerIndex] + "/BatHead.png");
        this._sprite.scale =this._spriteScale.min;
        this._sprite.position = realPos;
    }
    Copy() {
        let newChess = new Bat(this._player, this._type, this._sprite.position);
        newChess._sprite.scale = this._sprite.scale;
        newChess._health = this._health;
        return newChess;
    }
}
class King extends BaseChess{
    constructor(playerIndex, type, realPos) {
        super(playerIndex, type, realPos);
        this._setup(playerIndex, realPos);
        this._type = type;
    }
    _setup(playerIndex, realPos){
        this.data = this.data.King;
        let player = new Array("player1", "player2");
        this._player = playerIndex;
        this._sprite = new Framework.Sprite(define.imageSpritesPath + player[playerIndex] + "/King.png");
        this._sprite.scale =this._spriteScale.min;
        this._sprite.position = realPos;
    }
    Copy() {
        let newChess = new King(this._player, this._type, this._sprite.position);
        newChess._sprite.scale = this._sprite.scale;
        newChess._health = this._health;
        return newChess;
    }
}
class Tree extends BaseChess{
    constructor(type, realPos) {
        let playerIndex = -1;
        super(playerIndex, type, realPos);
        this._fightIcon.scale =  0.00001;
        this._type = type;
    }
    _setup(playerIndex, realPos){
        this.data = this.data.Tree;
        this._player =playerIndex;
        this._sprite = new Framework.Sprite(define.imageSpritesPath + "/Tree2.png");
        this._sprite.scale =0.2;
        this._sprite.position = {x:realPos.x,y:realPos.y-30};
    }
    OnHover(sw){
    }
    DrawText(ctx,pos){
    }
    DrawDamageText(ctx,pos,val){
    }
    ActiveFight(){
        this._fightIcon.scale =  0.00001;
        this._activeFight = true;
    }
}