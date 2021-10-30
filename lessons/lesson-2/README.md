In this lesson, you will learn two new concepts 1) building a rune using ML model2) processing the data using `proc-blocks`. Before jumping to building a `rune` with the ML model, let's first revise some ML concepts. 

Machine learning workflows typically have the following steps:

- prepare dataset

- train model

- deploy model

To successfully run a deployed model on edge, the input has to be processed on the deployment in the same way as during the training of the model. Therefore, consistency is required across the whole pipeline - the same operators have to be used during deployment as used during training.

To achieve that for an existing model, there are two options:

1. Match the preprocessing function and distribution of the new data with that of the originally trained model

2. Re-calibrate the model using the preprocessing function used in the deployment and using data drawn from the distribution encountered in the deployment scenario

We have to process the data before feeding it into the model and after receiving the output. The processing done before feeding it into the model is called pre-processing, and processing done on the model output is called post-processing. 

Let's start with taking a quick look at the below Runefile.
 ```yaml
version: 1
image: runicos/base

pipeline:
  image:
    capability: IMAGE
    outputs:
      - type: U8
        dimensions: [1, 96, 96, 1]
    args:
      pixel-format: "@PixelFormat::GrayScale"
      height: 96
      width: 96
  person_detection:
    model: "./person_detection.tflite"
    inputs:
      - image
    outputs:
      - type: U8
        dimensions: [1, 1, 1, 3]
  most_confident_index:
    proc-block: "hotg-ai/proc-blocks#most_confident_indices"
    inputs:
      - person_detection
    outputs:
      - type: U32
        dimensions: [1]
    args:
      count: 1
  label:
    proc-block: "hotg-ai/proc-blocks#label"
    inputs:
      - most_confident_index
    outputs:
      - type: UTF8
        dimensions: [1]
    args:
      labels:
        - unknown
        - person_prob
        - not_person_prob
  serial:
    out: SERIAL
    inputs:
      - label
 ```
 You can notice a lot of new things in the Runefile. Let's start understanding it one by one.
 
## Choose a Model
The first step of creating a Rune is to find (or train) a Machine Learning Model that matches your application.

Developers embedding Rune in their applications can provide inference backends for any model type they want, but by default, Rune comes with support for [TensorFlow Lite](https://www.tensorflow.org/lite).

Several pre-trained TensorFlow Lite models are available for download from the [TF Hub](https://tfhub.dev/s?deployment-format=lite&module-type=image-classification&publisher=google). In the above Runefile, we use a person detection model, which takes grayscale image as input and detects whether a person is present in the image. You may not find this model on TF Hub but you can use it from our repo.

Now, we have selected the model. First, we would like to know model input/output information. This information will be used to build the Runefile. To find this, we will run
```bash
rune model-info person_detection.tflite
```
We get:
```
Inputs:
        input: u8[1,96,96,1]
Outputs:
        MobilenetV1/Logits/Conv2d_1c_1x1/act_quant/FakeQuantWithMinMaxVars: u8[1,1,1,3]
```
Comparing input with the image format: `[batch_size, height, width, channels]`, we can see the model will take a `96 x 96` grayscale image (because the channel is 1). The input image type is `u8`, i.e., all the values will lie between `[0, 255]`. The output is an array of size `[1, 1, 1, 3]`.

## Capability
Now, we have got all the information about our model. We will start by setting our first **node** name as the image (you can change it to anything suitable to you) and will define  `capability` to `IMAGE` to take an image as input to our `rune`. We will set the output type to `u8` and dimensions to `[1, 96, 96, 1]` because, as we saw above, this is the format needed by our model. We will set our argument likewidth, height, and format of image in the `args` section. 

Basically, we process the data until we change it to the format needed by our model. In the later chapters, we will have to include some `proc-blocks` before our model node to change the input data to the format required by our model node. 

The `IMAGE` capability take the following arguments:
- width - the image's width in pixels
- height - the image's height in pixels
- pixel-format - the format used by the pixels. Possible values are:
    - @PixelFormat::Grayscale
    - @PixelFormat::RGB
    - @PixelFormat::BGR
```yaml
image:
 capability: IMAGE
 outputs:
   - type: U8
     dimensions: [1, 96, 96, 1]
 args:
   pixel-format: "@PixelFormat::GrayScale"
   height: 96
   width: 96
```
You can find more details on how to select capability and arguments supported by each capability [here](https://hotg.dev/docs/reference/runefile_yml#capabilities) (_highly recommended_).

Every node in the Runefile will have inputs and outputs (except the capability node, which only has output because it's the starting of our pipeline). You make a pipeline for data flow by connecting output of node-1 to the input of node-2.

## Model
We have already chosen our model. Now, it's time to define our model node in the Runefile. First, let's give our model node a name. I have given it _person_detection_  as this the name of our model. You can change it to something you find suitable. Next, we will provide a path to our model file in the `model` and connect the `image` node to the `model` node by setting input to `image`. Finally, we will select output type to `u8` and output dimensions to `[1, 1, 1, 3]`, which we got through model-info. The model will return score for three labels:
- unknown
- person_prob
- not_person_prob
```yaml
person_detection:
  model: "./person_detection.tflite"
  inputs:
    - image
  outputs:
    - type: U8
      dimensions: [1, 1, 1, 3]
```
We have got the output, and we would like to clean it by transforming the output data so that it could be converted to a valid format. Next, we will use a **proc-block** to perform these transformations.

## Proc-Block
A procedural block (aka "proc block") is a Rust crate that exposes functionality for transforming data from one form to another. We have created a list of proc-block for you. You can find it [here](https://github.com/hotg-ai/proc-blocks). Proc block stages are differentiated using a proc-block: `hotg-ai/proc-blocks#........` property.

Common properties supported by proc blocks are:
- args
- inputs
- outputs

We have got the output score for all three classes from our model. We want to find out which class has the highest score so that later we can print that class name as output. To get the index of class with the highest confidence value, we will use [_most_confident_indices_](https://github.com/hotg-ai/proc-blocks/tree/master/most_confident_indices) proc-block (A proc block which, when given a list of confidences, will return the indices of the top N most confident values). Let's start by setting our proc-block node name to `most_confident_indices`.  Next set following property:

1. `proc-block: hotg-ai/proc-block#most_confident_indices` -> path of the proc-block set to it's location in the github repo
2. Connect the output of the model node to the input of the proc-block.
3. Define outputs:
       - type: we will get an index that is a positive integer so you can set it to `u8, u16, u32` etc.
       - dimensions: It's a multiclass classification model, so we have set it to `[1]`. If you are using a multilabel classification 
          model, you can change it to `[2]` , `[3]` or at your convenience.
4. `args` is used to return a count of indices from the top N most confident values. You will have to set the `count` same as the output dimension.
          
Now, let's write proc-block node using above information
```yaml
most_confident_index:
    proc-block: "hotg-ai/proc-blocks#most_confident_indices"
    inputs:
      - person_detection
    outputs:
      - type: U32
        dimensions: [1]
    args:
      count: 1
```
Till now, we have got an index of the most confident index. Next, we would like to assign a label to this index. For this, we will use the [_label_](https://github.com/hotg-ai/proc-blocks/tree/master/label) proc-block (A proc block which, when given a set of indices, will return their associated labels). We will follow the above approach and will connect output of the most_confident_indices node to the input of our label node. In `args` property, we will add all the labels of our model. We will get `string` as output, so we will have to set the output type to `utf8`.
```yaml
label:
  proc-block: "hotg-ai/proc-blocks#label"
  inputs:
    - most_confident_index
  outputs:
    - type: UTF8
      dimensions: [1]
  args:
    labels:
      - unknown
      - person_prob
      - not_person_prob
```
## out
Finally, connect the output of the label proc-block node to the input of serial node.
```yaml
serial:
  out: SERIAL
  inputs:
    - label
```
If you have followed the above steps correctly, you have got your Runefile.

## Build the Rune
First, create an empty `Runefile.yml` and write the above code in the Runefile.
```bash
cd /workspace/tutorials/lessons/lesson-2
touch Runefile.yml
```
Ok, so you have written your `Runefile.yml` Let's now compile and test what you have so far. 

Run the below command to build the `rune`
```bash
rune build Runefile.yml
```
It will create a `lesson-2.rune` for you. 

Test your 'rune` and see the output you are getting. Run the below command In the terminal.
```bash
rune run lesson-2.rune --image image_grayscale.png
```