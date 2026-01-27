import { useState, useEffect, useRef, useCallback } from 'react';
import { getRanking } from '../../services/attendance/attendanceService';
import { Header } from '../../components/layout/Header';

export const RankingPage = () => {
    const [fullRanking, setFullRanking] = useState([]);
    const [displayedRanking, setDisplayedRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const observerTarget = useRef(null);
    const PAGE_SIZE = 10;

    useEffect(() => {
        loadRankingData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            loadRankingData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadRankingData = async () => {
        setLoading(true);
        try {
            // 1. Fetch all data (Client-side aggregation strategy)
            const data = await getRanking();
            setFullRanking(data);

            // 2. Initial render
            setDisplayedRanking(data.slice(0, PAGE_SIZE));
        } catch (error) {
            console.error('Error loading ranking:', error);
        } finally {
            setLoading(false);
        }
    };

    // Infinite Scroll Logic
    const loadMore = useCallback(() => {
        const nextLimit = (page + 1) * PAGE_SIZE;
        if (displayedRanking.length < fullRanking.length) {
            setDisplayedRanking(fullRanking.slice(0, nextLimit));
            setPage(prev => prev + 1);
        }
    }, [page, displayedRanking.length, fullRanking]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [loadMore]);

    // UI Helpers
    const getMedal = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return <span className="text-gray-400 font-bold text-sm">#{index + 1}</span>;
    };

    const getRowStyle = (index) => {
        if (index === 0) return 'bg-yellow-50 border-yellow-200 shadow-sm transform scale-[1.02]';
        if (index === 1) return 'bg-gray-50 border-gray-200';
        if (index === 2) return 'bg-orange-50 border-orange-200';
        return 'bg-white border-gray-100';
    };

    // Check if we have any attendances to show podium
    const hasAttendances = fullRanking.length > 0 && fullRanking[0]?.attendanceCount > 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Ranking de Asistencia" />

            <div className="max-w-md mx-auto px-4 py-6">
                {/* Refresh Button */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={loadRankingData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <span className={loading ? 'animate-spin' : ''}>🔄</span>
                        Actualizar
                    </button>
                </div>

                {/* Top Stats Summary - Only show if there are attendances */}
                {!loading && hasAttendances && (
                    <div className="grid grid-cols-3 gap-2 mb-8 text-center animate-fade-in">
                        {/* 2nd Place */}
                        <div className="pt-8">
                            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-2 relative">
                                <span className="text-2xl">🥈</span>
                                <div className="absolute -bottom-2 bg-gray-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                                    {fullRanking[1]?.attendanceCount || 0}
                                </div>
                            </div>
                            <p className="text-xs font-bold text-gray-600 truncate px-1">
                                {fullRanking[1]?.displayName.split(' ')[0]}
                            </p>
                        </div>

                        {/* 1st Place */}
                        <div className="">
                            <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl mb-2 relative ring-2 ring-yellow-400">
                                <span className="text-4xl">🥇</span>
                                <div className="absolute -bottom-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    {fullRanking[0]?.attendanceCount || 0}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-gray-800 truncate px-1">
                                {fullRanking[0]?.displayName.split(' ')[0]}
                            </p>
                            <p className="text-[10px] text-yellow-600 font-bold">Líder</p>
                        </div>

                        {/* 3rd Place */}
                        <div className="pt-8">
                            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-2 relative">
                                <span className="text-2xl">🥉</span>
                                <div className="absolute -bottom-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                    {fullRanking[2]?.attendanceCount || 0}
                                </div>
                            </div>
                            <p className="text-xs font-bold text-gray-600 truncate px-1">
                                {fullRanking[2]?.displayName.split(' ')[0]}
                            </p>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        displayedRanking.map((user, index) => (
                            <div
                                key={user.uid}
                                className={`
                                    flex items-center justify-between p-4 rounded-xl border transition-all duration-300 animate-slide-up
                                    ${getRowStyle(index)}
                                `}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 flex justify-center text-lg">
                                        {getMedal(index)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">
                                            {user.displayName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-primary-600 text-lg">
                                        {user.attendanceCount}
                                    </span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                        Asistencias
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Loading Trigger for Infinite Scroll */}
                <div ref={observerTarget} className="h-10 mt-4 flex justify-center">
                    {displayedRanking.length < fullRanking.length && (
                        <div className="animate-pulse w-2 h-2 bg-gray-300 rounded-full mx-1"></div>
                    )}
                </div>
            </div>
        </div>
    );
};
