import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: '👤',
    title: 'Портретная съёмка',
    description: 'Загрузите своё фото и окажитесь в любом месте мира — от пляжа на закате до космоса. Идеально для соцсетей и аватаров.',
    features: ['50+ уникальных локаций', 'Мгновенная генерация', 'Фотореалистичное качество'],
    link: '/auth/register',
    linkText: 'Создать портрет',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    icon: '📦',
    title: 'Товарная съёмка',
    description: 'Создавайте студийные фото товаров для Wildberries, Ozon и других маркетплейсов. Без фотостудии и фотографа.',
    features: ['7 категорий товаров', '3 концепции съёмки', 'Готовая инфографика'],
    link: '/auth/register',
    linkText: 'Снять товар',
    gradient: 'from-green-500 to-teal-600',
  },
  {
    icon: '🏠',
    title: 'Интерьерная съёмка',
    description: 'Преобразите интерьер вашей комнаты в любом стиле — от современного до лофта. Готово для дизайн-проекта.',
    features: ['5 стилей интерьера', 'Сохраняет планировку', 'Дизайн за 1 минуту'],
    link: '/auth/register',
    linkText: 'Изменить интерьер',
    gradient: 'from-amber-500 to-orange-600',
  },
];

const placeholderImages = [
  { id: 1, label: 'Портретная съёмка', icon: '👤' },
  { id: 2, label: 'Товарная съёмка', icon: '📦' },
  { id: 3, label: 'Интерьерная съёмка', icon: '🏠' },
  { id: 4, label: '50+ локаций', icon: '🌍' },
  { id: 5, label: 'Мгновенно', icon: '⚡' },
  { id: 6, label: 'Высокое качество', icon: '✨' },
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-transparent to-gray-950" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            AI-генерация фотографий, товаров и интерьеров
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">AI PhotoStudio</span>
            <br />
            <span className="text-white">Портреты, товары и интерьеры</span>
            <br />
            <span className="gradient-text">на основе нейросетей</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Загрузите фото и получите профессиональный результат за секунды — 
            портрет в любой точке мира, студийное фото товара или дизайн интерьера
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="btn-primary text-lg px-8 py-4"
            >
              Начать бесплатно
            </Link>
            <Link
              to="/pricing"
              className="btn-secondary text-lg px-8 py-4"
            >
              Посмотреть цены
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
            <span>⚡ 1 секунда</span>
            <span>🎨 Портреты, товары, интерьеры</span>
            <span>🔒 Безопасно</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Три формата — <span className="gradient-text">одна платформа</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              AI PhotoStudio умеет работать с портретами, товарами и интерьерами. 
              Выберите то, что нужно
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div
                key={i}
                className="card flex flex-col hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div className="text-5xl mb-6">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 text-sm mb-6 flex-1">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to={service.link}
                  className={`w-full text-center py-3 rounded-xl text-sm font-medium bg-gradient-to-r ${service.gradient} text-white hover:opacity-90 transition-opacity`}
                >
                  {service.linkText} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portrait Section */}
      <section className="py-20 px-4 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Портретная съёмка
              </h2>
              <p className="text-gray-400 mb-6">
                Загрузите свою фотографию и выберите любую локацию — нейросеть 
                перенесёт вас в любое место мира за секунду. От тропического пляжа 
                до космического пространства.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['50+ локаций', 'Фотореализм', 'Мгновенно', 'Без водяного знака'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link to="/auth/register" className="btn-primary inline-block">
                Попробовать портрет
              </Link>
            </div>
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-900/30 to-gray-900 flex items-center justify-center border border-purple-500/10">
              <div className="text-center">
                <div className="text-6xl mb-4">🌍</div>
                <p className="text-gray-500 text-sm">Любая локация мира</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Photography Section */}
      <section className="py-20 px-4 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-900/30 to-gray-900 flex items-center justify-center border border-green-500/10">
                <div className="text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-500 text-sm">Готово для маркетплейсов</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-4xl mb-4">📦</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Товарная съёмка
              </h2>
              <p className="text-gray-400 mb-6">
                Создавайте профессиональные фото товаров для Wildberries, Ozon и 
                других маркетплейсов без фотостудии и фотографа. Выбирайте концепцию 
                съёмки — каталожный снимок, на модели или композиция.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['7 категорий', '3 концепции', 'Инфографика', 'Без фона'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link to="/auth/register" className="inline-block px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-green-500 to-teal-600 text-white hover:opacity-90 transition-opacity">
                Начать товарную съёмку
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interior Photography Section */}
      <section className="py-20 px-4 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-4xl mb-4">🏠</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Интерьерная съёмка
              </h2>
              <p className="text-gray-400 mb-6">
                Преобразите интерьер вашей комнаты в любом стиле — от современного 
                минимализма до брутального лофта. AI сохраняет планировку и освещение, 
                меняя отделку, мебель и декор.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['5 стилей', 'Сохраняет планировку', 'Для дизайн-проектов', 'Быстро'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link to="/auth/register" className="inline-block px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 transition-opacity">
                Попробовать интерьер
              </Link>
            </div>
            <div>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-900/30 to-gray-900 flex items-center justify-center border border-amber-500/10">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏠</div>
                  <p className="text-gray-500 text-sm">Любой стиль интерьера</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-20 px-4 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Примеры <span className="gradient-text">генераций</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Посмотрите, как AI PhotoStudio преображает портреты, товары и интерьеры
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {placeholderImages.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{img.icon}</div>
                    <p className="text-gray-500 text-sm">{img.label}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="flex-1 text-center text-xs py-1 rounded-lg bg-white/10 text-white/80 backdrop-blur-sm">
                    До / После
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Почему <span className="gradient-text">AI PhotoStudio</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Мгновенный результат',
                description: 'Всего 1 секунда на генерацию портрета, товара или интерьера',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                title: 'Три формата',
                description: 'Портреты, товарная и интерьерная съёмка — всё в одном сервисе',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Высокое качество',
                description: 'Нейросеть сохраняет детализацию и естественность в любом формате',
              },
            ].map((feature, i) => (
              <div key={i} className="card text-center hover:border-purple-500/30 transition-colors duration-200">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-purple-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card border-purple-500/20 bg-gradient-to-b from-purple-950/30 to-gray-900">
            <h2 className="text-3xl font-bold mb-4">
              Готовы попробовать?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Начните с бесплатного тарифа — 2 бесплатных генерации любого формата
            </p>
            <Link
              to="/auth/register"
              className="btn-primary text-lg px-8 py-4 inline-block"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <span className="text-sm font-semibold gradient-text">AI PhotoStudio</span>
          </div>
          <p className="text-gray-600 text-sm">© 2024 AI PhotoStudio. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
