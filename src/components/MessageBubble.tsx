import { ChatMessage } from '@/types/chat';
import { Bot, User, CheckCircle, AlertCircle, DollarSign, Cpu } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-[80%]`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500 ml-2' : 'bg-primary mr-2'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message content */}
        <div className="flex flex-col">
          <div className={`rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            
            {/* Timestamp */}
            <p className={`text-xs mt-1 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>

          {/* Additional info for assistant messages */}
          {!isUser && (
            <div className="mt-2 space-y-1">
              {/* Sharia compliance */}
              {message.isShariahCompliant !== undefined && (
                <div className="flex items-center space-x-1">
                  {message.isShariahCompliant ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                  )}
                  <span className="text-xs text-gray-600">
                    {message.isShariahCompliant ? 'Sharia Compliant' : 'Requires Review'}
                  </span>
                </div>
              )}

              {/* Principles involved */}
              {message.principlesInvolved && message.principlesInvolved.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600">
                    Principles: {message.principlesInvolved.join(', ')}
                  </span>
                </div>
              )}

              {/* Model and cost info */}
              {message.modelUsed && (
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Cpu className="w-3 h-3" />
                    <span>{message.modelUsed}</span>
                  </div>
                  {message.cost && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>${(message.cost * 1000).toFixed(4)}k</span>
                    </div>
                  )}
                </div>
              )}

              {/* Recommended issuances */}
              {message.recommendedIssuances && message.recommendedIssuances.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Recommended Investments:</p>
                  {message.recommendedIssuances.slice(0, 2).map((issuance, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded p-2 mb-1">
                      <p className="text-xs font-medium text-green-800">{issuance.title}</p>
                      <p className="text-xs text-green-600">{issuance.issuer} - {issuance.proposed_profit}%</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Platform actions */}
              {message.platformActions && message.platformActions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.platformActions.slice(0, 3).map((action, index) => (
                    <button
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                      onClick={() => console.log('Action clicked:', action)}
                    >
                      {action.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};