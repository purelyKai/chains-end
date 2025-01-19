import { useState, useEffect } from "react";
import {
  getPlayerCoins,
  getAllStoreItems,
  purchaseItem,
  getPlayerItems,
} from "../contracts/gameState";

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

const Store = ({ onClose }: StoreProps) => {
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [gameMessage, setGameMessage] = useState<string | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<number[]>([]);
  const [allStoreItems, setAllStoreItems] = useState<StoreItem[]>([]);
  const [userAddress, setUserAddress] = useState<string>("");

  const fetchAddress = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const address = accounts[0];
    setUserAddress(address);
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  const fetchAllStoreItems = async () => {
    const allItems = await getAllStoreItems();
    setAllStoreItems(allItems);
  };

  const fetchPlayerItems = async () => {
    if (!userAddress) return;
    const userItems = await getPlayerItems(userAddress);
    setPurchasedItems(userItems);
  };

  const fetchBalance = async () => {
    const balance = await getPlayerCoins();
    setWalletBalance(balance);
  };

  // Fetch store items and wallet balance when the component mounts or address changes
  useEffect(() => {
    if (userAddress) {
      fetchBalance();
      fetchAllStoreItems();
      fetchPlayerItems();
    }
  }, [userAddress]);

  // Refresh data after balance changes
  useEffect(() => {
    if (userAddress && walletBalance !== null) {
      fetchAllStoreItems();
      fetchPlayerItems();
    }
  }, [walletBalance, userAddress]);

  useEffect(() => {
    if (gameMessage) {
      const timer = setTimeout(() => setGameMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [gameMessage]);

  const isItemPurchased = (itemId: number) => {
    return purchasedItems.includes(itemId);
  };

  // Handle purchase logic
  const handlePurchase = async (item: StoreItem) => {
    if (!walletBalance || walletBalance < item.price) {
      setGameMessage("Insufficient balance to purchase this item.");
      return;
    }

    try {
      await purchaseItem(item.id);

      // Update local state
      const newBalance = walletBalance - item.price;
      setWalletBalance(newBalance);
      setPurchasedItems((prev) => [...prev, item.id]);

      setGameMessage(`Successfully purchased ${item.name}!`);

      // Close the modal after 0.5 seconds
      setTimeout(() => {
        setSelectedItem(null);
      }, 500);
    } catch (error) {
      setGameMessage("Failed to purchase item. Please try again.");
    }
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
            {allStoreItems.map((item) => {
              const isPurchased = isItemPurchased(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-gray-700 rounded-lg p-4 transition-all relative
                    ${
                      isPurchased
                        ? "opacity-75 cursor-not-allowed"
                        : "hover:scale-105 cursor-pointer"
                    } flex-shrink-0 w-64`}
                  onClick={() => !isPurchased && setSelectedItem(item)}
                >
                  {isPurchased && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                      <span className="text-yellow-500 text-2xl font-bold">
                        OWNED
                      </span>
                    </div>
                  )}
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
                    <p className="text-green-400 font-bold">
                      {item.price} FRAG
                    </p>
                  </div>
                </div>
              );
            })}
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
