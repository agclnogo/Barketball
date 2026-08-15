import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;

@ccclass('LevelSelectUI')
export class LevelSelectUI extends Component {

    onLevel1Click() { director.loadScene("Level1"); }
    onLevel2Click() { director.loadScene("Level2"); }
    onLevel3Click() { director.loadScene("Level3"); }
    onLevel4Click() { director.loadScene("Level4"); }
    onLevel5Click() { director.loadScene("Level5"); }
    onLevel6Click() { director.loadScene("Level6"); }
    onLevel7Click() { director.loadScene("Level7"); }
    onLevel8Click() { director.loadScene("Level8"); }
}