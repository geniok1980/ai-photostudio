import React, { useState, useEffect } from 'react';
import { getLocations, getModes, getConcepts, getCategories, generatePhoto, getMe } from '../lib/api';

interface Mode {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
}

interface Concept {
  id: string;
  mode_id: string;
  name: string;
  display_name: string;
  description: string;
  prompt_template: string;
}

interface Category {
  id: string;
  name: string;
  display_name: string;
  icon: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  balance_generations: number;
  spark_balance: number;
  free_attempts_used: number;
}

const ProductDashboard: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'portrait' | 'product' | 'interior'>('portrait');
  const [modes, setModes] = useState<Mode[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modesData, conceptsData, categoriesData] = await Promise.all([
        getModes(),
        getConcepts(),
        getCategories(),
      ]);
      setModes(modesData);
      setConcepts(conceptsData);
      setCategories(categoriesData);
    } catch {
      // silent
    }
    try {
      const data = await getMe();
      setUser(data.user);
    } catch {
      // not logged in
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setResult(null);
    setError('');
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите фото');
      return;
    }

    if (activeMode === 'product') {
      if (!selectedConcept) {
        setError('Пожалуйста, выберите концепцию');
        return;
      }
    }

    if (activeMode === 'interior') {
      if (!selectedConcept) {
        setError('Пожалуйста, выберите стиль интерьера');
        return;
      }
    }

    setGenerating(true);
    setError('');
    setResult(null);

    try {
      const res = await generatePhoto(selectedFile, {
        modeId: activeMode === 'product' ? 'product' : activeMode === 'interior' ? 'interior' : undefined,
        conceptId: selectedConcept || undefined,
        categoryId: selectedCategory || undefined,
        productDescription: activeMode === 'product' ? productDescription : activeMode === 'interior' ? 'room' : undefined,
      });

      setError('Генерация запущена! Результат появится в истории через несколько секунд.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-96 rounded-2xl bg-gray-800 animate-pulse" />
        </div>
      </div>
    );
  }

  const productConcepts = concepts.filter(c => c.mode_id === modes.find(m => m.name === 'product')?.id);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with balance */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">AI PhotoStudio</h1>
            <p className="text-gray-400 mt-1">
              {activeMode === 'portrait'
                ? 'Загрузите своё фото и выберите локацию для преобразования'
                : 'Создайте студийные фото товаров для маркетплейсов'}
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-4 bg-gray-800/50 border border-gray-700 p-4 rounded-2xl">
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Spark</p>
                <p className="text-xl font-bold text-white">
                  {user.spark_balance} <span className="text-yellow-400">✦</span>
                </p>
              </div>
              <div className="w-px h-8 bg-gray-700" />
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Генерации</p>
                <p className="text-xl font-bold text-white">
                  {user.balance_generations} <span className="text-purple-400">шт.</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-3 mb-6">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.name as 'portrait' | 'product' | 'interior');
                setError('');
                setResult(null);
              }}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-left transition-all duration-200 ${
                activeMode === mode.name
                  ? 'bg-purple-600/20 border-2 border-purple-500/50 text-white'
                  : 'bg-gray-800/50 border-2 border-gray-700/50 text-gray-400 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{mode.icon}</span>
              <div>
                <p className="font-semibold">{mode.display_name}</p>
                <p className="text-xs opacity-70 mt-0.5">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">
                {activeMode === 'portrait' ? 'Загрузите своё фото' : 'Загрузите фото товара'}
              </h2>

              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-colors bg-gray-800/30">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Нажмите для загрузки</span>
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG (макс. 10MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {selectedFile.name}
                </div>
              )}
            </div>

            {/* Product-specific fields */}
            {activeMode === 'product' && (
              <>
                <div className="card">
                  <h2 className="text-lg font-semibold text-white mb-4">Категория товара</h2>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-xs ${
                          selectedCategory === cat.id
                            ? 'bg-purple-600/20 border border-purple-500/50 text-white'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-center leading-tight">{cat.display_name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-white mb-4">Концепция съёмки</h2>
                  <div className="space-y-2">
                    {productConcepts.map((concept) => (
                      <button
                        key={concept.id}
                        onClick={() => setSelectedConcept(concept.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedConcept === concept.id
                            ? 'bg-purple-600/20 border border-purple-500/50'
                            : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
                        }`}
                      >
                        <p className="font-semibold text-white">{concept.display_name}</p>
                        <p className="text-xs text-gray-400 mt-1">{concept.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-white mb-4">Описание товара</h2>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Например: мужские кожаные кроссовки, белого цвета, с красными вставками..."
                    className="w-full bg-gray-800/80 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none h-24"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Подробное описание помогает AI точнее сгенерировать изображение
                  </p>
                </div>
              </>
            )}

            {/* Interior-specific fields */}
            {activeMode === 'interior' && (
              <>
                <div className="card">
                  <h2 className="text-lg font-semibold text-white mb-4">Стиль интерьера</h2>
                  <div className="space-y-2">
                    {concepts.filter(c => c.mode_id === modes.find(m => m.name === 'interior')?.id).map((concept) => (
                      <button
                        key={concept.id}
                        onClick={() => setSelectedConcept(concept.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedConcept === concept.id
                            ? 'bg-purple-600/20 border border-purple-500/50'
                            : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
                        }`}
                      >
                        <p className="font-semibold text-white">{concept.display_name}</p>
                        <p className="text-xs text-gray-400 mt-1">{concept.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-lg font-semibold text-white mb-4">Описание помещения</h2>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Например: гостиная с большими окнами, светлые стены, деревянный пол..."
                    className="w-full bg-gray-800/80 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none h-24"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Опишите текущее помещение — AI преобразует его в выбранном стиле
                  </p>
                </div>
              </>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedFile || generating || (activeMode === 'product' && !selectedConcept) || (activeMode === 'interior' && !selectedConcept)}
              className="btn-primary w-full text-lg py-4"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Генерация...
                </span>
              ) : activeMode === 'portrait' ? (
                'Сгенерировать портрет'
              ) : activeMode === 'interior' ? (
                'Сгенерировать интерьер'
              ) : (
                'Сгенерировать фото товара'
              )}
            </button>

            {error && (
              <div className={`p-3 rounded-xl border text-sm ${
                error.includes('запущена')
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {error}
              </div>
            )}

            {result && (
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Результат</h2>
                <img src={result} alt="Generated" className="w-full rounded-xl" />
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">
                {activeMode === 'portrait' ? 'Выберите локацию' : 'Как это работает'}
              </h2>
              {activeMode === 'interior' ? (
                <div className="space-y-4 text-sm text-gray-400">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="text-white font-medium">Сфотографируйте комнату</p>
                      <p className="text-xs mt-1">Подойдёт любое фото интерьера</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="text-white font-medium">Выберите стиль</p>
                      <p className="text-xs mt-1">Современный, классика, лофт, минимализм или скандинавский</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="text-white font-medium">Получите дизайн интерьера</p>
                      <p className="text-xs mt-1">Готово для дизайн-проекта или визуализации</p>
                    </div>
                  </div>
                </div>
              ) : activeMode === 'product' ? (
                <div className="space-y-4 text-sm text-gray-400">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="text-white font-medium">Загрузите фото товара</p>
                      <p className="text-xs mt-1">Подойдёт обычное фото на смартфон</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="text-white font-medium">Выберите концепцию</p>
                      <p className="text-xs mt-1">Каталожный снимок, на модели или композиция</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="text-white font-medium">Получите студийное фото</p>
                      <p className="text-xs mt-1">Готово для Wildberries, Ozon и других маркетплейсов</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Выберите режим «Товарная съёмка» для создания фото товаров</p>
              )}
            </div>

            {/* Spark Pricing Preview */}
            <div className="card bg-gradient-to-br from-purple-950/30 to-gray-900/30 border-purple-500/20">
              <h2 className="text-lg font-semibold text-white mb-2">Spark — виртуальная валюта</h2>
              <p className="text-sm text-gray-400 mb-4">
                1 изображение = 4 ✦ Sparks. Покупайте пакеты на странице тарифов.
              </p>
              <a href="/pricing" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Посмотреть тарифы →
              </a>
            </div>

            {/* Quick Tips */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">
                {activeMode === 'interior' ? 'Советы по интерьеру' : 'Советы'}
              </h2>
              {activeMode === 'interior' ? (
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Фотографируйте комнату при хорошем освещении</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Уберите лишние предметы для лучшего результата</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Современный стиль — для светлых помещений</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Лофт отлично работает с индустриальными помещениями</span>
                  </li>
                </ul>
              ) : (
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Используйте фото на белом фоне для лучшего результата</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Для ювелирки выбирайте концепцию «Композиция»</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Для одежды — «На модели» для лучшей презентации</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Подробное описание товара улучшает качество генерации</span>
                </li>
              </ul>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;
