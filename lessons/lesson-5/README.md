# Lesson 4: Integrating With The Browser (Advanced)

You can use the below button to open this project directly in GitPod. It will
set up a _Rune_ playground for you.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/hotg-ai/tutorials/edit/main/lessons/lesson-5/README.md)

In this lesson, we will build a simple React web app that uses a rune for object
recognition linked to the webcam.

This tutorial will show you how to import our cdn library to deploy your runes
on the web.

## Deploy to web

In the project directory, run:

### `npm install`

Install dependencies

### `npx parcel index.html`

Opens a web server on [http://localhost:1234](http://localhost:1234).

In gitPod make sure you open the app in a new tab, webcam may not work in an
iFrame.

## Steps

### Create a react boilerplate app
```
npx create-react-app my-app
```
### Import the library

Add an index.html file and import the rune library

```html
<html>
<body>

<div  id="app"></div>
<script  src="https://rune-registry.web.app/vm/runevm.js"></script>
<script  type="module"  src="src/index.tsx"></script>

</body>

</html>
```

### Write the functions to deploy and run your rune

```js

// url for the rune
const  RUNE_URL = "https://rune-registry.web.app/registry/hotg-ai/mobilenet_v2_1/rune.rune";

export  const  runRune = async (image: HTMLImageElement) => {

	let  input = new  Uint8Array();
	let  output = { elements:""};
	let  runTime;

	//this ImageCapability class links the input data
	class  ImageCapability {
		parameters = {};
		generate(dest, id) {
			dest.set(input, 0);
		}
		setParameter(key, value) {
			this.parameters[key] = value;
		}
	}

	//this SerialOutput class links the output data
	class  SerialOutput {
		consume(data) {
			const  utf8 = new  TextDecoder();
			output = JSON.parse(utf8.decode(data));
		}
	}

	const  imageCap = new  ImageCapability();

	//Create all the imports for the Runtime
	const  imports = {
		createCapability: () =>  imageCap,
		createOutput: () =>  new  SerialOutput(),
		createModel: (mime, model_data) =>
			rune.TensorFlowModel.loadTensorFlowLite(model_data),
		log: (log) => { console.log(log) },
	};

	//download rune and deploy as a Runtime
	if (runTime === undefined) {
		const  response = await  fetch(RUNE_URL);
		const  bytes = new  Uint8Array(await  response.arrayBuffer());
		runTime = await  rune.Runtime.load(bytes.buffer, imports);
	}

	//get image input and resize
	input = rune.TensorFlowModel.resizeImage(image, 224);
	// call the model
	runTime.call();

	//get output and convert to image
	console.log("Result:", output);

	return  output.elements;
}
```

### Add the Webcam component

Add the [Webcam component for React][webcam] to your dependencies

```
npm install react-webcam
```

Import it in `App.tsx`

```js
import  Webcam  from  "react-webcam";
```

### Link everything together

```js
run = async () => {
	const  imageSrc = this.webcam.getScreenshot();
	const  img = new  Image();
	img.src = imageSrc;
	const  out = await  runRune(img);
	this.setState({ output:  out })
}
```

[webcam]: https://www.npmjs.com/package/react-webcam
