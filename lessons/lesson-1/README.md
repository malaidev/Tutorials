You can use below button to open this project directly in GitPod. It will setup a _rune_ playground for you.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/hotg-ai/tutorials/edit/main/lessons/lesson-2/README.md)

The primary way to create a Rune is by using a text file in the `YAML` format, referred to as a Runefile, to declare how a machine learning pipeline is configured. Below you can see a simple Runefile. You can take a quick look then we will go through every component step by step.
```yaml
version: 1
image: runicos/base

pipeline:
  random_input:
    capability: RAND
    outputs:
      - type: F32
        dimensions: [1]
  serial:
    out: SERIAL
    inputs:
      - random_input
```

# Image
The first item in a Runefile is the image. This specifies the functionality that will be provided to the Rune by the runtime.

The only image supported at the moment is runicos/base.
```yaml
image: runicos/base
```
# Pipeline
The main concept in a Runefile is that of the "pipeline". This is a directed acyclic graph specifying how data is transformed as it passes through the Rune.

The pipeline is a dictionary of key-value pairs where the key attaches a name to a particular stage.

## Capabilities
A capability stage is how information from the outside world enters the Rune. This may take the form of an image from the device's camera or samples from an audio file. Capabilities are specified using a capability key which dictates what type of capability it is. In the example below, we have defined `capability` to `RAND`, which will take some random input.
```yaml
pipeline:
  random_input:
    capability: RAND
    outputs:
      - type: F32
        dimensions: [1]
```
Capabilities have the following properties:

- args
- outputs

In the above example, you can see only `outputs`. In the later chapters, you will get familiar with the `args` property.

## Outputs
Each stage which outputs data must specify the type of that data using the outputs property. This specifies the data type and shape of a tensor. Here, we are taking an `F32` type single number as input. We have set `dimensions` to `[1]`, so it will be a single number. If you want two random `F32` numbers, you can change it to `[2]`

## Out
It is the mechanism used to pass information processed by the Rune to the outside world (e.g., the host application). Outputs are differentiated using an `out: SERIAL` property, where the value specifies the output type.
```yaml
serial:
  out: SERIAL
  inputs:
    - rand
```
<hr>
In summary, every system has an input and output. A system takes inputs from the outside world, performs some processing/operation, and sends back the output to the outside world. Similarly, here we have a `capability` that takes input from the outside world and `out: SERIAL`, which sends output to the outside world. In the coming lessons, we will see what kind of processing we can do in the `rune` and will unlock the power of `rune` to run complex Machine Learning models.

## Build the Rune
First, create an empty `Runefile.yml` and write the above code in the Runefile.
```bash
cd /workspace/tutorials/lessons/lesson-1
touch Runefile.yml
```
Ok, so you have written your first `Runefile.yml` Let's now compile and test what you have so far. 

Run the below command to build the `rune`
```bash
rune build Runefile.yml
```
It will create a `lesson-1.rune` for you. Yay, you have built your first Rune.

Excited to test your first `rune` and see the output you are getting. Run the below command In the terminal.
```bash
rune run lesson-1.rune
```
You will get a random number every time you will run the `Rune run lesson-1.rune` command. 

Did you have fun building your first `rune`? Next, we will build a `rune`  using an ML model.

