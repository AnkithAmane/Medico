import React from 'react';
import { useAuth } from '../../context/AuthContext';

export function AuthDebug() {
  try {
    const auth = useAuth();
    
    if (!auth) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', borderRadius: '4px', margin: '10px', color: '#d32f2f' }}>
          ❌ AuthContext is NOT available! AuthProvider might not be set up correctly.
        </div>
      );
    }
    
    return (
      <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '4px', margin: '10px', color: '#2e7d32' }}>
        ✅ AuthContext is available
        <pre>{JSON.stringify({
          hasLogin: typeof auth.login === 'function',
          hasRegister: typeof auth.register === 'function',
          hasLogout: typeof auth.logout === 'function',
          loading: auth.loading,
          hasUser: !!auth.user,
          hasToken: !!auth.token
        }, null, 2)}</pre>
      </div>
    );
  } catch (err) {
    return (
      <div style={{ padding: '20px', background: '#ffebee', borderRadius: '4px', margin: '10px', color: '#d32f2f' }}>
        ❌ Error accessing AuthContext: {err.message}
      </div>
    );
  }
}
