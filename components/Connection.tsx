import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ConnectionState, RoomUserMessage, LikeMessage } from '../types';

interface ConnectionProps {
    connect: (uniqueId: string) => void;
    isConnecting: boolean;
    isConnected: boolean;
    connectionState: ConnectionState | null;
    errorMessage: string | null;
    roomUsers: RoomUserMessage | null;
    latestLike: LikeMessage | null;
    totalDiamonds: number;
}

const Connection: React.FC<ConnectionProps> = ({ 
    connect, 
    isConnecting, 
    isConnected, 
    connectionState, 
    errorMessage,
    roomUsers,
    latestLike,
    totalDiamonds
}) => {
    const [username, setUsername] = useState('');
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
        }
    }, [latestLike]);

    const handleConnect = () => {
        if (username.trim()) {
            const sanitizedUsername = username.trim().replace(/^@/, '');
            connect(sanitizedUsername);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleConnect();
        }
    };
    
    const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-center text-white mb-3">Live Connector</h3>
            
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4 flex flex-col justify-center items-center">
                <h4 className="font-semibold text-white text-sm mb-2 text-center">Statistik Room</h4>
                <div className="text-sm text-gray-300 text-center space-x-4">
                    <span>Penonton: <b className="text-white">{formatNumber(viewerCount)}</b></span>
                    <span>Suka: <b className="text-white">{formatNumber(likeCount)}</b></span>
                    <span>Diamond: <b className="text-white">{formatNumber(totalDiamonds)}</b></span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-3">
                <input
                    type="text"
                    id="uniqueIdInput"
                    placeholder="@username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isConnecting || isConnected}
                    className="flex-grow w-full bg-gray-700 text-white placeholder-gray-400 border-2 border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 outline-none disabled:opacity-50"
                />
                <button
                    id="connectButton"
                    onClick={handleConnect}
                    disabled={isConnecting || isConnected}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-500 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isConnecting && <SpinnerIcon />}
                    {isConnecting ? 'Menghubungkan...' : isConnected ? 'Terhubung' : 'Hubungkan'}
                </button>
            </div>
             <div className="bg-gray-700/50 rounded-lg p-3 mt-4 min-h-[60px] flex flex-col justify-center items-center">
                <h4 className="font-semibold text-white text-sm mb-1 text-center">Status Koneksi</h4>
                <pre className="text-xs text-center whitespace-pre-wrap">
                    {isConnected && connectionState
                        ? <span className="text-green-400">Terhubung ke Room ID {connectionState.roomId}</span>
                        : errorMessage
                        ? <span className="text-red-400">{errorMessage}</span>
                        : <span className="text-gray-400">Belum terhubung.</span>}
                </pre>
            </div>
        </div>
    );
};

export default Connection;