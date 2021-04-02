
let ActionManager = function (gameLoop) {
    this._start ;
    this._curr;
    this.load = function () {
        this._start = new StartState();
        this._curr = new StartState();
        this.gameLoop = gameLoop
        this._mapControl = gameLoop._gameMap;
        this._uiControl = gameLoop._gameUIs;
        this._curr.Start(this.gameLoop);
        this.playerTurn = this.gameLoop.playerTurn;
    }
    this.GameOver = function(){
        let over = false;
        let health1 = this.ChangeHart(0);
        let health2 = this.ChangeHart(1);
        if(this._curr.GetStateId() == 0){
            if(health1 <=0) {
                //alert("gameover! player2 win");
                over = true;
                return 2;
            }
            if(health2 <=0){
                //alert("gameover! player1 win");
                over = true;
                return 1;
            }
        }
        return 0;
    }
    this.GameOver2 = function(){
        let over = false;
        let health1 = this.ChangeHart(0);
        if(this._curr.GetStateId() == 0){
            if(health1 <=0) {
                //alert("gameover! player2 win");
                over = true;
                return 2;
            }
        }
        return 0;
    }
    this.update = function () {
        if(this._curr.audio==null){
            this._curr.audio = this.gameLoop.audio;
        }
        if (this._curr.Change()) {
            this._curr = this._curr.End();
            this._curr.Start(this.gameLoop);
            console.log(this._curr);
        }
        if (this.playerTurn != this.gameLoop.playerTurn) {
            this.playerTurn = this.gameLoop.playerTurn;
            if(this.playerTurn==0){
                this._uiControl.AddCoin(0,this._mapControl.CountHouse(0));
                this._uiControl.AddCoin(1,this._mapControl.CountHouse(1));
            }
            this._curr = new StartState();
            this._curr.Start(this.gameLoop);
        }
        this._curr.update();
    }
    this.ChangeHart = function(player){
        let hart = this._mapControl.SearchChess(player,5);
        let val = 0;
        if(hart!=null){
            val = hart.GetHealth();
        }
        this._uiControl.UpdateHart(player,val);
        return val;
    }
    this.OnClick = function (e) {
        if (this._curr != null)
            this._curr.OnClick(e);
    }
    this.OnHover = function(e){
        if (this._curr != null)
            this._curr.OnHover(e);
    }
    this.draw = function(ctx){
        if (this._curr != null)
            this._curr.draw(ctx);        
    }
    this.OnRightClickDown =  function(e){
        let _select = this._mapControl.SelectTile(e);
        this._mapControl.ChangeTilesImg(_select,1);
    }
    this.OnRightClickUp =  function(e){
        this._curr.Start(this.gameLoop);
    }
}
class ActionState {
    constructor(input) {
        this._input = input;
        this._output;
        this._next = ActionState;
        this._id = 0;
    }
    Start(gameLoop) {
        this._playerTurn = gameLoop.playerTurn;
        this._mapControl = gameLoop._gameMap;
        this._uiControl = gameLoop._gameUIs;
        this.audio = gameLoop.audio;
    }
    End() {
        return new this._next(this._output);
    }
    update(player){
        this._playerTurn = player;
    }
    Change() {
        return this._change;
    }
    update() {
    }
    OnHover(e){
    }
    draw(ctx){
    }
    GetStateId(){
        return this._id;
    }
}
class StartState extends ActionState {
    constructor() {
        super(null);
        this._target = null;
        this._change = false;
        this._id =0;
    }
    Start(gameLoop){
        super.Start(gameLoop);
        this._isplaying = false;
        this._mapControl.ResetTiles(1);
        this._uiControl.CloseMenu(0);
        this._uiControl.CloseMenu(1);
    }
    OnHover(e){
        let tile = this._mapControl.SelectTile(e);
        if(tile!=null&&!tile.IsEmpty()){
            let chess = tile.GetChess();
            if(chess.GetPlayerIndex()==this._playerTurn&&chess.IsMoveable()){
                if(this._target!=null&&this._target.GetChess()!=chess){
                    this._target.GetChess().OnHover(false);
                    this._isplaying = false;
                }
                //play sound
                if(!this._isplaying){
                    let str = "ch"+ (chess.GetPlayerIndex()+1)+chess.GetType();
                    this.audio.play({name:str,loop:false});
                    this._isplaying = true;
                }
                //
                chess.OnHover(true);
                this._target = tile;
            }
        }
        else if(this._target!=null&&!this._target.IsEmpty()){
            this._isplaying = false;
            this._target.GetChess().OnHover(false);
            this._target = null;
        }
    }
    OnClick(e) {
        let menu = this._uiControl.BuyChess(e, this._playerTurn);
        if (this._target!=null) {
            this._output = this._target;
            this._change = true;
            this._target.GetChess().OnHover(true);
            this._next = ChessMovement;
        }
        else if (menu != null) {
            this._output = menu;
            this._next = ChoiceType;
            this._uiControl.OpenMenu(this._playerTurn);
            this._change = true;
            this.audio.play({name:"pop",loop:false});
            console.log("select menu");
        }
        console.log("do nothing in start");
    }
}
class ChessMovement extends ActionState {
    constructor(input) {
        super(input);
        this._next = MovingAnim;
        this._id =1;
    }
    Start(gameLoop) {
        super.Start(gameLoop);
        this._select = this._input;
        this._select.GetChess().OnHover(true);
        this._mapControl.ChangeTilesImg(this._select,0);
        this._target =  this._select;
        this._chess = this._select.GetChess();
    }
    OnHover(e){
        let tile = this._mapControl.SelectTile(e);
        if (tile != null && (tile.IsEmpty() || this._select==tile) ) {
            let to = tile.GetIndex();
            let from = this._select.GetIndex();
            let range = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
            if ( tile.NowTileState()==1) {
                if(this._target!=null&&this._target!=tile)
                    this._target.ChangeHover(false);
                this._target = tile;
                this._target.ChangeHover(true);
            }
        }
        else if(this._target!=null){    
            this._target.ChangeHover(false);
            this._target = null;
        }
    }
    OnClick(e) {
            if(this._target!=null){
                let to = this._target.GetIndex();
                let from = this._select.GetIndex();
                let graph = new Graph(this._mapControl.OutputMap(this._playerTurn,from));
                let result = [graph.grid[from.y][from.x]];
                if(to!=from){
                    let gfrom = graph.grid[from.y][from.x];
                    let gto = graph.grid[to.y][to.x]; 
                    result = astar.search(graph,gfrom,gto);
                }
                //console.log(result);
                this._mapControl.MoveChess(from,result);
                this._chess.Move();
                this._output = this._target;
            }
        else {
            console.log("not moving");
            this._next = StartState;
        }
        this._change = true;
    }
}
class MovingAnim extends ActionState{
    constructor(input) {
        super(input);
        this._next = ChessAttack;
        this._id =5;
    }
    Start(gameLoop) {
        super.Start(gameLoop); 
        this._output = this._input;
        this.audio.play({name:"walking",loop:false});
    }
    update(){
        if(this._mapControl.IsMovingOver()){
            this._change = true;
        }
    }
}
class ChessAttack extends ActionState {
    constructor(input) {
        super(input);
        this._next = StartState;
        this._text = new Array();
        this._id =2;
    }
    Start(gameLoop) {
        super.Start(gameLoop);
        this._select = this._input;
        this._target = null;
        this._mapControl.ResetTiles(1);
        this._isPlaying = null
        this._isClick = false;
        this._gm = gameLoop;
        if(this._mapControl.CountEnimy(this._select)<=0){
            this._change = true;
        }
        else{
            this._mapControl.ChangeTilesImg(this._select,1);
        }
    }
    End() {
        return new this._next();
    }
    OnHover(e){
        if(!this._isClick){
            let tile = this._mapControl.SelectTile(e);
            if(tile!=null&&!tile.IsEmpty()&&tile.GetChess().GetType()!=6){
                let chess = tile.GetChess();
                let to = tile.GetIndex();
                this._chess = this._select.GetChess();
                let from = this._select.GetIndex();
                let range = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
                if (
                    this._chess.InAttackRange(range)
                    && range != 0
                    && tile.GetChess().GetPlayerIndex() != this._chess.GetPlayerIndex()) {
                    if(this._target!=null&&this._target.GetChess()!=chess)
                        this._target.GetChess().OnHover(false);
                    chess.OnHover(true);
                    this._target = tile;
                }
            }
            else if(this._target!=null&&!this._target.IsEmpty()){
                this._target.GetChess().OnHover(false);
                this._target = null;
            }
        }     
    }
    draw(ctx){
        if(this._text.length>0){
            let element = this._text[0];
            if(element.time==30&&!this._isPlaying){
                this.audio.play({name:"Hit",loop:false});
                this._isPlaying = true;
            }
            if(element.time<30){
                //ctx.globalAlpha=Math.max(0,1-(50-element.time)/50);
            }
            element.tile.GetChess().DrawDamageText(ctx,this._mapControl._GetWorldPos(element.tile.GetPostion()),element.val);
            if(element.time<=0){
                this._isPlaying = false;
                this._text.shift();
                if (element.tile.GetChess().GetHealth() <= 0) {
                    if(element.tile.GetChess().GetPlayerIndex()==1)
                        this._gm._point+=10;
                    this._mapControl.DeleChess(element.tile.GetIndex());
                    this.audio.play({name:"death",loop:false});
                }
            }
            if(this._text.length<=0)
                this._change = true;
            element.time--;
        }
    }
    OnClick(e) {
        if(!this._isClick){
            let tile = this._mapControl.SelectTile(e);
            if(this._target!=null){
                let to = tile.GetIndex();
                let from = this._select.GetIndex();
                let damage = this._chess.Attack(tile.GetChess());
                this._text.push({tile:tile ,val:damage,time:40});
                let range = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
                if (tile.GetChess().GetHealth() > 0 && range <= 1) {
                    let damage2 = this._chess.BeAttack(tile.GetChess());
                    this._text.push({tile:this._select,val:damage2,time:40});
                }
                this._isClick = true;
            }
            else {
                console.log("attack nothing");
                this._change = true;    
            }
            this._mapControl.ResetTiles(1);
        }
    }
}
class ChoiceType extends ActionState{
    constructor() {
        super(null);
        this._change = false;
        this._next = BuyState;
        this._id =3;
    }
    Start(gameLoop) {
        super.Start(gameLoop);
        this._target = null;
        let playerCoin = this._uiControl.SelectPlayer(this._playerTurn).coin.val;   
        this._mapControl.ChangeBuyTilesImg(this._playerTurn);
    }
    OnHover(e){
        let playerCoin = this._uiControl.SelectPlayer(this._playerTurn).coin.val;   
    }
    OnClick(e) {
        let tile = this._mapControl.SelectTile(e);
        let playerCoin = this._uiControl.SelectPlayer(this._playerTurn).coin.val;
        this._target = this._uiControl.OnSelectMenu(e,this._playerTurn);
        let datas = new ChessDatas();
        if (this._target!=null ) {
            if(playerCoin-datas.GetCost(this._target)>=0){
                this._output = this._target;
                this._next = BuyState;
                console.log("buy");
            }
            else{
                this._next = StartState;
                console.log("notthing buy");
            }
        }
        else {
            this._next = StartState;
            console.log("notthing buy");
        }
        this._change = true;
    }
    End(){
        this.audio.play({name:"pop",loop:false});
        this._uiControl.CloseMenu(this._playerTurn);
        return new this._next(this._output);
    }
}
class BuyState extends ActionState {
    constructor(input) {
        super(input);
        this._change = false;
        this._next = StartState;
        this._type = input;
        this._id =4;
    }
    Start(gameLoop) {
        super.Start(gameLoop);
        this._target = null;
        let playerCoin = this._uiControl.SelectPlayer(this._playerTurn).coin.val;   
        this._mapControl.ChangeBuyTilesImg(this._playerTurn);
    }
    OnHover(e){
        let tile = this._mapControl.SelectTile(e);
        let playerCoin = this._uiControl.SelectPlayer(this._playerTurn).coin.val;   
        if (tile != null && tile.IsEmpty()  && tile.PlayerTile(this._playerTurn,this._mapControl.GetSize())) {
            if(this._target!=null&&this._target!=tile)
                this._target.ChangeHover(false);
            this._target = tile;
            this._target.ChangeHover(true);
        }
        else if(this._target!=null){    
            this._target.ChangeHover(false);
            this._target = null;
        }
    }
    OnClick(e) {
        let tile = this._mapControl.SelectTile(e);
        let playerCoin = this._uiControl.SelectPlayer(this._playerTurn).coin.val;
        if (this._target!=null) {
            this.audio.play({name:"create",loop:false});
            let to = tile.GetIndex();
            this._mapControl.CreateChess(to, this._playerTurn, this._type);
            this._uiControl.UpdateCoin(this._playerTurn, playerCoin - tile.GetChess().GetCost());
            console.log("buy");
        }
        else {
            this.audio.play({name:"pop",loop:false});
            console.log("notthing create");
        }
        this._change = true;
    }
}