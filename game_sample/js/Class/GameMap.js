let GameMap = function () {
    this._size = { x: 0, y: 0 };
    this._offset = { x: 0, y: 100 };
    this._pos = { x: Framework.Game.getCanvasWidth() / 2, y: Framework.Game.getCanvasHeight() / 2 };
    this._offsetPerTile = { x: 68, y: 68 };
    this._tileSize = { height: 8, width: 17 };
    this._tiles = Array.from(Array(this._tileSize.height), () => new Array(this._tileSize.width));
    this._mapScene = new Framework.Scene();
    this._mapScene.id = "gameMap";
    this._drawHelthArr = new Array();
    this.fectory = new Fectory();
    this.MovingData = { isMoving: false, counter: 0, from: null, result: null, target: null, curr: null };
    this.Mask = Array.from(Array(this._tileSize.height), () => new Array(this._tileSize.width));
    this.MaskScene = new Framework.Scene();
    //framework
    this.load = function () {
        this._LoadImgs();
        this._CreateAllTiles();
        this._SetScenesPos();
        this.CreateChess({ x: 0, y: 0 }, 0, 5);
        this.CreateChess({ x: 16, y: 7 }, 1, 5);
        this.CreateChess({ x: 1, y: 1 }, 0, 4);
        this.CreateChess({ x: 15, y: 6 }, 1, 4);
        this.CreateTrees(20);
    }
    this.load2 = function () {
        this._LoadImgs();
        this._CreateAllTiles();
        this._SetScenesPos();
        this.CreateChess({ x: 0, y: 0 }, 0, 5);
        this.CreateChess({ x: 1, y: 1 }, 0, 4);
        this.CreateTrees(20);
        this.SetMask();
    }
    this.GetMaskScene = function () {
        return this.MaskScene;
    }
    this.SetMask = function () {
        this._tiles.forEach(row => {
            row.forEach(element => {
                let sp = new Framework.Sprite(define.imageSpritesPath + "/Cloud.png");
                let epos = element.GetPostion();
                let val = 1;
                sp.position = this._GetWorldPos(epos);
                sp.scale = 0.15;
                this.MaskScene.attach(sp);
                if ((!element.IsEmpty() && element.GetChess().GetPlayerIndex() == 0)) {
                    val = 0;
                }
                this.Mask[element.GetIndex().y][element.GetIndex().x] = { sp: sp, val: val };
            });
        });
    }
    this.DrawMask = function () {
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (this.Mask[element.GetIndex().y][element.GetIndex().x].val == 1) {
                    this.Mask[element.GetIndex().y][element.GetIndex().x].sp.scale = 0.25;
                }
                else {
                    this.Mask[element.GetIndex().y][element.GetIndex().x].sp.scale = 0.00001;
                }
            });
        });
    }
    this.SetView = function () {
        this._tiles.forEach(row => {
            row.forEach(element => {
                this.Mask[element.GetIndex().y][element.GetIndex().x].val = 1;
            });
        });
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (!element.IsEmpty() && element.GetChess().GetPlayerIndex() == 0) {
                    let chess = element.GetChess();
                    let view = chess.GetView();
                    for (let i = -view; i < view; i++) {
                        for (let j = -view; j < view; j++) {
                            let from = element.GetIndex();
                            let to = { x: element.GetIndex().x + j, y: element.GetIndex().y + i };
                            if (to.x >= 0 && to.y >= 0 && to.x < this._tileSize.width && to.y < this._tileSize.height) {
                                let range = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
                                if (chess.InViewRange(range)) {
                                    this.Mask[to.y][to.x].val = 0;
                                }
                            }
                        }
                    }
                }
            });
        });
    }
    this.ChangeMask = function (pos, val) {
        this.Mask[pos.y][pos.x] = val;
    }
    this.CreateTrees = function (amount) {
        let i = 0;
        while (i < amount) {
            let x = Math.floor(Math.random() * this._tileSize.width);
            let y = Math.floor(Math.random() * this._tileSize.height);
            while (!this._tiles[y][x].IsEmpty() || (y + 1 < this._tileSize.height && !this._tiles[y + 1][x].IsEmpty()) || (y - 1 >= 0 && !this._tiles[y - 1][x].IsEmpty())) {
                x = Math.floor(Math.random() * this._tileSize.width);
                y = Math.floor(Math.random() * this._tileSize.height);
            };
            this.CreateChess({ x: x, y: y }, -1, 6);
            i++;
        }
    }
    this.initialize = function () {
    }
    this.update = function () {
        this.updateChess();
        this.MovingAnim();
    }
    this.update2 = function () {
        this.updateChess();
        this.MovingAnim();
        this.SetView();
        this.DrawMask();
    }
    this.updateChess = function () {
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (!element.IsEmpty()) {
                    element.GetChess().update();
                }
            });
        });
    }
    this.isWalkable = function (pos) {
        return this._tiles[pos.x][pos.y].IsEmpty();
    }
    this.ChangeTilesImg = function (tile, mode) {
        let player = tile.GetChess().GetPlayerIndex();
        let graph = new Graph(this.OutputMap(player, tile.GetIndex()));
        let map = this._tiles;
        this._tiles.forEach(row => {
            row.forEach(element => {
                let from = tile.GetIndex();
                let to = element.GetIndex();
                let range = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
                let isinRange = false;
                if (!tile.IsEmpty() && ((!element.IsEmpty() && element.GetChess().GetType() != 6) || (element.IsEmpty()))) {
                    if (mode == 0) {
                        let gfrom = graph.grid[from.y][from.x];
                        let gto = graph.grid[to.y][to.x];
                        let result = astar.search(graph, gfrom, gto);
                        let inroad = true;
                        if (result.length == 0) isinRange = false;
                        else {
                            result.forEach(ele => {
                                let range2 = Math.sqrt(Math.pow(from.x - ele.y, 2) + Math.pow(from.y - ele.x, 2))
                                let tileOnRoad = map[ele.x][ele.y];
                                if (!tile.GetChess().InWalkRange(range2)) inroad = false;
                            });
                            isinRange = tile.GetChess().InWalkRange(range) && inroad;
                        }
                    }
                    if (mode == 1) isinRange = tile.GetChess().InAttackRange(range);
                    if (isinRange)
                        element.ChangeToDark();
                    else
                        element.ChangeToLight();
                }
                else
                    element.ChangeToLight();
            });
        });
    }
    this.ChangeBuyTilesImg = function (player) {
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (element.PlayerTile(player, this._tileSize))
                    element.ChangeToDark();
                else
                    element.ChangeToLight();
            });
        });
    }
    this.SearchChess = function (player, chessType) {
        let result = null;
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (!element.IsEmpty()) {
                    let curr = element.GetChess();
                    if (curr.GetPlayerIndex() == player) {
                        if (curr.GetType() == chessType) {
                            result = curr;
                        }
                    }
                }
            });
        });
        return result;
    }
    this.CountHouse = function (player) {
        let count = 0;
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (!element.IsEmpty() && element.GetChess().GetPlayerIndex() == player)
                    if (element.GetChess().GetType() == 4) {
                        element.GetChess().AddCoin();
                        count++;
                    }
            });
        });
        return count;
    }
    this.DrawHealth = function (ctx, e) {
        let tile = this.SelectTile(e);
        if (tile != null && !tile.IsEmpty()) {
            if (this._drawHelthArr.find(element => element == tile) == undefined)
                this._drawHelthArr.push({ tile: tile, time: 10 });
        }
        let draw = this;
        this._drawHelthArr.forEach(function (ele, index) {
            if (!ele.tile.IsEmpty()) {
                ctx.textAlign = "center";
                ele.tile.GetChess().DrawText(ctx, draw._GetWorldPos(ele.tile.GetPostion()));
                ele.time--;
                if (ele.time <= 0)
                    draw._drawHelthArr.shift();
            }
        });
    }
    this.OutputMap = function (player, pos) {
        let outputArr = new Array();
        let width = this._tileSize.width;
        this._tiles.forEach(function (row, j) {
            let list = new Array();
            row.forEach(function (ele, i) {
                let attr = 1;
                if ((!ele.IsEmpty() && ele.GetChess().GetPlayerIndex() != player)) {
                    attr = 0;
                }
                list.push(attr);
            });
            outputArr.push(list);
        });
        outputArr[pos.y][pos.x] = 0;
        return outputArr;
    }
    this.InputMap = function (data) {
    }
    this.SelectTile = function (e) {
        let target = null;
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (element.OnClick(e)) {
                    target = element;
                }
            });
        });
        return target;
    }
    this.CountEnimy = function (chessTile) {
        let count = 0;
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (!element.IsEmpty() && element.GetChess().GetPlayerIndex() != chessTile.GetChess().GetPlayerIndex()) {
                    let range = Math.sqrt(Math.pow(chessTile.GetIndex().x - element.GetIndex().x, 2) + Math.pow(chessTile.GetIndex().y - element.GetIndex().y, 2));
                    if (chessTile.GetChess().InAttackRange(range)) {
                        element.GetChess().ActiveFight();
                        count++;
                    }
                }
            });
        });
        return count;
    }
    this.ResetTiles = function (mode) {
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (!element.IsEmpty() && mode == 1) {
                    element.GetChess().OnHover(false);
                    element.GetChess().InActiveFight();
                }
                if (mode == 2)
                    element.ChangeToDark();
                else
                    element.ChangeToLight();
                element.ChangeHover(false);
            });
        });
    }
    this.GetSize = function () {
        return this._tileSize;
    }
    this.GetMapScene = function () {
        return this._mapScene;
    }
    this.MoveChess = function (from, result) {
        if (!this._tiles[from.y][from.x].IsEmpty()) {
            let chess = this._tiles[from.y][from.x].GetChess();
            this.MovingData.from = this._tiles[from.y][from.x];
            this.MovingData.path = result;
            this.MovingData.target = chess;
            this.MovingData.isMoving = true;
            this.MovingData.curr = this._tiles[result[0].x][result[0].y];
        }
    }
    this.MovingAnim = function () {
        if (this.MovingData.isMoving) {
            let xoffset = this.MovingData.target.GetSprite().position.x - this.MovingData.curr.GetScene().position.x;
            let yoffset = this.MovingData.target.GetSprite().position.y - this.MovingData.curr.GetScene().position.y;
            if (Math.abs(xoffset) > 10) this.MovingData.target.GetSprite().position.x += -20 * Math.abs(xoffset) / xoffset;
            else if (Math.abs(yoffset) > 10) this.MovingData.target.GetSprite().position.y += -20 * Math.abs(yoffset) / yoffset;
            else if (this.MovingData.path.length > 0) {
                let result = this.MovingData.path;
                if (this.MovingData.path.length >= 2) this.MovingData.curr = this._tiles[result[1].x][result[1].y];
                this.MovingData.path.shift();
            }
            else {
                this.MovingData.isMoving = false;
            }
        }
    }
    this.IsMovingOver = function () {
        if (!this.MovingData.isMoving) {
            this.DeleChess(this.MovingData.from.GetIndex());
            this.PutChess(this.MovingData.curr.GetIndex(), this.MovingData.target);
            return true;
        }
        else {
            return false;
        }
    }
    this.CreateChess = function (pos, player, type) {
        let realPos = this._tiles[pos.y][pos.x].GetPostion();
        let chess = this.fectory.CreateChess(player, type, realPos);
        this._tiles[pos.y][pos.x].PutChess(chess);
        this._mapScene.attach(chess.GetSprite());
        this._mapScene.attach(chess.GetFightIcon());
        return chess;
    }
    this.PutChess = function (pos, oldChess) {
        let realPos = this._tiles[pos.y][pos.x].GetPostion();
        let chess = oldChess.Copy();
        chess.GetSprite().position = realPos;
        this._tiles[pos.y][pos.x].PutChess(chess);
        this._mapScene.attach(chess.GetSprite());
        this._mapScene.attach(chess.GetFightIcon());
    }
    this.DeleChess = function (pos) {
        if (!this._tiles[pos.y][pos.x].IsEmpty()) {
            this._mapScene.detach(this._tiles[pos.y][pos.x].GetChess().GetSprite());
            this._mapScene.detach(this._tiles[pos.y][pos.x].GetChess().GetFightIcon());
            this._tiles[pos.y][pos.x].DeleChess();
        }
    }
    this.ChangeTurn = function (player) {
        this._tiles.forEach(row => {
            row.forEach(element => {
                if (!element.IsEmpty())
                    element.GetChess().TurnStart(player);
            });
        });
    }
    //private
    this._LoadImgs = function () {
        let tmp = [new Framework.Sprite(define.imageSpritesPath + "player1" + "/BatHead.png"),
        new Framework.Sprite(define.imageSpritesPath + "player2" + "/BatHead.png"),
        new Framework.Sprite(define.imageSpritesPath + "player1" + "/Knight.png"),
        new Framework.Sprite(define.imageSpritesPath + "player2" + "/Knight.png"),
        new Framework.Sprite(define.imageSpritesPath + "player1" + "/Archer.png"),
        new Framework.Sprite(define.imageSpritesPath + "player2" + "/Archer.png"),
        new Framework.Sprite(define.imageSpritesPath + "player1" + "/Village.png"),
        new Framework.Sprite(define.imageSpritesPath + "player2" + "/Village.png"),
        new Framework.Sprite(define.imageSpritesPath + "player1" + "/King.png"),
        new Framework.Sprite(define.imageSpritesPath + "player2" + "/King.png"),
        new Framework.Sprite(define.imageSpritesPath + "/Sword.png"),
        new Framework.Sprite(define.imageSpritesPath + "/Tree2.png"),
        new Framework.Sprite(define.imageSpritesPath + "damageIcon.png"),
        new Framework.Sprite(define.imageSpritesPath + "missIcon.png"),
        new Framework.Sprite(define.imageSpritesPath + "/Cloud.png"),
        ];
    }
    this._CreateAllTiles = function () {
        let thisPos = { x: 0, y: 0 };
        for (let m = 0; m < this._tileSize.height; m++) {
            thisPos.x = 0;
            for (let n = 0; n < this._tileSize.width; n++) {
                this._tiles[m][n] = new Tile({ x: thisPos.x, y: thisPos.y }, { x: n, y: m });

                this._mapScene.attach(this._tiles[m][n].GetScene());
                thisPos.x += this._offsetPerTile.x
            }
            thisPos.y += this._offsetPerTile.y
        }
        this._size.x = thisPos.x - this._offsetPerTile.x;
        this._size.y = thisPos.y - this._offsetPerTile.y;
    }
    this._SetScenesPos = function () {
        this._mapScene.position = this._GetWorldPos(this._mapScene.position);
    }
    this._GetWorldPos = function (pos) {
        return {
            x: pos.x + this._pos.x - (this._size.x / 2) + this._offset.x,
            y: pos.y + this._pos.y - (this._size.y / 2) + this._offset.y
        };
    }
    this._WorldToMap = function (pos) {
        return {
            x: pos.x - this._mapScene.position.x,
            y: pos.y - this._mapScene.position.y
        };
    }
    this.GetTiles = function () {
        return this._tiles;
    }
}
class Tile {
    constructor(pos, index) {
        this._positionToMap = pos;
        this._index = index;
        this._sprite = new Framework.Sprite(define.imageSpritesPath + "Tile.png");
        this._darksprite = new Framework.Sprite(define.imageSpritesPath + "Tile_dark.png");
        this._square = new Framework.Sprite(define.imageSpritesPath + "SquareTile.png");
        this._nowsprite = this._sprite;
        this._scale = 0.1;
        this._sprite.scale = this._scale;
        this._square.scale = 0.0001;
        this._darksprite.scale = 0.0001;
        this._chess = null;
        this._scene = new Framework.Scene();
        this._scene.attach(this._sprite);
        this._scene.attach(this._darksprite);
        this._scene.attach(this._square);
        this._scene.position = pos;
    }
    PlayerTile(player, size) {
        if (player == 0) {
            return this._index.x < 6 && this._index.y < 8;
        }
        else {
            return this._index.x >= size.width - 6 && this._index.y >= size.height - 8;
        }
    }
    ChangeHover(sw) {
        if (sw) {
            this._square.scale = this._scale;
        }
        else {
            this._square.scale = 0.0001;
        }
    }
    ChangeToDark() {
        this._nowsprite = this._darksprite;
        this._sprite.scale = 0.00001;
        this._darksprite.scale = this._scale;
    }
    ChangeToLight() {
        this._nowsprite = this._sprite;
        this._sprite.scale = this._scale;
        this._darksprite.scale = 0.0001;
    }
    NowTileState() {
        return this._nowsprite == this._sprite ? 0 : 1;
    }
    //public
    OnHover(e) {
        if (!this.IsEmpty()) {
            this._chess.OnHover(false);
            return this._chess.IsOnMouse(e);
        }
        return false;
    }
    IsEmpty() {
        return this._chess == null;
    }
    PutChess(chess) {
        if (this.IsEmpty()) {
            this._chess = chess;
            return true;
        }
        return false;
    }
    GetChess() {
        if (!this.IsEmpty()) {
            return this._chess;
        }
    }
    DeleChess() {
        delete this._chess;
        this._chess = null;
    }
    GetScene() {
        return this._scene;
    }
    GetPostion() {
        return this._positionToMap;
    }
    OnClick(e) {
        return this._nowsprite.OnClick(e);
    }
    GetIndex() {
        return this._index;
    }
}
