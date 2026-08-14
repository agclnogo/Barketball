import {
    _decorator,
    Component,
    Node,
    Vec2,
    RigidBody2D,
    Collider2D,
    Contact2DType,
    PhysicsSystem2D,
    IPhysics2DContact,
    AudioSource
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Cup')
export class Cup extends Component {

    // ==========================================
    // Inspector 参数配置
    // ==========================================

    @property({
        tooltip: "杯子颜色ID (0=黄, 1=粉, 2=黑, 3=紫, 4=蓝, 5=白)"
    })
    public cupColor: number = 0;


    @property({
        tooltip: "错误颜色时弹出的速度大小"
    })
    public wrongBounceSpeed: number = 15;


    @property({
        tooltip: "判定球停止的速度阈值"
    })
    public stopSpeed: number = 0.1;


    @property({
        tooltip: "球停止后等待多久进行颜色判断 (秒)"
    })
    public correctDelay: number = 1.0;


    @property({
        tooltip: "弹出方向的 X 分量"
    })
    public exitDirectionX: number = 0;


    @property({
        tooltip: "弹出方向的 Y 分量"
    })
    public exitDirectionY: number = 1;


    // ==========================================
    // 音效
    // ==========================================

    @property(AudioSource)
    public correctAudio: AudioSource | null = null;


    @property(AudioSource)
    public wrongAudio: AudioSource | null = null;


    // ==========================================
    // 内部状态变量
    // ==========================================

    private triggerCollider: Collider2D | null = null;

    private ballInside: Node | null = null;

    private isWaitingForStop: boolean = false;

    private isChecking: boolean = false;


    // ==========================================
    // 生命周期
    // ==========================================

    onLoad() {

        console.log(
            'Cup onLoad, active:',
            this.node.active
        );


        const triggerNode =
            this.node.getChildByName('trigger');


        if (!triggerNode) {

            console.error(
                `Cup [${this.node.name}]: 找不到名为 'trigger' 的子节点`
            );

            return;
        }


        this.triggerCollider =
            triggerNode.getComponent(
                Collider2D
            );


        if (!this.triggerCollider) {

            console.error(
                `Cup [${this.node.name}]: trigger 节点上缺少 Collider2D 组件`
            );

            return;
        }


        this.triggerCollider.sensor = true;


        PhysicsSystem2D.instance.on(
            Contact2DType.BEGIN_CONTACT,
            this.onBeginContact,
            this
        );


        console.log(
            `Cup [${this.node.name}] 初始化完成，颜色ID: ${this.cupColor}`
        );
    }


    onDestroy() {

        if (this.triggerCollider) {

            PhysicsSystem2D.instance.off(
                Contact2DType.BEGIN_CONTACT,
                this.onBeginContact,
                this
            );
        }
    }


    update(dt: number) {

        if (
            this.isWaitingForStop &&
            this.ballInside
        ) {

            this.checkIfBallStopped();
        }
    }


    // ==========================================
    // 物理回调
    // ==========================================

    onBeginContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ) {

        let triggerSide: Collider2D | null = null;

        let otherSide: Collider2D | null = null;


        if (
            selfCollider ===
            this.triggerCollider
        ) {

            triggerSide =
                selfCollider;

            otherSide =
                otherCollider;

        } else if (
            otherCollider ===
            this.triggerCollider
        ) {

            triggerSide =
                otherCollider;

            otherSide =
                selfCollider;

        } else {

            return;
        }


        const otherBody =
            otherSide.node.getComponent(
                RigidBody2D
            );


        if (!otherBody) {
            return;
        }


        const ballScript =
            otherSide.node.getComponent(
                'Ball'
            ) as any;


        if (!ballScript) {
            return;
        }


        if (
            !this.isWaitingForStop &&
            !this.isChecking &&
            !this.ballInside
        ) {

            this.ballInside =
                otherSide.node;

            this.isWaitingForStop =
                true;


            console.log(
                `Cup [${this.node.name}] 捕获球: ${this.ballInside.name}`
            );


            otherBody.wakeUp();
        }
    }


    // ==========================================
    // 检查球是否停止
    // ==========================================

    private checkIfBallStopped() {

        if (!this.ballInside) {

            this.resetState();

            return;
        }


        const body =
            this.ballInside.getComponent(
                RigidBody2D
            );


        if (!body) {

            this.resetState();

            return;
        }


        const vel =
            body.linearVelocity;


        const currentSpeed =
            Math.sqrt(
                vel.x * vel.x +
                vel.y * vel.y
            );


        if (
            currentSpeed <=
            this.stopSpeed
        ) {

            console.log(
                `Cup [${this.node.name}] 球已停止，等待 ${this.correctDelay} 秒后判断`
            );


            this.isWaitingForStop =
                false;


            this.isChecking =
                true;


            this.scheduleOnce(
                () => {

                    this.performColorCheck();

                },
                this.correctDelay
            );
        }
    }


    // ==========================================
    // 判断颜色
    // ==========================================

    private performColorCheck() {

        if (!this.ballInside) {

            this.resetState();

            return;
        }


        const ballScript =
            this.ballInside.getComponent(
                'Ball'
            ) as any;


        if (!ballScript) {

            this.resetState();

            return;
        }


        const ballColor =
            ballScript.ballColor;


        console.log(
            `Cup [${this.node.name}] 颜色比对: 球(${ballColor}) vs 杯(${this.cupColor})`
        );


        if (
            ballColor ===
            this.cupColor
        ) {

            this.handleSuccess();

        } else {

            this.handleFailure();
        }
    }


    // ==========================================
    // 正确颜色
    // ==========================================

    private handleSuccess() {

        console.log(
            `Cup [${this.node.name}] 颜色正确！消除。`
        );


        // 播放正确音效
        if (
            this.correctAudio
        ) {

            this.correctAudio.play();
        }


        if (this.ballInside) {

            const ballScript =
                this.ballInside.getComponent(
                    'Ball'
                ) as any;


            if (
                ballScript &&
                ballScript.cooldownLabel
            ) {

                ballScript.cooldownLabel.node.active =
                    false;
            }


            this.ballInside.active =
                false;
        }


        this.node.active =
            false;


        this.resetState();
    }


    // ==========================================
    // 错误颜色
    // ==========================================

    private handleFailure() {

        console.log(
            `Cup [${this.node.name}] 颜色错误！弹出球。`
        );


        // 播放错误音效
        if (
            this.wrongAudio
        ) {

            this.wrongAudio.play();
        }


        if (this.ballInside) {

            this.ejectBall(
                this.ballInside
            );
        }


        this.resetState();
    }


    // ==========================================
    // 执行弹出
    // ==========================================

    private ejectBall(
        ball: Node
    ) {

        const body =
            ball.getComponent(
                RigidBody2D
            );


        if (!body) {
            return;
        }


        let dirX =
            this.exitDirectionX;


        let dirY =
            this.exitDirectionY;


        const len =
            Math.sqrt(
                dirX * dirX +
                dirY * dirY
            );


        if (
            len > 0.001
        ) {

            dirX /=
                len;

            dirY /=
                len;

        } else {

            console.warn(
                "弹出方向向量长度接近0，使用默认向上 (0, 1)"
            );


            dirX = 0;

            dirY = 1;
        }


        body.linearVelocity =
            new Vec2(
                dirX *
                this.wrongBounceSpeed,

                dirY *
                this.wrongBounceSpeed
            );


        body.wakeUp();


        console.log(
            `Cup [${this.node.name}] 弹出速度: ${body.linearVelocity}`
        );
    }


    // ==========================================
    // 重置状态
    // ==========================================

    private resetState() {

        this.ballInside =
            null;


        this.isWaitingForStop =
            false;


        this.isChecking =
            false;


        this.unscheduleAllCallbacks();
    }
}