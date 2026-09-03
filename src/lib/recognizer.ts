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
 * Helpers for `onnxruntime-web`'s fp16 tensors.
 *
 * JS doesn't have `float16` type and `onnxruntime-web` output can be `Float16Array` or `Uint16Array`, so we need to decode it to `Float32Array` for further processing.
 */
const Float16 = {
  /**
   * Convert a `float32` value to its raw `float16` bit pattern.
   *
   * Inverse of {@link Float16.fromBits}.
   *
   * @param value - The `float32` number to convert.
   * @returns The `float16` bit pattern, as an integer in `[0, 0xFFFF]`.
   */
  toBits(value: number): number {
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
  },

  /**
   * Convert a raw `float16` bit pattern back to a `float32`.
   *
   * Inverse of {@link Float16.toBits}.
   *
   * @param bits - A `float16` bit pattern, as an integer in `[0, 0xFFFF]`.
   * @returns The equivalent `float32` value.
   */
  fromBits(bits: number): number {
    const sign = bits & 0x8000 ? -1 : 1;
    const exponent = (bits >>> 10) & 0x1f;
    const mantissa = bits & 0x3ff;

    if (exponent === 0) return sign * mantissa * 2 ** -24;
    if (exponent === 31) return mantissa ? NaN : sign * Infinity;

    return sign * (1 + mantissa / 1024) * 2 ** (exponent - 15);
  },

  /**
   * Convert a `Float32Array` to a `Uint16Array` of `float16` bit patterns.
   * Used to build this app's fp16 model's input tensor.
   *
   * @param src - The `float32` values to convert.
   * @returns A same-length array of `float16` bit patterns.
   */
  encode(src: Float32Array): Uint16Array {
    const toBits = Float16.toBits;
    const out = new Uint16Array(src.length);
    for (let i = 0; i < src.length; i++) out[i] = toBits(src[i]);
    return out;
  },

  /**
   * Decode a model's fp16 output tensor data into a `Float32Array` support both a decoded `Float16Array` value, or a `Uint16Array` of raw bit patterns.
   *
   * @param data - The output tensor's `.data`.
   * @returns The decoded embedding values as a `Float32Array`.
   */
  decodeOutput(data: unknown): Float32Array {
    if (typeof Float16Array !== "undefined" && data instanceof Float16Array)
      return Float32Array.from(data as unknown as ArrayLike<number>);

    const fromBits = Float16.fromBits;
    const bits = data as Uint16Array;
    const out = new Float32Array(bits.length);
    for (let i = 0; i < bits.length; i++) out[i] = fromBits(bits[i]);
    return out;
  },
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
  const inputTensor = new ort.Tensor("float16", Float16.encode(tensorData), [
    1,
    3,
    h,
    w,
  ]);
  const results = await session.run({ input: inputTensor });

  const rawEmbedding = Float16.decodeOutput(results.embedding.data);

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
  const top: RecognitionCandidate[] = [];
  let offset = 0;
  for (let i = 0; i < numVectors; i++) {
    let dot = 0;
    for (let d = 0; d < embeddingDim; d++) {
      dot += embedding[d] * referenceMatrix[offset + d];
    }
    offset += embeddingDim;

    if (top.length < topN || dot > top[top.length - 1].confidence) {
      let insertAt = top.length;
      while (insertAt > 0 && top[insertAt - 1].confidence < dot) insertAt--;
      top.splice(insertAt, 0, {
        character: referenceCharacters[i],
        confidence: dot,
      });
      if (top.length > topN) top.pop();
    }
  }

  return top;
};
