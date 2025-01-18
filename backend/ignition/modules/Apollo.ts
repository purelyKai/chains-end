import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Apollo", (m) => {
  const apollo = m.contract("Rocket", ["Saturn V"]);

  m.call(apollo, "launch", []);

  const artemis = m.contract("Rocket", ["Artemis 2"], { id: "artemis" });

  m.call(artemis, "launch", []);

  return { apollo, artemis };
});
