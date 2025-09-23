import React, { useState, useEffect } from 'react'
import { Item, ItemRequest } from '../types/item'

interface ItemFormProps {
  item?: Item | null
  onSubmit: (data: ItemRequest) => Promise<void>
  onCancel: () => void
  isEditing: boolean
}

export const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: ''
  })

  useEffect(() => {
    if (item && isEditing) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category
      })
    }
  }, [item, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
        <div className='p-6'>
          <h2 className='text-2xl font-bold mb-4'>{isEditing ? 'Edit Item' : 'Create New Item'}</h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                Name
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
                Description
              </label>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor='price' className='block text-sm font-medium text-gray-700'>
                Price
              </label>
              <input
                type='number'
                id='price'
                name='price'
                value={formData.price}
                onChange={handleChange}
                required
                min='0'
                step='0.01'
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor='category' className='block text-sm font-medium text-gray-700'>
                Category
              </label>
              <select
                id='category'
                name='category'
                value={formData.category}
                onChange={handleChange}
                required
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              >
                <option value=''>Select a category</option>
                <option value='Electronics'>Electronics</option>
                <option value='Books'>Books</option>
                <option value='Clothing'>Clothing</option>
                <option value='Home'>Home</option>
                <option value='Sports'>Sports</option>
              </select>
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={onCancel}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
