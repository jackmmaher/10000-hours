/**
 * Type declarations for WebGazer.js
 * https://github.com/brownhci/WebGazer
 */

declare module 'webgazer' {
  interface GazeData {
    x: number
    y: number
  }

  interface WebGazer {
    /** Start eye tracking - requests camera permission */
    begin(): Promise<WebGazer>
    /** Stop eye tracking */
    end(): void
    /** Pause eye tracking without releasing camera */
    pause(): void
    /** Resume eye tracking */
    resume(): void
    /** Set callback for gaze updates */
    setGazeListener(callback: (data: GazeData | null, elapsedTime: number) => void): WebGazer
    /** Clear the gaze listener */
    clearGazeListener(): WebGazer
    /** Show/hide the video preview */
    showVideoPreview(show: boolean): WebGazer
    /** Show/hide the prediction point overlay */
    showPredictionPoints(show: boolean): WebGazer
    /** Show/hide the face overlay */
    showFaceOverlay(show: boolean): WebGazer
    /** Show/hide the face feedback box */
    showFaceFeedbackBox(show: boolean): WebGazer
    /** Set regression module */
    setRegression(type: 'ridge' | 'weightedRidge' | 'threadedRidge'): WebGazer
    /** Set tracker module */
    setTracker(type: 'TFFacemesh'): WebGazer
    /** Get current prediction */
    getCurrentPrediction(): GazeData | null
    /** Check if WebGazer is ready */
    isReady(): boolean
    /** Add mouse click data for calibration */
    recordScreenPosition(x: number, y: number, type?: string): void
    /** Clear calibration data */
    clearData(): void
  }

  const webgazer: WebGazer
  export default webgazer
}
