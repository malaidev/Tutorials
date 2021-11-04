import React, { FormEvent, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { builder, Capability } from '@hotg-ai/rune';
import { Result } from '@hotg-ai/rune/dist/Builder';
import '@tensorflow/tfjs-tflite/dist/tflite_web_api_cc_simd.js';

type RunFunc = () => Result;

const inputs = {
  paragraph: "",
  question: "",
};

function App() {
  const [run, setRun] = useState<RunFunc>();
  const [rune, setRune] = useState<ArrayBuffer>();
  const [paragraph, setParagraph] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Fetch the Rune on startup
  useEffect(() => {
    fetch("/lesson-4.rune")
      .then(r => r.arrayBuffer())
      .then(buffer => setRune(buffer))
      .then();
  });

  // TODO: Figure out a less hacky way to
  inputs.paragraph = paragraph;
  inputs.question = question;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!run) {
      return;
    }

    const result = run();
    const [textOutput] = result.outputs;
    setAnswer(textOutput.value);
  };

  const pressed = () => builder()
    .onDebug(console.log)
    .withCapability("raw", () => new TextCapability())
    .build("/lesson-4.rune")
    .then(runtime => setRun(runtime));

  const button = run
    ? (<input type="submit" value="Ask" />)
    : (<button onClick={pressed}>Fetch Rune</button>);

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
            {button}
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

export default App;

class TextCapability implements Capability {
  source: number = 0;
  encoder = new TextEncoder();

  generate(dest: Uint8Array): void {
    let text;
    switch (this.source) {
      case 0:
        text = inputs.paragraph;
        break;
      case 1:
        text = inputs.question;
        break;
      default:
        throw new Error();
    }

    this.encoder.encodeInto(text, dest);
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case "source":
        this.source = value;
    }
  }

}
