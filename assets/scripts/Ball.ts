import {
    _decorator,
    Component,
    Node,
    EventMouse,
    Graphics,
    input,
    Input,
    RigidBody2D,
    Vec2,
    Vec3,
    Label,
    AudioSource,
    Collider2D,
    Contact2DType,
    PhysicsSystem2D,
    IPhysics2DContact, Color
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Ball')
export class Ball extends Component {

    // =========================
    // 球的颜色
    // =========================

    // 0 = 黄色
    // 1 = 粉色
    // 2 = 黑色
    // 3 = 紫色
    // 4 = 蓝色
    // 5 = 白色

    @property
    ballColor: number = 0;


    // =========================
    // 发射参数
    // =========================

    @property
    maxForceDistance: number = 400;


    // 最大冲量
    @property
    maxImpulse: number = 50;


    // =========================
    // 冷却
    // =========================

    @property
    cooldownTime: number = 3;


    // =========================
    // 节点
    // =========================

    @property(Graphics)
    arrow: Graphics | null = null;


    @property(Label)
    cooldownLabel: Label | null = null;


    // =========================
    // 音效
    // =========================

    @property(AudioSource)
    audioSource: AudioSource | null = null;


    @property(AudioSource)
    bounceAudio: AudioSource | null = null;


    // =========================
    // 内部变量
    // =========================

    private aiming: boolean = false;

    private cooldown: number = 0;

    private aimX: number = 0;

    private aimY: number = 0;

    private aimLength: number = 0;


    // =========================
    // 初始化
    // =========================

    onLoad() {

        this.hideArrow();

        this.hideCooldown();


        // 球监听鼠标按下
        this.node.on(
            Node.EventType.MOUSE_DOWN,
            this.onMouseDown,
            this
        );


        // 全局监听鼠标移动
        input.on(
            Input.EventType.MOUSE_MOVE,
            this.onMouseMove,
            this
        );


        // 全局监听鼠标松开
        input.on(
            Input.EventType.MOUSE_UP,
            this.onMouseUp,
            this
        );


        // =========================
        // 监听物理碰撞
        // =========================

        PhysicsSystem2D.instance.on(
            Contact2DType.BEGIN_CONTACT,
            this.onBeginContact,
            this
        );
    }


    // =========================
    // 销毁
    // =========================

    onDestroy() {

        input.off(
            Input.EventType.MOUSE_MOVE,
            this.onMouseMove,
            this
        );


        input.off(
            Input.EventType.MOUSE_UP,
            this.onMouseUp,
            this
        );


        // 取消物理碰撞监听
        PhysicsSystem2D.instance.off(
            Contact2DType.BEGIN_CONTACT,
            this.onBeginContact,
            this
        );
    }


    // =========================
    // 每帧更新
    // =========================

    update(dt: number) {

        /*
         * CD
         */
        if (
            this.cooldown > 0
        ) {

            this.cooldown -= dt;


            if (
                this.cooldown < 0
            ) {

                this.cooldown = 0;
            }


            this.updateCooldownLabel();


            if (
                this.cooldown === 0
            ) {

                this.hideCooldown();
            }
        }
    }


    // =========================
    // 物理碰撞
    // =========================

    onBeginContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ) {

        /*
         * 判断是不是这个球的碰撞体
         */

        if (
            selfCollider.node !== this.node &&
            otherCollider.node !== this.node
        ) {

            return;
        }


        /*
         * 播放 bounce
         */

        if (
            this.bounceAudio
        ) {

            this.bounceAudio.play();
        }
    }


    // =========================
    // 按下球
    // =========================

    onMouseDown(
        event: EventMouse
    ) {

        /*
         * CD期间不能操作
         */
        if (
            this.cooldown > 0
        ) {

            return;
        }


        /*
         * 开始瞄准
         */
        this.aiming = true;


        this.updateArrow(
            event
        );
    }


    // =========================
    // 鼠标移动
    // =========================

    onMouseMove(
        event: EventMouse
    ) {

        if (
            !this.aiming
        ) {

            return;
        }


        this.updateArrow(
            event
        );
    }


    // =========================
    // 松开鼠标
    // =========================

    onMouseUp(
        event: EventMouse
    ) {

        if (
            !this.aiming
        ) {

            return;
        }


        /*
         * 发射
         */
        this.shoot();


        /*
         * 结束瞄准
         */
        this.aiming = false;


        /*
         * 隐藏箭头
         */
        this.hideArrow();
    }


    // =========================
    // 更新箭头（修复版 - 不再出现大片红色）
    // =========================
    updateArrow(event: EventMouse) {
        if (!this.arrow) return;

        // 1. 计算鼠标相对球的位置和距离
        const mouse = event.getUILocation();
        const ballPosition = this.node.worldPosition;
        let x = mouse.x - ballPosition.x;
        let y = mouse.y - ballPosition.y;
        const distance = Math.sqrt(x * x + y * y);

        // 限制最大瞄准距离
        if (distance > this.maxForceDistance) {
            const scale = this.maxForceDistance / distance;
            x *= scale;
            y *= scale;
        }

        // 保存瞄准数据
        this.aimX = x;
        this.aimY = y;
        this.aimLength = Math.sqrt(x * x + y * y);

        // 2. 箭头位置和角度
        this.arrow.node.worldPosition = ballPosition;
        this.arrow.node.angle = 0;

        const graphics = this.arrow;
        graphics.clear();

        // 如果拉得太短，不画
        if (this.aimLength <= 5) {
            this.arrow.node.active = true;
            return;
        }

        // 3. 蓄力比例 (0 ~ 1)
        const powerRatio = this.aimLength / this.maxForceDistance;

        // 4. 动态颜色：从浅灰白 → 大红色
        const r = 255;
        const g = Math.floor(200 - 200 * powerRatio);
        const b = Math.floor(200 - 200 * powerRatio);
        const lineColor = new Color(r, g, b, 255);

        // 5. 先画箭头头部（fill）—— 必须在 clear 之后、stroke 之前画
        //    这样 fill 只会填充箭头本身，不会误填线条路径
        const arrowSize = 12 + 8 * powerRatio;
        const nx = x / this.aimLength;
        const ny = y / this.aimLength;
        const px = -ny;
        const py = nx;

        const tipX = x;
        const tipY = y;
        const wingX1 = x - nx * arrowSize + px * arrowSize * 0.5;
        const wingY1 = y - ny * arrowSize + py * arrowSize * 0.5;
        const wingX2 = x - nx * arrowSize - px * arrowSize * 0.5;
        const wingY2 = y - ny * arrowSize - py * arrowSize * 0.5;

        graphics.fillColor = lineColor;
        graphics.moveTo(tipX, tipY);
        graphics.lineTo(wingX1, wingY1);
        graphics.lineTo(wingX2, wingY2);
        graphics.lineTo(tipX, tipY);  // ← 显式闭合，不用 close()
        graphics.fill();

        // 6. 再画瞄准线（stroke）—— stroke 不影响已填充的箭头
        const segments = 10;
        const dx = x / segments;
        const dy = y / segments;

        for (let i = 0; i < segments; i++) {
            const startWidth = 2 + (4 * powerRatio) * (i / segments);
            const endWidth = 2 + (4 * powerRatio) * ((i + 1) / segments);
            
            const sx = dx * i;
            const sy = dy * i;
            const ex = dx * (i + 1);
            const ey = dy * (i + 1);

            graphics.strokeColor = lineColor;
            graphics.lineWidth = (startWidth + endWidth) / 2;
            graphics.moveTo(sx, sy);
            graphics.lineTo(ex, ey);
            graphics.stroke();
        }

        // 显示箭头
        this.arrow.node.active = true;
    }

    // =========================
    // 发射
    // =========================

    shoot() {

        const body =
            this.node.getComponent(
                RigidBody2D
            );


        if (!body) {

            console.warn(
                'Ball: 没有找到 RigidBody2D'
            );

            return;
        }


        /*
         * 没有有效瞄准
         */
        if (
            this.aimLength <= 1
        ) {

            return;
        }


        /*
         * 单位方向
         */
        const directionX =
            this.aimX /
            this.aimLength;


        const directionY =
            this.aimY /
            this.aimLength;


        /*
         * 力量比例
         *
         * 0 ~ 1
         */
        const power =
            this.aimLength /
            this.maxForceDistance;


        /*
         * 计算冲量
         */
        const impulse =
            power *
            this.maxImpulse;


        /*
         * 施加冲量
         *
         * 物理引擎根据球实际质量
         * 自动计算速度变化。
         */
        body.applyLinearImpulse(
            new Vec2(
                directionX *
                impulse,

                directionY *
                impulse
            ),

            body.getWorldCenter(),

            true
        );


        // =========================
        // 播放发射音效
        // =========================    

        if (
            this.audioSource
        ) {

            this.audioSource.play();
        }


        /*
         * 开始冷却
         */
        this.cooldown =
            this.cooldownTime;


        this.updateCooldownLabel();
    }


    // =========================
    // 更新倒计时
    // =========================

    updateCooldownLabel() {

        if (
            !this.cooldownLabel
        ) {

            return;
        }


        this.cooldownLabel.string =
            this.cooldown.toFixed(1);


        const ballPosition =
            this.node.worldPosition;


        /*
         * 球上方
         */
        this.cooldownLabel.node.worldPosition =
            new Vec3(
                ballPosition.x,
                ballPosition.y + 50,
                0
            );


        /*
         * 不跟随球旋转
         */
        this.cooldownLabel.node.angle =
            0;


        this.cooldownLabel.node.active =
            true;
    }


    // =========================
    // 隐藏倒计时
    // =========================

    hideCooldown() {

        if (
            !this.cooldownLabel
        ) {

            return;
        }


        this.cooldownLabel.node.active =
            false;
    }


    // =========================
    // 隐藏箭头
    // =========================

    hideArrow() {

        if (
            !this.arrow
        ) {

            return;
        }


        this.arrow.clear();

        this.arrow.node.active =
            false;
    }
}