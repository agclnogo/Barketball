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
    Label
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
    // 更新箭头
    // =========================

    updateArrow(event: EventMouse) {

        if (!this.arrow) {
            return;
        }

        // 鼠标的屏幕坐标
        const mouse = event.getUILocation();

        // 球的世界坐标
        const ballPosition = this.node.worldPosition;

        // 球 → 鼠标
        let x = mouse.x - ballPosition.x;
        let y = mouse.y - ballPosition.y;

        // 计算距离
        const distance = Math.sqrt(
            x * x +
            y * y
        );

        // 超过最大距离，只限制长度，不限制方向
        if (distance > this.maxForceDistance) {

            const scale =
                this.maxForceDistance / distance;

            x *= scale;
            y *= scale;
        }

        // 保存瞄准数据
        this.aimX = x;
        this.aimY = y;

        this.aimLength = Math.sqrt(
            x * x +
            y * y
        );

        // =========================
        // 箭头位置
        // =========================

        // 箭头虽然是球的子节点，
        // 但位置使用球的世界坐标。
        this.arrow.node.worldPosition =
            ballPosition;


        // =========================
        // 关键：
        // 强制箭头不跟随球旋转
        // =========================

        this.arrow.node.angle = 0;


        // =========================
        // 绘制箭头
        // =========================

        const graphics = this.arrow;

        graphics.clear();


        // 箭头主体
        graphics.moveTo(
            0,
            0
        );

        graphics.lineTo(
            x,
            y
        );

        graphics.stroke();


        // =========================
        // 箭头尖端
        // =========================

        if (this.aimLength > 1) {

            const nx =
                x / this.aimLength;

            const ny =
                y / this.aimLength;

            const px = -ny;
            const py = nx;


            // 箭头长度
            const arrowSize = 20;

            // 箭头宽度
            const arrowWidth = 9;


            graphics.moveTo(
                x,
                y
            );


            graphics.lineTo(
                x -
                nx * arrowSize +
                px * arrowWidth,

                y -
                ny * arrowSize +
                py * arrowWidth
            );


            graphics.lineTo(
                x -
                nx * arrowSize -
                px * arrowWidth,

                y -
                ny * arrowSize -
                py * arrowWidth
            );


            graphics.lineTo(
                x,
                y
            );


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
         * 物理引擎根据刚体实际质量
         * 自动计算速度变化。
         *
         * 质量来自：
         *
         * CircleCollider2D
         * ↓
         * Density
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