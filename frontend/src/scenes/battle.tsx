import Phaser from "phaser"
import { getPlayerInfo, createMob, updateMobHealth, getPlayerCoins, stageCleared } from "../contracts/gameState";

const PLAYER_HEALTH = 100
const PLAYER_DMG = 10

interface MobSprite extends Phaser.Physics.Arcade.Sprite {
  healthBar?: HealthBar;
  isInvulnerable: boolean;
  isAttacking: boolean;
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

  private player?: Phaser.Physics.Arcade.Sprite
  private playerHealthBar?: HealthBar
  private playerInvulnerable = false;
  private mobs: MobSprite[] = []
  private PLAYER_SPEED = 300
  private JUMP_VELOCITY = -600
  private isAttacking = false

  preload() {
    this.load.image("background", "/background.png")
    this.load.image("player", "/idle.png")
    this.load.image("slime", "/slime.png")
    this.load.spritesheet("goblin", "/goblin.png", { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet("boss", "/boss.png", { frameWidth: 64, frameHeight: 64 })
    this.load.spritesheet("run", "/run.png", { frameWidth: 32, frameHeight: 40 })
    this.load.spritesheet("attack", "/attack.png", { frameWidth: 50, frameHeight: 40 })
  }

  async create() {
    this.anims.remove("idle")
    this.anims.remove("run")
    this.anims.remove("attack")
    this.anims.remove("goblinIdle")
    this.anims.remove("goblinRun")
    this.anims.remove("goblinAttack")
    this.anims.remove("bossIdle")
    this.anims.remove("bossRun")
    this.anims.remove("bossAttack")

    if (!this.input?.keyboard) return console.log("you need a keyboard");
    const coins = await getPlayerCoins()
    const playerState = await getPlayerInfo()

    this.add.text(316, 16, `STAGE: ${playerState.stage}    |    LEVEL: ${playerState.level}    |    XP: ${playerState.experience} / 100    |    BALANCE: ${coins}`, {
      fontFamily: "VP-Pixel",
      fontSize: "24px",
      color: "#ffffff",
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1000);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const background = this.add.image(0, 32, "background").setOrigin(0, 0)

    const scaleRatio = (height - 32) / background.height;
    background.setScale(scaleRatio);

    if (playerState.stage > 3) {
      const dimOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5);
      dimOverlay.setOrigin(0, 0);
      dimOverlay.setDepth(1);
      this.add.text(this.cameras.main.width / 4, this.cameras.main.height / 2 - 110, "You've saved the Chainverse,\nreclaiming the Chain Cutter Sword.\nGazing into the void, you mourn the souls lost.\nYou cast the sword into oblivion,\nhoping to never see it again.\nNow rest, my wanderer.\nYour story forever etched into the chain...", {
        fontFamily: "VP-Pixel",
        fontSize: "32px",
        color: "#ffffff",
        padding: { x: 20, y: 10 }
      })
      .setDepth(1000)
      return
    }

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

    this.anims.create({
      key: "idle",
      frames: [{ key: "player" }],
      frameRate: 1
    })

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("run", { start: 0, end: 2 }),
      frameRate: 10
    })

    this.anims.create({
      key: "attack",
      frames: this.anims.generateFrameNumbers("attack", { start: 0, end: 2 }),
      frameRate: 10,
    })

    this.anims.create({
      key: "goblinIdle",
      frames: this.anims.generateFrameNumbers("goblin", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: "goblinRun",
      frames: this.anims.generateFrameNumbers("goblin", { start: 4, end: 11 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: "goblinAttack",
      frames: this.anims.generateFrameNumbers("goblin", { start: 12, end: 17 }),
      frameRate: 10,
      repeat: 0 
    });

    this.anims.create({
      key: "bossIdle",
      frames: this.anims.generateFrameNumbers("boss", { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: "bossRun",
      frames: this.anims.generateFrameNumbers("boss", { start: 8, end: 15 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: "bossAttack",
      frames: this.anims.generateFrameNumbers("boss", { start: 16, end: 20 }),
      frameRate: 10,
      repeat: 0 
    });

    let n: number, mobName: string;
    if (playerState.stage == 1) {
      n = 3
      mobName = "slime"
    } else if (playerState.stage == 2) {
      n = 2
      mobName = "goblin"
    } else {
      n = 1
      mobName = "boss"
    }

    for (let i = 0; i < n; i++) {
      const mobData = await createMob(mobName)

      const mob = this.physics.add.sprite(
        this.cameras.main.width + 100 + (i * 100),
        height - 150,
        mobName
      ) as MobSprite;
      mob.setScale(2)
      mob.healthBar = new HealthBar(this, mob, mobData.health);
      mob.isInvulnerable = false
      mob.isAttacking = false
      
      this.physics.add.collider(mob, leftBoundary);
      this.physics.add.collider(mob, rightBoundary);
      this.physics.add.collider(mob, platform);
      this.mobs.push(mob);

      this.physics.add.overlap(mob, this.player, async() => {
        if (!this.player) return
        if (this.isAttacking && !mob.isInvulnerable) {
          mob.isInvulnerable = true
          mob.isAttacking = false
          const knockbackDirection = this.player.flipX ? -1 : 1;
          const KNOCKBACK_FORCE = 400

          mob.setVelocityX(KNOCKBACK_FORCE * knockbackDirection);
          mob.setVelocityY(-200)

          mob.setTint(0xff0000);
          this.time.delayedCall(200, () => {
            mob.clearTint();
          });
          this.time.delayedCall(400, () => {
            mob.isInvulnerable = false
          })
          
          const checkLanding = () => {
            if (!mob.body) return
            if (mob.body.touching.down) {
              mob.setVelocityX(0);
              this.events.removeListener("update", checkLanding);
            }
          };
          this.events.on("update", checkLanding);

          const isDead = mob.healthBar?.takeDamage(PLAYER_DMG)
          if (isDead) {
            mob.healthBar?.destroy();
            mob.destroy();
            this.mobs = this.mobs.filter(s => s !== mob);
            await updateMobHealth(mobData.id, mobData.health)
          }

          if (this.mobs.length === 0) {
            this.handleVictory()
          }

        } else if(!this.playerInvulnerable && !mob.isInvulnerable) {
          mob.isAttacking = true
          mob.play(mobName+"Attack")
          mob.once("animationcomplete", () => {
            mob.isAttacking = false
          })
          this.playerInvulnerable = true
          const knockbackDirection = mob.flipX ? -1 : 1;
          const KNOCKBACK_FORCE = 400

          this.player.setVelocityX(KNOCKBACK_FORCE * knockbackDirection);
          this.player.setVelocityY(500)

          this.player.setTint(0xff0000);
          this.time.delayedCall(200, () => {
            this.player.clearTint();
          });
          this.time.delayedCall(800, () => {
            this.playerInvulnerable = false
          })

          const isDead = this.playerHealthBar?.takeDamage(mobData.attack)
          if (isDead) {
            this.playerHealthBar?.destroy()
            this.player.destroy()
            mob.play(mobName+"Idle")
          }
        }
      });

      this.startMobMovement(mobName, mob);
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
          this.player.play("run", true);
        }
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(this.PLAYER_SPEED);
        this.player.setFlipX(false)
        if (!this.isAttacking) {
          this.player.play("run", true);
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
        } else {
          this.player.body.setSize(originalWidth * 2, 40);
          this.player.body.setOffset(originalOffset, 0);
        }

        this.player.play("attack")
        
        this.player.once("animationcomplete", () => {
          if (!this.player?.body) return
          this.player.body.setSize(20, 40);
          this.player.body.setOffset(0, 0);
          this.isAttacking = false;
          this.player.play("idle")
        })
      }
    });
  }

  startMobMovement(name: string, mob: MobSprite) {
    if (name == "slime") {
      const jump = () => {
        if (!this.player || !mob.body) return;
        if (mob.body.touching.down) {
          const directionX = this.player.x - mob.x;
          const normalizedDirection = Math.sign(directionX);
          const willJumpTowardsPlayer = Math.random() < 0.60;
          const finalDirection = willJumpTowardsPlayer 
            ? normalizedDirection
            : Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
          const velocityX = finalDirection * Phaser.Math.Between(200, 300);
          const velocityY = Phaser.Math.Between(-550, -650);
          
          mob.setVelocityX(velocityX);
          mob.setVelocityY(velocityY);

          const checkLanding = () => {
            if (!mob.body) return
            if (mob.body.touching.down) {
              mob.setVelocityX(0);
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
    } else {
      this.events.on("update", ()=> {
        if (!this.player || !mob.body) return;
        const directionX = this.player.x - mob.x;
        const normalizedDirection = Math.sign(directionX);
        if (normalizedDirection < 0) {
          mob.setFlipX(true)
        } else {
          mob.setFlipX(false)
        }
        const velocityX = normalizedDirection * 100;
        mob.setVelocityX(velocityX);
        mob.play(name+"Run", true)
      })
    }
  }

  async handleVictory() {
    const coins = await getPlayerCoins()
    console.log("coins", coins)
    const camera = this.cameras.main;
    const { width, height } = camera;
  
    const victoryText = this.add.text(width/2, height/2 - 100, "VICTORY!", {
      fontFamily: "VP-Pixel",
      fontSize: "64px",
      color: "#ffffff",
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1000);

    const continueButton = this.add.text(width/2, height/2 + 50, "Continue", {
      fontFamily: "VP-Pixel",
      fontSize: "32px",
      color: "#000000",
      backgroundColor: "#ffffff",
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1000);
  
    continueButton.setInteractive()
    continueButton.on("pointerdown", async() => {
      victoryText.destroy();
      continueButton.destroy();
      const result = await stageCleared()
      console.log("res", result)
      this.scene.remove();
      this.scene.add("Battle", Battle)
    });
  
    continueButton.on("pointerover", () => {
      continueButton.setScale(1.1);
    });
    continueButton.on("pointerout", () => {
      continueButton.setScale(1);
    });
  }
}