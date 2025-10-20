import React, { useState, useEffect } from 'react';
import { LikeMessage, RoomUserMessage } from '../types';

interface StatsProps {
    roomUsers: RoomUserMessage | null;
    latestLike: LikeMessage | null;
    totalDiamonds: number;
}

const Stats: React.FC<StatsProps> = ({ roomUsers, latestLike, totalDiamonds }) => {
    
    const [viewerCount, setViewerCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if(roomUsers?.viewerCount){
            setViewerCount(roomUsers.viewerCount);
        } else {
             setViewerCount(0);
        }
    }, [roomUsers]);

    useEffect(() => {
        if(latestLike?.totalLikeCount) {
            setLikeCount(latestLike.totalLikeCount);
        } else {
            setLikeCount(0);
        }
    }, [latestLike]);


    const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

    return (
        <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col justify-center items-center">
            <h3 className="font-semibold text-white mb-2 text-center">Statistik Room</h3>
            <div className="text-sm text-gray-300 text-center space-x-4">
                <span>Penonton: <b className="text-white">{formatNumber(viewerCount)}</b></span>
                <span>Suka: <b className="text-white">{formatNumber(likeCount)}</b></span>
                <span>Diamond: <b className="text-white">{formatNumber(totalDiamonds)}</b></span>
            </div>
        </div>
    );
};

export default Stats;
