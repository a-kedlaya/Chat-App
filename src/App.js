import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('https://chat7-l7uc.onrender.com');

function App() {
  const [room, setRoom] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on('receiveMessage', (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    socket.on('previousMessages', (msgs) => {
      setMessages(msgs);
    });

    socket.on('errorMessage', (msg) => {
      setError(msg);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('previousMessages');
      socket.off('errorMessage');
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = async () => {
    if (!room || !password || !username) return setError('Fill all fields');
    try {
      // Check if room exists before joining
      const res = await axios.post('https://chat7-l7uc.onrender.com/check-room', { room, password });
      if (res.data.success) {
        socket.emit('joinRoom', { room, password });
        setJoined(true);
        setError('');
      } else {
        setError('Invalid room or password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid room or password');
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    socket.emit('sendMessage', { room, username, message });
    setMessage('');
  };

  const handleRegister = async () => {
    try {
      await axios.post('https://chat7-l7uc.onrender.com/register', { room, password });
      alert('Room registered!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering room');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔐 Chat Rooms</h1>

      {!joined ? (
        <div style={styles.form}>
          <input placeholder="Room" value={room} onChange={(e) => setRoom(e.target.value)} style={styles.input} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleJoin} style={styles.button}>Join Room</button>
            <button onClick={handleRegister} style={styles.secondaryButton}>Register Room</button>
          </div>
          {error && <p style={styles.error}>{error}</p>}
        </div>
      ) : (
        <>
          <div style={styles.chatBox}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.messageBubble,
                  alignSelf: msg.username === username ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.username === username ? '#4f46e5' : '#f0f0f0',
                  color: msg.username === username ? 'white' : 'black',
                }}
              >
                <strong>{msg.username}</strong>
                <div>{msg.message}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div style={styles.messageInputContainer}>
            <input
              placeholder="Type message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              style={styles.chatInput}
            />
            <button onClick={handleSend} style={styles.button}>Send</button>
          </div>
        </>
      )}

      <footer style={styles.footer}>
        Created by <strong>Abhiram</strong> using AI 🤖
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    maxWidth: 1500,
    margin: '0 auto',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(to right, #e0eafc, #cfdef3)',
  },
  title: {
    textAlign: 'center',
    marginBottom: 90,
    fontSize: '2.2rem',
    color: '#333',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    padding: '12px 14px',
    fontSize: '15px',
    borderRadius: 100,
    border: '1px solid #bbb',
    width: '80%',
    maxWidth:'300px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: '0.3s',
  },
    
  chatInput: {
    padding: '12px 14px',
    fontSize: '15px',
    borderRadius: 100,
    border: '1px solid #bbb',
    width: '100%',
    maxWidth: 1500,
    boxSizing: 'border-box',
    outline: 'none',
    transition: '0.3s',
  },
  button: {
    padding: '10px 16px',
    fontSize: '15px',
    background: 'linear-gradient(to right, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: 100,
    cursor: 'pointer',
    fontWeight: 500,
  },
  secondaryButton: {
    padding: '10px 16px',
    fontSize: '15px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: 100,
    cursor: 'pointer',
    fontWeight: 500,
  },
  error: {
    color: 'red',
    fontWeight: 500,
  },
  chatBox: {
    width: '70%',
    margin: '0 auto',
    flexGrow: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxHeight: 400,
    overflowY: 'auto',
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  messageBubble: {
    padding: 8,
    borderRadius: 10,
    maxWidth: '70%',
    wordWrap: 'break-word',
    borderRadius1:15,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#f1f1f1',
  },
  messageInputContainer: {
    display: 'flex',
    gap: 10,
    width: '50%',
    margin: '0 auto 20px',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#444',
    fontWeight: 500,
    textShadow: '0 0 1px #ccc',
  },
};

export default App;
