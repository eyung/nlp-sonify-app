import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { DndContext } from '@dnd-kit/core';
import Droppable from './Droppable';
import Draggable from './Draggable';
import SoundPlayer from './SoundPlayer';
import ScoreMapper from './ScoreMapper';
import ScoreCard from './ScoreCard';
import ScoreGraph from './ScoreGraph';

const mappingFunctions = {
  frequency: (score) => 220 + (score * 420), // (score) => 440 + (score * 220)
  duration: (score) => 0.5 + (score * 0.5),
  //waveform: (score) => ['sine', 'square', 'triangle', 'sawtooth'][Math.floor(score * 4)],
  detune: (score) => -1200 + (score * 1200),
  volume: (score) => -30 + (score * 50)
};

//
// JSON schema for scores
// {
//  "sentences": [
//   {
//    "word": {
//      "Complexity Score": [-1.0 , 1.0],
//      "Sentiment Analysis Score": [-1.0 , 1.0],
//      "Concreteness Score": [-1.0 , 1.0],
//      "Emotional-Intensity Score": [-1.0 , 1.0],
//    }
//   },
//   ...
//

const processScores = (data) => {
  // Ensure the data has the "sentences" root schema
  const root = data.sentences ? data : { sentences: [data] };

  const complexityScores = {};
  const sentimentScores = {};
  const concretenessScores = {};
  const emotionalIntensityScores = {};

  console.log('Root:', root);

  root.sentences.forEach(sentence => {
    for (const [word, scores] of Object.entries(sentence)) {
      complexityScores[word] = scores["Complexity Score"];
      sentimentScores[word] = scores["Sentiment Analysis Score"];
      concretenessScores[word] = scores["Concreteness Score"];
      emotionalIntensityScores[word] = scores["Emotional-Intensity Score"];
    }
  });

  return {
    complexityScores,
    sentimentScores,
    concretenessScores,
    emotionalIntensityScores
  };  
};

const App = ({ setIsLoading }) => {
  const webURL = 'https://nlp-sonify-be.vercel.app';

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  //const [complexityScores, setComplexityScores] = useState(null);
  //const [sentimentScores, setSentimentScores] = useState(null);
  //const [concretenessScores, setConcretenessScores] = useState(null);
  //const [emotionalIntensityScores, setEmotionalIntensityScores] = useState(null);
  const [shouldPlaySound, setShouldPlaySound] = useState(false);

  const [inputText, setInputText] = useState('');
  const [mappedScores, setMappedScores] = useState(null);
  
  // Default mappings of text parameters to audio parameters
  const [mappings, setMappings] = useState({
    complexity: {
      parameter: 'frequency',
      mapFunction: mappingFunctions.frequency
    },
    sentiment: {
      parameter: 'duration',
      mapFunction: mappingFunctions.duration
    },
    concreteness: {
      parameter: 'detune',
      mapFunction: mappingFunctions.detune
    },
    emotionalIntensity: {
      parameter: 'volume',
      mapFunction: mappingFunctions.volume
    },
  });

  const handlePlaySound = async () => {

    setIsLoading(true); // Set loading to true when starting the request

    try {
      const response = await axios.post(`${webURL}/api/v2/scores`, { text: inputText });
      //const combinedScores = response.data;
      //const combinedScores = response.data.choices[0].message.content;
      //responses.map(response => JSON.parse(response.data.choices[0].message.content));
      //const combinedScores = JSON.parse(response.data.choices[0].message.content);

      const scores = processScores(response.data);
      const mappedScores = ScoreMapper(scores, mappings);

      setMappedScores(mappedScores);

      //setComplexityScores(scores.complexityScores);
      //setSentimentScores(scores.sentimentScores);
      //setConcretenessScores(scores.concretenessScores);
      //setEmotionalIntensityScores(scores.emotionalIntensityScores);


      //setShouldPlaySound(true); // Set shouldPlaySound to true when form is submitted
      //reset();

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Set loading to false when the request is complete
    }
  };

  const handleDrop = (textParam, audioParam) => {
    setMappings(prevMappings => {
      const newMappings = { ...prevMappings };
  
      // Find if the audioParam is already mapped to another textParam
      const existingTextParam = Object.keys(newMappings).find(key => newMappings[key]?.parameter === audioParam);
  
      if (existingTextParam) {
        // Swap the mappings
        const temp = newMappings[textParam];
        newMappings[textParam] = newMappings[existingTextParam];
        newMappings[existingTextParam] = temp;
      } else {
        // Set the new mapping
        newMappings[textParam] = {
          parameter: audioParam,
          mapFunction: mappingFunctions[audioParam] || ((value) => value) // Default to identity function if no mapping function is found
        };
      }
  
      return newMappings;
    });
  };

  return (
    <div className="App flex justify-center">
      <div className="w-full max-w-screen-lg p-4">
      
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter your text here"
        rows="10"
        cols="50"
      />
      <button onClick={handlePlaySound}>Play Sound</button>

        <DndContext onDragEnd={({ active, over }) => {
          if (over) {
            handleDrop(over.id, active.id);
          }
        }}>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {['complexity', 'sentiment', 'concreteness', 'emotionalIntensity'].map(param => (
              <Droppable key={param} id={param}>
                <div className="p-4 border rounded">
                  <h3 className="text-lg font-semibold">{param}</h3>
                  {mappings[param] && <p>Mapped to: {mappings[param].parameter}</p>}
                </div>
              </Droppable>
            ))}
          </div>

          <div className="flex justify-around mt-4">
            {['frequency', 'duration', 'detune', 'volume'].map(param => (
              <Draggable key={param} id={param}>
                <div className="p-4 bg-gray-200 rounded">
                  <p>{param}</p>
                </div>
              </Draggable>
            ))}
          </div>
        </DndContext>

        {mappedScores && <SoundPlayer mappedScores={mappedScores} onSoundPlayed={() => setIsLoading(false)} />}
      {mappedScores && <ScoreGraph mappedScores={mappedScores} />}

        <div className="grid grid-cols-4 gap-4 m-10">
          <ScoreCard title="Complexity Scores" scores={complexityScores} tooltiptext={"tooltip"} />
          <ScoreCard title="Sentiment Scores" scores={sentimentScores} tooltiptext={"tooltip"} />
          <ScoreCard title="Concreteness Scores" scores={concretenessScores} tooltiptext={"tooltip"} />
          <ScoreCard title="Emotional Intensity Scores" scores={emotionalIntensityScores} tooltiptext={"tooltip"} />
        </div>

        {/* <ScoreGraph mappedScores={mappedScores} /> */}

      </div>
    </div>
  );
};

export default App;
