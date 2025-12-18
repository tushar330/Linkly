import React, { useState } from 'react'
import AnalyticsChart from './AnalyticsChart'

const UserUrl = ({ urls }) => {
  // Data fetching moved to parent component
  
  const [copiedId, setCopiedId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const handleCopy = (url, id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  const toggleAnalytics = (id) => {
      setExpandedId(expandedId === id ? null : id);
  }

  if (!urls || urls.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <p className="text-xl font-medium text-slate-400">No URLs found</p>
        <p className="mt-2 text-slate-600">Create your first shortened URL to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Original URL
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Short URL
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Clicks
              </th>
               <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Expiry
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-transparent">
            {urls.slice().reverse().map((url) => ( // Create copy to reverse
              <React.Fragment key={url._id}>
              <tr 
                onClick={() => toggleAnalytics(url._id)}
                className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded bg-slate-700 flex items-center justify-center text-slate-400 mr-3">
                         <img src={`https://www.google.com/s2/favicons?domain=${url.originalUrl}&sz=32`} alt="favicon" className="h-4 w-4 opacity-70" onError={(e) => {e.target.style.display='none'}} /> 
                    </div>
                    <div className="text-sm text-slate-300 truncate max-w-[200px]" title={url.originalUrl}>
                      {url.originalUrl}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a 
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${url.shortCode}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                  >
                    {url.customAlias ? url.customAlias : url.shortCode}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                     <span className="px-2.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-slate-700 text-slate-300 border border-slate-600 group-hover:bg-indigo-500/20 group-hover:text-indigo-200 transition-colors">
                      {url.clicks}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                    {url.expiresAt ? new Date(url.expiresAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={(e) => handleCopy(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${url.shortCode}`, url._id, e)}
                        className={`inline-flex items-center px-3 py-1.5 border border-slate-600 text-xs font-medium rounded-lg shadow-sm transition-all duration-200 ${
                          copiedId === url._id
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                        }`}
                      >
                        {copiedId === url._id ? 'Copied' : 'Copy'}
                      </button>
                      <button 
                         className="text-slate-500 hover:text-slate-300 transform transition-transform duration-200"
                         style={{ transform: expandedId === url._id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                  </div>
                </td>
              </tr>
              {expandedId === url._id && (
                  <tr>
                      <td colSpan="5" className="px-6 py-4 bg-slate-800/30 animate-fade-in-down">
                          <AnalyticsChart data={url.analytics} />
                      </td>
                  </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
    </div>
  )
}

export default UserUrl