import React, { useState, useEffect } from 'react';
import { getAdminDashboard, getAdminUsers, getLocations, deleteLocation, updateLocation, updateUserRole } from '../lib/api';
import type { AdminDashboard, UserAdmin, Location } from '../lib/api';

type Tab = 'dashboard' | 'locations' | 'users';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'dashboard':
          setDashboard(await getAdminDashboard());
          break;
        case 'users':
          setUsers(await getAdminUsers());
          break;
        case 'locations':
          setLocations(await getLocations());
          break;
      }
    } catch (err) {
      // If API not available, load demo data
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    if (activeTab === 'dashboard') {
      setDashboard({
        totalUsers: 0,
        totalRevenue: 0,
        totalGenerations: 0,
        recentUsers: 0,
      });
    } else if (activeTab === 'users') {
      setUsers([]);
    } else if (activeTab === 'locations') {
      setLocations([]);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await deleteLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError('Ошибка удаления локации');
    }
  };

  const handleToggleLocationActive = async (location: Location) => {
    try {
      const updated = await updateLocation(location.id, { isActive: !location.isActive });
      setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch {
      setError('Ошибка обновления локации');
    }
  };

  const handleToggleUserRole = async (user: UserAdmin) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const updated = await updateUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch {
      setError('Ошибка обновления роли');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Дашборд',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'locations',
      label: 'Локации',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Пользователи',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Панель администратора</h1>
          <p className="text-gray-400 mt-1">Управление системой AI PhotoStudio</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-gray-900 rounded-xl inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && dashboard && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Всего пользователей"
                  value={dashboard.totalUsers}
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  color="blue"
                />
                <StatCard
                  title="Выручка"
                  value={`${dashboard.totalRevenue.toLocaleString('ru-RU')} ₽`}
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  color="green"
                />
                <StatCard
                  title="Всего генераций"
                  value={dashboard.totalGenerations}
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  color="purple"
                />
                <StatCard
                  title="Новых за месяц"
                  value={dashboard.recentUsers}
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  }
                  color="indigo"
                />
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === 'locations' && (
              <div className="card">
                {locations.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Локации не найдены</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="pb-3 text-sm font-medium text-gray-400">Название</th>
                          <th className="pb-3 text-sm font-medium text-gray-400">Категория</th>
                          <th className="pb-3 text-sm font-medium text-gray-400">Статус</th>
                          <th className="pb-3 text-sm font-medium text-gray-400">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {locations.map((location) => (
                          <tr key={location.id} className="border-b border-gray-800/50">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg bg-cover bg-center bg-gray-700"
                                  style={{ backgroundImage: `url(${location.imageUrl})` }}
                                />
                                <span className="text-white font-medium">{location.name}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="px-2.5 py-1 text-xs rounded-full bg-gray-800 text-gray-300">
                                {location.category}
                              </span>
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2.5 py-1 text-xs rounded-full ${
                                  location.isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {location.isActive ? 'Активна' : 'Неактивна'}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleLocationActive(location)}
                                  className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                                >
                                  {location.isActive ? 'Деактивировать' : 'Активировать'}
                                </button>
                                <button
                                  onClick={() => handleDeleteLocation(location.id)}
                                  className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                >
                                  Удалить
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="card">
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Пользователи не найдены</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="pb-3 text-sm font-medium text-gray-400">Имя</th>
                          <th className="pb-3 text-sm font-medium text-gray-400">Email</th>
                          <th className="pb-3 text-sm font-medium text-gray-400">Роль</th>
                          <th className="pb-3 text-sm font-medium text-gray-400">Генерации</th>
                          <th className="pb-3 text-sm font-medium text-gray-400">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-800/50">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-white font-medium">{user.name}</span>
                              </div>
                            </td>
                            <td className="py-4 text-gray-300">{user.email}</td>
                            <td className="py-4">
                              <span
                                className={`px-2.5 py-1 text-xs rounded-full ${
                                  user.role === 'admin'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-gray-800 text-gray-300'
                                }`}
                              >
                                {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                              </span>
                            </td>
                            <td className="py-4 text-gray-300">{user.generationsCount}</td>
                            <td className="py-4">
                              <button
                                onClick={() => handleToggleUserRole(user)}
                                className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                              >
                                {user.role === 'admin' ? 'Сделать пользователем' : 'Сделать админом'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400',
    indigo: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{title}</p>
    </div>
  );
};

export default Admin;
