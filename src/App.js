import './App.css';
import ResultsListAPI from './features/ResultsList/components/ResultsListAPI';
import TestAPI from './features/ResultsList/components/TestAPI';

function App() {
  return (
    <div className="App">
      Singling
      <ResultsListAPI />
      <TestAPI />
    </div>

  );
}

export default App;
