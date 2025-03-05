import React, { useState, useRef, useEffect } from "react";
import Sidebar from './Sidebar';
import { db } from '../firebase/config';
import { collection, addDoc, query, getDocs, orderBy } from 'firebase/firestore';

function ToxicDetector({ user, onLogout  }) {
  const [text, setText] = useState("");
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [inputMode, setInputMode] = useState("manual");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const detailsRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const labels = ["Toxic", "Severe Toxic", "Obscene", "Threat", "Insult", "Identity Hate"];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const handleNewChat = () => {
    setText("");
    setPredictions(null);
    setError(null);
    setFileError(null);
    setShowDetails(false);
    setUploadedFileName(null);
  };
  useEffect(() => {
    const loadChatHistory = async () => {
      const chatQuery = query(
        collection(db, 'users', user.userId, 'chats'),
        orderBy('timestamp', 'desc')
      );
  
      const querySnapshot = await getDocs(chatQuery);
      const chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatHistory(chats);
    };
  
    if (user?.userId) {
      loadChatHistory();
    }
  }, [user?.userId]);
  
    useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);
  
  // Save chat history
  const saveChatHistory = async (predictions) => {
    const chatData = {
      timestamp: new Date().toISOString(),
      predictions: predictions,
      text: text
    };
    
    // Create reference to user's chats subcollection
    const userChatsRef = collection(db, 'users', user.userId, 'chats');
    const docRef = await addDoc(userChatsRef, chatData);
    const newChat = { id: docRef.id, ...chatData };
    setChatHistory(prevHistory => [newChat, ...prevHistory]);
  };
  
  // Handle chat selection
  const handleChatSelect = (chat) => {
    setText(chat.text);
    setPredictions(chat.predictions);
    setIsSidebarOpen(false);
  };
  useEffect(() => {
    if (showDetails && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showDetails]);

  useEffect(() => {
    if (predictions) {
      setShowDetails(false);
    }
  }, [predictions]);

  const parseInputText = (text) => {
    if (inputMode === "manual") {
      return text
        .split(/[\n,|]+/)
        .map(t => t.trim())
        .filter(t => t.length > 0);
    } else { // links mode
      return text
        .split(/[\n]+/)
        .map(t => t.trim())
        .filter(t => t.length > 0);
    }
  };

  const handleClear = () => {
    setText("");
    setPredictions(null);
    setError(null);
    setFileError(null);
    setShowDetails(false);
    setUploadedFileName(null); // Clear the filename

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputModeChange = (mode) => {
    setInputMode(mode);
    setText("");
    setPredictions(null);
    setError(null);
    setFileError(null);
    setUploadedFileName(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = async (file) => {
    setFileError(null);
    
    if (!file) return;
  
    // Check file type
    const fileType = file.name.split('.').pop().toLowerCase();
    if (!['txt', 'csv'].includes(fileType)) {
      setFileError("Please upload only .txt or .csv files");
      return;
    }
  
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size should be less than 5MB");
      return;
    }
  
    try {
      const content = await file.text();
      let processedContent;
  
      if (fileType === 'csv') {
        processedContent = content
          .split('\n')
          .map(line => line.replace(/["']/g, '').trim())
          .filter(line => line.length > 0)
          .join('\n');
      } else {
        processedContent = content;
      }
  
      setText(processedContent);
      setUploadedFileName(file.name); // Store the filename
    } catch (err) {
      setFileError("Error reading file. Please make sure it's a valid text file.");
      console.error("File reading error:", err);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set isDragging to false if we're leaving the dropzone
    const rect = dropZoneRef.current.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX >= rect.right ||
      e.clientY < rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const inputs = parseInputText(text);
    
    if (inputs.length === 0) {
      setError(`Please enter at least one ${inputMode === "manual" ? "comment" : "link"} to analyze`);
      setIsLoading(false);
      return;
    }

    try {
      let response;
      
      if (inputMode === "manual") {
        // Use existing endpoint for manual comment analysis
        response = await fetch("http://127.0.0.1:8000/predict/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ texts: inputs }),
        });
      } else {
        // Use YouTube analysis endpoint for links
        response = await fetch("http://127.0.0.1:8000/analyze-youtube/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ links: inputs }),
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to analyze ${inputMode === "manual" ? "comments" : "YouTube links"}`);
      }
      
      const data = await response.json();
      setPredictions(data.predictions);
      setPredictions(data.predictions);
      saveChatHistory(data.predictions); 
    } catch (error) {
      setError(error.message);
      console.error("Prediction error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    if (!predictions || predictions.length === 0) return null;

    const totalComments = predictions.length;
    const stats = labels.map((label, idx) => {
      const count = predictions.filter(p => p.prediction[idx] === 1).length;
      const percentage = ((count / totalComments) * 100).toFixed(1);
      return {
        label,
        count,
        percentage
      };
    });

    return { totalComments, stats };
  };

  const stats = calculateStats();

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input Mode Selector */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              inputMode === 'manual' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleInputModeChange('manual')}
          >
            Manual Input
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              inputMode === 'links' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleInputModeChange('links')}
          >
            YouTube Links
          </button>
        </div>
      </div>

      <div 
        ref={dropZoneRef}
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadedFileName ? (
          <div className="p-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">📎</span>
              <span className="font-medium">{uploadedFileName}</span>
            </div>
          </div>
        ) : (
          <textarea
            rows="5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={inputMode === "manual" 
              ? "Enter one or multiple comments to analyze...\nYou can separate comments using:\n- New lines\n- Commas\n- Pipe symbol (|)" 
              : "Enter YouTube links to analyze (one per line)"}
            className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none border-none bg-transparent ${
              isDragging ? "pointer-events-none" : ""
            }`}
          />
        )}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 pointer-events-none">
            <div className="text-blue-500 text-lg font-medium">Drop your file here</div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {parseInputText(text).length} {inputMode === "manual" ? "comment" : "link"}(s) detected
        </p>
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center"
          >
            📎 Upload File
          </button>
        </div>
      </div>
      {fileError && (
        <p className="text-sm text-red-600">{fileError}</p>
      )}
      <div className="space-y-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center p-3 rounded-lg text-white font-semibold ${
            isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </button>
        {predictions && (
          <button
            type="button"
            onClick={handleClear}
            className="w-full p-3 rounded-lg text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );


  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(!isSidebarOpen)}
        chatHistory={chatHistory}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      
      {/* Header with navigation and user controls */}
      <div className="flex justify-between items-center px-4 mb-6">
      {/* Left side - Toggle sidebar and New Chat */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Only show New Chat button when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={handleNewChat}
            title="New Chat"
            className="flex items-center bg-white rounded-lg shadow-md p-2 space-x-2 hover:bg-gray-50 transition-all duration-300"
          >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          </button>
        )}
      </div>

        {/* Right side - User account dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center bg-white rounded-lg shadow-md p-2 space-x-2 hover:bg-gray-50"
          >
            <img 
              src={user.picture} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
            <span className="text-gray-700 font-medium">{user.name}</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">💬 Toxic Comment Detector</h1>
        
        {!predictions ? (
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                {renderForm()}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg h-fit">
              {renderForm()}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">📊 Analysis Summary</h2>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Total {inputMode === "manual" ? "comments" : "videos"} analyzed: {stats.totalComments}
                </p>
                <div className="space-y-4">
                  {stats.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{stat.label}</span>
                        <span className="text-gray-600">
                          {stat.count} ({stat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {showDetails && (
                <div ref={detailsRef} className="bg-white p-6 rounded-2xl shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">📝 Detailed Results</h2>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {predictions.map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <p className="font-medium mb-2">
                          {inputMode === "manual" ? `Comment ${idx + 1}:` : `Video ${idx + 1}:`}
                        </p>
                        <p className="text-gray-600 mb-3">{item.text}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {labels.map((label, labelIdx) => (
                            <div
                              key={label}
                              className={`p-2 rounded-lg flex justify-between ${
                                item.prediction[labelIdx] === 1
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              <span>{label}</span>
                              <span>{item.prediction[labelIdx] === 1 ? "⚠️" : "✅"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToxicDetector;