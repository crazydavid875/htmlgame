class Fectory{
    constructor(){}
    CreateChess(player,type,pos){
        switch(type){
            case 1:
                return new Knight(player,type,pos);
                break;
            case 2:
                return new Archer(player,type,pos);
                break;
            case 4:
                return new Village(player,type,pos);
                break;
            case 3:
                return new Bat(player,type,pos);
                break;
            case 5:
                return new King(player,type,pos);
                break;
            case 6:
                return new Tree(type,pos);
                break;
        }
    }
}