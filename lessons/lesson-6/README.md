# Adding wordlist and Proc-blocks.


## Adding a wordlist in the Runefile

In lesson-2, we look at how to manually add [labels](https://github.com/hotg-ai/tutorials/blob/16ac4c7f0c7e14435fe71dbad37a5534f15ea6dd/lessons/lesson-2/Runefile.yml#L38) in the `args` property of the [label ](https://github.com/hotg-ai/proc-blocks/tree/master/label) proc-block. This will be a cumbersome process if we have a large number of labels ( [Landmark model](https://tfhub.dev/google/on_device_vision/classifier/landmarks_classifier_north_america_V1/1) has 100k labels). Instead of manually adding all those labels in the Runefile, we can provide a path to the `txt, csv` files using a `wordlist`
To do so, we add `resources` outside the ML pipeline in the Runefile.
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
      wordlist: $WORD_LIST    # <-------------
 serial:
   out: SERIAL
   inputs:
     - label
    
resources:             #  <---------------
  WORD_LIST:
    path: ./label.txt
    type: string
```

## Proc-blocks

The processing block is used to process your data by transforming it from one form to another. We have a list of them over [here](https://github.com/hotg-ai/proc-blocks). You can also create your own proc-block if you need one, or let us know we can help you make one. 

### 1. argmax

It returns indices of the max element of the array.
```yaml
image: runicos/base
version: 1

pipeline:
  random_input:
    capability: RAND
    outputs:
      - type: f32
        dimensions: [5]
  argmax:
    proc-block: "hotg-ai/proc-blocks#argmax"
    inputs:
      - random_input
    outputs:
      - type: u32
        dimensions: [1]
  serial:
    out: SERIAL
    inputs:
      - random_input
      - argmax
```
E.g. I got this output after running rune build from the above Runefile. As we can see 2nd index has largest value.
```
random_input: {"type_name":"f32","channel":1,"elements":[-5.7317625e 28, -1.5026809e14, 3.0563458e26, 8.577695e22, 5.0970436e-17],"dimensions":[5]};
argmax: {"type_name":"u32","channel":1,"elements":[2],"dimensions":[1]}
```
It takes only type `f32` tensor as input and give back `u32` tensor as output. This proc-block get used in the [BERT rune](https://github.com/hotg-ai/test-runes/blob/d2fc9b83c8497f01420e505e81e85f9d7126bb11/nlp/bert/Runefile.yml#L48).

### 2. audio_float_conversion

Many audio models take in an input of f32. This proc-block convert our input from an i16 data type to a floating-point value.

This proc-block used in the [YAMNET rune](https://github.com/hotg-ai/test-runes/blob/d2fc9b83c8497f01420e505e81e85f9d7126bb11/audio/yamnet/Runefile.yml#L13). You can find more details on this in our [article](https://tinyverse.substack.com/p/rune-ifying-audio-models).

### 3.  fft

This proc-block converts a signal from its original domain (often time or space) to a representation in the frequency domain.

This proc-block is used in the [microspeech rune](https://github.com/hotg-ai/rune/blob/a0fa8563eadb9fd7254955e735671ff79e80824f/examples/microspeech/Runefile.yml#L15). You can find more detail in our [article](https://tinyverse.substack.com/p/processing-blocks-in-a-machine-learning).

### 4. image-normalization

We saw this proc-block in lesson-3. It transform our u8 type to f32 and normalize the image matrix in range [0, 1].

### 5. label

We saw this proc-block in lesson-2. A proc block which, when given a set of indices, will return their associated labels.

### 6. modulo

As the same suggest, it returns the remainder of a division, after one number is divided by another. 

This proc-block is used in the [sine rune](https://github.com/hotg-ai/rune/blob/a0fa8563eadb9fd7254955e735671ff79e80824f/examples/sine/Runefile.yml#L12).

### 7. most_confident_indices.

We saw this proc-block in lesson-2. A proc block which, when given a list of confidences, will return the indices of the top N most confident values.

### 8. noise-filtering

This proc-block perform a couple of functions:
- Reduces noise within each frequency bin (channel)
- Applies a gain control algorithm to each frequency bin (channel)
- Applies log2 function and scales the output.

This proc-block is used in the [microspeech rune](https://github.com/hotg-ai/rune/blob/a0fa8563eadb9fd7254955e735671ff79e80824f/examples/microspeech/Runefile.yml#L24). You can find more detail in our [article](https://tinyverse.substack.com/p/processing-blocks-in-a-machine-learning).

### 9. normalize

This proc-block normalize the input to the range `[0, 1].

This proc-block is used in our [gesture rune](https://github.com/hotg-ai/rune/blob/a0fa8563eadb9fd7254955e735671ff79e80824f/examples/gesture/Runefile.yml#L16).

### 10. parse

 A proc block which can parse a string to numbers. This proc-block could be helpful in doing non-ML tasks.
 
 ```yaml
image: runicos/base
version: 1

pipeline:
  number_list:
    capability: RAW
    outputs:
      - type: u8
        dimensions: [50]  # ----> keep this dimension a bit larger rune will automatically adjust it.
  utf8_decode:
    proc-block: "hotg-ai/proc-blocks#utf8_decode"
    inputs:
        - number_list
    outputs:
        - type: utf8
          dimensions: [50]      # ----> keep this dimension a bit larger rune will automatically adjust it.
  parse:
    proc-block: "hotg-ai/proc-blocks#parse"
    inputs:
        - utf8_decode
    outputs:
        - type: u32
          dimensions: [5]
  word_list: 
    proc-block: "hotg-ai/proc-blocks#label"
    inputs:
      - parse
    outputs:
      - type: utf8
        dimensions: [5]
    args:
      labels:
        - zero        
        - one
        - two
        - three
        - four
        - five
        - six
        - seven
        - eight
        - nine
        - ten
  serial:
    out: SERIAL
    inputs:
      - word_list
```
After building a rune using above Runefile run `rune run test.rune --raw input.txt`, where input .txt contains `1 2 3 4 5`. You will get this as output.
```
{"type_name":"utf8","channel":1,"elements":["one","two","three","four","five"],"dimensions":[5]}
```
P.S. Keep capability dimension a bit a bit larger rune will automatically adjust it.

### 11. segment_output

This proc-block is useful in image segmentation. A proc-block which takes a rank 4 `tensor` as input, whose dimension is of this form `[1, x, y, z]`. It will return:
-  a 2-d `tensor` after performing argmax along the axis-3 of the tensor
- a 1-d `tensor` which a `set` of all the number present in the above 2-d `tensor`

We use this in [deep_lab rune](https://github.com/hotg-ai/test-runes/blob/d2fc9b83c8497f01420e505e81e85f9d7126bb11/image/deep_labv3/Runefile.yml#L29).

### 12. softmax

A proc-block which apply softmax function over the tensor list.

### 13. tokenizers 

This proc-block is helpful in the NLP models. Tokenization is a way of separating a piece of text into smaller units called tokens. E.g. bert tokenizer
```
tokens: ['[CLS]', 'this', 'is', 'a', 'nice', 'sentence', '.', '[SEP]']
input_ids: [101, 2023, 2003, 1037, 3835, 6251, 1012, 102]
```

we use this in [bert rune](https://github.com/hotg-ai/test-runes/blob/d2fc9b83c8497f01420e505e81e85f9d7126bb11/nlp/bert/Runefile.yml#L21). You can find more details in our [article](https://tinyverse.substack.com/p/runebert-nlp-on-the-edge).

### 14. utf8_decode

A proc block which can convert u8 bytes to utf8.

```yaml
image: runicos/base
version: 1

pipeline:
  number_list:
    capability: RAW
    outputs:
      - type: u8
        dimensions: [50]
  utf8_decode:
    proc-block: "hotg-ai/proc-blocks#utf8_decode"
    inputs:
        - number_list
    outputs:
        - type: utf8
          dimensions: [50]
  serial:
    out: SERIAL
    inputs:
      - utf8_decode
```
After building a rune using above Runefile run `rune run test.rune --raw input.txt`, where input .txt contains `one two three four five`. You will get this as output.
```
{"type_name":"utf8","channel":1,"elements":["one two three four five"],"dimensions":[1]}
```
The `capability` convert the input data to `u8` bytes so we can use this proc-block to convert them back to `utf8`