import React, { useState, useCallback } from 'react';
import { useTikTok } from './hooks/useTikTok';
import Header from './components/Header';
import Connection from './components/Connection';
import WordleGame from './components/WordleGame';
import ChatBox from './components/ChatBox';
import GiftBox from './components/GiftBox';
import Leaderboard from './components/Leaderboard';
import { User, LeaderboardEntry } from './types';
import MobileTabs from './components/MobileTabs';

const App: React.FC = () => {
    const { 
        isConnected, 
        isConnecting,
        connectionState, 
        errorMessage, 
        connect, 
        latestChatMessage,
        latestGiftMessage,
        latestLikeMessage,
        roomUsers,
        totalDiamonds
    } = useTikTok();
    
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [activeTab, setActiveTab] = useState('game');

    const updateLeaderboard = useCallback((winner: User) => {
        setLeaderboard(prev => {
            const userIndex = prev.findIndex(entry => entry.user.uniqueId === winner.uniqueId);
            let newLeaderboard;

            if (userIndex > -1) {
                newLeaderboard = [...prev];
                const updatedUser = { ...newLeaderboard[userIndex], wins: newLeaderboard[userIndex].wins + 1 };
                newLeaderboard[userIndex] = updatedUser;
            } else {
                const newWinner = { user: { ...winner }, wins: 1 };
                newLeaderboard = [...prev, newWinner];
            }

            return newLeaderboard.sort((a, b) => b.wins - a.wins).slice(0, 3);
        });
    }, []);

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'connect':
                return <Connection 
                    connect={connect} 
                    isConnecting={isConnecting} 
                    isConnected={isConnected} 
                    connectionState={connectionState} 
                    errorMessage={errorMessage} 
                    roomUsers={roomUsers}
                    latestLike={latestLikeMessage}
                    totalDiamonds={totalDiamonds}
                />;
            case 'game':
                return <WordleGame latestChatMessage={latestChatMessage} isConnected={isConnected} updateLeaderboard={updateLeaderboard} />;
            case 'leaderboard':
                return <Leaderboard leaderboard={leaderboard} />;
            case 'chat':
                return <ChatBox latestMessage={latestChatMessage} />;
            case 'gift':
                return <GiftBox latestGift={latestGiftMessage} />;
            default:
                return <WordleGame latestChatMessage={latestChatMessage} isConnected={isConnected} updateLeaderboard={updateLeaderboard} />;
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 flex flex-col" style={{ height: 'calc(100vh - 2rem)' }}>
                <Header />
                
                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-6 mt-4 flex-grow overflow-hidden">
                    <div className="lg:col-span-2 flex flex-col">
                        <WordleGame 
                            latestChatMessage={latestChatMessage} 
                            isConnected={isConnected} 
                            updateLeaderboard={updateLeaderboard}
                        />
                    </div>
                    
                    <div className="lg:col-span-1 space-y-4 flex flex-col overflow-hidden">
                        <Connection 
                            connect={connect} 
                            isConnecting={isConnecting} 
                            isConnected={isConnected} 
                            connectionState={connectionState} 
                            errorMessage={errorMessage} 
                            roomUsers={roomUsers}
                            latestLike={latestLikeMessage}
                            totalDiamonds={totalDiamonds}
                        />
                        <Leaderboard leaderboard={leaderboard} />
                        <div className="grid grid-rows-2 gap-4 flex-grow overflow-hidden">
                           <ChatBox latestMessage={latestChatMessage} />
                           <GiftBox latestGift={latestGiftMessage} />
                        </div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <main className="lg:hidden flex-grow mt-4 overflow-y-auto pb-20">
                    {renderActiveTabContent()}
                </main>
                <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
    );
};

export default App;