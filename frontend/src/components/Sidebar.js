import React from 'react';

function Sidebar({ isOpen, onClose, chatHistory, onChatSelect, onNewChat }) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        ></div>
      )}
      <div 
        className={`sidebar fixed left-0 top-0 h-full bg-white shadow-lg transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 z-50 overflow-y-auto`}
        style={{ zIndex: 55 }}
      >
        <div className="p-4">
          {/* Top bar with close (X) and new chat (+) buttons */}
          <div className="flex justify-end items-center mb-6 pt-2">
            <button
              onClick={onClose}
              title="Close Sidebar"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <button
              onClick={onNewChat}
              title="New Chat"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm font-medium">{chat.timestamp}</p>
                <p className="text-xs text-gray-500 truncate">
                  {chat.text.substring(0, 50)}...
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
