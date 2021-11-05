# Lesson 1 - Getting Started

<!-- 
  - How to pass input to a Rune?
    - capabilities
  - How to read outputs from a Rune?
    - serial

  - Running from the terminal
  - For each concept, show how you would use it from the command-line and any errors you might expect
-->

You can use below button to open this project directly in GitPod. It will setup a _rune_ playground for you.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/hotg-ai/tutorials/edit/main/lessons/lesson-1/README.md)

The primary way to create a Rune is by using a text file in the `YAML` format, referred to as a Runefile, to declare how a machine learning pipeline is configured. Below you can see a simple Runefile. You can take a quick look then we will go through every component step by step.

```yaml
image: runicos/base
version: 1

pipeline:
  random_input:
    capability: RAND
    outputs:
      - type: u8
        dimensions: [4]
  serial:
    out: SERIAL
    inputs:
      - random_input
```

## Image

The first item in a Runefile is the image. This specifies the functionality that will be provided to the Rune by the runtime.

Most Runes will use the `runicos/base` image. Creating custom images is outside the scope of this tutorial.

```yaml
image: runicos/base
```

## Version

The `rune build` command uses a `version` field to allow for backwards compatibilty. The current Runefile format is version 1.

```yaml
version: 1
```

If you use the wrong version, you might see the following error message:

```console
$ cat simple.yml 
image: something-else
version: 2123

$ rune build simple.yml 
error: invalid value: integer `2123`, expected version to be 1

Error: There were 1 or more errors
```

## Pipeline

The main concept in a Runefile is that of the "pipeline". This is a directed acyclic graph specifying how data is transformed as it passes through the Rune.

Each node ("stage") in this DAG is written as a property of the `pipeline` field, where stages in the pipeline are connected to previous stages (inputs) and subsequent stages (outputs) by tensors.

### Capabilities

A capability stage is how information from the outside world enters the Rune. This may be an image from the device's camera or samples from an audio file, and takes the form of a tensor. 

Capabilities are specified using a `capability` key which dictates what type of capability it is. In the `random_input` stage below, we have defined `capability` to `RAND`, the random number generator.

```yaml
pipeline:
  random_input:
    capability: RAND
    outputs:
      - type: u8
        dimensions: [4]
```

Capabilities have the following properties:

- `outputs`
- `args`

In the above example, you can see only `outputs`. In the later chapters, you will get familiar with the `args` property.

### Outputs

Each stage which outputs data must specify the type of that data using the outputs property. This specifies the data type and shape of a tensor. 

The `random_input` stage from above outputs a 1D `u8` tensor with 4 elements (e.g. `[0x00, 0x01, 0x02, 0xFF]`). If we wanted to return a 2x2 matrix of floating point numbers, we might write the following instead:

```yaml
type: f32
dimensions: [2, 2]
```

### Out

An `out` node is the mechanism used to pass information processed by the Rune to the outside world (e.g., the host application). Similar to a `capability` node, the `out` field's value indicates what type it is.

Use `SERIAL` to print a JSON representation to the console.

```yaml
serial:
  out: SERIAL
  inputs:
    - rand
```

---

A Rune takes inputs from the outside world, performs some processing/operation, and sends back the output to the outside world. Similarly, here we have a `capability` that takes input from the outside world and `out: SERIAL`, which sends output to the outside world. In the coming lessons, we will see what kind of processing we can do in the `rune` and will unlock the power of `rune` to run complex Machine Learning models.

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

Did you have fun building your first `rune`? Next, we will build a `rune` using an ML model.
