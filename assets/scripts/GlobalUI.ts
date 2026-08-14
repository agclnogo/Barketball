import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;

@ccclass('GlobalUI')
export class GlobalUI extends Component {

    onRestartClick() {
        const sceneName = director.getScene().name;
        director.loadScene(sceneName);
    }

    onBackToMenuClick() {
        director.loadScene("LevelSelect");
    }
}