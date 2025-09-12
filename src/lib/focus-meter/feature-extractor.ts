/**
 * The output structure for our feature extraction.
 */
export interface FocusFeatures {
  headPitch: number;
  headYaw: number;
  browDown: number;
  gazeDev: number;
}

/**
 * Extracts head pose (pitch and yaw) from the facial transformation matrix.
 * @param matrix A 16-element Float32Array representing the transformation matrix.
 * @returns An object with head pitch and yaw in radians.
 */
function extractHeadPose(matrix: Float32Array | undefined): { headPitch: number, headYaw: number } {
  if (!matrix || matrix.length < 16) {
    return { headPitch: 0, headYaw: 0 };
  }

  // Matrix elements (column-major order from MediaPipe)
  const m11 = matrix[0];
  // const m12 = matrix[1];
  // const m13 = matrix[2];
  // const m14 = matrix[3];
  const m21 = matrix[4];
  // const m22 = matrix[5];
  // const m23 = matrix[6];
  // const m24 = matrix[7];
  const m31 = matrix[8];
  // const m32 = matrix[9];
  // const m33 = matrix[10];
  // const m34 = a[11];

  // Extract Euler angles from the rotation matrix part.
  // Formulae are based on standard conversions.
  // Pitch (around X-axis)
  const headPitch = Math.asin(-m31);
  // Yaw (around Y-axis)
  const headYaw = Math.atan2(m21, m11);

  // We don't need roll for this use case.

  return { headPitch, headYaw };
}

/**
 * Extracts the 'browDown' score from face blendshapes.
 * @param blendshapes An array of blendshape categories from MediaPipe.
 * @returns The score for the 'browDown' blendshape, or 0 if not found.
 */
function extractBrowDown(blendshapes: any[] | undefined): number {
  if (!blendshapes || blendshapes.length === 0) return 0;
  // MediaPipe FaceLandmarker returns [{ categories: [{categoryName, score}, ...] }]
  const first = blendshapes[0] as any
  const arr: any[] = Array.isArray(first?.categories) ? first.categories : (Array.isArray(first) ? first : [])
  if (!Array.isArray(arr) || arr.length === 0) return 0
  const left = arr.find((s: any) => s?.categoryName === 'browDown_L')?.score || 0
  const right = arr.find((s: any) => s?.categoryName === 'browDown_R')?.score || 0
  return (left + right) / 2
}

/**
 * Placeholder for gaze deviation extraction.
 * @param landmarks The array of face landmarks from MediaPipe.
 * @returns A placeholder value of 0.
 */
function extractGaze(landmarks: any[] | undefined): number {
  // This is a complex calculation involving iris and eye corner landmarks.
  // For now, we'll return a placeholder.
  return 0;
}

/**
 * The main feature extraction function.
 * It takes the result from MediaPipe's FaceLandmarker and computes the required features.
 * @param result The result object from MediaPipe's detectForVideo method.
 * @returns An object containing the computed focus features.
 */
export function extractFeatures(result: any): FocusFeatures {
  const { headPitch, headYaw } = extractHeadPose(result.facialTransformationMatrixes?.[0]);
  const browDown = extractBrowDown(result.faceBlendshapes);
  const gazeDev = extractGaze(result.faceLandmarks);

  return {
    headPitch,
    headYaw,
    browDown,
    gazeDev,
  };
}
