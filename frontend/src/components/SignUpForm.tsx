import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAxiosError } from 'axios'

export const SignUpForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { signUp } = useAuth()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { left, top, width, height } = container.getBoundingClientRect()
      const x = (clientX - left) / width
      const y = (clientY - top) / height

      container.style.setProperty('--mouse-x', x.toString())
      container.style.setProperty('--mouse-y', y.toString())
    }

    container.addEventListener('mousemove', handleMouseMove)

    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')

      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')

      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signUp(formData.email, formData.password, formData.name)
    } catch (error) {
      if (isAxiosError(error)) setError(error.response?.data)
      else setError('Failed to create new account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div
      ref={containerRef}
      className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden'
    >
      {/* Enhanced mouse follow effect */}
      <div
        className='absolute inset-0 transition-all duration-300 pointer-events-none'
        style={{
          background: `
               radial-gradient(400px circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), 
                 rgba(120, 119, 198, 0.25) 0%, 
                 rgba(120, 119, 198, 0.15) 30%, 
                 transparent 60%)
             `
        }}
      />

      {/* Additional mouse trail effect */}
      <div
        className='absolute inset-0 opacity-40 pointer-events-none'
        style={{
          background: `
               radial-gradient(200px circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), 
                 rgba(255, 255, 255, 0.3) 0%, 
                 rgba(255, 255, 255, 0.1) 50%, 
                 transparent 80%)
             `,
          transform: 'scale(1.2)',
          transition: 'background 0.1s ease-out'
        }}
      />

      <div className='max-w-md w-full space-y-8 relative z-10'>
        <div className='bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 transform transition-all duration-300 hover:scale-[1.01]'>
          <div className='text-center'>
            <h2 className='mt-6 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Create your account
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              Or{' '}
              <Link
                to='/signin'
                className='font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200'
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            {error && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-shake'>
                {error}
              </div>
            )}

            <div className='space-y-4'>
              {[
                { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Full Name', autoComplete: 'name' },
                {
                  id: 'email',
                  type: 'email',
                  label: 'Email address',
                  placeholder: 'Email address',
                  autoComplete: 'email'
                },
                {
                  id: 'password',
                  type: 'password',
                  label: 'Password',
                  placeholder: 'Password (min. 8 characters)',
                  autoComplete: 'new-password'
                },
                {
                  id: 'confirmPassword',
                  type: 'password',
                  label: 'Confirm Password',
                  placeholder: 'Confirm Password',
                  autoComplete: 'new-password'
                }
              ].map(field => (
                <div key={field.id}>
                  <label htmlFor={field.id} className='block text-sm font-medium text-gray-700 mb-2'>
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    required
                    autoComplete={field.autoComplete}
                    className='w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300'
                    placeholder={field.placeholder}
                    value={formData[field.id as keyof typeof formData]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl'
              >
                {isLoading ? (
                  <span className='flex items-center justify-center'>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
