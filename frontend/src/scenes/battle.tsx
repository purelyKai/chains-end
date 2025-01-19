import Phaser from "phaser"
import { getPlayerInfo } from "../contracts/gameState";

const PLAYER_HEALTH = 100
const PLAYER_DMG = 10

interface SlimeSprite extends Phaser.Physics.Arcade.Sprite {
  healthBar?: HealthBar;
  isInvulnerable: boolean;
}

class HealthBar {
  private scene: Phaser.Scene;
  private entity: Phaser.Physics.Arcade.Sprite;
  private maxHealth: number;
  private currentHealth: number;
  private healthBarBackground?: Phaser.GameObjects.Rectangle;
  private healthBarForeground?: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene, 
    entity: Phaser.Physics.Arcade.Sprite, 
    maxHealth: number
  ) {
    this.scene = scene;
    this.entity = entity;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;

    this.createHealthBar();
  }

  private createHealthBar() {
    this.healthBarBackground = this.scene.add.rectangle(
      0, 0, 40, 5, 0x808080
    ).setOrigin(0.5, 0);

    this.healthBarForeground = this.scene.add.rectangle(
      0, 0, 40, 5, 0x00ff00
    ).setOrigin(0.5, 0);

    this.scene.events.on("update", this.updateHealthBarPosition, this);
  }

  private updateHealthBarPosition() {
    if (!this.entity || !this.entity.body || 
      !this.healthBarBackground || !this.healthBarForeground) return;

    this.healthBarBackground.x = this.entity.x;
    this.healthBarBackground.y = this.entity.y - this.entity.height / 2 - 10;

    this.healthBarForeground.x = this.healthBarBackground.x;
    this.healthBarForeground.y = this.healthBarBackground.y;

    const currentHealthWidth = (this.currentHealth / this.maxHealth) * 40;
    this.healthBarForeground.width = currentHealthWidth;

    if (this.currentHealth / this.maxHealth > 0.5) {
      this.healthBarForeground.setFillStyle(0x00ff00)
    } else if (this.currentHealth / this.maxHealth > 0.25) {
      this.healthBarForeground.setFillStyle(0xffff00)
    } else {
      this.healthBarForeground.setFillStyle(0xff0000)
    }
  }

  takeDamage(damage: number): boolean {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    return this.currentHealth <= 0;
  }

  heal(amount: number) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  destroy() {
    this.healthBarBackground?.destroy();
    this.healthBarForeground?.destroy();
    this.scene.events.off("update", this.updateHealthBarPosition, this);
  }
}

export class Battle extends Phaser.Scene {
  constructor() {
    super({ key: "Battle" });
  }

  private level: number = 1
  private player?: Phaser.Physics.Arcade.Sprite
  private playerHealthBar?: HealthBar
  private playerInvulnerable = false;
  private slimes: (Phaser.Physics.Arcade.Sprite & { healthBar?: HealthBar })[] = []
  private PLAYER_SPEED = 300
  private JUMP_VELOCITY = -600
  private isAttacking = false

  preload() {
    this.load.image("background", "/background.png")
    this.load.image("player", "/idle.png")
    this.load.image("slime", "/slime.png")
    this.load.spritesheet("run", "/run.png", { frameWidth: 32, frameHeight: 40 })
    this.load.spritesheet("attack", "/attack.png", { frameWidth: 50, frameHeight: 40 })
  }

  async create() {
    if (!this.input?.keyboard) return console.log("you need a keyboard");

    const playerAddr = this.registry.get("playerAddr")
    const data = await getPlayerInfo()
    console.log("DATA", data)

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const background = this.add.image(0, 0, "background").setOrigin(0, 0)

    const scaleRatio = height / background.height;
    background.setScale(scaleRatio);

    this.player = this.physics.add.sprite(300, height - 200, "player");
    this.player.setScale(2)

    this.playerHealthBar = new HealthBar(this, this.player, PLAYER_HEALTH);

    const leftBoundary = this.add.rectangle(
      200 / 2,
      height / 2,
      200,
      height,
      0x000000,
      0
    );
    this.physics.add.existing(leftBoundary, true);

    const rightBoundary = this.add.rectangle(
      background.displayWidth - 300 / 2,
      height / 2,
      300,
      height,
      0x000000,
      0
    );
    this.physics.add.existing(rightBoundary, true);

    this.physics.world.setBounds(0, 0, background.displayWidth, height);
    this.cameras.main.setBounds(0, 0, background.displayWidth, height);

    this.physics.add.collider(this.player, leftBoundary);
    this.physics.add.collider(this.player, rightBoundary);

    const platform = this.add.rectangle(
      background.displayWidth / 2,
      height - 60,
      background.displayWidth,
      20,
      0x000000,
      0
    );
    this.physics.add.existing(platform, true);
    this.physics.add.collider(this.player, platform);

    for (let i = 0; i < 3; i++) {
      const slime = this.physics.add.sprite(
        this.cameras.main.width + 100 + (i * 100),
        height - 150,
        "slime"
      ) as SlimeSprite;

      slime.healthBar = new HealthBar(this, slime, 15);
      slime.isInvulnerable = false
      
      this.physics.add.collider(slime, leftBoundary);
      this.physics.add.collider(slime, rightBoundary);
      this.physics.add.collider(slime, platform);
      this.slimes.push(slime);

      this.physics.add.overlap(slime, this.player, () => {
        if (!this.player) return
        if (this.isAttacking && !slime.isInvulnerable) {
          slime.isInvulnerable = true
          const knockbackDirection = this.player.flipX ? -1 : 1;
          const KNOCKBACK_FORCE = 400

          slime.setVelocityX(KNOCKBACK_FORCE * knockbackDirection);
          slime.setVelocityY(-200)

          slime.setTint(0xff0000);
          this.time.delayedCall(200, () => {
            slime.clearTint();
          });
          this.time.delayedCall(800, () => {
            slime.isInvulnerable = false
          })
          
          const checkLanding = () => {
            if (!slime.body) return
            if (slime.body.touching.down) {
              slime.setVelocityX(0);
              this.events.removeListener("update", checkLanding);
            }
          };
          this.events.on("update", checkLanding);

          const isDead = slime.healthBar?.takeDamage(PLAYER_DMG)
          if (isDead) {
            slime.healthBar?.destroy();
            slime.destroy();
            this.slimes = this.slimes.filter(s => s !== slime);
          }

          if (this.slimes.length === 0) {
            this.handleVictory()
          }

        } else if(!this.playerInvulnerable) {
          this.playerInvulnerable = true
          const knockbackDirection = slime.flipX ? -1 : 1;
          const KNOCKBACK_FORCE = 400

          this.player.setVelocityX(KNOCKBACK_FORCE * knockbackDirection);
          this.player.setVelocityY(-200)

          this.player.setTint(0xff0000);
          this.time.delayedCall(200, () => {
            this.player.clearTint();
          });
          this.time.delayedCall(800, () => {
            this.playerInvulnerable = false
          })

          const isDead = this.playerHealthBar?.takeDamage(10)
          if (isDead) {
            this.playerHealthBar?.destroy()
            this.player.destroy()
          }
        }
      });

      this.startSlimeJumping(slime);
    }

    const deadZoneWidth = width * 0.6;
    this.cameras.main.startFollow(
      this.player,
      false,
      1,
      1,
      0,
      0
    );
    this.cameras.main.setDeadzone(deadZoneWidth, height);

    this.anims.create({
      key: "idle",
      frames: [{ key: "player" }],
      frameRate: 1
    })
    this.anims.create({
      key: "running",
      frames: this.anims.generateFrameNumbers("run", {
        start: 0,
        end: 2
      }),
      frameRate: 12
    })
    this.anims.create({
      key: "attacking",
      frames: this.anims.generateFrameNumbers("attack", {
        start: 0,
        end: 2
      }),
      frameRate: 12,
    })

    const cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    }) as any;
    
    this.events.on("update", () => {
      if (!this.player || !this.player.body || !cursors) return;

      if (cursors.left.isDown) {
        this.player.setVelocityX(-this.PLAYER_SPEED);
        this.player.setFlipX(true)
        if (!this.isAttacking) {
          this.player.play("running", true);
        }
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(this.PLAYER_SPEED);
        this.player.setFlipX(false)
        if (!this.isAttacking) {
          this.player.play("running", true);
        }
      } else {
        this.player.setVelocityX(0)
        if (!this.isAttacking) {
          this.player.stop();
        }
      }

      if (cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(this.JUMP_VELOCITY);
      }

      if (cursors.space.isDown && !this.isAttacking) {
        this.isAttacking = true;

        const originalWidth = this.player.body.width;
        const originalOffset = this.player.body.offset.x;

        if (this.player.flipX) {
          this.player.body.setSize(originalWidth * 2, 40);
          this.player.body.setOffset(originalOffset - originalWidth, 0);
          console.log(this.player.body.width, this.player.body.height)
        } else {
          this.player.body.setSize(originalWidth * 2, 40);
          this.player.body.setOffset(originalOffset, 0);
          console.log(this.player.body.width, this.player.body.height)
        }

        this.player.play("attacking")
        
        this.player.once
        this.player.once("animationcomplete", () => {
          if (!this.player?.body) return
          console.log(this.player.body.width, this.player.body.height)
          this.player.body.setSize(20, 40);
          this.player.body.setOffset(0, 0);
          this.isAttacking = false;
          this.player.play("idle")
        })
      }
    });
  }

  startSlimeJumping(slime: Phaser.Physics.Arcade.Sprite) {
    const jump = () => {
      if (!this.player || !slime.body) return;
      if (slime.body.touching.down) {
        const directionX = this.player.x - slime.x;
        const normalizedDirection = Math.sign(directionX);
        const willJumpTowardsPlayer = Math.random() < 0.60;
        const finalDirection = willJumpTowardsPlayer 
          ? normalizedDirection
          : Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
        const velocityX = finalDirection * Phaser.Math.Between(200, 300);
        const velocityY = Phaser.Math.Between(-550, -650);
        
        slime.setVelocityX(velocityX);
        slime.setVelocityY(velocityY);

        const checkLanding = () => {
          if (!slime.body) return
          if (slime.body.touching.down) {
            slime.setVelocityX(0);
            this.events.removeListener("update", checkLanding);
          }
        };
        this.events.on("update", checkLanding);
      }

      this.time.delayedCall(
        Phaser.Math.Between(1000, 3000),
        () => jump(),
        [],
        this
      );
    };
    jump();
  }

  handleVictory() {
    const camera = this.cameras.main;
    const { width, height } = camera;
  
    this.add.text(width/2, height/2 - 100, "VICTORY!", {
      fontFamily: "VP-Pixel",
      fontSize: "64px",
      color: "#ffffff",
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1000);

    const restartButton = this.add.text(width/2, height/2 + 50, "Continue", {
      fontFamily: "VP-Pixel",
      fontSize: "32px",
      color: "#000000",
      backgroundColor: "#ffffff",
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1000);
  
    restartButton.setInteractive()
    restartButton.on("pointerdown", () => {
      this.scene.start("Battle");
    });
  
    restartButton.on("pointerover", () => {
      restartButton.setScale(1.1);
    });
    restartButton.on("pointerout", () => {
      restartButton.setScale(1);
    });
  }
}