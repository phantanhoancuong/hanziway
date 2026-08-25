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
type ReferenceIndex = {
  /** Characters in the same order their vectors appear in the binary file. */
  characters: string[];
  /** Number of reference sub-center vectors each character has. */
  sub_center_counts: number[];
  embedding_dim: number;
};

type RecognizerResources = {
  /** ONNX inference session. */
  session: ort.InferenceSession;
  preprocessingConfig: PreprocessingConfig;
  /** Reference vectors (character, sub-center) pair. */
  referenceMatrix: Float32Array;
  /** Map each row in `referenceMatrix` back to its character. */
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
  const referenceCharacters: string[] = [];
  for (let i = 0; i < referenceIndex.characters.length; i++) {
    const char = referenceIndex.characters[i];
    const count = referenceIndex.sub_center_counts[i];
    for (let j = 0; j < count; j++) {
      referenceCharacters.push(char);
    }
  }
  return {
    session: loadedSession,
    preprocessingConfig,
    referenceMatrix,
    referenceCharacters,
  };
};

const getRecognizer = (): Promise<RecognizerResources> => {
  if (!recognizerPromise) {
    recognizerPromise = loadRecognizer();
  }
  return recognizerPromise;
};

/**
 * Recognize a hand drawn character from a canvas.
 *
 * Compute the drawing's embedding, then find the most similar reference vectors with cosine similarity.
 *
 * Each character may have multiple reference vectors so a character's overall confidence is its best matching subcenter.
 *
 * It is required that the canvas is drawn with black strokes on a white background.
 *
 * @param canvas - The canvas the character was drawn on.
 * @param topN - How many ranked candidates to return. Default to 5.
 * @returns Candidates, most similar first, deduplicated by character.
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

  // Convert to normalized CHW float32 to match training proprocessing.
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
  const inputTensor = new ort.Tensor("float32", tensorData, [1, 3, h, w]);
  const results = await session.run({ input: inputTensor });
  const rawEmbedding = results.embedding.data as Float32Array;

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

  const bestPerCharacter = new Map<string, number>();
  for (let i = 0; i < numVectors; i++) {
    const char = referenceCharacters[i];
    const sim = similarities[i];
    const existing = bestPerCharacter.get(char);
    if (existing === undefined || sim > existing) {
      bestPerCharacter.set(char, sim);
    }
  }

  return Array.from(bestPerCharacter.entries())
    .map(([character, confidence]) => ({ character, confidence }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topN);
};
