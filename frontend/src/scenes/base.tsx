import Phaser from "phaser";
import {
  getPlayerInfo,
  PlayerData,
  stageCleared,
  killMob,
  MobData,
  getPlayerCoins,
} from "../contracts/gameState";

export interface MobSprite extends Phaser.Physics.Arcade.Sprite {
  healthBar?: HealthBar;
  isInvulnerable: boolean;
}

export class BaseScene extends Phaser.Scene {
  protected background!: Phaser.GameObjects.Image;
  protected player!: Phaser.Physics.Arcade.Sprite;
  protected playerState!: PlayerData;
  protected playerHealthBar!: HealthBar;
  protected playerCoins!: number;
  protected mobs: MobSprite[] = [];
  protected killedMobs: string[] = [];
  protected bounderies!: Phaser.Physics.Arcade.StaticGroup;

  protected BASE_DAMAGE = 10;
  protected PLAYER_SPEED = 300;
  protected JUMP_VELOCITY = -600;
  protected isAttacking = false;
  protected playerInvulnerable = false;

  constructor(key: string) {
    super(key);
  }

  preload() {
    this.load.image("player", "/idle.png");
    this.load.spritesheet("run", "/run.png", {
      frameWidth: 32,
      frameHeight: 40,
    });
    this.load.spritesheet("attack", "/attack.png", {
      frameWidth: 50,
      frameHeight: 40,
    });
  }

  async create() {
    this.createBackground();
    this.createBounderies();
    this.createPlayer();
    this.setupCamera();
    await this.setupInputs();

    // Start loading blockchain data
    this.loadBlockchainData();
    this.createAnimations();
  }

  protected createAnimations(): void {
    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: [{ key: "player" }],
        frameRate: 1,
      });
    }

    if (!this.anims.exists("run")) {
      this.anims.create({
        key: "run",
        frames: this.anims.generateFrameNumbers("run", { start: 0, end: 2 }),
        frameRate: 10,
      });
    }

    if (!this.anims.exists("attack")) {
      this.anims.create({
        key: "attack",
        frames: this.anims.generateFrameNumbers("attack", { start: 0, end: 2 }),
        frameRate: 10,
      });
    }
  }

  protected async loadBlockchainData() {
    const loadingOverlay = this.add
      .rectangle(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000
      )
      .setDepth(1000)
      .setScrollFactor(0);

    // Add loading text
    const loadingText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Loading game data...",
        {
          fontSize: "24px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5)
      .setDepth(1001)
      .setScrollFactor(0);

    try {
      this.playerState = await getPlayerInfo();
      this.playerCoins = await getPlayerCoins();
      console.log("Player State:", this.playerState);

      // Create mobs after getting player info
      await this.createMobs();

      // Update any UI elements that depend on blockchain data
      this.updateUIWithPlayerData();
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    } finally {
      loadingText.destroy();
      loadingOverlay.destroy();
    }
  }

  protected updateUIWithPlayerData(): void {
    this.add
      .text(
        0,
        0,
        `STAGE: ${this.playerState.stage}    |    LEVEL: ${this.playerState.level}    |    XP: ${this.playerState.experience} / 100    |    BALANCE: ${this.playerCoins}`,
        {
          fontFamily: "VP-Pixel",
          fontSize: "24px",
          color: "#ffffff",
          padding: { x: 0, y: 0 },
        }
      )
      .setScrollFactor(0);
    const home = this.add
      .text(1180, 0, "⌂", {
        fontSize: "32px",
        color: "#ffffff",
        padding: { x: 2, y: 0 },
      })
      .setScrollFactor(0)
      .setInteractive();

    home.on("pointerdown", () => {
      const dimOverlay = this.add
        .rectangle(
          0,
          0,
          this.cameras.main.width,
          this.cameras.main.height,
          0x000000,
          1
        )
        .setOrigin(0, 0)
        .setDepth(1)
        .setScrollFactor(0)
        .setAlpha(0);

      this.tweens.add({
        targets: [dimOverlay],
        alpha: 1,
        duration: 3000,
        ease: "Power2",
        onComplete: () => {
          dimOverlay.destroy();
          this.game.destroy(true);
          window.location.href = "/";
        },
      });
    });
  }

  protected createBackground(): void {
    // overwritten
  }

  protected createPlayer() {
    this.player = this.physics.add.sprite(
      300,
      this.cameras.main.height - 200,
      "player"
    );
    this.player.setScale(2);
    this.playerHealthBar = new HealthBar(this, this.player, 100);
    this.physics.add.collider(this.player, this.bounderies);
  }

  protected createBounderies(): void {
    this.bounderies = this.physics.add.staticGroup();
    const ground = this.add.rectangle(
      this.background.displayWidth / 2,
      this.cameras.main.height,
      this.background.displayWidth,
      30,
      0x000000,
      0
    );
    const leftBoundary = this.add.rectangle(
      20,
      this.cameras.main.height / 2,
      200,
      this.cameras.main.height,
      0x000000,
      0
    );
    const rightBoundary = this.add.rectangle(
      this.background.displayWidth - 300 / 2,
      this.cameras.main.height / 2,
      300,
      this.cameras.main.height,
      0x000000,
      0
    );
    this.bounderies.add(ground);
    this.bounderies.add(leftBoundary);
    this.bounderies.add(rightBoundary);
  }

  protected async createMobs() {
    this.mobs.forEach((mob) => {
      mob.healthBar = new HealthBar(this, mob, mob.getData("health"));
    });
  }

  protected setupCamera(): void {
    this.cameras.main.setBounds(
      0,
      0,
      this.background.displayWidth,
      this.background.height
    );
    this.cameras.main.startFollow(this.player, false, 1, 1, 0, 0);
    this.cameras.main.setDeadzone(
      this.cameras.main.width * 0.6,
      this.cameras.main.height
    );
  }

  protected async setupInputs() {
    if (!this.input.keyboard) return console.log("you need a keyboard duh");

    const cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as any;

    this.input.keyboard.on("keydown", async (event: KeyboardEvent) => {
      if (event.code === "Space") {
        await this.handleAttack();
      }
    });

    this.events.on("update", () => {
      this.handlePlayerMovement(cursors);
    });
  }

  protected handlePlayerMovement(cursors: any): void {
    if (!this.player || !this.player.body) return;

    if (cursors.left.isDown) {
      this.player.setVelocityX(-this.PLAYER_SPEED);
      this.player.setFlipX(true);
      if (!this.isAttacking) {
        this.player.play("run", true);
      }
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(this.PLAYER_SPEED);
      this.player.setFlipX(false);
      if (!this.isAttacking) {
        this.player.play("run", true);
      }
    } else {
      this.player.setVelocityX(0);
      if (!this.isAttacking) {
        this.player.play("idle", true);
      }
    }

    if (cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(this.JUMP_VELOCITY);
    }
  }

  protected async handleAttack() {
    if (this.isAttacking || !this.player.body) return;

    this.isAttacking = true;
    this.player.play("attack");

    // Increase attack hitbox
    const originalWidth = this.player.body.width;
    const originalHeight = this.player.body.height;
    const attackWidth = originalWidth * 1.75; // Increase attack range by 75%
    const attackOffset = this.player.flipX
      ? -attackWidth / 2
      : originalWidth / 2;
    this.player.body.setSize(
      attackWidth / this.player.scale,
      originalHeight / this.player.scale
    );
    this.player.body.setOffset(attackOffset, 0);

    // Check for mobs in attack range
    this.mobs.forEach(async (mob) => {
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.player.getBounds(),
          mob.getBounds()
        )
      ) {
        await this.damageMob(mob);
      }
    });

    // Reset attack state after delay
    this.time.delayedCall(500, () => {
      if (!this.player.body) return;

      this.isAttacking = false;
      this.player.play("idle");
      // Reset hitbox to original size
      this.player.body.setSize(
        originalWidth / this.player.scale,
        originalHeight / this.player.scale
      );
      this.player.body.setOffset(0, 0);
    });
  }

  private async damageMob(mob: MobSprite) {
    const damage = this.BASE_DAMAGE * this.playerState.level;
    const currentHealth = mob.healthBar!.getHealth();
    const newHealth = Math.max(currentHealth - damage, 0);
    mob.setData("health", newHealth);
    mob.healthBar!.takeDamage(damage);

    mob.isInvulnerable = true;
    this.time.delayedCall(400, () => {
      mob.isInvulnerable = false;
    });
    // Visual feedback
    this.flashSprite(mob, 0xff0000);

    if (newHealth <= 0) {
      await this.defeatMob(mob);
    }
  }

  protected handlePlayerMobCollision(
    player: Phaser.Physics.Arcade.Sprite,
    mob: MobSprite
  ): void {
    if (this.playerInvulnerable || this.isAttacking) return;

    // Player takes damage
    const mobDamage = mob.getData("attack");
    this.playerHealthBar.takeDamage(mobDamage);
    this.flashSprite(player, 0xff0000); // Flash red
    this.knockback(player, mob, 150); // Knock the player back

    // Make player invulnerable for a short time
    this.playerInvulnerable = true;
    this.time.delayedCall(1000, () => {
      this.playerInvulnerable = false;
    });

    // Check if player is defeated
    if (this.playerHealthBar.getHealth() <= 0) {
      this.handlePlayerDefeat();
    }
  }

  private async defeatMob(mob: MobSprite) {
    this.mobs = this.mobs.filter((m) => m !== mob);
    this.killedMobs.push(mob.getData("id"));

    mob.healthBar?.destroy();
    mob.destroy();

    if (this.mobs.length === 0) {
      this.handleVictory();
    }
  }

  private flashSprite(sprite: Phaser.GameObjects.Sprite, color: number): void {
    sprite.setTint(color);
    this.time.delayedCall(100, () => {
      sprite.clearTint();
    });
  }

  private knockback(
    target: Phaser.Physics.Arcade.Sprite,
    source: Phaser.Physics.Arcade.Sprite,
    force: number
  ): void {
    const angle = Phaser.Math.Angle.Between(
      source.x,
      source.y,
      target.x,
      target.y
    );
    const knockbackX = Math.cos(angle) * force;
    const knockbackY = Math.sin(angle + 0.75) * force;

    target.setVelocity(knockbackX, knockbackY);
  }

  private handlePlayerDefeat(): void {
    console.log("Player defeated!");

    this.input.keyboard.enabled = false;
    this.player.play("idle");
    this.player.setVelocity(0, 0);

    this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY, "Game Over", {
        fontFamily: "VP-Pixel",
        fontSize: "64px",
        color: "#ff0000",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Add a restart button
    const restartButton = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 100,
        "Restart",
        {
          fontFamily: "VP-Pixel",
          fontSize: "32px",
          color: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .setScrollFactor(0);

    restartButton.on("pointerdown", () => {
      this.scene.restart();
    });
  }

  protected async setupMob(mob: MobSprite, mobData: MobData): Promise<void> {
    mob.setData("id", mobData.id);
    mob.setData("type", Number(mobData.enemyType));
    mob.setData("name", mobData.name);
    mob.setData("health", mobData.health);
    mob.setData("attack", mobData.attack);
    mob.setData("coinDrop", mobData.coinsDropped);
    mob.setData("isDead", mobData.isDead);

    this.physics.add.collider(mob, this.bounderies);
    this.physics.add.overlap(
      this.player,
      mob,
      this.handlePlayerMobCollision,
      undefined,
      this
    );

    switch (mob.getData("type")) {
      case 0:
        const jump = () => {
          if (!this.player || !mob.body) return;
          if (mob.body.touching.down) {
            const directionX = this.player.x - mob.x;
            const normalizedDirection = Math.sign(directionX);
            const willJumpTowardsPlayer = Math.random() < 0.6;
            const finalDirection = willJumpTowardsPlayer
              ? normalizedDirection
              : Phaser.Math.Between(0, 1) === 0
              ? -1
              : 1;
            const velocityX = finalDirection * Phaser.Math.Between(200, 300);
            const velocityY = Phaser.Math.Between(-550, -650);

            mob.setVelocityX(velocityX);
            mob.setVelocityY(velocityY);

            const checkLanding = () => {
              if (!mob.body) return;
              if (mob.body.touching.down) {
                mob.setVelocityX(0);
                this.events.removeListener("update", checkLanding);
              }
            };
            this.events.on("update", checkLanding);
          }
          this.time.delayedCall(Phaser.Math.Between(1000, 3000), jump);
        };
        jump();
        break;
      case 1:
      case 2:
        this.events.on("update", () => {
          if (!this.player || !mob.active) return;

          const speed = mob.getData("name") === "boss" ? 200 : 150; // Boss is faster
          const direction = Math.sign(this.player.x - mob.x);

          mob.setVelocityX(direction * speed);

          // Flip the mob sprite based on movement direction
          if (direction < 0) {
            mob.setFlipX(true);
          } else if (direction > 0) {
            mob.setFlipX(false);
          }

          mob.play(`${mob.getData("name")}Run`, true);
        });
        break;
    }
  }

  protected async handleVictory() {
    this.killedMobs.forEach(async (id) => {
      await killMob(id);
    });
    await stageCleared();

    const { width, height } = this.cameras.main;

    const victoryText = this.add
      .text(width / 2, height / 2 - 100, "VICTORY!", {
        fontFamily: "VP-Pixel",
        fontSize: "64px",
        color: "#ffffff",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    const continueButton = this.add
      .text(width / 2, height / 2 + 50, "Continue", {
        fontFamily: "VP-Pixel",
        fontSize: "32px",
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    continueButton.setInteractive();
    continueButton.on("pointerdown", async () => {
      victoryText.destroy();
      continueButton.destroy();
      this.nextScene();
    });
  }

  protected nextScene() {}
}

export class HealthBar {
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
    this.healthBarBackground = this.scene.add
      .rectangle(0, 0, 40, 5, 0x808080)
      .setOrigin(0.5, 0);

    this.healthBarForeground = this.scene.add
      .rectangle(0, 0, 40, 5, 0x00ff00)
      .setOrigin(0.5, 0);

    this.scene.events.on("update", this.updateHealthBarPosition, this);
  }

  private updateHealthBarPosition() {
    if (
      !this.entity ||
      !this.entity.body ||
      !this.healthBarBackground ||
      !this.healthBarForeground
    )
      return;

    this.healthBarBackground.x = this.entity.x;
    this.healthBarBackground.y = this.entity.y - this.entity.height / 2 - 40;

    this.healthBarForeground.x = this.healthBarBackground.x;
    this.healthBarForeground.y = this.healthBarBackground.y;

    const currentHealthWidth = (this.currentHealth / this.maxHealth) * 40;
    this.healthBarForeground.width = currentHealthWidth;

    if (this.currentHealth / this.maxHealth > 0.5) {
      this.healthBarForeground.setFillStyle(0x00ff00);
    } else if (this.currentHealth / this.maxHealth > 0.25) {
      this.healthBarForeground.setFillStyle(0xffff00);
    } else {
      this.healthBarForeground.setFillStyle(0xff0000);
    }
  }

  public getHealth(): number {
    return this.currentHealth;
  }

  public takeDamage(damage: number) {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
  }

  public heal(amount: number) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  public destroy() {
    this.healthBarBackground?.destroy();
    this.healthBarForeground?.destroy();
    this.scene.events.off("update", this.updateHealthBarPosition, this);
  }
}
