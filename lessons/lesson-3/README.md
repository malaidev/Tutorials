You can use the below button to open this project directly in GitPod. It will set up a _Rune_ playground for you.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/hotg-ai/tutorials/edit/main/lessons/lesson-1/README.md)

In this lesson, we will build a complex rune that takes two ML models and deals with multiple input/output. Till now, we have built a relatively simple linear pipeline, but Rune's ability for abstraction really shines with more complex pipelines like _Style Transfer_. Let's start with taking a quick look at the Runefile.
```yaml
image: runicos/base
version: 1

pipeline:
  style:
    capability: IMAGE
    outputs:
      - type: u8
        dimensions: [1, 256, 256, 3]
    args:
      source: 0
      pixel-format: "@PixelFormat::RGB"
      width: 256
      height: 256
  content_image:
    capability: IMAGE
    outputs:
      - type: u8
        dimensions: [1, 384, 384, 3]
    args:
      source: 1
      pixel-format: "@PixelFormat::RGB"
      width: 384
      height: 384

  normalized_content_image:
    proc-block: "hotg-ai/proc-blocks#image-normalization"
    inputs:
      - content_image
    outputs:
      - type: f32
        dimensions: [1, 384, 384, 3]

  normalized_style_image:
    proc-block: "hotg-ai/proc-blocks#image-normalization"
    inputs:
      - style
    outputs:
      - type: f32
        dimensions: [1, 256, 256, 3]

  style_vector:
    model: ./style_predict.tflite
    inputs:
      - normalized_style_image
    outputs:
      - type: f32
        dimensions: [1, 1, 1, 100]

  style_transform:
    model: ./style_transform.tflite
    inputs:
      - normalized_content_image
      - style_vector
    outputs:
      - type: f32
        dimensions: [1, 384, 384, 3]

  serial:
    out: SERIAL
    inputs:
      - style_transform
 ```
This is the data flow for the above Runefile.

![](https://hotg.dev/assets/images/style-transfer-pipeline-6aee412d0d04f32749d1d6600779d2f6.png)

The Style Transfer Rune takes the "style" from one image (e.g., a painting), derives a "style vector" for it, and tries to apply that style to another image.

Imagine having an app on your phone that lets you take a photo and see what it would look like a Van Gogh.

We have two ML models,
1. _Style Predict_: It takes a stylish image as input and extracts style from that image as the style vector.
2. _Style Transform_: It takes an image matrix and a styled vector as input and transforms the image matrix to apply that style to it.

We will start writing our Runefile by looking at the model information.

Run model-info command on the _style_predict.tflite_
```bash
rune model-info style_predict.tflite
```
We got this: 
```
Inputs:
        style_image: f32[1,256,256,3]
Outputs:
        mobilenet_conv/Conv/BiasAdd: f32[1,1,1,100]
```
Let's figure out the steps for our data pipeline:
Looking at the input, we can say the model will take a `256 x 256` RGB (because the channel is 3) image as input. The input type is `f32`, but last time we saw that we could take `u8` image as input. So, we will need a proc-bock that will convert `u8` to `f32` type. For this, we have [_image_normalization_](https://github.com/hotg-ai/proc-blocks/tree/master/image-normalization) proc-block. It will take the `u8` image matrix and normalize their values to the range `[0, 1]` as `f32`. We have got all our nodes sorted out for _style_predict_ model

Now, let's take a look at the _style_transform_ model
```bash
rune model-info style_transform.tflite
```
We got:
```
Inputs:
        content_image: f32[1,384,384,3]
        mobilenet_conv/Conv/BiasAdd: f32[1,1,1,100]
Outputs:
        transformer/expand/conv3/conv/Sigmoid: f32[1,384,384,3]
```
It will take a `384 x 384` RGB (because the channel is 3) image as input, along with an array of shape `[1, 1, 1, 100]`. The input type for image is `f32` so we can use [_image_normalization_](https://github.com/hotg-ai/proc-blocks/tree/master/image-normalization) proc-block to perform this transformation. Next, if we look at the configuration of the `f32[1, 1, 1, 100]` input array, it's the same as the output of the _style_predict_ model. Perfect, now we have all our pieces in place. Let's start writing our Runefile.

## Capability
We have two input sources in our Rune with `capability: IMAGE`. The first is for  _style_predict_, and another one is for _style_transform_.

We will start by setting our first **node** name as the style and define  `capability` to `IMAGE` to take an image as input to our `rune` for _style_predict_ model. We will set the output type to `u8` and dimensions to `[1, 256, 256, 3]`. Later, we will normalize it and convert it to `f32` type.  In `args`, we will set width, height and `pixel-format: "@PixelFormat::RGB"` because it's a RGB image. We see a new property in `args` with name `source`. Our Rune has two input sources, one for each model. We will have to give a number to our source to avoid confusion while running the inference. We will set `source` to `0` (zero-based indexing), which is our first source.
```yaml
style:
  capability: IMAGE
  outputs:
    - type: u8
      dimensions: [1, 256, 256, 3]
  args:
    source: 0
    pixel-format: "@PixelFormat::RGB"
    width: 256
    height: 256
```
Similarly, we will create another capability node with the name `content image` for _style_transform_ model. We will set all our properties as per our model information. The most important thing is to select `source` to `1`, so this is our second input source.
```yaml
content_image:
  capability: IMAGE
  outputs:
    - type: u8
      dimensions: [1, 384, 384, 3]
  args:
    source: 1
    pixel-format: "@PixelFormat::RGB"
    width: 384
    height: 384
```
## Proc-Block
As discussed earlier, we will need a proc-block that could transform our `u8` type to `f32` and normalize the image matrix in range `[0, 1]`. First step is giving our node a name so let's set it to _normalized_style_image_  and set **proc-block** path to `"hotg-ai/proc-blocks#image-normalization"`. Next, we will connect _style node_ output to the input of this node and will define the output properties.
```yaml
 normalized_style_image:
  proc-block: "hotg-ai/proc-blocks#image-normalization"
  inputs:
    - style
  outputs:
    - type: f32
      dimensions: [1, 256, 256, 3]
```
Similarly, we define proc-block for _style_transform_ model:
```yaml
normalized_content_image:
  proc-block: "hotg-ai/proc-blocks#image-normalization"
  inputs:
    - content_image
  outputs:
    - type: f32
      dimensions: [1, 384, 384, 3]
```
## Model
Let's start with defining model properties for _style_predict_ node. Set the name of this node to _style_vector_ and give a path to the model file. Connect _normalized_style_image_ node output to the input of this node and define output properties using model-info.
```yaml
style_vector:
  model: ./style_predict.tflite
  inputs:
    - normalized_style_image
  outputs:
    - type: f32
      dimensions: [1, 1, 1, 100]
```
Now, it's time to write a node for _style_transform_ model. Everything will be defined the same way as the above node, except it will take two inputs, one _normalized_content_image_ and the second _style_vector_ node in the same order. Below you can see the syntax to write a `yaml` when we have multiple inputs. We use similar syntax when we have multiple outputs.
```yaml
style_transform:
  model: ./style_transform.tflite
  inputs:
    - normalized_content_image
    - style_vector
  outputs:
    - type: f32
      dimensions: [1, 384, 384, 3]
```
## serial
This is the last stage of our pipeline. As usual, we will set `out` to `SERIAL` and connect the input of node to _style_transform_ output
```yaml
serial:
  out: SERIAL
  inputs:
    - style_transform
 ```

## Build the Rune
First, create an empty `Runefile.yml` and write the above code in the Runefile.
```bash
cd /workspace/tutorials/lessons/lesson-3
touch Runefile.yml
```
Ok, so you have written your `Runefile.yml` Let's now compile and test what you have so far. 

Run the below command to build the `rune`
```bash
rune build Runefile.yml
```
It will create a `lesson-3.rune` for you. 

Test your Rune and see the output you are getting. It will take two images as input. You will have to maintain the input order as defined by you as `source` in the capability node. Run the below command in the terminal.
```bash
rune run lesson-3.rune --image style.jpeg content.jpeg
```
You will get an image matrix as output. Now, you can use some external libraries to convert an image matrix to an image. You can also use our pan code to convert this matrix into an image. We will cover how to use it in the coming lessons.
