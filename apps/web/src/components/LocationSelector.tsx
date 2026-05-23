import React from 'react';

export interface Location {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
}

interface LocationSelectorProps {
  locations: Location[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  locations,
  selectedId,
  onSelect,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-xl bg-gray-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-400">Локации не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {locations.map((location) => {
        const isSelected = selectedId === location.id;
        return (
          <button
            key={location.id}
            onClick={() => onSelect(location.id)}
            className={`group relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-200 ${
              isSelected
                ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-950 scale-[1.02]'
                : 'hover:scale-[1.02]'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url(${location.imageUrl})` }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/10 backdrop-blur-sm text-white/90">
                {location.category}
              </span>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
              <h3 className="text-white font-semibold text-sm">{location.name}</h3>
              <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{location.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default LocationSelector;
