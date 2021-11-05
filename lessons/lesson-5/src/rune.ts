
const RUNE_URL = "https://rune-registry.web.app/registry/hotg-ai/mobilenet_v2_1/rune.rune"; 

export const runRune = async (image: HTMLImageElement) =>  {
    let input = new Uint8Array();
    let output = { elements:""};
    let runTime;
    class ImageCapability {
      parameters = {};
      generate(dest, id) {
          dest.set(input, 0);
      }
      setParameter(key, value) {
          this.parameters[key] = value;
      }
    }
    
    class SerialOutput {
      consume(data) {
          const utf8 = new TextDecoder();
          output = JSON.parse(utf8.decode(data));
      }
    }
  
    const imageCap = new ImageCapability();
    const imports = {
        createCapability: () => imageCap,
        createOutput: () => new SerialOutput(),
        createModel: (mime, model_data) => rune.TensorFlowModel.loadTensorFlowLite(model_data),
        log: (log) => { console.log(log) },
    };
  
    if (runTime === undefined) {
      const response = await fetch(RUNE_URL);
      const bytes = new Uint8Array(await response.arrayBuffer());
      runTime = await rune.Runtime.load(bytes.buffer, imports);
    }
    //get input and resize
    input = rune.TensorFlowModel.resizeImage(image, 224);
    runTime.call();
  
    //get output and convert to image
    console.log("Result:", output);
    return output.elements;
  
  }