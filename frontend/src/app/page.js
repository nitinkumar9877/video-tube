"use client"
import React from 'react'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Home = () => {
  const route = useRouter();
  useEffect(() => {
    route.push('/register-account');
  }, []);
  return (
    <div>
      This is the home page
    </div>
  )
}
export default Home;
