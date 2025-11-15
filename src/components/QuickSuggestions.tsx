// src/components/QuickSuggestions.tsx
interface QuickSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
}

export const QuickSuggestions = ({ suggestions, onSuggestionClick, disabled }: QuickSuggestionsProps) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            disabled={disabled}
            className="text-xs md:text-sm bg-green-50 text-green-700 px-3 py-2 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-200 break-words text-left"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};