import React, { useState, useEffect } from 'react';
import { getGenerationHistory, getPaymentHistory } from '../lib/api';
import type { GenerationHistoryItem, Payment } from '../lib/api';

const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generations' | 'payments'>('generations');
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<GenerationHistoryItem | null>(null);

  useEffect(() => {
    if (activeTab === 'generations') {
      loadHistory();
    } else {
      loadPayments();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getGenerationHistory();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки истории');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await getPaymentHistory();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки платежей');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
            Готово
          </span>
        );
      case 'processing':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
            Обрабатывается
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20">
            В очереди / Ожидание
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
            Ошибка
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && history.length === 0 && payments.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedItem) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к истории
          </button>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedItem.location_name}</h2>
                <p className="text-sm text-gray-400 mt-1">{formatDate(selectedItem.created_at)}</p>
              </div>
              {getStatusBadge(selectedItem.status)}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Оригинал</p>
                <div
                  className="aspect-square rounded-xl bg-cover bg-center bg-gray-800"
                  style={{ backgroundImage: `url(${selectedItem.original_photo_url})` }}
                />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Результат</p>
                <div
                  className="aspect-square rounded-xl bg-cover bg-center bg-gray-800"
                  style={{ backgroundImage: selectedItem.result_url ? `url(${selectedItem.result_url})` : 'none' }}
                >
                  {!selectedItem.result_url && selectedItem.status === 'processing' && (
                    <div className="flex items-center justify-center h-full">
                      <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">История</h1>
            <p className="text-gray-400 mt-1">Все ваши активности в AI PhotoStudio</p>
          </div>

          <div className="flex p-1 rounded-xl bg-gray-800/50 border border-gray-700">
            <button
              onClick={() => setActiveTab('generations')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'generations'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Генерации
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'payments'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Платежи
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {activeTab === 'generations' ? (
          history.length === 0 && !loading ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">История пуста</h3>
              <p className="text-gray-400">Создайте свою первую AI-фотографию</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-800 cursor-pointer text-left"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: item.result_url ? `url(${item.result_url})` : 'none' }}
                  />
                  {!item.result_url && item.status === 'processing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <svg className="animate-spin h-5 w-5 text-purple-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute top-3 right-3">
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-medium text-sm truncate">{item.location_name}</h3>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(item.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          payments.length === 0 && !loading ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Платежей пока нет</h3>
              <p className="text-gray-400">Выберите тарифный план, чтобы пополнить баланс</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-gray-400 text-sm">
                    <th className="pb-2 pl-4">Пакет</th>
                    <th className="pb-2">Сумма</th>
                    <th className="pb-2">Статус</th>
                    <th className="pb-2">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="bg-gray-800/50 hover:bg-gray-800 transition-colors">
                      <td className="py-4 pl-4 rounded-l-2xl">
                        <div className="font-semibold text-white">{payment.package_name}</div>
                        <div className="text-xs text-gray-500">{payment.generations_count} генераций</div>
                      </td>
                      <td className="py-4 font-bold text-white">
                        {payment.amount} {payment.currency}
                      </td>
                      <td className="py-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="py-4 pr-4 rounded-r-2xl text-gray-400 text-sm">
                        {formatDate(payment.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default History;
