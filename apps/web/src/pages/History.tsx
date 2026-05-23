import React, { useState, useEffect } from 'react';
import { getGenerationHistory } from '../lib/api';
import type { GenerationHistoryItem } from '../lib/api';

const History: React.FC = () => {
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<GenerationHistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getGenerationHistory();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки истории');
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
            В очереди
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
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
                <h2 className="text-xl font-semibold text-white">{selectedItem.locationName}</h2>
                <p className="text-sm text-gray-400 mt-1">{formatDate(selectedItem.createdAt)}</p>
              </div>
              {getStatusBadge(selectedItem.status)}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Оригинал</p>
                <div
                  className="aspect-square rounded-xl bg-cover bg-center bg-gray-800"
                  style={{ backgroundImage: `url(${selectedItem.originalUrl})` }}
                />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Результат</p>
                <div
                  className="aspect-square rounded-xl bg-cover bg-center bg-gray-800"
                  style={{ backgroundImage: `url(${selectedItem.resultUrl})` }}
                />
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">История генераций</h1>
          <p className="text-gray-400 mt-1">Все ваши созданные AI-фотографии</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {history.length === 0 ? (
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
                  style={{ backgroundImage: `url(${item.resultUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(item.status)}
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-medium text-sm truncate">{item.locationName}</h3>
                  <p className="text-gray-400 text-xs mt-1">{formatDate(item.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
