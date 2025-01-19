import { useState } from "react";

interface StoreProps {
  onClose: () => void;
}

interface StoreItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

const storeItems: StoreItem[] = [
  {
    id: 1,
    name: "Ethereum Sword",
    description: "A powerful sword infused with Ethereum's might",
    price: 100,
    image: "/eth-sword.png",
  },
  {
    id: 2,
    name: "Bitcoin Shield",
    description: "An unbreakable shield forged from Bitcoin",
    price: 150,
    image: "/btc-shield.png",
  },
  {
    id: 3,
    name: "Chainlink Boots",
    description: "Boots that grant incredible speed and agility",
    price: 50,
    image: "/link-boots.png",
  },
  {
    id: 4,
    name: "Polkadot Armor",
    description: "Armor that connects and protects",
    price: 200,
    image: "/dot-armor.png",
  },
  {
    id: 5,
    name: "Cardano Bow",
    description: "A precise and powerful bow",
    price: 120,
    image: "/ada-bow.png",
  },
  {
    id: 6,
    name: "Solana Cloak",
    description: "A cloak that grants stealth and speed",
    price: 80,
    image: "/sol-cloak.png",
  },
];

const Store = ({ onClose }: StoreProps) => {
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 font-[VP-Pixel]">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-500">Crypto Armory</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="flex space-x-6 pb-4">
            {storeItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 flex-shrink-0 w-64"
                onClick={() => setSelectedItem(item)}
              >
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-300 mb-4 h-20 overflow-y-auto">
                  {item.description}
                </p>
                <p className="text-green-400 font-bold">{item.price} FRAG</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-yellow-500 mb-4">
              {selectedItem.name}
            </h3>
            <img
              src={selectedItem.image || "/placeholder.svg"}
              alt={selectedItem.name}
              className="w-full h-64 object-cover rounded-md mb-4"
            />
            <p className="text-gray-300 mb-4">{selectedItem.description}</p>
            <p className="text-green-400 font-bold mb-4">
              {selectedItem.price} FRAG
            </p>
            <div className="flex justify-between">
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold transition-all hover:bg-yellow-700 hover:scale-105">
                Purchase
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold transition-all hover:bg-gray-700 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
