"use client";
import React, { use } from 'react'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const VideoPage = () => {
    const route = useRouter();
    useEffect(() => {
        route.push('/');
    }, []);
    return (
        <div>

        </div>
    )
}

export default VideoPage
