import React from 'react';
import { Link } from 'react-router-dom';

const placeholderImages = [
  { id: 1, label: 'Уличная фотосессия' },
  { id: 2, label: 'Студийный портрет' },
  { id: 3, label: 'Природа и пейзаж' },
  { id: 4, label: 'Интерьерная съёмка' },
  { id: 5, label: 'Архитектурное фото' },
  { id: 6, label: 'Корпоративное фото' },
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-transparent to-gray-950" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            AI-генерация фотографий
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">AI PhotoStudio</span>
            <br />
            <span className="text-white">Ваши фото в любых</span>
            <br />
            <span className="gradient-text">локациях мира</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Загрузите своё фото и выберите локацию — нейросеть перенесёт вас 
            в любое место за считанные секунды
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
            <span>🎨 50+ локаций</span>
            <span>🔒 Безопасно</span>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Примеры <span className="gradient-text">генераций</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Посмотрите, как AI PhotoStudio преображает обычные фотографии
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {placeholderImages.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900"
              >
                {/* Placeholder visual */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-purple-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">{img.label}</p>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Before/After labels */}
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
                description: 'Всего 1 секунда на генерацию фото в любой локации',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: '50+ уникальных локаций',
                description: 'От городских пейзажей до экзотических пляжей',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Высокое качество',
                description: 'Нейросеть сохраняет детализацию и естественность',
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
              Начните с бесплатного тарифа и создайте свои первые AI-фотографии
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
