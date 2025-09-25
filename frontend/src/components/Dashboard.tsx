import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Item, ItemRequest } from '../types/item'
import { itemService } from '../services/api'
import { ItemForm } from './ItemForm'
import { isAxiosError } from 'axios'
import ItemList from './ItemList'
import { ConfirmModal, Modal } from './Modal'

import RefreshIcon from '../assets/svg/refresh.svg'
import LogoutIcon from '../assets/svg/logout.svg'
import CheckIcon from '../assets/svg/check.svg'
import ErrorIcon from '../assets/svg/error.svg'

export const Dashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [showFormModal, setShowFormModal] = useState<boolean>(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null
  })
  const [successMessage, setSuccessMessage] = useState<string>('')
  const { user, signOut } = useAuth()

  useEffect(() => {
    loadItems()
  }, [])

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const loadItems = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await itemService.listItems()
      setItems(data)
      setError('')
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'An error occurred')
      } else {
        setError('Failed to load items. Please check if you are authenticated.')
      }
      console.error('Error loading items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNewProduct = () => {
    setEditingItem(null)
    setShowFormModal(true)
  }

  const handleCreateItem = async (data: ItemRequest): Promise<void> => {
    try {
      const newItem = await itemService.createItem(data)
      setItems(prev => [...prev, newItem])
      setShowFormModal(false)
      setError('')
      showSuccess('Product created successfully! 🎉')
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to create item')
      } else {
        setError('Failed to create item')
      }
      console.error('Error creating item:', err)
    }
  }

  const handleUpdateItem = async (data: ItemRequest): Promise<void> => {
    if (!editingItem) return

    try {
      const updatedItem = await itemService.updateItem(editingItem.itemId, data)
      setItems(prev => prev.map(item => (item.itemId === editingItem.itemId ? updatedItem : item)))
      setEditingItem(null)
      setShowFormModal(false)
      setError('')
      showSuccess('Product updated successfully! ✨')
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update item')
      } else {
        setError('Failed to update item')
      }
      console.error('Error updating item:', err)
    }
  }

  const handleDeleteItem = async (id: string): Promise<void> => {
    try {
      await itemService.deleteItem(id)
      setItems(prev => prev.filter(item => item.itemId !== id))
      setError('')
      setDeleteModal({ isOpen: false, itemId: null })
      showSuccess('Product deleted successfully! 🗑️')
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to delete item')
      } else {
        setError('Failed to delete item')
      }
      console.error('Error deleting item:', err)
      setDeleteModal({ isOpen: false, itemId: null })
    }
  }

  const confirmDelete = (id: string): void => {
    setDeleteModal({ isOpen: true, itemId: id })
  }

  const handleEdit = (item: Item): void => {
    setEditingItem(item)
    setShowFormModal(true)
  }

  const handleCancel = (): void => {
    setShowFormModal(false)
  }

  const handleRefresh = (): void => {
    loadItems()
    showSuccess('Products refreshed! 🔄')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden'>
      {/* Simplified Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000'></div>
      </div>

      {/* Header with Enhanced Gradient */}
      <header className='relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0'>
            <div className='text-center sm:text-left'>
              <h1 className='text-4xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'>
                Product Inventory Manager
              </h1>
              <p className='text-blue-100 mt-2 flex items-center justify-center sm:justify-start space-x-2'>
                <span className='w-3 h-3 bg-green-400 rounded-full animate-ping'></span>
                <span>Welcome back, {user?.name}!</span>
              </p>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className='bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center space-x-2 border border-white/30 hover:shadow-lg'
              >
                <div className='w-5 h-5 animate-spin-slow'>
                  <RefreshIcon />
                </div>
                <span>Refresh</span>
              </button>
              <button
                onClick={signOut}
                className='bg-red-500/90 backdrop-blur-lg text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 border border-red-400/50 hover:shadow-lg'
              >
                <div className='w-5 h-5'>
                  <LogoutIcon />
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='relative container mx-auto px-4 py-8'>
        {/* Enhanced Success Message */}
        {successMessage && (
          <div
            className='mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg transform animate-in slide-in-from-top duration-500 hover:scale-105 transition-transform cursor-pointer'
            onClick={() => setSuccessMessage('')}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='bg-white/20 rounded-full p-2 animate-bounce'>
                  <div className='w-6 h-6'>
                    <CheckIcon />
                  </div>
                </div>
                <span className='font-semibold text-lg'>{successMessage}</span>
              </div>
              <button className='hover:text-green-200 transition-colors transform hover:scale-110'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Error Message */}
        {error && (
          <div
            className='mb-6 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-lg transform animate-in slide-in-from-top duration-500 hover:scale-105 transition-transform cursor-pointer'
            onClick={() => setError('')}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='bg-white/20 rounded-full p-2 animate-pulse'>
                  <div className='w-6 h-6'>
                    <ErrorIcon />
                  </div>
                </div>
                <span className='font-semibold text-lg'>{error}</span>
              </div>
              <button className='hover:text-red-200 transition-colors transform hover:scale-110'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18-6M6 6l12 12' />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='group relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200' />
            <div className='relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>Total Products</p>
                  <p className='text-3xl font-bold text-gray-800 mt-2'>{items.length}</p>
                </div>
                <div className='p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300'>
                  <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className='group relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200' />
            <div className='relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>Total Value</p>
                  <p className='text-3xl font-bold text-gray-800 mt-2'>
                    ${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </p>
                </div>
                <div className='p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300'>
                  <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className='group relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200' />
            <div className='relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>Categories</p>
                  <p className='text-3xl font-bold text-gray-800 mt-2'>
                    {new Set(items.map(item => item.category)).size}
                  </p>
                </div>
                <div className='p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300'>
                  <svg className='w-8 h-8 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className='flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0'>
          <div className='text-center sm:text-left'>
            <h2 className='text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent animate-pulse'>
              Product Inventory
            </h2>
            <p className='text-gray-600 mt-2 text-lg'>Manage your products with ease and style</p>
          </div>
          <button
            onClick={handleNewProduct}
            className='relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 font-semibold group overflow-hidden'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000' />
            <svg className='w-6 h-6 relative z-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            <span className='relative z-10'>Add New Product</span>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className='text-center py-16'>
            <div className='inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent'></div>
            <p className='mt-4 text-gray-600 text-lg animate-pulse'>Loading your products...</p>
          </div>
        ) : (
          <div className='transform animate-in fade-in duration-700'>
            <ItemList items={items} onEdit={handleEdit} onDelete={confirmDelete} />
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={handleCancel}
        title={editingItem ? 'Edit Product' : 'Create New Product'}
        size='lg'
      >
        <ItemForm
          item={editingItem}
          onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
          onCancel={handleCancel}
          isEditing={!!editingItem}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onConfirm={() => deleteModal.itemId && handleDeleteItem(deleteModal.itemId)}
        onCancel={() => setDeleteModal({ isOpen: false, itemId: null })}
        title='Confirm Deletion'
        message='Are you sure you want to delete this product? This action cannot be undone.'
        confirmText='Delete Product'
        cancelText='Keep Product'
      />
    </div>
  )
}
