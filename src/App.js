import React from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function App() {
  return (
    <div style={{
      background: '#0d1117',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', color: '#e6edf3' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏗</div>
        <h1 style={{ color: '#f78166', marginBottom: 8 }}>СтройКонтроль</h1>
        <p style={{ color: '#8b949e' }}>Система запущена успешно!</p>
      </div>
    </div>
  );
}
