import * as ort from "onnxruntime-web";

/** A character candidate. */
export type RecognitionCandidate = {
  character: string;
  /** Cosine similarity to the reference vector that best matches this character. */
  confidence: number;
};

/** Preprocessing constants. */
type PreprocessingConfig = {
  /** Expected model input size, as [height, width]. */
  input_size: [number, number];
  /** Per-channel normalization mean. */
  mean: [number, number, number];
  /** Per-channel normalization standard deviation. */
  std: [number, number, number];
  embedding_dim: number;
};

/** Index describing the layout of the binary reference embeddings file. */
type ReferenceIndex = { characters: string[] };

type RecognizerResources = {
  /** ONNX inference session. */
  session: ort.InferenceSession;
  preprocessingConfig: PreprocessingConfig;
  /** Reference vectors, one per character, in the same order as `referenceCharacters`. */
  referenceMatrix: Float32Array;
  /** Character for each row in `referenceMatrix`, same order. */
  referenceCharacters: string[];
};

const MODEL_URL = "/models/hanzi_embedder.onnx";
const PREPROCESSING_CONFIG_URL = "/models/embedder_preprocessing_config.json";
const REFERENCE_INDEX_URL = "/models/reference_index.json";
const REFERENCE_BIN_URL = "/models/reference_embeddings.bin";

ort.env.wasm.wasmPaths = "/ort/";

// Cache the PROMISE.
// If recognizeCharacter() is called again before the first load finishes, this ensures both calls await the same load instance.
let recognizerPromise: Promise<RecognizerResources> | null = null;

/**
 * Convert `float32` value to its `float16` bit pattern.
 *
 * `onnxruntime-web` has no native `float16` type, so fp16 model inputs must be packed as raw bits in `Uint16Array` instead of `Float32Array`.
 *
 * Used when building the input tensor for this app's fp16 model.
 *
 * Inverse of {@link float16BitsToFloat32}.
 *
 * @param value - The float32 number to convert.
 * @returns The 16-bit bit pattern, as an integer in `[0, 0xFFFF]`.
 */
const float32ToFloat16Bits = (value: number): number => {
  const floatView = new Float32Array(1);
  const int32View = new Int32Array(floatView.buffer);
  floatView[0] = value;
  const bits = int32View[0];

  const sign = (bits >>> 16) & 0x8000;
  let exponent = ((bits >>> 23) & 0xff) - 112;
  let mantissa = bits & 0x7fffff;

  if (exponent <= 0) return sign;

  if (exponent >= 31) return sign | 0x7c00;

  mantissa += 0x1000;
  if (mantissa & 0x800000) {
    mantissa = 0;
    exponent += 1;
    if (exponent >= 31) return sign | 0x7c00;
  }
  return sign | (exponent << 10) | (mantissa >>> 13);
};

/**
 * Convert an IEEE 754 half-precision (float16) bit pattern back to a float32.
 *
 * Decode the raw `Uint16Array` values `onnxruntime-web` returns for fp16 model outputs back into JS numbers.
 *
 * Inverse of {@link float32ToFloat16Bits}.
 *
 * @param bits - A 16-bit bit pattern, as an integer in `[0, 0xFFFF]`.
 * @returns The equivalent float32 value.
 */
const float16BitsToFloat32 = (bits: number): number => {
  const sign = bits & 0x8000 ? -1 : 1;
  const exponent = (bits >>> 10) & 0x1f;
  const mantissa = bits & 0x3ff;

  if (exponent === 0) return sign * mantissa * 2 ** -24;

  if (exponent === 31) return mantissa ? NaN : sign * Infinity;

  return sign * (1 + mantissa / 1024) * 2 ** (exponent - 15);
};

/**
 * Convert a `Float32Array` to a `Uint16Array` of `float16` bit patterns by {@link float32ToFloat16Bits}.
 *
 * Used to build fp16 input tensors for this app's model.
 *
 * @param src - The float32 values to convert.
 * @returns A same-length array of float16 bit patterns.
 */
const toFloat16Array = (src: Float32Array): Uint16Array => {
  const out = new Uint16Array(src.length);
  for (let i = 0; i < src.length; i++) out[i] = float32ToFloat16Bits(src[i]);
  return out;
};

/**
 * Convert a `Uint16Array` of float16 bit patterns to a `Float32Array` by {@link float16BitsToFloat32}.
 *
 * Used to decode the app's fp16 model's raw output tensor.
 *
 * @param src - The float16 bit patterns to convert.
 * @returns A same-length array of float32 values.
 */
const fromFloat16Array = (src: Uint16Array): Float32Array => {
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i++) out[i] = float16BitsToFloat32(src[i]);
  return out;
};

/**
 * Fetch and parse the ONNX model, the preprocessing config, and the reference embedding table.
 *
 * Reference embeddings are stored as raw binary so we need to also process a JSON index file.
 *
 * @returns The loaded session, config, and reference table.
 */
const loadRecognizer = async (): Promise<RecognizerResources> => {
  const [loadedSession, configRes, indexRes, binRes] = await Promise.all([
    ort.InferenceSession.create(MODEL_URL),
    fetch(PREPROCESSING_CONFIG_URL),
    fetch(REFERENCE_INDEX_URL),
    fetch(REFERENCE_BIN_URL),
  ]);
  const preprocessingConfig: PreprocessingConfig = await configRes.json();
  const referenceIndex: ReferenceIndex = await indexRes.json();
  const binBuffer = await binRes.arrayBuffer();
  const referenceMatrix = new Float32Array(binBuffer);
  return {
    session: loadedSession,
    preprocessingConfig,
    referenceMatrix,
    referenceCharacters: referenceIndex.characters,
  };
};

const getRecognizer = (): Promise<RecognizerResources> => {
  if (!recognizerPromise) recognizerPromise = loadRecognizer();

  return recognizerPromise;
};

/**
 * Start loading the recognizer's resources in the background.
 *
 * The model is designed to run on mobile devices but WASM compilation takes a few seconds which can be disrupting.
 */
export const preloadRecognizer = (): Promise<void> => {
  return getRecognizer().then(
    () => undefined,
    () => undefined
  );
};

/**
 * Recognize a hand drawn character from a canvas.
 *
 * Compute the drawing's embedding, then find the most similar reference vector with cosine similarity.
 *
 * It is required that the canvas is drawn with black strokes on a white background.
 *
 * @param canvas - The canvas the character was drawn on.
 * @param topN - How many ranked candidates to return. Default to `5`.
 * @returns Candidates, most similar first.
 */
export const recognizeCharacter = async (
  canvas: HTMLCanvasElement,
  topN: number = 5
): Promise<RecognitionCandidate[]> => {
  const { session, preprocessingConfig, referenceMatrix, referenceCharacters } =
    await getRecognizer();
  const [h, w] = preprocessingConfig.input_size;
  const { mean, std, embedding_dim: embeddingDim } = preprocessingConfig;
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d");
  if (!ctx)
    throw new Error("Could not get 2D context for preprocessing canvas.");
  ctx.drawImage(canvas, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  const pixels = imageData.data;
  const hw = h * w;
  const tensorData = new Float32Array(3 * hw);
  const [meanR, meanG, meanB] = mean;
  const [stdR, stdG, stdB] = std;
  for (let i = 0, p = 0; i < hw; i++, p += 4) {
    tensorData[i] = (pixels[p] / 255 - meanR) / stdR;
    tensorData[hw + i] = (pixels[p + 1] / 255 - meanG) / stdG;
    tensorData[2 * hw + i] = (pixels[p + 2] / 255 - meanB) / stdB;
  }

  // The model is fp16 so the inputs must be `float16` bit patterns.
  const inputTensor = new ort.Tensor("float16", toFloat16Array(tensorData), [
    1,
    3,
    h,
    w,
  ]);
  const results = await session.run({ input: inputTensor });

  // Output is `float16` so convert back to `float32` for the similarity math.
  const rawEmbedding = fromFloat16Array(results.embedding.data as Uint16Array);

  // L2-normalize the embedding.
  // The reference embeddings are already normalized so the dot product is equivalent to cosine similarity.
  let normSq = 0;
  for (let i = 0; i < embeddingDim; i++)
    normSq += rawEmbedding[i] * rawEmbedding[i];
  const invNorm = 1 / Math.sqrt(normSq);
  const embedding = new Float32Array(embeddingDim);
  for (let i = 0; i < embeddingDim; i++)
    embedding[i] = rawEmbedding[i] * invNorm;

  const numVectors = referenceCharacters.length;
  const similarities = new Float32Array(numVectors);
  let offset = 0;
  for (let i = 0; i < numVectors; i++) {
    let dot = 0;
    for (let d = 0; d < embeddingDim; d++) {
      dot += embedding[d] * referenceMatrix[offset + d];
    }
    similarities[i] = dot;
    offset += embeddingDim;
  }

  const ranked = Array.from(similarities, (confidence, i) => ({
    character: referenceCharacters[i],
    confidence,
  })).sort((a, b) => b.confidence - a.confidence);

  return ranked.slice(0, topN);
};
