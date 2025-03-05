import React from 'react';

function Sidebar({ isOpen, onClose, chatHistory, onChatSelect, onNewChat }) {
  return (
    <>
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-md p-2 hover:bg-gray-50"
        >
          ✕
        </button>
      )}

      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 z-40 overflow-y-auto`}>
        <div className="p-4 pt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Analysis History</h2>
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
