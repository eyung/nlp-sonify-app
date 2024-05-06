import './App.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';

import ResultsListAPI from './features/ResultsList/components/ResultsListAPI';
import TestAPI from './features/ResultsList/components/TestAPI';

const App = () => {
  //const [inputText, setInputText] = useState('');
  //const [result, setResults] = useState(null);

  //const handleInputChange = (event) => {
  //  setInputText(event.target.value);
  //};
  const webURL = 'https://nlp-sonify-be.vercel.app';

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [result, setResults] = useState(null);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(webURL + '/api/complexity-scores', { text: data.inputText });
      console.log(response.data);
      
      // Show only the contents of the payload
      setResults(response.data.choices[0].message.content);
      reset();
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Text App</h1>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('inputText', { required: true })} />
            {errors.inputText && <p>This field is required</p>}
            <button type="submit">go</button>
          </form>
          {result && (
            <div>
              <h2>Response:</h2>
              <p>{result}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
