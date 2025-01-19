# Setup

paste private key and rpc url into ``.env``

```shell
npx hardhat ignition deploy ./ignition/modules/ChainsEnd.ts --network sepolia
```

or locally

```shell
npx hardhat node
npx hardhat ignition deploy ignition/modules/ChainsEnd.ts --network localhost --reset
```
