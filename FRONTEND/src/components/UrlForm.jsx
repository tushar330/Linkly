import React, { useState } from 'react'
import { createShortUrl } from '../api/shortUrl.api'
import { useSelector } from 'react-redux'
import { QueryClient } from '@tanstack/react-query'
import { queryClient } from '../main'

const UrlForm = () => {
  
  const [url, setUrl] = useState("https://www.google.com")
  const [shortUrl, setShortUrl] = useState()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [customSlug, setCustomSlug] = useState("")
  const [expiresIn, setExpiresIn] = useState("")
  const {isAuthenticated} = useSelector((state) => state.auth)

  const handleSubmit = async () => {
    try{
      const shortUrl = await createShortUrl(url, customSlug, expiresIn)
      setShortUrl(shortUrl)
      queryClient.invalidateQueries({queryKey: ['userUrls']})
      setError(null)
    }catch(err){
      setError(err.message)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (

    <div className="space-y-4">
        <div>
          <label htmlFor="url" className="text-left block text-sm font-medium text-slate-300 mb-1">
            Enter your URL
          </label>
          <div className="relative">
            <input
              type="url"
              id="url"
              value={url}
              onInput={(event)=>setUrl(event.target.value)}
              placeholder="https://example.com/very/long/url"
              required
              className="w-full px-5 py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
            />
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="pt-2">
             <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300 text-left">
                  Advanced Options
                </label>
             </div>
             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Custom Alias */}
              <div>
                <label htmlFor="customSlug" className="block text-xs text-slate-400 mb-1 text-left">Custom Alias</label>
                <div className="flex items-center">
                   <span className="p-3 bg-slate-700/50 border border-r-0 border-slate-600 rounded-l-xl text-slate-400 text-sm">
                     /
                   </span>
                   <input
                    type="text"
                    id="customSlug"
                    value={customSlug}
                    onChange={(event) => setCustomSlug(event.target.value)}
                    placeholder="custom-link"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-r-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                  />
                </div>
              </div>

               {/* Expiry Dropdown */}
               <div>
                  <label htmlFor="expiry" className="block text-xs text-slate-400 mb-1 text-left">Expiration</label>
                  <div className="relative">
                    <select
                      id="expiry"
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="">Never</option>
                      <option value="1m">1 Minute</option>
                      <option value="1h">1 Hour</option>
                      <option value="1d">1 Day</option>
                      <option value="7d">7 Days</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          type="submit"
          disabled={!url}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center"
        >
          Shorten URL
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
         {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm text-left flex items-start animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {shortUrl && (
          <div className="mt-8 animate-fade-in-up">
            <h2 className="text-sm uppercase tracking-wide text-slate-400 font-semibold mb-3 text-left">Your Short Link</h2>
            <div className="flex items-center bg-slate-900/80 border border-indigo-500/30 rounded-xl p-1.5 shadow-lg">
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="flex-1 p-3 bg-transparent text-indigo-300 font-mono text-sm focus:outline-none"
              />
               <button
                onClick={handleCopy}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  copied 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
  )
}

export default UrlForm