import React, { useState, useEffect } from 'react';
import { getPackages, createPaymentLink } from '../lib/api';
import type { Package } from '../lib/api';

const Pricing: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await getPackages();
      // Add default features if not present
      const enhancedPackages = data.map(pkg => ({
        ...pkg,
        features: pkg.features || [
          `${pkg.generations_count === -1 ? 'Безлимитные' : pkg.generations_count} генераций`,
          'Все локации',
          'Высокое качество',
          'Без водяного знака',
          'Приоритетная обработка'
        ]
      }));
      setPackages(enhancedPackages);
    } catch {
      // Fallback demo data if API not available
      setPackages([
        {
          id: '1',
          name: 'Пробный',
          price: 0,
          generations_count: 2,
          description: 'Попробуйте AI PhotoStudio бесплатно',
          features: ['2 генерации', '5 доступных локаций', 'Базовое качество', 'Водяной знак'],
        },
        {
          id: '2',
          name: 'Стартовый',
          price: 299,
          generations_count: 10,
          description: 'Для occasional использования',
          isPopular: false,
          features: ['10 генераций', 'Все локации', 'Высокое качество', 'Без водяного знака', 'Приоритетная обработка'],
        },
        {
          id: '3',
          name: 'Оптимальный',
          price: 599,
          generations_count: 30,
          description: '30 генераций — лучшая цена',
          isPopular: true,
          features: ['30 генераций', 'Все локации', 'Максимальное качество', 'Без водяного знака', 'Приоритетная обработка', 'API доступ'],
        },
        {
          id: '4',
          name: 'PRO',
          price: 1499,
          generations_count: 100,
          description: 'Для активных пользователей',
          isPopular: false,
          features: ['100 генераций', 'Все локации', 'Максимальное качество', 'Без водяного знака', 'Приоритет 24/7', 'API доступ', 'Персональный менеджер'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = async (pkg: Package) => {
    if (pkg.price === 0) {
      // Free plan - redirect to register
      window.location.href = '/auth/register';
      return;
    }

    const token = localStorage.getItem('jwt');
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    try {
      const res = await createPaymentLink(pkg.id);
      window.location.href = res.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания платежа');
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Бесплатно';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-gray-950 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-4">
            💎 Доступные тарифы
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Выберите ваш <span className="gradient-text">тариф</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Начните с бесплатного тарифа или выберите подходящий пакет генераций
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative card flex flex-col transition-all duration-200 hover:border-purple-500/30 ${
                pkg.isPopular
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/5'
                  : ''
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    Популярный
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{pkg.description}</p>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-white">
                  {formatPrice(pkg.price)}
                </div>
                {pkg.price > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    {pkg.generations_count === -1
                      ? '∞ генераций'
                      : `${pkg.generations_count} генераций`}
                  </p>
                )}
                {pkg.price === 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    {pkg.generations_count} бесплатных генераций
                  </p>
                )}
              </div>

              <div className="flex-1">
                <ul className="space-y-3">
                  {pkg.features?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPackage(pkg)}
                className={`mt-6 w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                  pkg.isPopular
                    ? 'btn-primary'
                    : pkg.price === 0
                    ? 'btn-secondary'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                }`}
              >
                {pkg.price === 0 ? 'Начать бесплатно' : `Купить за ${pkg.price} ₽`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
