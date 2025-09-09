import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Use a singleton pattern to avoid re-initializing the landmarker.
let faceLandmarker: FaceLandmarker | undefined = undefined;

/**
 * Creates and initializes the MediaPipe FaceLandmarker instance.
 * This is an asynchronous operation that involves loading the model and WASM files.
 * @returns A promise that resolves with the initialized FaceLandmarker instance.
 */
export async function createFaceLandmarker(): Promise<FaceLandmarker> {
  // If the landmarker is already created, return it.
  if (faceLandmarker) {
    console.log('FaceLandmarker instance already exists.');
    return faceLandmarker;
  }

  console.log('Creating a new FaceLandmarker instance...');

  // 1. Create a fileset resolver to locate the WASM files.
  const vision = await FilesetResolver.forVisionTasks(
    // Use a CDN to fetch the WASM files.
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  // 2. Create the FaceLandmarker with the required options.
  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      // Path to the model file, hosted on Google's servers.
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      // Use GPU for better performance if available.
      delegate: "GPU"
    },
    // We need blendshapes for expression analysis (e.g., brow lowering).
    outputFaceBlendshapes: true,
    // The running mode must be 'VIDEO' for processing continuous streams.
    runningMode: 'VIDEO',
    // We only need to track one face for this application.
    numFaces: 1
  });

  console.log('FaceLandmarker instance created successfully.');
  return faceLandmarker;
}
