import React from 'react';
import './App.css';
import TravelSamples from './TravelSamples';
import ChatBot from './ChatBot';

function App() {
  return (
    <div className="App">
      <div className="App-left">
        <TravelSamples />
      </div>
      <div className="App-right">
        <ChatBot />
      </div>
    </div>
  );
}

export default App;
