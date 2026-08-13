import { _decorator, Component, Node, Vec2, RigidBody2D, Collider2D, Contact2DType, PhysicsSystem2D, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Cup')
export class Cup extends Component {
    // ==========================================
    // 12. Inspector 参数配置
    // ==========================================
    
    @property({ tooltip: "杯子颜色ID (0=黄, 1=粉, 2=黑, 3=紫, 4=蓝, 5=白)" })
    public cupColor: number = 0;

    @property({ tooltip: "错误颜色时弹出的速度大小" })
    public wrongBounceSpeed: number = 15;

    @property({ tooltip: "判定球停止的速度阈值" })
    public stopSpeed: number = 0.1;

    @property({ tooltip: "球停止后等待多久进行颜色判断 (秒)" })
    public correctDelay: number = 1.0;

    @property({ tooltip: "弹出方向的 X 分量" })
    public exitDirectionX: number = 0;

    @property({ tooltip: "弹出方向的 Y 分量" })
    public exitDirectionY: number = 1;

    // ==========================================
    // 内部状态变量
    // ==========================================
    private triggerCollider: Collider2D | null = null;
    private ballInside: Node | null = null;
    
    // 状态机标记
    private isWaitingForStop: boolean = false;
    private isChecking: boolean = false;

    // ==========================================
    // 生命周期
    // ==========================================
    onLoad() {
        console.log('Cup onLoad, active:', this.node.active);
        // 1. 获取 trigger 节点和组件
        const triggerNode = this.node.getChildByName('trigger');
        if (!triggerNode) {
            console.error(`Cup [${this.node.name}]: 找不到名为 'trigger' 的子节点`);
            return;
        }

        this.triggerCollider = triggerNode.getComponent(Collider2D);
        if (!this.triggerCollider) {
            console.error(`Cup [${this.node.name}]: trigger 节点上缺少 Collider2D 组件`);
            return;
        }

        // 2. 确保设置为 Sensor
        this.triggerCollider.sensor = true;

        // 3. 注册全局物理接触监听 (比直接监听组件更稳定)
        PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        
        console.log(`Cup [${this.node.name}] 初始化完成，颜色ID: ${this.cupColor}`);
    }

    onDestroy() {
        // 移除监听防止内存泄漏
        if (this.triggerCollider) {
            PhysicsSystem2D.instance.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    update(dt: number) {
        // 核心循环：如果正在等待球停止，则每帧检查速度
        if (this.isWaitingForStop && this.ballInside) {
            this.checkIfBallStopped();
        }
    }

    // ==========================================
    // 物理回调
    // ==========================================
    
    /**
     * 全局接触回调
     */
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 双向判断：不管 trigger 在 self 还是 other 位置，都能匹配到
        let triggerSide: Collider2D | null = null;
        let otherSide: Collider2D | null = null;

        if (selfCollider === this.triggerCollider) {
            triggerSide = selfCollider;
            otherSide = otherCollider;
        } else if (otherCollider === this.triggerCollider) {
            triggerSide = otherCollider;
            otherSide = selfCollider;
        } else {
            return; // 跟这个杯子无关的碰撞，直接忽略
        }

        // 确认对方有刚体（是个动态物体）
        const otherBody = otherSide.node.getComponent(RigidBody2D);
        if (!otherBody) return;

        // 确认对方有 Ball 脚本
        const ballScript = otherSide.node.getComponent('Ball') as any;
        if (!ballScript) return;

        // 如果杯子当前空闲，则接纳这个球
        if (!this.isWaitingForStop && !this.isChecking && !this.ballInside) {
            this.ballInside = otherSide.node;
            this.isWaitingForStop = true;
            console.log(`Cup [${this.node.name}] 捕获球: ${this.ballInside.name}`);
            
            // 唤醒刚体
            otherBody.wakeUp();
        }
    }
    // ==========================================
    // 逻辑流程控制
    // ==========================================

    /**
     * 3. 必须等球停止
     * 每帧检查球的速度
     */
    private checkIfBallStopped() {
        if (!this.ballInside) {
            this.resetState();
            return;
        }

        const body = this.ballInside.getComponent(RigidBody2D);
        if (!body) {
            this.resetState();
            return;
        }

        const vel = body.linearVelocity;
        const currentSpeed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

        // 如果速度低于阈值，认为球已停止
        if (currentSpeed <= this.stopSpeed) {
            console.log(`Cup [${this.node.name}] 球已停止，等待 ${this.correctDelay} 秒后判断`);
            this.isWaitingForStop = false;
            this.isChecking = true;
            
            // 4. 停止后等待 1 秒
            this.scheduleOnce(() => {
                this.performColorCheck();
            }, this.correctDelay);
        }
    }

    /**
     * 6 & 7. 判断颜色
     */
    private performColorCheck() {
        if (!this.ballInside) {
            this.resetState();
            return;
        }

        const ballScript = this.ballInside.getComponent('Ball') as any;
        if (!ballScript) {
            this.resetState();
            return;
        }

        const ballColor = ballScript.ballColor;
        console.log(`Cup [${this.node.name}] 颜色比对: 球(${ballColor}) vs 杯(${this.cupColor})`);

        if (ballColor === this.cupColor) {
            // 6. 正确颜色：球和杯子一起消失
            this.handleSuccess();
        } else {
            // 7. 错误颜色：弹出球
            this.handleFailure();
        }
    }

    // ==========================================
    // 结果处理
    // ==========================================

    /**
     * 6. 正确颜色处理
     */
    private handleSuccess() {
        console.log(`Cup [${this.node.name}] 颜色正确！消除。`);
        if (this.ballInside) {
            // 先找到并隐藏倒计时标签
            const ballScript = this.ballInside.getComponent('Ball') as any;
            if (ballScript && ballScript.cooldownLabel) {
                ballScript.cooldownLabel.node.active = false;
            }
            // 再隐藏球
            this.ballInside.active = false;
        }
        this.node.active = false;
        this.resetState();
    }
    /**
     * 8. 错误颜色处理 (使用速度弹出)
     */
    private handleFailure() {
        console.log(`Cup [${this.node.name}] 颜色错误！弹出球。`);
        if (this.ballInside) {
            this.ejectBall(this.ballInside);
        }
        this.resetState();
    }

    /**
     * 8. 执行弹出逻辑
     * 直接设置 linearVelocity，无视质量
     */
    private ejectBall(ball: Node) {
        const body = ball.getComponent(RigidBody2D);
        if (!body) return;

        // 计算单位方向向量
        let dirX = this.exitDirectionX;
        let dirY = this.exitDirectionY;
        const len = Math.sqrt(dirX * dirX + dirY * dirY);

        if (len > 0.001) {
            dirX /= len;
            dirY /= len;
        } else {
            console.warn("弹出方向向量长度接近0，使用默认向上 (0, 1)");
            dirX = 0;
            dirY = 1;
        }

        // 直接赋值速度 (Fixed Initial Velocity)
        body.linearVelocity = new Vec2(dirX * this.wrongBounceSpeed, dirY * this.wrongBounceSpeed);
        body.wakeUp(); // 确保唤醒
        
        console.log(`Cup [${this.node.name}] 弹出速度: ${body.linearVelocity}`);
    }

    /**
     * 重置内部状态，允许接收下一个球
     */
    private resetState() {
        this.ballInside = null;
        this.isWaitingForStop = false;
        this.isChecking = false;
        this.unscheduleAllCallbacks(); // 清除可能残留的延时任务
    }
}