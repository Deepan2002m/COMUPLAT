import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ComposeEmail() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/send-email', { to, subject, body });
      alert('Email sent successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to send email', error);
      alert('Failed to send email');
    }
  };
  

  return (
    <div>
      <h1>Compose Email</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>To:</label>
          <input type="email" value={to} onChange={(e) => setTo(e.target.value)} required />
        </div>
        <div>
          <label>Subject:</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label>Body:</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required />
        </div>
        <button type="submit">Send Email</button>
      </form>
    </div>
  );
}

export default ComposeEmail;