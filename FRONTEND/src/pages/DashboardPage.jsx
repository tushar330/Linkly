import React, { useState } from 'react'
import UrlForm from '../components/UrlForm'
import UserUrl from '../components/UserUrl'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAllUserUrls } from '../api/user.api'
import AnalyticsChart from '../components/AnalyticsChart'

import { updateUserProfile } from '../api/user.api'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../store/slice/authSlice.js'

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Settings State
  const [uploading, setUploading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
      email: user?.email || '',
      avatar: null
  });
  const [preview, setPreview] = useState(user?.avatar || null);

  // Update formData when user data loads
  React.useEffect(() => {
    if (user) {
        setFormData(prev => ({ ...prev, email: user.email }));
        setPreview(user.avatar);
    }
  }, [user]);

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setFormData({ ...formData, avatar: file });
          setPreview(URL.createObjectURL(file));
      }
  };

  const handleSettingsSubmit = async (e) => {
      e.preventDefault();
      setUploading(true);
      setSettingsMsg({ type: '', text: '' });
      
      try {
          const data = new FormData();
          // Only append email if it has changed
          if (formData.email && formData.email !== user?.email) {
              data.append('email', formData.email);
          }
          if (formData.avatar) {
              data.append('avatar', formData.avatar);
          }
          
          // If nothing to update
          if (!data.has('email') && !data.has('avatar')) {
              setUploading(false);
              setSettingsMsg({ type: 'info', text: 'No changes detected.' });
              return;
          }
          
          const response = await updateUserProfile(data);
          
          if (response.success) {
              dispatch(setUser(response.user));
              setSettingsMsg({ type: 'success', text: 'Profile updated successfully!' });
          }
      } catch (error) {
          setSettingsMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
      } finally {
          setUploading(false);
      }
  };

  const { data: urlsData, isLoading, isError } = useQuery({
    queryKey: ['userUrls'],
    queryFn: getAllUserUrls,
    refetchInterval: 5000, 
    staleTime: 0, 
  })

  // ... (Stats Logic remains same)
  const urls = urlsData?.urls || [];
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const activeLinks = urls.filter(url => !url.expiresAt || new Date() < new Date(url.expiresAt)).length;
  const avgClicks = activeLinks > 0 ? Math.round(totalClicks / activeLinks) : 0;
  
  // ... (Analytics Logic remains same)
  const getGlobalAnalytics = () => {
    let allAnalytics = [];
    urls.forEach(url => {
        if(url.analytics) allAnalytics = [...allAnalytics, ...url.analytics];
    });
    return allAnalytics.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };
  const globalAnalytics = getGlobalAnalytics();

  const getCountryName = (code) => {
    if (!code || code === 'Unknown') return 'Unknown';
    try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        return regionNames.of(code);
    } catch (error) {
        return code;
    }
  }

  const getCountryStats = () => {
      const stats = {};
      globalAnalytics.forEach(item => {
          let country = item.country || 'Unknown';
          if (country !== 'Unknown') {
              country = getCountryName(country);
          } else {
             country = "Unidentified Location";
          }
           stats[country] = (stats[country] || 0) + 1;
      });
      return Object.entries(stats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); 
  };
  const countryStats = getCountryStats();

  // Dynamic Header Description
  const getHeaderDescription = () => {
      switch(activeTab) {
          case 'dashboard': return "Manage your links and track their performance.";
          case 'analytics': return "Deep dive into your traffic sources and geography.";
          case 'settings': return "Update your profile and account preferences.";
          default: return "";
      }
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                 <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* ... Dashboard UI ... (Using existing JSX) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Clicks</h3>
                  <p className="text-3xl font-bold text-white mt-2 animate-pulse-soft" key={totalClicks}>{totalClicks.toLocaleString()}</p>
                  <span className="text-green-400 text-sm flex items-center mt-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    Real-time
                  </span>
               </div>
               <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Links</h3>
                  <p className="text-3xl font-bold text-white mt-2">{activeLinks}</p>
                  <span className="text-slate-500 text-sm mt-2">Creating traffic</span>
               </div>
               <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm">
                   <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Avg. Clicks / Link</h3>
                   <p className="text-3xl font-bold text-white mt-2">{avgClicks}</p>
                   <span className="text-slate-500 text-sm mt-2">Engagement Score</span>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                 <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg sticky top-8">
                    <h3 className="text-xl font-bold text-white mb-6">Create New Link</h3>
                    <UrlForm/>
                 </div>
              </div>

              <div className="lg:col-span-2">
                 <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-slate-700">
                      <h3 className="text-xl font-bold text-white">Your Links</h3>
                    </div>
                    <UserUrl urls={urls} />
                 </div>
              </div>
            </div>
          </>
        );
      case 'analytics':
        return (
          <div className="space-y-8">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6">Global Click Activity</h3>
                <AnalyticsChart data={globalAnalytics} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-6">Top Countries</h3>
                    {countryStats.length > 0 ? (
                        <div className="space-y-4">
                            {countryStats.slice(0, 10).map((stat, idx) => (
                                <div key={stat.name} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-slate-500 font-mono">#{idx + 1}</span>
                                        <span className="text-slate-200">{stat.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-24 bg-slate-700 rounded-full h-2 overflow-hidden">
                                            <div className="bg-indigo-500 h-full" style={{ width: `${(stat.value / totalClicks) * 100}%` }}></div>
                                        </div>
                                        <span className="text-slate-400 text-sm font-medium">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">No country data available yet.</p>
                    )}
                </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto">
             <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Profile Settings</h3>
                    
                    {settingsMsg.text && (
                        <div className={`mb-6 p-4 rounded-lg ${settingsMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {settingsMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleSettingsSubmit} className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-700 border-2 border-slate-600 ring-2 ring-transparent group-hover:ring-indigo-500 transition-all">
                                    {preview ? (
                                        <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-2xl font-bold">
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-lg font-medium text-white">{user?.name}</h4>
                                <p className="text-slate-400 text-sm mt-1">Upload a new avatar to customize your profile.</p>
                                <p className="text-slate-500 text-xs mt-2">Recommended: Square JPG, PNG. Max 5MB.</p>
                            </div>
                        </div>

                        {/* Email Section */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={uploading}
                                className={`px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Saving...
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100 font-sans pt-16">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col">
        {/* ... Sidebar Nav (Using existing JSX if identical, but re-rendered for completeness or kept if stable) ... */}
        {/* For brevity, I will include the nav since I'm replacing the file content block */}
         <nav className="flex-1 p-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'}`}>
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === 'analytics' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'}`}>
             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Analytics
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'}`}>
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white capitalize">{activeTab}</h2>
            <p className="text-slate-400 mt-1">{getHeaderDescription()}</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                {user?.avatar ? ( <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" /> ) : ( user?.name?.[0]?.toUpperCase() || 'U' )}
             </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  )
}

export default DashboardPage