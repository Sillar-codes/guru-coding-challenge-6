import { useEffect, useState } from 'react'

import CloseIcon from '../assets/svg/close.svg'

// Enhanced Modal Component with animations
export const Modal: React.FC<{
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'animate-in fade-in duration-300' : 'animate-out fade-out duration-200'}`}
    >
      {/* Enhanced Backdrop */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300 ${isOpen ? 'animate-in fade-in' : 'animate-out fade-out'}`}
        onClick={onClose}
      />

      {/* Modal container with enhanced animations */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl transform-gpu transition-all duration-300 w-full ${sizeClasses[size]} ${
          isOpen ? 'animate-in zoom-in-95 slide-in-from-bottom-10' : 'animate-out zoom-out-95 slide-out-to-bottom-10'
        }`}
      >
        {/* Gradient header with shine effect */}
        <div className='relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-t-3xl px-8 py-6 overflow-hidden'>
          {/* Shine animation overlay */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine' />
          <h3 className='text-2xl font-bold text-white relative z-10 drop-shadow-lg'>{title}</h3>
        </div>

        <div className='p-8'>{children}</div>

        {/* Enhanced Close button with better hover area */}
        <button
          onClick={onClose}
          className='absolute top-6 right-6 text-white hover:text-gray-200 transition-all duration-200 transform hover:scale-110 bg-black/20 rounded-full p-3 backdrop-blur-sm hover:bg-black/30'
        >
          <div className='w-5 h-5 pointer-events-none'>
            <CloseIcon />
          </div>
        </button>
      </div>
    </div>
  )
}

// Enhanced Confirmation Modal
export const ConfirmModal: React.FC<{
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}> = ({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Delete', cancelText = 'Cancel' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size='sm'>
      <div className='space-y-6'>
        <div className='flex items-center justify-center'>
          <div className='bg-red-100 rounded-full p-4 animate-pulse'>
            <svg className='w-12 h-12 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
        </div>
        <p className='text-gray-600 text-center text-lg'>{message}</p>
        <div className='flex space-x-4 justify-center'>
          <button
            onClick={onCancel}
            className='px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 font-medium flex-1'
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className='px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium flex-1'
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
