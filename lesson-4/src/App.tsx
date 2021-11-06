import React, { FormEvent, useEffect, useState } from 'react';
import './App.css';
import { builder, InputDescription, OutputValue, ReadInput, Result } from '@hotg-ai/rune';
import { Tensor, tensor1d } from '@tensorflow/tfjs-core';
import logo from './logo.svg';

type RunFunc = (r: ReadInput) => Result;
const runeURL = "/lesson-4.rune";

export default function App() {
  const [runtime, setRuntime] = useState<RunFunc>();
  const [number, setNumber] = useState(65.0);
  const [result, setResult] = useState("");

  // Initialize the runtime on startup
  useEffect(() => init(setRuntime), []);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!runtime) { return; }

    const result = evaluate(runtime, number);
    setResult(JSON.stringify(result, null, 4));
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <form onSubmit={submit}>
            <div>
              <label>
                Number: <br/>
                <input type="number" value={number}
                  onChange={e => setNumber(parseInt(e.target.value))} />
              </label>
            </div>
            <input type="submit" value="Calculate" disabled={!runtime} />
          </form>

          <div>
            <h3>Result</h3>
            <pre style={{textAlign: 'left', width: "50vw"}}>{result}</pre>
          </div>
        </div>
      </header>
    </div>
  );
}

function init(setRuntime: React.Dispatch<React.SetStateAction<RunFunc | undefined>>) {
  console.log("Loading the Rune");

  builder()
    .build(runeURL)
    .then(r => {
      console.log("Loaded the Rune");
      setRuntime(() => r);
    })
    .catch(console.error);
}

function evaluate(runtime: RunFunc, angle: number): OutputValue[] {
  console.log("Running the Rune");
  const { outputs } = runtime(input => generateInput(input, angle));

  console.log("Result:", outputs);
  return outputs;
}

function generateInput(input: InputDescription, number: number): Tensor {
  console.log("Generating", input);
  return tensor1d([number], "int32");
}
