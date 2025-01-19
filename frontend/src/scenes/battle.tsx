import Phaser from "phaser"

export class Battle extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;

  preload() {
    this.load.image("background", "/background.png")
    this.load.image("player", "/idle.png")
    this.load.spritesheet("run", "run.png", { frameWidth: 64, frameHeight: 64 })
  }

  create() {

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.image(width - 132, height / 2, "background")

    const platform = this.add.rectangle(
      0,
      height + 200,
      width,
      200,
      0x000000,
      0
    )

    this.physics.add.existing(platform, true)

    this.player = this.physics.add.sprite(0, 0, "player")

    this.anims.create({
      key: "running",
      frames: this.anims.generateFrameNumbers("run", {
        start: 0,
        end: 2
      }),
      frameRate: 12,
    })

    this.player.setCollideWorldBounds(true)

    const cursors = this.input.keyboard.createCursorKeys()
    
    this.events.on("update", () => {
      if (!this.player) return;

      if (cursors.left.isDown) {
        this.player.setVelocityX(-160)
        this.player.play("running", true);
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(160)
        this.player.play("running", true);
      } else {
        this.player.setVelocityX(0)
        this.player.stop();
      }

      if (cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330)
      }
    });
  }
}