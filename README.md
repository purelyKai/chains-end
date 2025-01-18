# chains-end

## Tech, Libs, & Frameworks

React, TypeScript, Solidity, Ethers.js, Hardhat

### Backend:

```
npm install --save-dev hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

### Frontend:

```
npm install ethers
```

## File Tree

chains-end/
├── backend/
│ ├── .gitignore
│ ├── contracts/
│ │ └── Lock.sol
│ ├── hardhat.config.ts
│ ├── ignition/
│ │ └── modules/
│ │ └── Lock.ts
│ ├─] node_modules/ (ignored)
│ ├── package-lock.json
│ ├── package.json
│ ├── README.md
│ ├── test/
│ │ └── Lock.ts
│ └── tsconfig.json
├── frontend/
│ ├── .gitignore
│ ├── eslint.config.js
│ ├── index.html
│ ├─] node_modules/ (ignored)
│ ├── package-lock.json
│ ├── package.json
│ ├── public/
│ │ ├── background.png
│ │ └── favicon.ico
│ ├── src/
│ │ ├── App.css
│ │ ├── App.tsx
│ │ ├── assets/
│ │ │ └── react.svg
│ │ ├── index.css
│ │ ├── main.tsx
│ │ └── vite-env.d.ts
│ ├── tsconfig.app.json
│ ├── tsconfig.json
│ ├── tsconfig.node.json
│ └── vite.config.ts
└── README.md
