import React, { useState, useEffect } from 'react'
import { Item, ItemRequest } from './types/item'
import { itemService } from './services/api'
import { ItemList } from './components/ItemList'
import { ItemForm } from './components/ItemForm'

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await itemService.getItems()
      setItems(data)
      setError('')
    } catch (err) {
      setError('Failed to load items. Please try again.')
      console.error('Error loading items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateItem = async (data: ItemRequest) => {
    try {
      const newItem = await itemService.createItem(data)
      setItems(prev => [...prev, newItem])
      setShowForm(false)
      setError('')
    } catch (err) {
      setError('Failed to create item. Please try again.')
      console.error('Error creating item:', err)
    }
  }

  const handleUpdateItem = async (data: ItemRequest) => {
    if (!editingItem) return

    try {
      const updatedItem = await itemService.updateItem(editingItem.itemId, data)
      setItems(prev => prev.map(item => (item.itemId === editingItem.itemId ? updatedItem : item)))
      setEditingItem(null)
      setError('')
    } catch (err) {
      setError('Failed to update item. Please try again.')
      console.error('Error updating item:', err)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      await itemService.deleteItem(id)
      setItems(prev => prev.filter(item => item.itemId !== id))
      setError('')
    } catch (err) {
      setError('Failed to delete item. Please try again.')
      console.error('Error deleting item:', err)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        <header className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Item Manager</h1>
          <p className='text-gray-600'>Manage your items with full CRUD functionality</p>
        </header>

        {error && <div className='mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>{error}</div>}

        <div className='mb-6 flex justify-between items-center'>
          <button
            onClick={() => setShowForm(true)}
            className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
          >
            Create New Item
          </button>

          <button
            onClick={loadItems}
            className='bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors'
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          </div>
        ) : (
          <ItemList items={items} onEdit={handleEdit} onDelete={handleDeleteItem} />
        )}

        {(showForm || editingItem) && (
          <ItemForm
            item={editingItem}
            onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
            onCancel={handleCancel}
            isEditing={!!editingItem}
          />
        )}
      </div>
    </div>
  )
}

export default App
