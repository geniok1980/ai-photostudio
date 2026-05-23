import React, { useState, useEffect } from 'react';
import { 
  getAdminDashboard, getAdminUsers, updateUserAdmin, 
  getAdminLocations, createLocation, updateLocation, deleteLocation,
  getAdminPackages, createAdminPackage, updateAdminPackage,
  getMonitoringGenerations, getMonitoringPayments, checkOpenRouterStatus
} from '../lib/api';
import type { AdminDashboard, AdminChartData, UserAdmin, Location, Package, GenerationLog, PaymentLog } from '../lib/api';

type Tab = 'dashboard' | 'locations' | 'users' | 'packages' | 'monitoring';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // States
  const [dashboard, setDashboard] = useState<{ stats: AdminDashboard; charts: { generations: AdminChartData[]; income: AdminChartData[] } } | null>(null);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [genLogs, setGenLogs] = useState<GenerationLog[]>([]);
  const [payLogs, setPayLogs] = useState<PaymentLog[]>([]);
  const [orStatus, setOrStatus] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [editingLocation, setEditingLocation] = useState<Partial<Location> | null>(null);
  const [editingPackage, setEditingPackage] = useState<Partial<Package> | null>(null);

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
          setLocations(await getAdminLocations());
          break;
        case 'packages':
          setPackages(await getAdminPackages());
          break;
        case 'monitoring':
          setGenLogs(await getMonitoringGenerations());
          setPayLogs(await getMonitoringPayments());
          setOrStatus(await checkOpenRouterStatus());
          break;
      }
    } catch (err: any) {
      setError('Ошибка загрузки данных: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Locations Handlers ---
  const handleSaveLocation = async () => {
    try {
      if (editingLocation?.id) {
        const updated = await updateLocation(editingLocation.id, editingLocation);
        setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
      } else if (editingLocation) {
        const created = await createLocation(editingLocation);
        setLocations(prev => [...prev, created]);
      }
      setEditingLocation(null);
    } catch (err: any) {
      setError('Ошибка сохранения локации: ' + err.message);
    }
  };

  const handleMoveLocation = async (id: string, dir: -1 | 1) => {
    const idx = locations.findIndex(l => l.id === id);
    if (idx < 0) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= locations.length) return;

    const loc1 = locations[idx];
    const loc2 = locations[targetIdx];

    // Swap sort orders simply
    const newLoc1Order = loc2.sort_order || targetIdx;
    const newLoc2Order = loc1.sort_order || idx;

    try {
      await updateLocation(loc1.id, { sort_order: newLoc1Order });
      await updateLocation(loc2.id, { sort_order: newLoc2Order });
      loadTabData();
    } catch (err) {
      setError('Ошибка изменения порядка');
    }
  };

  // --- Users Handlers ---
  const handleToggleLocationActive = async (location: Location) => {
    try {
      const updated = await updateLocation(location.id, { is_active: !location.is_active });
      setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
    } catch (err) {
      setError('Ошибка обновления статуса');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await deleteLocation(id);
      setLocations(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      setError('Ошибка удаления локации');
    }
  };

  // --- Users Handlers ---
  const handleUserBalanceChange = async (userId: string, balance: number) => {
    try {
      const updated = await updateUserAdmin(userId, { balance_generations: balance });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (err) {
      setError('Ошибка обновления баланса');
    }
  };

  const handleUserToggleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      const updated = await updateUserAdmin(userId, { is_blocked: !isBlocked });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (err) {
      setError('Ошибка блокировки/разблокировки');
    }
  };

  // --- Packages Handlers ---
  const handleSavePackage = async () => {
    try {
      if (editingPackage?.id) {
        const updated = await updateAdminPackage(editingPackage.id, editingPackage);
        setPackages(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else if (editingPackage) {
        const created = await createAdminPackage(editingPackage);
        setPackages(prev => [...prev, created]);
      }
      setEditingPackage(null);
    } catch (err: any) {
      setError('Ошибка сохранения тарифа: ' + err.message);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Дашборд' },
    { id: 'locations', label: 'Локации' },
    { id: 'users', label: 'Пользователи' },
    { id: 'packages', label: 'Тарифы' },
    { id: 'monitoring', label: 'Мониторинг' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Панель администратора</h1>
          <p className="text-gray-400 mt-1">Управление платформой</p>
        </div>

        <div className="flex gap-2 mb-8 p-1 bg-gray-900 rounded-xl inline-flex flex-wrap">
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
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && dashboard && (
              <div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard title="Пользователи" value={dashboard.stats.totalUsers} color="blue" />
                  <StatCard title="Доход (₽)" value={dashboard.stats.totalRevenue} color="green" />
                  <StatCard title="Генерации" value={dashboard.stats.totalGenerations} color="purple" />
                  <StatCard title="Новые (30д)" value={dashboard.stats.recentUsers} color="indigo" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-bold text-white mb-4">Генерации по дням</h3>
                    <div className="h-48 flex items-end gap-2 mt-4">
                      {dashboard.charts.generations.map((d, i) => {
                        const max = Math.max(...dashboard.charts.generations.map(x => x.count || 0), 1);
                        const height = ((d.count || 0) / max) * 100;
                        return (
                          <div key={i} className="flex-1 bg-purple-600/50 hover:bg-purple-500 rounded-t-sm relative group" style={{ height: `${height}%` }}>
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded">
                              {d.date}: {d.count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-bold text-white mb-4">Доход по дням</h3>
                    <div className="h-48 flex items-end gap-2 mt-4">
                      {dashboard.charts.income.map((d, i) => {
                        const max = Math.max(...dashboard.charts.income.map(x => x.total || 0), 1);
                        const height = ((d.total || 0) / max) * 100;
                        return (
                          <div key={i} className="flex-1 bg-green-600/50 hover:bg-green-500 rounded-t-sm relative group" style={{ height: `${height}%` }}>
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded">
                              {d.date}: {d.total} ₽
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'locations' && (
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Управление локациями</h3>
                  <button onClick={() => setEditingLocation({ is_active: true, sort_order: locations.length })} className="px-4 py-2 bg-purple-600 rounded-lg text-sm text-white hover:bg-purple-700 transition-colors">
                    + Добавить
                  </button>
                </div>

                {editingLocation && (
                  <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input placeholder="Название" className="input-field" value={editingLocation.name || ''} onChange={e => setEditingLocation({...editingLocation, name: e.target.value})} />
                      <input placeholder="Категория" className="input-field" value={editingLocation.category || ''} onChange={e => setEditingLocation({...editingLocation, category: e.target.value})} />
                      <input placeholder="Prompt" className="input-field col-span-2" value={editingLocation.prompt || ''} onChange={e => setEditingLocation({...editingLocation, prompt: e.target.value})} />
                      <input placeholder="Preview URL" className="input-field col-span-2" value={editingLocation.preview_url || ''} onChange={e => setEditingLocation({...editingLocation, preview_url: e.target.value})} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveLocation} className="px-4 py-2 bg-green-600 rounded text-white text-sm hover:bg-green-700 transition-colors">Сохранить</button>
                      <button onClick={() => setEditingLocation(null)} className="px-4 py-2 bg-gray-600 rounded text-white text-sm hover:bg-gray-700 transition-colors">Отмена</button>
                    </div>
                  </div>
                )}

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
                                  style={{ backgroundImage: location.preview_url ? `url(${location.preview_url})` : 'none' }}
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
                              <span className={`px-2.5 py-1 text-xs rounded-full ${
                                location.is_active
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {location.is_active ? 'Активна' : 'Неактивна'}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleLocationActive(location)}
                                  className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                                >
                                  {location.is_active ? 'Деактивировать' : 'Активировать'}
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

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="pb-3 text-gray-400 font-medium">Сорт.</th>
                        <th className="pb-3 text-gray-400 font-medium">Название</th>
                        <th className="pb-3 text-gray-400 font-medium">Категория</th>
                        <th className="pb-3 text-gray-400 font-medium">Статус</th>
                        <th className="pb-3 text-gray-400 font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((loc) => (
                        <tr key={loc.id} className="border-b border-gray-800/50">
                          <td className="py-3 flex gap-1">
                            <button onClick={() => handleMoveLocation(loc.id, -1)} className="text-gray-400 hover:text-white">↑</button>
                            <button onClick={() => handleMoveLocation(loc.id, 1)} className="text-gray-400 hover:text-white">↓</button>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              {loc.preview_url && <img src={loc.preview_url} className="w-8 h-8 rounded object-cover" />}
                              <span className="text-white">{loc.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-gray-300">{loc.category}</td>
                          <td className="py-3">
                            <button onClick={async () => { await updateLocation(loc.id, { is_active: !loc.is_active }); loadTabData(); }} className={`px-2 py-1 rounded text-xs ${loc.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {loc.is_active ? 'Вкл' : 'Выкл'}
                            </button>
                          </td>
                          <td className="py-3 flex gap-2">
                            <button onClick={() => setEditingLocation(loc)} className="text-blue-400 text-sm">Ред.</button>
                            <button onClick={async () => { await deleteLocation(loc.id); loadTabData(); }} className="text-red-400 text-sm">Удал.</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="card">
                <h3 className="text-lg font-bold text-white mb-6">Управление пользователями</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="pb-3 text-gray-400">Email / Имя</th>
                        <th className="pb-3 text-gray-400">Роль</th>
                        <th className="pb-3 text-gray-400">Генерации</th>
                        <th className="pb-3 text-gray-400">Блокировка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800/50">
                          <td className="py-3">
                            <div className="text-white">{user.email}</div>
                            <div className="text-xs text-gray-400">{user.name}</div>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-300">{user.role}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2 items-center">
                              <input 
                                type="number" 
                                className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm" 
                                defaultValue={user.balance_generations}
                                onBlur={(e) => handleUserBalanceChange(user.id, parseInt(e.target.value))}
                              />
                            </div>
                          </td>
                          <td className="py-3">
                            <button 
                              onClick={() => handleUserToggleBlock(user.id, user.is_blocked)}
                              className={`px-3 py-1 text-xs rounded ${user.is_blocked ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-300'}`}
                            >
                              {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PACKAGES TAB */}
            {activeTab === 'packages' && (
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Управление тарифами</h3>
                  <button onClick={() => setEditingPackage({ is_active: true })} className="px-4 py-2 bg-purple-600 rounded-lg text-sm text-white">
                    + Создать тариф
                  </button>
                </div>

                {editingPackage && (
                  <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input placeholder="Название" className="input" value={editingPackage.name || ''} onChange={e => setEditingPackage({...editingPackage, name: e.target.value})} />
                      <input placeholder="Описание (промо)" className="input" value={editingPackage.description || ''} onChange={e => setEditingPackage({...editingPackage, description: e.target.value})} />
                      <input type="number" placeholder="Цена (₽)" className="input" value={editingPackage.price || ''} onChange={e => setEditingPackage({...editingPackage, price: parseInt(e.target.value)})} />
                      <input type="number" placeholder="Кол-во генераций" className="input" value={editingPackage.generations_count || ''} onChange={e => setEditingPackage({...editingPackage, generations_count: parseInt(e.target.value)})} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSavePackage} className="px-4 py-2 bg-green-600 rounded text-white text-sm">Сохранить</button>
                      <button onClick={() => setEditingPackage(null)} className="px-4 py-2 bg-gray-600 rounded text-white text-sm">Отмена</button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="pb-3 text-gray-400">Название</th>
                        <th className="pb-3 text-gray-400">Цена</th>
                        <th className="pb-3 text-gray-400">Генерации</th>
                        <th className="pb-3 text-gray-400">Статус</th>
                        <th className="pb-3 text-gray-400">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.map((pkg) => (
                        <tr key={pkg.id} className="border-b border-gray-800/50">
                          <td className="py-3 text-white">
                            {pkg.name}
                            {pkg.description && <div className="text-xs text-gray-400">{pkg.description}</div>}
                          </td>
                          <td className="py-3 text-white">{pkg.price} ₽</td>
                          <td className="py-3 text-white">{pkg.generations_count}</td>
                          <td className="py-3">
                            <button onClick={async () => { await updateAdminPackage(pkg.id, { is_active: !pkg.is_active }); loadTabData(); }} className={`px-2 py-1 rounded text-xs ${pkg.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {pkg.is_active ? 'Активен' : 'Архив'}
                            </button>
                          </td>
                          <td className="py-3">
                            <button onClick={() => setEditingPackage(pkg)} className="text-blue-400 text-sm">Ред.</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MONITORING TAB */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="card flex items-center gap-4">
                  <h3 className="text-lg font-bold text-white">Статус OpenRouter:</h3>
                  {orStatus?.status === 'ok' ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">Работает (Limit: {orStatus.data?.limit})</span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">Ошибка: {orStatus?.message}</span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-bold text-white mb-4">Логи генераций</h3>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="pb-2 text-gray-400">Время</th>
                            <th className="pb-2 text-gray-400">Email</th>
                            <th className="pb-2 text-gray-400">Локация</th>
                            <th className="pb-2 text-gray-400">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          {genLogs.map((log) => (
                            <tr key={log.id} className="border-b border-gray-800/30">
                              <td className="py-2 text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                              <td className="py-2 text-white">{log.user_email}</td>
                              <td className="py-2 text-white">{log.location_name}</td>
                              <td className="py-2">
                                <span className={log.status === 'completed' ? 'text-green-400' : log.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-bold text-white mb-4">Логи платежей</h3>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="pb-2 text-gray-400">Время</th>
                            <th className="pb-2 text-gray-400">Email</th>
                            <th className="pb-2 text-gray-400">Сумма</th>
                            <th className="pb-2 text-gray-400">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payLogs.map((log) => (
                            <tr key={log.id} className="border-b border-gray-800/30">
                              <td className="py-2 text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                              <td className="py-2 text-white">{log.user_email}</td>
                              <td className="py-2 text-white">{log.amount} {log.currency}</td>
                              <td className="py-2">
                                <span className={log.status === 'success' ? 'text-green-400' : log.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; color: 'blue' | 'green' | 'purple' | 'indigo' }> = ({ title, value, color }) => {
  const colorMap = {
    blue: 'border-blue-500/20 text-blue-400',
    green: 'border-green-500/20 text-green-400',
    purple: 'border-purple-500/20 text-purple-400',
    indigo: 'border-indigo-500/20 text-indigo-400',
  };

  return (
    <div className={`card border ${colorMap[color]} bg-gray-900/50`}>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-2">{title}</p>
    </div>
  );
};

export default Admin;