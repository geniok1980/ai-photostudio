import React, { useState, useEffect, useCallback } from 'react';
import PhotoUploader from '../components/PhotoUploader';
import LocationSelector from '../components/LocationSelector';
import type { Location } from '../components/LocationSelector';
import { getLocations, generatePhoto, getGenerationHistory } from '../lib/api';
import type { GenerationResult, GenerationHistoryItem } from '../lib/api';

const Dashboard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [recentHistory, setRecentHistory] = useState<GenerationHistoryItem[]>([]);

  useEffect(() => {
    loadLocations();
    loadHistory();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch {
      // If API not available, use empty
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getGenerationHistory();
      setRecentHistory(data.slice(0, 4));
    } catch {
      // silent
    }
  };

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setResult(null);
    setError('');
  }, []);

  const handleLocationSelect = useCallback((id: string) => {
    setSelectedLocation(id);
    setError('');
  }, []);

  const handleGenerate = async () => {
    if (!selectedFile || !selectedLocation) {
      setError('Пожалуйста, выберите фото и локацию');
      return;
    }

    setGenerating(true);
    setError('');
    setResult(null);

    try {
      const res = await generatePhoto(selectedFile, selectedLocation);
      setResult(res);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Генерация фото</h1>
          <p className="text-gray-400 mt-1">
            Загрузите фото и выберите локацию для преобразования
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Upload + Generate */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Загрузить фото</h2>
              <PhotoUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedFile || !selectedLocation || generating}
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
              ) : (
                'Сгенерировать'
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Результат</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Оригинал</p>
                    <div
                      className="aspect-square rounded-xl bg-cover bg-center bg-gray-800"
                      style={{ backgroundImage: `url(${result.originalUrl})` }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Результат</p>
                    <div
                      className="aspect-square rounded-xl bg-cover bg-center bg-gray-800"
                      style={{ backgroundImage: `url(${result.resultUrl})` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Локация: {result.locationName}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Locations */}
          <div className="lg:col-span-3">
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Выберите локацию</h2>
              <LocationSelector
                locations={locations}
                selectedId={selectedLocation}
                onSelect={handleLocationSelect}
                loading={locationsLoading}
              />
            </div>

            {/* Recent History */}
            {recentHistory.length > 0 && (
              <div className="card mt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Последние генерации</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {recentHistory.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-xl bg-cover bg-center bg-gray-800 relative group cursor-pointer overflow-hidden"
                      style={{ backgroundImage: `url(${item.resultUrl})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs text-white/90 truncate">{item.locationName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
