import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ChatWindow from './components/ChatWindow';
import LoanForm from './components/LoanForm';
import SalaryUploadForm from './components/SalaryUploadForm';
import ActionButtons from './components/ActionButtons';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Welcome to Tata Capital Loan Origination System! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [loanData, setLoanData] = useState(null);
  const [salaryFileId, setSalaryFileId] = useState(null);
  const messagesEndRef = useRef(null);

  const BACKEND_URL = 'http://localhost:8000';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        user_message: text,
        session_id: sessionId,
      });

      const botMessage = {
        id: messages.length + 2,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLoanFlow = async () => {
    await sendMessage(
      "I'd like to start the loan application process. Can you help me?"
    );
  };

  const handleLoanFormSubmit = async (data) => {
    setLoanData(data);
    const message = `I want to apply for a loan of ₹${data.loanAmount} with a tenure of ${data.tenure} months.`;
    await sendMessage(message);
  };

  const handleSalaryUpload = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${BACKEND_URL}/mock/upload_salary?session_id=${sessionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSalaryFileId(response.data.file_id);

      const botMessage = {
        id: messages.length + 1,
        text: `Salary document uploaded successfully! Monthly salary: ₹${response.data.monthly_salary.toLocaleString('en-IN')}`,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 1,
        text: 'Failed to upload salary document. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSanction = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/sanction/${sessionId}`,
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sanction_letter.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (error) {
      alert('Failed to download sanction letter. Please try again.');
      console.error('Download error:', error);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <h1>Tata Capital Loan Origination</h1>
          <p className="session-id">Session: {sessionId.substring(0, 20)}...</p>
        </header>

        {/* Main Content */}
        <div className="app-content">
          {/* Chat Section */}
          <div className="chat-section">
            <ChatWindow messages={messages} messagesEndRef={messagesEndRef} />
          </div>

          {/* Forms and Actions Section */}
          <div className="forms-section">
            {/* Action Buttons */}
            <ActionButtons
              onStartFlow={handleStartLoanFlow}
              onDownloadSanction={handleDownloadSanction}
              loading={loading}
            />

            {/* Loan Form */}
            <LoanForm onSubmit={handleLoanFormSubmit} />

            {/* Salary Upload Form */}
            <SalaryUploadForm onUpload={handleSalaryUpload} loading={loading} />

            {/* Status Info */}
            {loanData && (
              <div className="status-info">
                <h3>Loan Details</h3>
                <p>Amount: ₹{loanData.loanAmount}</p>
                <p>Tenure: {loanData.tenure} months</p>
              </div>
            )}

            {salaryFileId && (
              <div className="status-info success">
                <p>✓ Salary uploaded (ID: {salaryFileId.substring(0, 15)}...)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
