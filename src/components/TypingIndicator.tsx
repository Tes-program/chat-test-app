export const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 p-3 bg-gray-100 rounded-lg max-w-xs">
      <span className="text-sm text-gray-600 mr-2">RainBot is typing</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
      </div>
    </div>
  );
};