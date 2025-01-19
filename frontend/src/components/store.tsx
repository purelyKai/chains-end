import { useState, useEffect } from "react";
import { getPlayerCoins, getAllStoreItems } from "../contracts/gameState";

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

/*
const accounts = await window.ethereum.request({
  method: "eth_requestAccounts",
});
const address = accounts[0];
*/

const Store = ({ onClose }: StoreProps) => {
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [gameMessage, setGameMessage] = useState<string | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<number[]>([]); // Track purchased item IDs
  const [allStoreItems, setAllStoreItems] = useState<StoreItem[]>([]);

  // Fetch wallet balance when the component mounts
  useEffect(() => {
    const fetchAllStoreItems = async () => {
      const allItems = await getAllStoreItems();
      setAllStoreItems(allItems);
    };
    const fetchBalance = async () => {
      const balance = await getPlayerCoins();
      setWalletBalance(balance);
    };

    fetchBalance();
    fetchAllStoreItems();
  }, []);

  useEffect(() => {
    if (gameMessage) {
      const timer = setTimeout(() => setGameMessage(null), 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [gameMessage]);

  // Handle purchase logic
  const handlePurchase = async (item: StoreItem) => {
    if (!walletBalance || walletBalance < item.price) {
      setGameMessage("Insufficient balance to purchase this item.");
      return;
    }

    // Simulate purchase and update wallet balance
    const newBalance = walletBalance - item.price;
    setWalletBalance(newBalance);

    // Mark item as purchased
    setPurchasedItems((prev) => [...prev, item.id]);

    // Set success message
    setGameMessage(`Successfully purchased ${item.name}!`);

    // Close the modal after 3 seconds
    setTimeout(() => {
      setSelectedItem(null); // Close the modal
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 font-[VP-Pixel]">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-500">Crypto Armory</h2>
          <p className="text-3xl font-bold text-yellow-500">
            Balance: {walletBalance !== null ? `${walletBalance} FRAG` : "N/A"}
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="flex space-x-6 pb-4">
            {allStoreItems.map((item) => (
              <div
                key={item.id}
                className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
                  purchasedItems.includes(item.id)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                } flex-shrink-0 w-64`}
                onClick={() =>
                  !purchasedItems.includes(item.id) && setSelectedItem(item)
                }
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
                <div className="flex items-center justify-between mt-2">
                  <p className="text-green-400 font-bold">{item.price} FRAG</p>
                  {purchasedItems.includes(item.id) && (
                    <p className="text-red-500 font-bold ml-4">Sold</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            {gameMessage && (
              <div className="mb-4 p-4 bg-gray-700 text-center text-yellow-400 font-bold rounded-lg">
                {gameMessage}
              </div>
            )}
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
              <button
                onClick={() => handlePurchase(selectedItem)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold transition-all hover:bg-yellow-700 hover:scale-105"
              >
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
