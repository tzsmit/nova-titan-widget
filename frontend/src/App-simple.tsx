import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Nova Titan Elite</h1>
        <p className="text-slate-300 mb-8">Testing React Application</p>
        
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-6 max-w-md mx-auto">
          <div className="text-green-400 font-semibold">✅ React App Loading Successfully</div>
        </div>
      </div>
    </div>
  );
}

export default App;