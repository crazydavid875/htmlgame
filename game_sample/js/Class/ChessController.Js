class AiController{
    constructor(gameLoop,aiTurn){
        this._loop = gameLoop;
        this._action = gameLoop._actManager;
        this._aiTurn = aiTurn;
        this._map = gameLoop._gameMap.GetTiles();
        this._Gmap = gameLoop._gameMap;
        this.chessArr= new Array();
        this.actArr = new Array();
        this.timer = 0;
        this.delay = 8;
        this.UpdateChess();
        this.EnterTurn = false;
        this.level = 0;
    }
    GetLevel(){
        return this.level;
    }
    Actions(){
        let aiController = this;
        let i = 0;
        let max = 20;
        let betarget = Array();
        this.chessArr.forEach(function(Ai,index){
            if(Ai.chess.IsMoveable()&&i<max){
                let min = 1000;
                let target = null;
                if(Ai.target==null){
                    aiController.enemyArr.forEach(enemy=>{
                        if( aiController._Step(enemy.pos,Ai.pos)<min) {
                            min = aiController._Step(enemy.pos,Ai.pos);
                            Ai.target = enemy;
                        }
                    });
                }
                if(Ai.target!=null){
                    betarget.push( Ai.target);
                    target = Ai.target;
                    if(Ai.chess.InAttackRange(aiController._Step(target.pos,Ai.pos))){
                        aiController.Moveto(index,Ai.pos);
                        i++;
                    }
                    else{
                        let from = Ai.pos;
                        let to = target.pos;
                        let output = aiController._Gmap.OutputMap(aiController._aiTurn,from);
                        output[to.y][to.x]=1;
                        let graph = new Graph(output);
                        let result = [graph.grid[from.y][from.x]];
                        if(to!=from){
                            let gfrom = graph.grid[from.y][from.x];
                            let gto = graph.grid[to.y][to.x]; 
                            result = astar.search(graph,gfrom,gto);
                            result.pop();
                            let i = result.length-1;
                            while(i>0&&!Ai.chess.InWalkRange(aiController._Step({x:result[i].y,y:result[i].x},Ai.pos))){
                                result.pop();
                                i--;
                            }
                            while(i>0&&!aiController._map[result[i].x][result[i].y].IsEmpty()){
                                result.pop();
                                i--;
                            }
                            let last = result.pop();
                            if(last!=null){
                                aiController.Moveto(index,{x:last.y,y:last.x});
                                i++;
                            }
                        }
                    }
                }
            }
        });
    }
    Update(){
        if(this._loop.playerTurn==this._aiTurn){
            this.UpdateChess();
            if(!this.EnterTurn){
                this.EnterTurn = true;
                this.Actions();
                if(this.level%5==4||this.level==0)this.RndBuy();
                this.level++;
            }
            if(this._action._curr.GetStateId()!=5){
                this.timer--;
                if(this.timer<=0&&this.actArr.length>0){
                    let ele = this.actArr[0];
                    if(ele.act==0){
                        this._action._curr.OnHover(ele.val);
                    }
                    else if(ele.act==1){
                        this._action._curr.OnClick(ele.val);
                    }
                    else if(ele.act==2){
                        this.Buy(ele.val.type,ele.val.pos);
                    }
                    this.actArr.shift();
                    this.timer =this.delay; 
                }
            }
            if(this.actArr.length<=0&&this._action._curr.GetStateId()==0){
                //
                this.ChangeTurn();
            }
        }
    }
    UpdateChess(){
        let arr1 = new Array();
        let arr2 = new Array();
        let turn = this._aiTurn;
        this._map.forEach(row => {
            row.forEach(element => { 
                if(!element.IsEmpty()){
                    if(element.GetChess().GetPlayerIndex()==turn){
                        let result = {chess:element.GetChess(),pos:element.GetIndex()};
                        arr1.push(result);
                    }
                    else if(element.GetChess().GetPlayerIndex()!=-1){
                        let result = {chess:element.GetChess(),pos:element.GetIndex()};
                        arr2.push(result);
                    }
                }
            });
        });  
        this.chessArr = arr1;
        this.enemyArr = arr2;
    }
    IsTurn(){
        return this._loop.playerTurn;
    }
    Moveto(index,pos){
        let chess = this.chessArr[index].chess;
        let Cpos = this.chessArr[index].pos;
        if(this._action._curr.GetStateId()==0){
            if((this._map[pos.y][pos.x].IsEmpty()&&chess.InWalkRange(this._Step(Cpos,pos)))||this._Step(Cpos,pos)==0){
                this.actArr.push( 
                    {act:0,val:this._Gmap._GetWorldPos(this._map[Cpos.y][Cpos.x].GetPostion())},
                    {act:1,val:this._Gmap._GetWorldPos(this._map[Cpos.y][Cpos.x].GetPostion())},
                    {act:0,val:this._Gmap._GetWorldPos(this._map[pos.y][pos.x].GetPostion())},
                    {act:1,val:this._Gmap._GetWorldPos(this._map[pos.y][pos.x].GetPostion())}
                );
                this.Attack(index,pos);
            }
        }
    }
    _Step(pos1,pos2){
        return Math.sqrt(Math.pow(pos1.x-pos2.x,2)+Math.pow(pos1.y-pos2.y,2));
    }
    RndBuy(){
        let rnd = 0;
        let count = 3+this.level;
        let pos = {x:0,y:0};
        let i=0;
        let width = this._Gmap._tileSize.width/2;
        let height = this._Gmap._tileSize.height;
        while(i<count){
            rnd = Math.floor(Math.random()*3+1);
            pos = {x:Math.floor(Math.random()*width+width),y:Math.floor(Math.random()*height)};
            if(this.Buy(rnd,pos)){
                i++;
            }
            console.log(rnd);
        }
    }
    Buy(type,pos){
        if(this._action._curr.GetStateId()==0){
            if(this._map[pos.y][pos.x].IsEmpty()){
                this._Gmap.CreateChess(pos, this._aiTurn, type);
                //this._loop._gameUIs.UpdateCoin(this._aiTurn, this._loop._gameUIs.SelectPlayer(this._aiTurn).coin.val - this._map[pos.y][pos.x].GetChess().GetCost());
                console.log("buy");
                return true;
            }
        }
        return false;
    }
    Attack(index,pos){
        let chess = this.chessArr[index].chess;
        let Cpos = pos;
        let target = 0;
        this.enemyArr.forEach(ele=>{
            let pos = ele.pos;
            if(chess.InAttackRange(this._Step(Cpos,pos))&&target==0){
                this.actArr.push( 
                    {act:0,val:this._Gmap._GetWorldPos(this._map[pos.y][pos.x].GetPostion())},
                    {act:1,val:this._Gmap._GetWorldPos(this._map[pos.y][pos.x].GetPostion())},
                )
            }
        });
        if(target==0){
            this.actArr.push({act:1,val:{x:1,y:1}});
        }        
    }
    ChangeTurn(){
        this._loop.playerTurn = this._aiTurn==0?1:0 ;
        this._loop.audio.play({name:'Change',loop:false});
        this._loop._gameUIs.UpateTurn(this._loop.playerTurn );
        this._loop._gameMap.ChangeTurn(this._loop.playerTurn);
        this.EnterTurn = false;
    }
    SelectChess(index){
        return this.actArr[index];//pos
    }
    GetMoney(){
    }
    GetMap(){
        //0空 123456 player1  -1-2-3-4-5-6 player2  10樹  [width][height]
    }
}