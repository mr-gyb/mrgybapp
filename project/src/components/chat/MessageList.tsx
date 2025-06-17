import React from 'react';
import { Message } from '../../types/chat';
import { FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const renderMessageContent = (message: Message) => {
    try {
      // Try to parse as JSON for complex message types (like those with images)
      if (typeof message.content === 'string') {
        try {
          const parsedContent = JSON.parse(message.content);
          if (Array.isArray(parsedContent.content)) {
            return (
              <div className="space-y-2">
                {parsedContent.content.map((item: any, index: number) => {
                  if (item.type === 'image_url') {
                    return (
                      <img
                        key={index}
                        src={item.image_url.url}
                        alt="Uploaded content"
                        className="max-w-xs rounded-lg mb-2"
                      />
                    );
                  }
                  if (item.type === 'text') {
                    return (
                      <ReactMarkdown 
                        key={index} 
                        className="prose prose-sm max-w-none" 
                        remarkPlugins={[remarkGfm]}
                      >
                        {item.text}
                      </ReactMarkdown>
                    );
                  }
                  return null;
                })}
              </div>
            );
          }
        } catch (e) {
          // Not JSON, continue with normal rendering
        }
      }

      // Handle file type messages
      if (message.fileType && message.fileName) {
        return (
          <div className="space-y-2 ">
            <div className="flex items-center space-x-2 ">
              <FileText size={20} />
              <span>{message.fileName}</span>
            </div>
            <ReactMarkdown 
              className="prose prose-sm max-w-none" 
              remarkPlugins={[remarkGfm]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        );
      }
      console.log("sssssssssssssssssssssssssssss");
      // Default case: render as markdown
      return (
        
        <ReactMarkdown 
          className="prose prose-sm max-w-none" 
          remarkPlugins={[remarkGfm]}
        >
          {message.content}
        </ReactMarkdown>
      );
    } catch (error) {
      return <p>{message.content}</p>;
    }
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 mb-16 border border-green-500">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }` }
        >
          <div
            className={` max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-gold text-navy-blue'
                : 'bg-navy-blue text-white'
            }`}
          >
            {renderMessageContent(message)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;