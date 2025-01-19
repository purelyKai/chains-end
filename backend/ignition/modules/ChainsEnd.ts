import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ChainsEnd", (m) => {
  const ChainsEnd = m.contract("GameStateManager", []);

  return { ChainsEnd };
});
