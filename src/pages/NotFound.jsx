import React from 'react'
import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
          <AlertCircle size={64} className="text-indigo-600" />
        </div>
        <div className="absolute -top-2 -right-2 bg-rose-500 text-white font-black px-4 py-1.5 rounded-full shadow-lg rotate-12">
          404
        </div>
      </div>
      
      <h1 className="text-4xl font-black text-slate-900 mb-4 font-outfit">Lost in the Nexus?</h1>
      <p className="text-slate-500 max-w-md mb-10 text-lg">
        This page seems to have shifted dimensions. Let's get you back to familiar campus grounds.
      </p>
      
      <Link to="/">
        <Button icon={Home} size="lg">
          Back to Safety
        </Button>
      </Link>
    </div>
  )
}
