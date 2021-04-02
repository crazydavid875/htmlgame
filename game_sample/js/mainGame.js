//當有要加關卡時, 可以使用addNewLevel
//第一個被加進來的Level就是啟動點, 所以一開始遊戲就進入MyMenu
//Framework.Game.addNewLevel({menu: new MyMenu()});
//Framework.Game.fps = 60;

Framework.Game.isBackwardCompatiable = true;
Framework.Game.addNewLevel({Level0: new GameStart()});
Framework.Game.addNewLevel({Level1: new GameLoop()});
Framework.Game.addNewLevel({end: new GameEnd()});
Framework.Game.addNewLevel({Level2: new GameLoop2()});



//讓Game開始運行
Framework.Game.start();
