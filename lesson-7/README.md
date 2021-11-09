# Convert Tensorflow model to tflite

TinyML area focuses on deploying simple yet powerful models on extremely low-power, low-cost microcontrollers at the network edge. TinyML can run on microcontroller development boards with extensive hardware abstraction, such as Arduino products, deploying an application onto hardware is easy. Edge devices often have limited memory or computational power. Various optimizations can be applied to the models so that they can be run within these constraints. 

In this lesson, we will learn how to optimize a TensorFlow model to convert it to tflite. TensorFlow Lite and the [TensorFlow Model Optimization Toolkit](https://www.tensorflow.org/model_optimization) provide tools to minimize the complexity of optimizing inference. TensorFlow Lite is a set of tools that enables on-device machine learning by helping developers optimize their models to run on mobile, embedded and IoT devices.

## Why models should be optimized

- **Size Reduction**: A small size model will require less memory footprints. It's very crucial for microcontrollers that have memory in MBs and RAM in KBs.

- **Low Power Consumption**: A optimized model requires less computation power, resulting in less energy. 

- **Latency Reduction**: Optimization reduce the amount of computation required to run inference using a model, resulting in lower latency. Latency can also have an impact on power consumption.

- **Accelerator Compatibility**: Some hardware accelerators, such as the Edge TPU, can run inference extremely fast with models that have been correctly optimized.

## Trade-offs
Optimizations can potentially result in changes in model accuracy, which must be considered during the application development process.

## Types of Optimization

1. **Quantization**: works by reducing the precision of the numbers used to represent a model's parameters, which by default are 32-bit floating-point numbers. 

2. **Pruning**: This works by removing parameters within a model that only has a minor impact on its predictions.

3. **Clustering** works by grouping the weights of each layer in a model into a predefined number of clusters, then sharing the centroid values for the weights belonging to each cluster.

The last two approaches aren't mature enough, so we will focus on the first approach.

---

## Quantization

The following types of quantization are available in TensorFlow Lite:

| Technique | Data requirements | Size reduction | Accuracy | Supported hardware |
| --- | --- | --- | --- | --- |
| Post-training float16 quantization | No data | Up to 50% | Insignificant accuracy loss | CPU, GPU |
| Post-training dynamic range quantization | No data | Up to 75% | Smallest accuracy loss | CPU, GPU (Android) |
| Post-training integer quantization | Unlabelled representative sample | Up to 75% | Small accuracy loss | CPU, GPU (Android), EdgeTPU, Hexagon DSP |
| Quantization-aware training | Labelled training data | Up to 75% | Smallest accuracy loss | CPU, GPU (Android), EdgeTPU, Hexagon DSP |

We will use an MNIST dataset example to show you how to quantize a model.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googlecolab/colabtools/blob/master/notebooks/colab-github-demo.ipynb)


