interface QuickSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
}

export const QuickSuggestions = ({ suggestions, onSuggestionClick, disabled }: QuickSuggestionsProps) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            disabled={disabled}
            className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};