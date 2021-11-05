import React, {Component} from 'react';
import bender from './bender.png';
import './App.css';
//import { Runtime } from '@hotg-ai/rune';
import { runRune } from "./rune";
import Webcam from "react-webcam";


export default class App extends Component {
  
  constructor(props) {
    super(props);
    // Set the initial grid in
    this.state = {
      output : "no output"
    };

  }


  setRef = webcam => {
    this.webcam = webcam;
  };
  
  
  
  run = async () =>  {
      const imageSrc = this.webcam.getScreenshot();
      const img = new Image();
      img.src = imageSrc;
      const out = await runRune(img);
      this.setState({ output: out })
  }

  render() {
    return ( 
      <div className="App">
        <header className="App-header">
        <Webcam
        audio={false}
        height={480}
        ref={this.setRef}
        screenshotFormat="image/jpeg"     
        width={640}
      />
          <p>
            {this.state.output}
          </p>

        <button className="App-button" onClick={this.run}>
          Run model
        </button>
        
        </header>
      </div>
    );
  }
}

