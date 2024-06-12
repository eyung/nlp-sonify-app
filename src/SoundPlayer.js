import React, { useEffect } from 'react';
import * as Tone from 'tone';

const SoundPlayer = ({ scores, textualToAudioMapping }) => {
  useEffect(() => {
    // Function to map scores to sound parameters
    const waveforms = ['sine', 'square', 'triangle', 'sawtooth'];
    const mapScoreToWaveform = (score) => waveforms[Math.floor((score + 1) * waveforms.length / 2)];
    const mapScoreToFrequency = (score) => 440 + (score * 220);
    const mapScoreToVolume = (score) => -30 + (score * 30);
    const mapScoreToDuration = (score) => 0.5 + (score * 0.5);

    const synth = new Tone.Synth().toDestination();

    // Function to get mapped audio property based on textual property
    const getMappedAudioProperty = (textualProp, score) => {
      const mapping = textualToAudioMapping.find(mapping => mapping.textual === textualProp);
      if (!mapping || !mapping.audio) return null;

      switch (mapping.audio) {
        case 'waveform':
          return mapScoreToWaveform(score);
        case 'pitch':
          return mapScoreToFrequency(score);
        case 'volume':
          return mapScoreToVolume(score);
        case 'duration':
          return mapScoreToDuration(score);
        default:
          return null;
      }
    };

    // Generate sounds based on scores and mappings
    scores.forEach(({ word, complexity, sentiment, concreteness, emotionalIntensity }, index) => {
      const frequency = getMappedAudioProperty('complexity', complexity);
      const volume = getMappedAudioProperty('emotionalIntensity', emotionalIntensity);
      const duration = getMappedAudioProperty('sentiment', sentiment);
      const waveform = getMappedAudioProperty('concreteness', concreteness);

      // Check if the waveform is valid before setting it
      if (waveforms.includes(waveform)) {
        synth.oscillator.type = waveform;
      }

      // Only trigger the sound if frequency is valid
      if (frequency) {
        synth.triggerAttackRelease(frequency, duration || 1, Tone.now() + (index * 1.1), volume || -12);
      }
    });

    // Clean up Tone.js context on unmount
    return () => {
      synth.dispose();
    };
  }, [scores, textualToAudioMapping]);

  return <div>Playing sounds based on the text analysis scores.</div>;
};

export default SoundPlayer;
