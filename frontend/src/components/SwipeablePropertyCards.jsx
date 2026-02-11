/**
 * @fileoverview Swipeable Property Cards Component
 * @description Tinder-style swipeable card interface for browsing properties
 * 
 * UX Research Applied:
 * - Fitts's Law: Large touch targets, swipe gestures in thumb zone
 * - Miller's Law: Show one card at a time to reduce cognitive load
 * - Progressive Disclosure: Details on demand (expand card)
 * - Memory Efficiency: Only render 3 cards (prev, current, next)
 * 
 * Technical Approach:
 * - CSS scroll-snap for native-feeling swipes (no heavy libraries)
 * - Virtual rendering for 1000+ property performance
 * - Touch and mouse gesture support
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

/**
 * Format currency for display
 */
const formatCurrency = (value) => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Single Property Card - Optimized for swipe display
 */
function PropertySwipeCard({ property, isActive, onExpand }) {
  const getRealtorSearchUrl = (address, city) => {
    const searchQuery = encodeURIComponent(`site:realtor.com ${address} ${city} CT`);
    return `https://www.google.com/search?q=${searchQuery}`;
  };

  return (
    <div 
      className={`
        flex-shrink-0 w-full h-full snap-center
        flex items-center justify-center p-4
        transition-opacity duration-300
        ${isActive ? 'opacity-100' : 'opacity-40'}
      `}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Property Image Placeholder / Gradient Header */}
        <div className="h-32 bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-30">🏠</span>
          </div>
          {/* Price Badge */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-lg">
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(property.price)}
            </span>
          </div>
          {/* Property Type Badge */}
          {property.metadata?.propertyType && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur px-2 py-1 rounded-full">
              <span className="text-xs font-medium text-white">
                {property.metadata.propertyType}
              </span>
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="p-4">
          {/* Address */}
          <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
            {property.address}
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            {property.city}, CT
          </p>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            {property.metadata?.bedrooms && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🛏️</span>
                <span className="font-medium text-slate-700">
                  {property.metadata.bedrooms} bed
                </span>
              </div>
            )}
            {property.metadata?.bathrooms && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🚿</span>
                <span className="font-medium text-slate-700">
                  {property.metadata.bathrooms} bath
                </span>
              </div>
            )}
            {property.metadata?.squareFeet && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">📐</span>
                <span className="font-medium text-slate-700">
                  {property.metadata.squareFeet.toLocaleString()} sqft
                </span>
              </div>
            )}
          </div>

          {/* Assessed Value */}
          {property.metadata?.assessedValue && (
            <p className="text-xs text-slate-500 mb-3">
              Assessed: {formatCurrency(property.metadata.assessedValue)}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={getRealtorSearchUrl(property.address, property.city)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl text-center transition-colors"
            >
              View on Realtor.com
            </a>
            <button
              onClick={() => onExpand?.(property)}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Property Detail Modal - Shown when "Details" is clicked
 */
function PropertyDetailModal({ property, onClose }) {
  if (!property) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Property Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{property.address}</h3>
            <p className="text-slate-600">{property.city}, CT</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Price</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(property.price)}</p>
            </div>
            {property.metadata?.assessedValue && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Assessed</p>
                <p className="text-lg font-bold text-slate-700">{formatCurrency(property.metadata.assessedValue)}</p>
              </div>
            )}
            {property.metadata?.bedrooms && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Bedrooms</p>
                <p className="text-lg font-bold text-slate-700">{property.metadata.bedrooms}</p>
              </div>
            )}
            {property.metadata?.bathrooms && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Bathrooms</p>
                <p className="text-lg font-bold text-slate-700">
                  {property.metadata.bathrooms}
                  {property.metadata.halfBathrooms > 0 && ` + ${property.metadata.halfBathrooms} half`}
                </p>
              </div>
            )}
            {property.metadata?.squareFeet && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Square Feet</p>
                <p className="text-lg font-bold text-slate-700">{property.metadata.squareFeet.toLocaleString()}</p>
              </div>
            )}
            {property.metadata?.lotSize && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Lot Size</p>
                <p className="text-lg font-bold text-slate-700">{property.metadata.lotSize} acres</p>
              </div>
            )}
            {property.metadata?.yearBuilt && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Year Built</p>
                <p className="text-lg font-bold text-slate-700">{property.metadata.yearBuilt}</p>
              </div>
            )}
            {property.metadata?.style && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Style</p>
                <p className="text-lg font-bold text-slate-700">{property.metadata.style}</p>
              </div>
            )}
            {(property.metadata?.heating || property.metadata?.cooling) && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">HVAC</p>
                <p className="text-lg font-bold text-slate-700">
                  {[property.metadata.heating, property.metadata.cooling].filter(Boolean).join(' / ')}
                </p>
              </div>
            )}
            {property.metadata?.propertyType && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Type</p>
                <p className="text-lg font-bold text-slate-700">{property.metadata.propertyType}</p>
              </div>
            )}
          </div>

          {/* Photo Link */}
          {property.metadata?.photoUrl && (
            <a
              href={property.metadata.photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold rounded-xl transition-colors"
            >
              📷 View Property Photo
            </a>
          )}

          {/* External Link */}
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`site:realtor.com ${property.address} ${property.city} CT`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-center font-semibold rounded-xl transition-colors"
          >
            🔍 Search on Realtor.com
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Swipeable Property Cards Component
 * 
 * Performance optimizations:
 * - Virtual rendering: Only 3 cards in DOM at a time
 * - CSS scroll-snap: Native swipe feel without JS overhead
 * - Auto-loading: Fetches more results when user approaches end
 */
function SwipeablePropertyCards({ properties = [], pagination, onPageChange, onLoadMore, loading }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedProperty, setExpandedProperty] = useState(null);
  const scrollContainerRef = useRef(null);

  // Reset index when properties change (but not when appending)
  const prevPropertiesLengthRef = useRef(properties.length);
  useEffect(() => {
    // Only reset if this is a new search (length decreased or went to 0)
    if (properties.length < prevPropertiesLengthRef.current || properties.length === 0) {
      setCurrentIndex(0);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'instant' });
      }
    }
    prevPropertiesLengthRef.current = properties.length;
  }, [properties.length]);

  // Auto-load more when approaching end (3 cards from end)
  useEffect(() => {
    const shouldLoadMore = 
      currentIndex >= properties.length - 3 && 
      pagination && 
      pagination.page < pagination.totalPages && 
      !loading;
    
    if (shouldLoadMore) {
      console.log('[SwipeablePropertyCards] Auto-loading more properties...');
      onLoadMore?.();
    }
  }, [currentIndex, properties.length, pagination, loading, onLoadMore]);

  // Calculate which cards to render (memory optimization)
  // Only render current card ± 2 for smooth swiping
  const visibleCards = useMemo(() => {
    if (properties.length === 0) return [];
    
    const start = Math.max(0, currentIndex - 2);
    const end = Math.min(properties.length, currentIndex + 3);
    
    return properties.slice(start, end).map((property, i) => ({
      property,
      index: start + i,
    }));
  }, [properties, currentIndex]);

  // Handle scroll to update current index
  const handleScroll = useCallback((e) => {
    const container = e.target;
    const cardWidth = container.clientWidth;
    const newIndex = Math.round(container.scrollLeft / cardWidth);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < properties.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, properties.length]);

  // Navigate to specific card
  const goToCard = useCallback((index) => {
    if (scrollContainerRef.current && index >= 0 && index < properties.length) {
      const cardWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  }, [properties.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToCard(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        goToCard(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, goToCard]);

  if (properties.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        <div className="text-center p-6">
          <span className="text-4xl mb-3 block">🏠</span>
          <p className="font-medium">No properties to show</p>
          <p className="text-sm mt-1">Try asking about homes in a specific city!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Navigation Header */}
      <div className="flex-shrink-0 px-4 py-2 flex items-center justify-between bg-white/80 backdrop-blur border-b border-slate-100">
        <button
          onClick={() => goToCard(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous property"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">
            {currentIndex + 1} of {properties.length}
          </p>
          {pagination && pagination.total > properties.length && (
            <p className="text-xs text-slate-500">
              {pagination.total.toLocaleString()} total matches
            </p>
          )}
        </div>

        <button
          onClick={() => goToCard(currentIndex + 1)}
          disabled={currentIndex === properties.length - 1}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next property"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Swipeable Card Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
        style={{ 
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Spacer for virtual rendering offset */}
        {currentIndex > 2 && (
          <div 
            className="flex-shrink-0" 
            style={{ width: `${(currentIndex - 2) * 100}%` }} 
          />
        )}
        
        {visibleCards.map(({ property, index }) => (
          <PropertySwipeCard
            key={property.id || index}
            property={property}
            isActive={index === currentIndex}
            onExpand={() => setExpandedProperty(property)}
          />
        ))}
        
        {/* Spacer for remaining cards */}
        {currentIndex < properties.length - 3 && (
          <div 
            className="flex-shrink-0" 
            style={{ width: `${(properties.length - currentIndex - 3) * 100}%` }} 
          />
        )}
      </div>

      {/* Progress Dots */}
      <div className="flex-shrink-0 py-3 flex justify-center gap-1.5">
        {properties.length <= 10 ? (
          // Show all dots for small lists
          properties.map((_, i) => (
            <button
              key={i}
              onClick={() => goToCard(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex 
                  ? 'bg-emerald-500 w-6' 
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to property ${i + 1}`}
            />
          ))
        ) : (
          // Show abbreviated dots for large lists
          <>
            {[0, 1, 2].map(i => (
              <button
                key={i}
                onClick={() => goToCard(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-emerald-500 w-6' : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
            <span className="text-slate-400 text-xs px-1">•••</span>
            {properties.slice(-3).map((_, i) => {
              const actualIndex = properties.length - 3 + i;
              return (
                <button
                  key={actualIndex}
                  onClick={() => goToCard(actualIndex)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    actualIndex === currentIndex ? 'bg-emerald-500 w-6' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Load More Button (for pagination) - Manual trigger if auto-load fails */}
      {pagination && pagination.page < pagination.totalPages && (
        <div className="flex-shrink-0 px-4 pb-3">
          {loading ? (
            <div className="w-full py-2 text-sm font-medium text-slate-500 text-center flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Loading more properties...
            </div>
          ) : (
            <button
              onClick={() => onLoadMore?.()}
              className="w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              Load more properties →
            </button>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <PropertyDetailModal
        property={expandedProperty}
        onClose={() => setExpandedProperty(null)}
      />
    </div>
  );
}

export default SwipeablePropertyCards;
