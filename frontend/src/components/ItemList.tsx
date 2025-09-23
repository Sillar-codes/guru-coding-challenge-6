import React from "react";
import { Item } from "../types/item";

interface ItemListProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  onEdit,
  onDelete,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No items found. Create your first item!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <div
          key={item.itemId}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {item.name}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {item.description}
            </p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-blue-600">
                ${item.price.toFixed(2)}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.category}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item.itemId)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
