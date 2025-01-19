import { BaseScene, MobSprite } from "./base"
import { createMob } from "../contracts/gameState";

export class StageOne extends BaseScene {
  constructor() {
    super("StageOne")
  }

  preload() {
    super.preload()
    this.load.image("stage_one", "/stage_one.png")
    this.load.image("slime", "/slime.png")
  }

  async create() {
    await super.create()
  }

  protected async loadBlockchainData() {
    await super.loadBlockchainData()
    switch(this.playerState.stage) {
      case 1:
        break
      case 2:
        this.scene.stop("StageOne")
        this.scene.start("StageTwo")
        break
      case 3:
        this.scene.stop("StageOne")
        this.scene.start("StageThree")
        break
      case 4:
        this.scene.stop("StageOne")
        this.scene.start("StageFour")
        break
    }
  }

  protected createBackground() {
    this.background = this.add.image(0, 32, "stage_one").setOrigin(0, 0)
    const scaleRatio = (this.cameras.main.height - 32) / this.background.height;
    this.background.setScale(scaleRatio);
  }

  protected async createMobs() {
    for (let i = 0; i < 3; i++) {
      const mobData = await createMob("slime");
      const mob = this.physics.add.sprite(
        this.cameras.main.width + 100 + (i * 100),
        this.cameras.main.height - 150,
        "slime"
      ) as MobSprite;
      mob.isInvulnerable = false
      this.setupMob(mob, mobData);
      this.mobs.push(mob);
    }
    await super.createMobs()
  }

  protected nextScene() {
    this.scene.start("StageTwo")
  }
}

export class StageTwo extends BaseScene {
  constructor() {
    super("StageTwo")
  }

  preload() {
    super.preload()
    this.load.image("stage_two", "/stage_two.png")
    this.load.spritesheet("goblin", "/goblin.png", { frameWidth: 32, frameHeight: 32 })
  }

  async create() {
    await super.create()

    if (!this.anims.exists("goblinIdle")) {
      this.anims.create({
        key: "goblinIdle",
        frames: this.anims.generateFrameNumbers("goblin", { start: 0, end: 3 }),
        frameRate: 12,
      });
    }

    if (!this.anims.exists("goblinRun")) {
      this.anims.create({
        key: "goblinRun",
        frames: this.anims.generateFrameNumbers("goblin", { start: 8, end: 15 }),
        frameRate: 12,
      });
    }

    if (!this.anims.exists("goblinAttack")) {
      this.anims.create({
        key: "goblinAttack",
        frames: this.anims.generateFrameNumbers("goblin", { start: 12, end: 17 }),
        frameRate: 10,
      });
    }
  }

  protected createBackground(): void {
    this.background = this.add.image(0, 32, "stage_two").setOrigin(0, 0)
    const scaleRatio = (this.cameras.main.height - 32) / this.background.height;
    this.background.setScale(scaleRatio);
  }

  protected async createMobs() {
    for (let i = 0; i < 2; i++) {
      const mobData = await createMob("goblin");
      const mob = this.physics.add.sprite(
        this.cameras.main.width + 100 + (i * 100),
        this.cameras.main.height - 150,
        "goblin"
      ) as MobSprite;
      mob.setScale(2);
      mob.isInvulnerable = false;
      this.setupMob(mob, mobData);
      this.mobs.push(mob);
    }
    await super.createMobs()
  }

  protected nextScene() {
    this.scene.start("StageThree")
  }
}

export class StageThree extends BaseScene {
  constructor() {
    super("StageThree")
  }

  preload() {
    super.preload()
    this.load.image("stage_three", "/stage_three.png")
    this.load.spritesheet("boss", "/boss.png", { frameWidth: 64, frameHeight: 64 })
  }

  async create() {
    await super.create()

    if (!this.anims.exists("bossIdle")) {
      this.anims.create({
        key: "bossIdle",
        frames: this.anims.generateFrameNumbers("boss", { start: 0, end: 7 }),
        frameRate: 12,
        repeat: -1
      });
    }

    if (!this.anims.exists("bossRun")) {
      this.anims.create({
        key: "bossRun",
        frames: this.anims.generateFrameNumbers("boss", { start: 8, end: 15 }),
        frameRate: 12,
        repeat: -1
      });
    }
    
    if (!this.anims.exists("bossAttack")) {
      this.anims.create({
        key: "bossAttack",
        frames: this.anims.generateFrameNumbers("boss", { start: 16, end: 20 }),
        frameRate: 10,
        repeat: 0 
      });
    }
  }

  protected createBackground() {
    this.background = this.add.image(0, 32, "stage_three").setOrigin(0, 0)
    const scaleRatio = (this.cameras.main.height - 32) / this.background.height;
    this.background.setScale(scaleRatio);
  }

  protected async createMobs() {
    const mobData = await createMob("boss");
    const mob = this.physics.add.sprite(
      this.cameras.main.width + 200,
      this.cameras.main.height - 150,
      "boss"
    ) as MobSprite;
    mob.isInvulnerable = false;
    mob.setScale(4);
    this.setupMob(mob, mobData);
    this.mobs.push(mob);
    await super.createMobs()
  }

  protected nextScene() {
    this.scene.start("StageFour")
  }
}

export class StageFour extends BaseScene {
  constructor() {
    super("StageFour")
  }

  preload() {
    this.load.image("stage_four", "/stage_four.png")
  }

  protected createBackground() {
    this.background = this.add.image(0, 32, "stage_four").setOrigin(0, 0)
    const scaleRatio = (this.cameras.main.height - 32) / this.background.height;
    this.background.setScale(scaleRatio);

    const dimOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5)
      .setOrigin(0, 0)
      .setDepth(1)
      .setScrollFactor(0)
      .setAlpha(0)

    const story = this.add.text(this.cameras.main.width / 4, this.cameras.main.height / 2 - 110, "You've saved the Chainverse,\nreclaiming the Chain Cutter Sword.\nGazing into the void, you mourn the souls lost.\nYou cast the sword into oblivion,\nhoping to never see it again.\nNow rest, my wanderer.\nYour story forever etched into the chain...", {
      fontFamily: "VP-Pixel",
      fontSize: "32px",
      color: "#ffffff",
      padding: { x: 20, y: 10 }
    })
    .setDepth(1000)
    .setScrollFactor(0)
    .setInteractive()
    .setAlpha(0); 

    // Fade in effect
    this.tweens.add({
      targets: [story, dimOverlay],
      alpha: 1,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(8000, () => {
          this.tweens.add({
            targets: [story, dimOverlay],
            alpha: 0,
            duration: 3000,
            ease: "Power2",
            onComplete: () => {
              story.destroy();
              dimOverlay.destroy();
            }
          });
        });
      }
    });
  }
}