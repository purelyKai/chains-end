import React, { useEffect } from "react";
import Phaser from "phaser";
import { Battle } from "../scenes/battle";

export const Game: React.FC = () => {
    useEffect(() => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: "game-container",
        scale: {
          mode: Phaser.Scale.FIT,
          width: "100%",
          height: "100%",
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
          }
        },
        scene: Battle
      };

      const game = new Phaser.Game(config);

      return () => {
        game.destroy(true);
      };
    }, []);

    return <div id="game-container" className="h-full w-full" />
};
