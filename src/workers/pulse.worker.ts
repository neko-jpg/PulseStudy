import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'

type MsgIn = { type: 'frame'; frame: ImageBitmap; ts: number }

let faceLandmarker: FaceLandmarker | null = null
let lastTs = 0
let ewma = 0.6

function clamp(x: number, a: number, b: number) { return Math.max(a, Math.min(b, x)) }

async function init() {
  const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm")
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    runningMode: "VIDEO",
    numFaces: 1
  })
  postMessage({ type: 'ready' })
}

init()

// Basic gaze estimation: check how far from center the pupils are.
// This is a simplification. True gaze requires calibration and more complex models.
function estimateGaze(landmarks: any[], frame: ImageBitmap) {
  if (!landmarks || landmarks.length === 0) return { gazeScore: 0, headX: 0, headY: 0 }
  const [face] = landmarks
  // Key landmarks for pupils
  const leftPupil = face[473] // Left eye pupil
  const rightPupil = face[468] // Right eye pupil

  if (!leftPupil || !rightPupil) return { gazeScore: 0, headX: 0, headY: 0 }

  const pupilX = (leftPupil.x + rightPupil.x) / 2
  const pupilY = (leftPupil.y + rightPupil.y) / 2

  const dx = Math.abs(pupilX - 0.5)
  const dy = Math.abs(pupilY - 0.5)

  // Gaze score: 1 when centered, 0 when at edge of screen.
  const gazeScore = clamp(1 - Math.sqrt(dx * dx + dy * dy) * 2, 0, 1)

  return { gazeScore, headX: dx, headY: dy }
}

onmessage = async (ev: MessageEvent<MsgIn>) => {
  const m = ev.data
  if (!m || m.type !== 'frame' || !faceLandmarker) return

  const { frame, ts } = m

  try {
    const result = faceLandmarker.detectForVideo(frame, ts)
    if (!result || result.faceLandmarks.length === 0) {
      // No face detected, send low score
      postMessage({ type: 'pulse', score: 0.2, trend: 0, attn: { gaze: 0, pose: 0, expression: 0 }, quality: { fps: 0 } })
      return
    }

    const { faceLandmarks, faceBlendshapes, facialTransformationMatrixes } = result

    // 1. Gaze Score
    const { gazeScore } = estimateGaze(faceLandmarks, frame)

    // 2. Head Pose Score from transformation matrix
    const matrix = facialTransformationMatrixes![0].data
    // Simple head pose: pitch (looking down) and yaw (looking away)
    // These are rough estimations from the rotation matrix elements.
    const pitch = Math.asin(-matrix[8]) // sin(pitch) is in matrix[8]
    const yaw = Math.atan2(matrix[9], matrix[10]) // yaw from other elements
    const posePenalty = clamp(Math.abs(pitch) * 2 + Math.abs(yaw) * 0.5, 0, 1)
    const poseScore = 1 - posePenalty

    // 3. Expression Score from Blendshapes
    const blendshapes = faceBlendshapes![0].categories as Array<{ categoryName: string; score: number }>
    const browDownLeft = blendshapes.find(c => c.categoryName === 'browDownLeft')?.score ?? 0
    const browDownRight = blendshapes.find(c => c.categoryName === 'browDownRight')?.score ?? 0
    const browDown = (browDownLeft + browDownRight) / 2
    const mouthPressLeft = blendshapes.find(c => c.categoryName === 'mouthPressLeft')?.score ?? 0
    const mouthPressRight = blendshapes.find(c => c.categoryName === 'mouthPressRight')?.score ?? 0
    const mouthPress = mouthPressLeft + mouthPressRight

    // Confusion/Concentration is often tied to browDown.
    // We'll treat it as a positive indicator for focus, up to a point.
    const expressionScore = clamp(0.5 + browDown * 0.5 - mouthPress * 0.2, 0, 1)

    // Combine scores (MVP heuristic)
    // Gaze is most important, followed by pose, then expression.
    const weights = { gaze: 0.5, pose: 0.3, expression: 0.2 }
    let score = gazeScore * weights.gaze + poseScore * weights.pose + expressionScore * weights.expression

    // FPS estimation
    const dt = ts - lastTs
    lastTs = ts
    const fps = dt > 0 ? 1000 / dt : 0

    // EWMA smoothing
    const alpha = 0.15
    ewma = (1 - alpha) * ewma + alpha * score
    const trend = clamp(score - ewma, -1, 1)

    const attn = {
      gaze: gazeScore,
      pose: poseScore,
      expression: expressionScore,
      audio: 0,
      hr: 0
    }
    const quality = { fps: Math.round(fps) }

    postMessage({ type: 'pulse', score: ewma, trend, attn, quality })

  } catch (e) {
    // console.error(e)
  } finally {
    try { frame.close() } catch {}
  }
}

export {}
