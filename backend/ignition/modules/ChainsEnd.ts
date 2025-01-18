import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ChainsEnd", (m) => {
  const ChainsEnd = m.contract("GameState", []);

  return { ChainsEnd };
});
