System.register("chunks:///_virtual/Ball.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Graphics, Label, AudioSource, Node, input, Input, PhysicsSystem2D, Contact2DType, Color, RigidBody2D, Vec2, Vec3, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Graphics = module.Graphics;
      Label = module.Label;
      AudioSource = module.AudioSource;
      Node = module.Node;
      input = module.input;
      Input = module.Input;
      PhysicsSystem2D = module.PhysicsSystem2D;
      Contact2DType = module.Contact2DType;
      Color = module.Color;
      RigidBody2D = module.RigidBody2D;
      Vec2 = module.Vec2;
      Vec3 = module.Vec3;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;
      cclegacy._RF.push({}, "f7f451iN09GmIM/1iV86613", "Ball", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var Ball = exports('Ball', (_dec = ccclass('Ball'), _dec2 = property(Graphics), _dec3 = property(Label), _dec4 = property(AudioSource), _dec5 = property(AudioSource), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Ball, _Component);
        function Ball() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          // =========================
          // 球的颜色
          // =========================
          // 0 = 黄色
          // 1 = 粉色
          // 2 = 黑色
          // 3 = 紫色
          // 4 = 蓝色
          // 5 = 白色
          _initializerDefineProperty(_this, "ballColor", _descriptor, _assertThisInitialized(_this));
          // =========================
          // 发射参数
          // =========================
          _initializerDefineProperty(_this, "maxForceDistance", _descriptor2, _assertThisInitialized(_this));
          // 最大冲量
          _initializerDefineProperty(_this, "maxImpulse", _descriptor3, _assertThisInitialized(_this));
          // =========================
          // 冷却
          // =========================
          _initializerDefineProperty(_this, "cooldownTime", _descriptor4, _assertThisInitialized(_this));
          // =========================
          // 节点
          // =========================
          _initializerDefineProperty(_this, "arrow", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "cooldownLabel", _descriptor6, _assertThisInitialized(_this));
          // =========================
          // 音效
          // =========================
          _initializerDefineProperty(_this, "audioSource", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "bounceAudio", _descriptor8, _assertThisInitialized(_this));
          // =========================
          // 内部变量
          // =========================
          _this.aiming = false;
          _this.cooldown = 0;
          _this.aimX = 0;
          _this.aimY = 0;
          _this.aimLength = 0;
          return _this;
        }
        var _proto = Ball.prototype;
        // =========================
        // 初始化
        // =========================
        _proto.onLoad = function onLoad() {
          this.hideArrow();
          this.hideCooldown();

          // 球监听鼠标按下
          this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);

          // 全局监听鼠标移动
          input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

          // 全局监听鼠标松开
          input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);

          // =========================
          // 监听物理碰撞
          // =========================

          PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        // =========================
        // 销毁
        // =========================
        ;

        _proto.onDestroy = function onDestroy() {
          input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
          input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);

          // 取消物理碰撞监听
          PhysicsSystem2D.instance.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        // =========================
        // 每帧更新
        // =========================
        ;

        _proto.update = function update(dt) {
          /*
           * CD
           */
          if (this.cooldown > 0) {
            this.cooldown -= dt;
            if (this.cooldown < 0) {
              this.cooldown = 0;
            }
            this.updateCooldownLabel();
            if (this.cooldown === 0) {
              this.hideCooldown();
            }
          }
        }

        // =========================
        // 物理碰撞
        // =========================
        ;

        _proto.onBeginContact = function onBeginContact(selfCollider, otherCollider, contact) {
          /*
           * 判断是不是这个球的碰撞体
           */

          if (selfCollider.node !== this.node && otherCollider.node !== this.node) {
            return;
          }

          /*
           * 播放 bounce
           */

          if (this.bounceAudio) {
            this.bounceAudio.play();
          }
        }

        // =========================
        // 按下球
        // =========================
        ;

        _proto.onMouseDown = function onMouseDown(event) {
          /*
           * CD期间不能操作
           */
          if (this.cooldown > 0) {
            return;
          }

          /*
           * 开始瞄准
           */
          this.aiming = true;
          this.updateArrow(event);
        }

        // =========================
        // 鼠标移动
        // =========================
        ;

        _proto.onMouseMove = function onMouseMove(event) {
          if (!this.aiming) {
            return;
          }
          this.updateArrow(event);
        }

        // =========================
        // 松开鼠标
        // =========================
        ;

        _proto.onMouseUp = function onMouseUp(event) {
          if (!this.aiming) {
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
        ;

        _proto.updateArrow = function updateArrow(event) {
          if (!this.arrow) return;

          // 1. 计算鼠标相对球的位置和距离
          var mouse = event.getUILocation();
          var ballPosition = this.node.worldPosition;
          var x = mouse.x - ballPosition.x;
          var y = mouse.y - ballPosition.y;
          var distance = Math.sqrt(x * x + y * y);

          // 限制最大瞄准距离
          if (distance > this.maxForceDistance) {
            var scale = this.maxForceDistance / distance;
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
          var graphics = this.arrow;
          graphics.clear();

          // 如果拉得太短，不画
          if (this.aimLength <= 5) {
            this.arrow.node.active = true;
            return;
          }

          // 3. 蓄力比例 (0 ~ 1)
          var powerRatio = this.aimLength / this.maxForceDistance;

          // 4. 动态颜色：从浅灰白 → 大红色
          var r = 255;
          var g = Math.floor(200 - 200 * powerRatio);
          var b = Math.floor(200 - 200 * powerRatio);
          var lineColor = new Color(r, g, b, 255);

          // 5. 先画箭头头部（fill）—— 必须在 clear 之后、stroke 之前画
          //    这样 fill 只会填充箭头本身，不会误填线条路径
          var arrowSize = 12 + 8 * powerRatio;
          var nx = x / this.aimLength;
          var ny = y / this.aimLength;
          var px = -ny;
          var py = nx;
          var tipX = x;
          var tipY = y;
          var wingX1 = x - nx * arrowSize + px * arrowSize * 0.5;
          var wingY1 = y - ny * arrowSize + py * arrowSize * 0.5;
          var wingX2 = x - nx * arrowSize - px * arrowSize * 0.5;
          var wingY2 = y - ny * arrowSize - py * arrowSize * 0.5;
          graphics.fillColor = lineColor;
          graphics.moveTo(tipX, tipY);
          graphics.lineTo(wingX1, wingY1);
          graphics.lineTo(wingX2, wingY2);
          graphics.lineTo(tipX, tipY); // ← 显式闭合，不用 close()
          graphics.fill();

          // 6. 再画瞄准线（stroke）—— stroke 不影响已填充的箭头
          var segments = 10;
          var dx = x / segments;
          var dy = y / segments;
          for (var i = 0; i < segments; i++) {
            var startWidth = 2 + 4 * powerRatio * (i / segments);
            var endWidth = 2 + 4 * powerRatio * ((i + 1) / segments);
            var sx = dx * i;
            var sy = dy * i;
            var ex = dx * (i + 1);
            var ey = dy * (i + 1);
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
        ;

        _proto.shoot = function shoot() {
          var body = this.node.getComponent(RigidBody2D);
          if (!body) {
            console.warn('Ball: 没有找到 RigidBody2D');
            return;
          }

          /*
           * 没有有效瞄准
           */
          if (this.aimLength <= 1) {
            return;
          }

          /*
           * 单位方向
           */
          var directionX = this.aimX / this.aimLength;
          var directionY = this.aimY / this.aimLength;

          /*
           * 力量比例
           *
           * 0 ~ 1
           */
          var power = this.aimLength / this.maxForceDistance;

          /*
           * 计算冲量
           */
          var impulse = power * this.maxImpulse;

          /*
           * 施加冲量
           *
           * 物理引擎根据球实际质量
           * 自动计算速度变化。
           */
          body.applyLinearImpulse(new Vec2(directionX * impulse, directionY * impulse), body.getWorldCenter(), true);

          // =========================
          // 播放发射音效
          // =========================    

          if (this.audioSource) {
            this.audioSource.play();
          }

          /*
           * 开始冷却
           */
          this.cooldown = this.cooldownTime;
          this.updateCooldownLabel();
        }

        // =========================
        // 更新倒计时
        // =========================
        ;

        _proto.updateCooldownLabel = function updateCooldownLabel() {
          if (!this.cooldownLabel) {
            return;
          }
          this.cooldownLabel.string = this.cooldown.toFixed(1);
          var ballPosition = this.node.worldPosition;

          /*
           * 球上方
           */
          this.cooldownLabel.node.worldPosition = new Vec3(ballPosition.x, ballPosition.y + 50, 0);

          /*
           * 不跟随球旋转
           */
          this.cooldownLabel.node.angle = 0;
          this.cooldownLabel.node.active = true;
        }

        // =========================
        // 隐藏倒计时
        // =========================
        ;

        _proto.hideCooldown = function hideCooldown() {
          if (!this.cooldownLabel) {
            return;
          }
          this.cooldownLabel.node.active = false;
        }

        // =========================
        // 隐藏箭头
        // =========================
        ;

        _proto.hideArrow = function hideArrow() {
          if (!this.arrow) {
            return;
          }
          this.arrow.clear();
          this.arrow.node.active = false;
        };
        return Ball;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ballColor", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "maxForceDistance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 400;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "maxImpulse", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 50;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "cooldownTime", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "arrow", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "cooldownLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "audioSource", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "bounceAudio", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Cup.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, AudioSource, Collider2D, PhysicsSystem2D, Contact2DType, RigidBody2D, Vec2, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      AudioSource = module.AudioSource;
      Collider2D = module.Collider2D;
      PhysicsSystem2D = module.PhysicsSystem2D;
      Contact2DType = module.Contact2DType;
      RigidBody2D = module.RigidBody2D;
      Vec2 = module.Vec2;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;
      cclegacy._RF.push({}, "1cc3aCohtVOaYKHzPwmSvtz", "Cup", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var Cup = exports('Cup', (_dec = ccclass('Cup'), _dec2 = property({
        tooltip: "杯子颜色ID (0=黄, 1=粉, 2=黑, 3=紫, 4=蓝, 5=白)"
      }), _dec3 = property({
        tooltip: "错误颜色时弹出的速度大小"
      }), _dec4 = property({
        tooltip: "判定球停止的速度阈值"
      }), _dec5 = property({
        tooltip: "球停止后等待多久进行颜色判断 (秒)"
      }), _dec6 = property({
        tooltip: "弹出方向的 X 分量"
      }), _dec7 = property({
        tooltip: "弹出方向的 Y 分量"
      }), _dec8 = property(AudioSource), _dec9 = property(AudioSource), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Cup, _Component);
        function Cup() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          // ==========================================
          // Inspector 参数配置
          // ==========================================
          _initializerDefineProperty(_this, "cupColor", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "wrongBounceSpeed", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "stopSpeed", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "correctDelay", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "exitDirectionX", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "exitDirectionY", _descriptor6, _assertThisInitialized(_this));
          // ==========================================
          // 音效
          // ==========================================
          _initializerDefineProperty(_this, "correctAudio", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "wrongAudio", _descriptor8, _assertThisInitialized(_this));
          // ==========================================
          // 内部状态变量
          // ==========================================
          _this.triggerCollider = null;
          _this.ballInside = null;
          _this.isWaitingForStop = false;
          _this.isChecking = false;
          return _this;
        }
        var _proto = Cup.prototype;
        // ==========================================
        // 生命周期
        // ==========================================
        _proto.onLoad = function onLoad() {
          console.log('Cup onLoad, active:', this.node.active);
          var triggerNode = this.node.getChildByName('trigger');
          if (!triggerNode) {
            console.error("Cup [" + this.node.name + "]: \u627E\u4E0D\u5230\u540D\u4E3A 'trigger' \u7684\u5B50\u8282\u70B9");
            return;
          }
          this.triggerCollider = triggerNode.getComponent(Collider2D);
          if (!this.triggerCollider) {
            console.error("Cup [" + this.node.name + "]: trigger \u8282\u70B9\u4E0A\u7F3A\u5C11 Collider2D \u7EC4\u4EF6");
            return;
          }
          this.triggerCollider.sensor = true;
          PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
          console.log("Cup [" + this.node.name + "] \u521D\u59CB\u5316\u5B8C\u6210\uFF0C\u989C\u8272ID: " + this.cupColor);
        };
        _proto.onDestroy = function onDestroy() {
          if (this.triggerCollider) {
            PhysicsSystem2D.instance.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
          }
        };
        _proto.update = function update(dt) {
          if (this.isWaitingForStop && this.ballInside) {
            this.checkIfBallStopped();
          }
        }

        // ==========================================
        // 物理回调
        // ==========================================
        ;

        _proto.onBeginContact = function onBeginContact(selfCollider, otherCollider, contact) {
          var otherSide = null;
          if (selfCollider === this.triggerCollider) {
            otherSide = otherCollider;
          } else if (otherCollider === this.triggerCollider) {
            otherSide = selfCollider;
          } else {
            return;
          }
          var otherBody = otherSide.node.getComponent(RigidBody2D);
          if (!otherBody) {
            return;
          }
          var ballScript = otherSide.node.getComponent('Ball');
          if (!ballScript) {
            return;
          }
          if (!this.isWaitingForStop && !this.isChecking && !this.ballInside) {
            this.ballInside = otherSide.node;
            this.isWaitingForStop = true;
            console.log("Cup [" + this.node.name + "] \u6355\u83B7\u7403: " + this.ballInside.name);
            otherBody.wakeUp();
          }
        }

        // ==========================================
        // 检查球是否停止
        // ==========================================
        ;

        _proto.checkIfBallStopped = function checkIfBallStopped() {
          var _this2 = this;
          if (!this.ballInside) {
            this.resetState();
            return;
          }
          var body = this.ballInside.getComponent(RigidBody2D);
          if (!body) {
            this.resetState();
            return;
          }
          var vel = body.linearVelocity;
          var currentSpeed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
          if (currentSpeed <= this.stopSpeed) {
            console.log("Cup [" + this.node.name + "] \u7403\u5DF2\u505C\u6B62\uFF0C\u7B49\u5F85 " + this.correctDelay + " \u79D2\u540E\u5224\u65AD");
            this.isWaitingForStop = false;
            this.isChecking = true;
            this.scheduleOnce(function () {
              _this2.performColorCheck();
            }, this.correctDelay);
          }
        }

        // ==========================================
        // 判断颜色
        // ==========================================
        ;

        _proto.performColorCheck = function performColorCheck() {
          if (!this.ballInside) {
            this.resetState();
            return;
          }
          var ballScript = this.ballInside.getComponent('Ball');
          if (!ballScript) {
            this.resetState();
            return;
          }
          var ballColor = ballScript.ballColor;
          console.log("Cup [" + this.node.name + "] \u989C\u8272\u6BD4\u5BF9: \u7403(" + ballColor + ") vs \u676F(" + this.cupColor + ")");
          if (ballColor === this.cupColor) {
            this.handleSuccess();
          } else {
            this.handleFailure();
          }
        }

        // ==========================================
        // 正确颜色
        // ==========================================
        ;

        _proto.handleSuccess = function handleSuccess() {
          console.log("Cup [" + this.node.name + "] \u989C\u8272\u6B63\u786E\uFF01\u6D88\u9664\u3002");

          // 播放正确音效
          if (this.correctAudio) {
            this.correctAudio.play();
          }
          if (this.ballInside) {
            var ballScript = this.ballInside.getComponent('Ball');
            if (ballScript && ballScript.cooldownLabel) {
              ballScript.cooldownLabel.node.active = false;
            }
            this.ballInside.active = false;
          }
          this.node.active = false;
          this.resetState();
        }

        // ==========================================
        // 错误颜色
        // ==========================================
        ;

        _proto.handleFailure = function handleFailure() {
          console.log("Cup [" + this.node.name + "] \u989C\u8272\u9519\u8BEF\uFF01\u5F39\u51FA\u7403\u3002");

          // 播放错误音效
          if (this.wrongAudio) {
            this.wrongAudio.play();
          }
          if (this.ballInside) {
            this.ejectBall(this.ballInside);
          }
          this.resetState();
        }

        // ==========================================
        // 执行弹出
        // ==========================================
        ;

        _proto.ejectBall = function ejectBall(ball) {
          var body = ball.getComponent(RigidBody2D);
          if (!body) {
            return;
          }
          var dirX = this.exitDirectionX;
          var dirY = this.exitDirectionY;
          var len = Math.sqrt(dirX * dirX + dirY * dirY);
          if (len > 0.001) {
            dirX /= len;
            dirY /= len;
          } else {
            console.warn("弹出方向向量长度接近0，使用默认向上 (0, 1)");
            dirX = 0;
            dirY = 1;
          }
          body.linearVelocity = new Vec2(dirX * this.wrongBounceSpeed, dirY * this.wrongBounceSpeed);
          body.wakeUp();
          console.log("Cup [" + this.node.name + "] \u5F39\u51FA\u901F\u5EA6: " + body.linearVelocity);
        }

        // ==========================================
        // 重置状态
        // ==========================================
        ;

        _proto.resetState = function resetState() {
          this.ballInside = null;
          this.isWaitingForStop = false;
          this.isChecking = false;
          this.unscheduleAllCallbacks();
        };
        return Cup;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "cupColor", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "wrongBounceSpeed", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 15;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "stopSpeed", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.1;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "correctDelay", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.0;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "exitDirectionX", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "exitDirectionY", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "correctAudio", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "wrongAudio", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GlobalUI.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, director, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      director = module.director;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "58682cynMRLxoDq6jEgdXjo", "GlobalUI", undefined);
      var ccclass = _decorator.ccclass;
      var GlobalUI = exports('GlobalUI', (_dec = ccclass('GlobalUI'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GlobalUI, _Component);
        function GlobalUI() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.currentLevel = 0;
          return _this;
        }
        var _proto = GlobalUI.prototype;
        _proto.onLoad = function onLoad() {
          // 1. 提取关卡数字
          var sceneName = director.getScene().name.replace('.scene', '').replace('Level', '');
          this.currentLevel = parseInt(sceneName) || 0;
          console.log("【过关检测】当前场景名:", director.getScene().name, "提取到的关卡号:", this.currentLevel);

          // 2. 启动过关检测（每 0.5 秒检查一次）
          this.schedule(this.checkLevelComplete, 0.5);
        };
        _proto.onRestartClick = function onRestartClick() {
          var sceneName = director.getScene().name;
          sceneName = sceneName.replace('.scene', '');
          director.loadScene(sceneName);
        };
        _proto.onBackToMenuClick = function onBackToMenuClick() {
          director.loadScene("LevelSelect");
        };
        _proto.checkLevelComplete = function checkLevelComplete() {
          var canvas = this.node.parent;
          if (!canvas) return;
          var hasBall = false;
          var ballNames = []; // 用来记录找到的球的名字

          for (var i = 0; i < canvas.children.length; i++) {
            var child = canvas.children[i];
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
        };
        _proto.handleLevelComplete = function handleLevelComplete() {
          if (this.currentLevel >= 8) {
            console.log("【过关检测】已到最后一关，返回选关页");
            director.loadScene("LevelSelect");
          } else {
            var nextLevelName = "Level" + (this.currentLevel + 1);
            console.log("【过关检测】自动进入下一关:", nextLevelName);
            director.loadScene(nextLevelName);
          }
        };
        return GlobalUI;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LevelSelectUI.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, director, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      director = module.director;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "9350acX98FJBLG8rmgkxOF7", "LevelSelectUI", undefined);
      var ccclass = _decorator.ccclass;
      var LevelSelectUI = exports('LevelSelectUI', (_dec = ccclass('LevelSelectUI'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(LevelSelectUI, _Component);
        function LevelSelectUI() {
          return _Component.apply(this, arguments) || this;
        }
        var _proto = LevelSelectUI.prototype;
        _proto.onLevel1Click = function onLevel1Click() {
          director.loadScene("Level1");
        };
        _proto.onLevel2Click = function onLevel2Click() {
          director.loadScene("Level2");
        };
        _proto.onLevel3Click = function onLevel3Click() {
          director.loadScene("Level3");
        };
        _proto.onLevel4Click = function onLevel4Click() {
          director.loadScene("Level4");
        };
        _proto.onLevel5Click = function onLevel5Click() {
          director.loadScene("Level5");
        };
        _proto.onLevel6Click = function onLevel6Click() {
          director.loadScene("Level6");
        };
        _proto.onLevel7Click = function onLevel7Click() {
          director.loadScene("Level7");
        };
        _proto.onLevel8Click = function onLevel8Click() {
          director.loadScene("Level8");
        };
        return LevelSelectUI;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./Ball.ts', './Cup.ts', './GlobalUI.ts', './LevelSelectUI.ts'], function () {
  return {
    setters: [null, null, null, null],
    execute: function () {}
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});