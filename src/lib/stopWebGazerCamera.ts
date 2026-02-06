/**
 * Shared utility to explicitly stop WebGazer camera MediaStream tracks.
 *
 * WebGazer.end() doesn't always properly release the camera, leaving it
 * recording. This function manually stops the MediaStream tracks to turn
 * off the camera indicator before calling webgazer.end().
 */
export function stopWebGazerCamera(): void {
  try {
    const videoElement = document.getElementById('webgazerVideoFeed') as HTMLVideoElement | null
    if (videoElement?.srcObject) {
      const mediaStream = videoElement.srcObject as MediaStream
      mediaStream.getTracks().forEach((track) => {
        track.stop()
      })
      videoElement.srcObject = null
    }
  } catch (err) {
    console.warn('[WebGazer] Error stopping media tracks:', err)
  }
}
