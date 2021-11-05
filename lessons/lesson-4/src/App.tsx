import React, { FormEvent, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { builder, } from '@hotg-ai/rune';
import { Result } from '@hotg-ai/rune/dist/Builder';
import '@tensorflow/tfjs-tflite/dist/tflite_web_api_cc_simd.js';
import { ReadInput } from '@hotg-ai/rune/dist/facade';
import { Tensor } from '@tensorflow/tfjs-core';

type RunFunc = (r: ReadInput) => Result;

export default function App() {
  const [runtime, setRuntime] = useState<RunFunc>();
  const [paragraph, setParagraph] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    console.log("Loading the Rune");

    // Fetch the Rune on startup
    builder()
      .build("/lesson-4.rune")
      .then(r => {
        console.log("Loaded the Rune");
        setRuntime(r);
      })
      .catch(console.error);
  }, []);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    console.log("Clicked the ASK button", { runtime, paragraph, question, answer });
    e.preventDefault();
    if (!runtime) {
      return;
    }

    console.log("Running the Rune");
    const result = runtime(input => generateInput(question, paragraph));
    const [textOutput] = result.outputs;
    setAnswer(textOutput.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <div>
          <form onSubmit={submit}>
            <div>
              <label>
                Paragraph:
                <textarea maxLength={1024} value={paragraph} rows={3}
                  onChange={e => setParagraph(e.target.value)} />
              </label>
            </div>
            <div>
              <label>
                Question:
                <input type="text" maxLength={256} value={question}
                  onChange={e => setQuestion(e.target.value)} />
              </label>
            </div>
            <input type="submit" value="ASK" />
          </form>

          <div>
            <h3>Answer</h3>
            <p>{answer}</p>
          </div>
        </div>
      </header>
    </div>
  );
}

function generateInput(question: string, paragraph: string): Tensor {
  throw new Error('Function not implemented.');
}

