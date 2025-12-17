import React, { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useDispatch } from 'react-redux'
import Navbar from './components/NavBar'
import { getCurrentUser } from './api/user.api'
import { setUser } from './store/slice/authSlice'

const RootLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response.user) {
          dispatch(setUser(response.user));
        }
      } catch (error) {
        console.error("Failed to fetch user session:", error);
        // Optional: dispatch(logout()) if 401, but axios interceptor might handle logging
      }
    };
    fetchUser();
  }, [dispatch]);

  return (
    <>
      <Navbar/>
      <Outlet/>
    </>
  )
}

export default RootLayout