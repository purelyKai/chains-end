import React, { useEffect } from "react";
import Phaser from "phaser";
import { StageOne, StageTwo, StageThree, StageFour } from "../scenes/stages";

export const Game: React.FC = () => {
    useEffect(() => { 
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: "game-container",
        scale: {
          mode: Phaser.Scale.FIT,
          width: 1200,
          height: 400,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 1500 },
            debug: false
          }
        },
        scene: [StageOne, StageTwo, StageThree, StageFour]
      };

      const game = new Phaser.Game(config);
      
      return () => {
        game.destroy(true);
      };
    }, []);

    return <div id="game-container" className="h-full w-full font-[VP-Pixel]" />
};
