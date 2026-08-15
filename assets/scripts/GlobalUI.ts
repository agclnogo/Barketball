import { _decorator, Component, director, Node } from 'cc';
const { ccclass } = _decorator;

@ccclass('GlobalUI')
export class GlobalUI extends Component {

    private currentLevel: number = 0; 

    onLoad() {
        // 1. 提取关卡数字
        let sceneName = director.getScene().name.replace('.scene', '').replace('Level', '');
        this.currentLevel = parseInt(sceneName) || 0;
        
        console.log("【过关检测】当前场景名:", director.getScene().name, "提取到的关卡号:", this.currentLevel);
        
        // 2. 启动过关检测（每 0.5 秒检查一次）
        this.schedule(this.checkLevelComplete, 0.5);
    }

    onRestartClick() {
        let sceneName = director.getScene().name;
        sceneName = sceneName.replace('.scene', '');
        director.loadScene(sceneName);
    }

    onBackToMenuClick() {
        director.loadScene("LevelSelect");
    }

    checkLevelComplete() {
        const canvas = this.node.parent;
        if (!canvas) return;

        let hasBall = false; 
        let ballNames = []; // 用来记录找到的球的名字

        for (let i = 0; i < canvas.children.length; i++) {
            const child = canvas.children[i];
            // 只有当节点名字包含 ball，并且它是激活状态时，才算场上还有球
            if (child.active && child.name.toLowerCase().includes("ball")) {
                hasBall = true;
                ballNames.push(child.name + " (激活:" + child.active + ")");
            }
        }
        
        // 每 0.5 秒打印一次当前状态
        console.log("【过关检测】场上还有球吗?", hasBall, ballNames);

        if (!hasBall) {
            this.unschedule(this.checkLevelComplete); 
            console.log("【过关检测】所有球已清空！准备跳关...");
            this.handleLevelComplete();
        }
    }

    handleLevelComplete() {
        if (this.currentLevel >= 8) {
            console.log("【过关检测】已到最后一关，返回选关页");
            director.loadScene("LevelSelect");
        } else {
            const nextLevelName = "Level" + (this.currentLevel + 1);
            console.log("【过关检测】自动进入下一关:", nextLevelName);
            director.loadScene(nextLevelName);
        }
    }
}