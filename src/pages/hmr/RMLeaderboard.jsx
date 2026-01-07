import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { useGetRMLeaderboardQuery } from '../../services/api/rmApi';
import { FiAward, FiStar, FiTrendingUp, FiXCircle } from 'react-icons/fi';

/**
 * RM Leaderboard Page
 * 
 * Displays competitive rankings of all Relationship Managers based on performance scores.
 * Shows top performers with their metrics (salons added, approval rates, total scores).
 * Highlights current user's position in the leaderboard.
 * 
 * Features:
 * - Real-time leaderboard data from backend
 * - Visual rank indicators (gold/silver/bronze for top 3)
 * - Current user highlight
 * - Performance metrics display
 * - Responsive design
 */
const RMLeaderboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [limit, setLimit] = useState(20);

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading, error } = useGetRMLeaderboardQuery({ limit });

  // Extract leaderboard array
  const leaderboard = leaderboardData?.data || [];

  // Find current user's rank
  const currentUserRank = leaderboard.findIndex((rm) => rm.id === user?.id) + 1;

  // Medal icons for top 3
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FiAward className="text-yellow-500" size={24} />;
      case 2:
        return <FiAward className="text-gray-400" size={24} />;
      case 3:
        return <FiAward className="text-orange-400" size={24} />;
      default:
        return <span className="text-gray-600 font-bold text-lg">#{rank}</span>;
    }
  };

  // Get rank badge color
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-300 to-orange-500 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <DashboardLayout role="hmr">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-orange rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <FiAward size={28} className="sm:w-9 sm:h-9" />
                RM Leaderboard
              </h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                Top performers ranked by salon approvals and performance scores
              </p>
            </div>
            {currentUserRank > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center">
                <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">Your Rank</p>
                <p className="text-4xl sm:text-5xl font-bold">{currentUserRank}</p>
                <p className="text-white/80 text-xs mt-1">out of {leaderboard.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Card */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FiTrendingUp className="text-accent-orange" />
                Top Relationship Managers
              </span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-accent-orange focus:border-transparent"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>
          }
        >
          {/* Loading State */}
          {isLoading && (
            <div className="py-12">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Rank</th>
                    <th className="px-6 py-4 text-left">RM Name</th>
                    <th className="px-6 py-4 text-center">Total Salons</th>
                    <th className="px-6 py-4 text-center">Active Salons</th>
                    <th className="px-6 py-4 text-center">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <FiXCircle size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600 font-body">Failed to load leaderboard</p>
              <p className="text-sm text-gray-500 mt-2">{error?.message || 'Please try again later'}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && leaderboard.length === 0 && (
            <div className="text-center py-12">
              <FiAward size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                No Rankings Yet
              </h3>
              <p className="text-gray-600 font-body">
                Be the first to add salons and earn your spot on the leaderboard!
              </p>
            </div>
          )}

          {/* Leaderboard Table */}
          {!isLoading && !error && leaderboard.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-4 text-sm font-body font-semibold text-gray-700">
                        Rank
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-body font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-body font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-1">
                          <FiStar className="text-yellow-500" />
                          Score
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-body font-semibold text-gray-700">
                        Salons Added
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-body font-semibold text-gray-700">
                        Approved
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-body font-semibold text-gray-700">
                        Approval Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((rm, index) => {
                      const rank = index + 1;
                      const isCurrentUser = rm.id === user?.id;
                      const approvalRate = rm.total_salons_added > 0
                        ? Math.round(((rm.approved_requests_count || rm.total_approved_salons || 0) / rm.total_salons_added) * 100)
                        : 0;

                      return (
                        <tr
                          key={rm.id}
                          className={`border-b border-gray-100 transition-all ${
                            isCurrentUser
                              ? 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4">
                            <div
                              className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getRankBadgeColor(
                                rank
                              )} font-bold shadow-sm`}
                            >
                              {getRankIcon(rank)}
                            </div>
                          </td>

                          {/* Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-body font-semibold text-gray-900">
                                  {rm.profiles?.full_name || rm.full_name || 'Unknown RM'}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500 font-body">{rm.profiles?.email || rm.email || 'N/A'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Score */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-2xl font-bold text-accent-orange">
                                {rm.performance_score || 0}
                              </span>
                            </div>
                          </td>

                          {/* Salons Added */}
                          <td className="py-4 px-4 text-center">
                            <span className="text-lg font-semibold text-gray-700">
                              {rm.total_salons_added || 0}
                            </span>
                          </td>

                          {/* Approved */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 rounded-full font-bold">
                              {rm.approved_requests_count || rm.total_approved_salons || 0}
                            </span>
                          </td>

                          {/* Approval Rate */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-bold text-gray-900">{approvalRate}%</span>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1 max-w-[80px]">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                                  style={{ width: `${approvalRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-3">
                {leaderboard.map((rm, index) => {
                  const rank = index + 1;
                  const isCurrentUser = rm.id === user?.id;
                  const approvalRate = rm.total_salons_added > 0
                    ? Math.round(((rm.approved_requests_count || rm.total_approved_salons || 0) / rm.total_salons_added) * 100)
                    : 0;

                  return (
                    <div
                      key={rm.id}
                      className={`rounded-lg p-4 border-2 ${
                        isCurrentUser
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getRankBadgeColor(
                              rank
                            )} font-bold shadow-sm text-sm`}
                          >
                            {rank <= 3 ? getRankIcon(rank) : `#${rank}`}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {rm.profiles?.full_name || rm.full_name || 'Unknown RM'}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{rm.profiles?.email || rm.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center bg-white rounded-lg p-2">
                          <p className="text-xs text-gray-600 mb-1">Score</p>
                          <p className="text-xl font-bold text-accent-orange">{rm.performance_score || 0}</p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-2">
                          <p className="text-xs text-gray-600 mb-1">Total</p>
                          <p className="text-xl font-bold text-gray-700">{rm.total_salons_added || 0}</p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-2">
                          <p className="text-xs text-gray-600 mb-1">Approved</p>
                          <p className="text-xl font-bold text-green-600">{rm.approved_requests_count || rm.total_approved_salons || 0}</p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-2">
                          <p className="text-xs text-gray-600 mb-1">Rate</p>
                          <p className="text-xl font-bold text-gray-900">{approvalRate}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full"
                              style={{ width: `${approvalRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer Info */}
          {!isLoading && !error && leaderboard.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 font-body">
                <div className="flex items-start gap-2">
                  <FiStar className="text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Scoring System</p>
                    <p>+100 for approvals, +50 for verified salons, -50 for rejections</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FiAward className="text-accent-orange mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Rankings Update</p>
                    <p>Leaderboard refreshes in real-time as salons are reviewed</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FiTrendingUp className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Climb Higher</p>
                    <p>Add more salons and maintain high approval rates to rank up</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RMLeaderboard;
