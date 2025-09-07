// WebRTC configuration constants and helpers

/**
 * ICE (Interactive Connectivity Establishment) servers configuration.
 * For the "¥0 Plan", we are only using free public STUN servers.
 * STUN (Session Traversal Utilities for NAT) helps clients find out their public IP address.
 * This is often enough for P2P connections if the NATs are not too restrictive.
 */
export const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
  // Add more public STUN servers here for fallback if needed
];

/**
 * Creates a new RTCPeerConnection with the predefined ICE server configuration.
 * @returns A new RTCPeerConnection instance.
 */
export const createPeerConnection = () => {
  return new RTCPeerConnection({ iceServers: ICE_SERVERS });
};

/**
 * Tests if a direct P2P connection is likely possible using only STUN servers.
 * It creates a peer connection and checks if it can gather 'host' or 'srflx' ICE candidates.
 * @returns A Promise that resolves to `true` if a direct connection is likely, `false` otherwise.
 */
export async function testDirectICE(): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      let success = false;

      // Set a timeout to resolve false if gathering takes too long.
      const timeout = setTimeout(() => resolve(success), 3000); // 3-second timeout

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          // If we find a 'host' (local) or 'srflx' (server reflexive) candidate,
          // a direct connection is very likely.
          if (e.candidate.candidate.includes("typ host") || e.candidate.candidate.includes("typ srflx")) {
            success = true;
          }
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          resolve(success);
        }
      };

      // Create a dummy data channel to trigger ICE gathering.
      pc.createDataChannel('preflight-test');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

    } catch (error) {
      console.error("Pre-flight ICE test failed:", error);
      resolve(false);
    }
  });
}
