"use client";
import React from 'react'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
const DashBoard = () => {
    const route = useRouter();
    useEffect(() => {
        route.push('/user');
    }, []);
    return (
    <div>
      
    </div>
  )
}

export default DashBoard
