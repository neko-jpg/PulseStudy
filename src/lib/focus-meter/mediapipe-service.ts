import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

let faceLandmarker: FaceLandmarker | undefined

export async function createFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker

  // 1) Use local WASM files (matching the stable version).
  const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm')

  // 2) Define base options with GPU as the preferred delegate.
  const baseOptions = {
    modelAssetPath: '/mediapipe/models/face_landmarker.task',
    delegate: 'GPU' as const,
  }

  try {
    // Attempt to create the landmarker with GPU.
    console.log('Attempting to create FaceLandmarker with GPU delegate...');
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions,
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
    })
    console.log('FaceLandmarker created successfully with GPU.');
  } catch (e) {
    // If GPU initialization fails, fall back to CPU.
    console.warn('GPU delegate failed to initialize. Falling back to CPU.', e);
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { ...baseOptions, delegate: 'CPU' },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
    })
    console.log('FaceLandmarker created successfully with CPU.');
  }

  return faceLandmarker
}
