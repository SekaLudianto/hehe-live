import React from 'react';
import { ConnectIcon } from './icons/ConnectIcon';
import { GameIcon } from './icons/GameIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ChatIcon } from './icons/ChatIcon';
import { GiftIcon } from './icons/GiftIcon';

interface MobileTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const MobileTabs: React.FC<MobileTabsProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { name: 'connect', label: 'Koneksi', icon: ConnectIcon },
        { name: 'game', label: 'Game', icon: GameIcon },
        { name: 'leaderboard', label: 'Peringkat', icon: TrophyIcon },
        { name: 'chat', label: 'Chat', icon: ChatIcon },
        { name: 'gift', label: 'Hadiah', icon: GiftIcon },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg z-10">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                            activeTab === tab.name ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <tab.icon className="h-6 w-6 mb-1" />
                        <span className="text-xs font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default MobileTabs;
