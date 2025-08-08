import React from 'react';
import PropTypes from 'prop-types';
import { Clock, RefreshCw } from 'lucide-react';

const RecentCards = ({ recentCards, onLoadCard, onClearHistory }) => {
  if (!recentCards || recentCards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <Clock className="mr-2" size={20} />
          Recent Cards
        </h3>
        <p className="text-gray-500 text-sm">No recent cards yet. Create your first card to see it here!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
          <Clock className="mr-2" size={20} />
          Recent Cards
        </h3>
        <button
          onClick={onClearHistory}
          className="text-sm text-red-500 hover:text-red-600 transition-colors"
          title="Clear all recent cards"
        >
          Clear History
        </button>
      </div>
      
      <div className="space-y-2">
        {recentCards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
            onClick={() => onLoadCard(card.data)}
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {card.data.name || 'Unnamed Candidate'}
              </div>
              <div className="text-sm text-gray-500">
                {card.data.position || 'No position'} • {new Date(card.timestamp).toLocaleDateString()}
              </div>
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-[#2237f1]"
              onClick={(e) => {
                e.stopPropagation();
                onLoadCard(card.data);
              }}
              title="Load this card"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-400 mt-3">
        Click on any card to reload its information into the form
      </p>
    </div>
  );
};

RecentCards.propTypes = {
  recentCards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      data: PropTypes.object.isRequired,
      timestamp: PropTypes.number.isRequired
    })
  ).isRequired,
  onLoadCard: PropTypes.func.isRequired,
  onClearHistory: PropTypes.func.isRequired
};

export default RecentCards; 