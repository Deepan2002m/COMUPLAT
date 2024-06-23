import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard({ user }) {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await axios.get('/api/emails');
        setEmails(res.data);
      } catch (error) {
        console.error('Failed to fetch emails', error);
      }
    };
    fetchEmails();
  }, []);

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <Link to="/compose">Compose Email</Link>
      <h2>Your Emails</h2>
      <ul>
        {emails.map((email, index) => (
          <li key={index}>
            To: {email.to}, Subject: {email.subject}, Date: {new Date(email.date).toLocaleString()}
          </li>
        ))}
      </ul>
      <a href="http://localhost:5000/api/logout">Logout</a>
    </div>
  );
}

export default Dashboard;