"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as ort from "onnxruntime-web";

const COCO_CLASSES = [
  "person","bicycle","car","motorcycle","airplane","bus","train","truck","boat",
  "traffic light","fire hydrant","stop sign","parking meter","bench","bird","cat","dog","horse","sheep","cow",
  "elephant","bear","zebra","giraffe","backpack","umbrella","handbag","tie","suitcase","frisbee",
  "skis","snowboard","sports ball","kite","baseball bat","baseball glove","skateboard","surfboard","tennis racket",
  "bottle","wine glass","cup","fork","knife","spoon","bowl","banana","apple","sandwich",
  "orange","broccoli","carrot","hot dog","pizza","donut","cake","chair","couch","potted plant",
  "bed","dining table","toilet","tv","laptop","mouse","remote","keyboard","cell phone",
  "microwave","oven","toaster","sink","refrigerator","book","clock","vase","scissors","teddy bear","hair drier","toothbrush"
];

const COLORS = [
  "#00FF88","#FF4466","#44AAFF","#FFCC00","#FF88AA","#88FFCC",
  "#FF8800","#AA44FF","#00CCFF","#FF0055",
];

function getColor(classId: number) {
  return COLORS[classId % COLORS.length];
}

type DetectionBox = {
  box: number[];
  score: number;
  classId: number;
};

function iou(a: number[], b: number[]) {
  const interW = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const interH = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const inter = interW * interH;
  const union = (a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - inter;
  return union === 0 ? 0 : inter / union;
}

function nms(boxes: DetectionBox[], iouThreshold = 0.45): DetectionBox[] {
  boxes.sort((a, b) => b.score - a.score);
  const kept: DetectionBox[] = [];
  while (boxes.length) {
    const top = boxes.shift()!;
    kept.push(top);
    boxes = boxes.filter((b) => iou(top.box, b.box) < iouThreshold);
  }
  return kept;
}

export default function Home() {
  const videoRef     = useRef<HTMLVideoElement | null>(null);
  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const snapRef      = useRef<HTMLCanvasElement | null>(null);
  const sessionRef   = useRef<ort.InferenceSession | null>(null);
  const isRunningRef = useRef(false);
  const animationRef = useRef<number | null>(null);

  // Inference concurrency
  const inferenceRunningRef = useRef(false);
  const lastBoxesRef        = useRef<DetectionBox[]>([]);

  // FPS — pure refs, never triggers React re-render
  const fpsRef       = useRef(0);
  const frameCount   = useRef(0);
  const fpsTimer     = useRef(performance.now());

  // React state — only for UI controls (slider, status badge)
  const [status, setStatus] = useState<"loading" | "ready" | "running" | "stopped">("loading");
  const [confidenceThreshold, setConfidenceThresholdState] = useState(0.5);
  const [maxDetections, setMaxDetectionsState]             = useState(10);
  const confidenceRef = useRef(0.5);
  const maxDetRef     = useRef(10);

  function setConfidenceThreshold(v: number) {
    confidenceRef.current = v;
    setConfidenceThresholdState(v);
  }
  function setMaxDetections(v: number) {
    maxDetRef.current = v;
    setMaxDetectionsState(v);
  }

  // ─── Load model ──────────────────────────────────────────────
  async function loadModel() {
    try {
      sessionRef.current = await ort.InferenceSession.create(
        "/models/yolov8n.onnx",
        { executionProviders: ["wasm"] }
      );
      setStatus("ready");
    } catch (e) {
      console.error("Model load failed:", e);
      setStatus("stopped");
    }
  }

  // ─── Camera ──────────────────────────────────────────────────
  async function startCamera() {
    if (isRunningRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      isRunningRef.current = true;
      frameCount.current   = 0;
      fpsTimer.current     = performance.now();
      setStatus("running");
      animationRef.current = requestAnimationFrame(loop);
    } catch (e) {
      console.error("Camera error:", e);
    }
  }

  function stopCamera() {
    isRunningRef.current      = false;
    inferenceRunningRef.current = false;
    lastBoxesRef.current      = [];
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    canvasRef.current?.getContext("2d")?.clearRect(
      0, 0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setStatus("ready");
  }

  // ─── Preprocess ──────────────────────────────────────────────
  function preprocess(src: HTMLCanvasElement | HTMLVideoElement, w: number, h: number): ort.Tensor {
    const size = 640;
    if (!offscreenRef.current) {
      offscreenRef.current        = document.createElement("canvas");
      offscreenRef.current.width  = size;
      offscreenRef.current.height = size;
    }
    const ctx = offscreenRef.current.getContext("2d")!;
    ctx.drawImage(src, 0, 0, size, size);
    const img   = ctx.getImageData(0, 0, size, size).data;
    const input = new Float32Array(3 * size * size);
    for (let c = 0; c < 3; c++)
      for (let i = 0; i < size * size; i++)
        input[c * size * size + i] = img[i * 4 + c] / 255.0;
    return new ort.Tensor("float32", input, [1, 3, size, size]);
  }

  // ─── Inference ───────────────────────────────────────────────
  async function runInference(
    src: HTMLVideoElement,
    session: ort.InferenceSession,
    scaleX: number,
    scaleY: number
  ): Promise<DetectionBox[]> {
    const inputTensor = preprocess(src, src.videoWidth, src.videoHeight);
    const feeds: Record<string, ort.Tensor> = {};
    feeds[session.inputNames[0]] = inputTensor;

    const output    = await session.run(feeds);
    const outTensor = output[session.outputNames[0]];
    const out       = outTensor.data as Float32Array;
    const [, channels, numPred] = outTensor.dims;

    const threshold = confidenceRef.current;
    const rawBoxes: DetectionBox[] = [];

    for (let i = 0; i < numPred; i++) {
      const cx = out[0 * numPred + i];
      const cy = out[1 * numPred + i];
      const w  = out[2 * numPred + i];
      const h  = out[3 * numPred + i];

      let maxScore = 0, classId = 0;
      for (let c = 4; c < channels; c++) {
        const s = out[c * numPred + i];
        if (s > maxScore) { maxScore = s; classId = c - 4; }
      }
      if (maxScore > threshold) {
        rawBoxes.push({
          box: [
            (cx - w/2) * scaleX, (cy - h/2) * scaleY,
            (cx + w/2) * scaleX, (cy + h/2) * scaleY,
          ],
          score: maxScore,
          classId,
        });
      }
    }
    return nms(rawBoxes).slice(0, maxDetRef.current);
  }

  // ─── Draw boxes ──────────────────────────────────────────────
  function drawBoxes(ctx: CanvasRenderingContext2D, boxes: DetectionBox[]) {
    boxes.forEach((b) => {
      const [x1, y1, x2, y2] = b.box;
      const color = getColor(b.classId);
      const label = COCO_CLASSES[b.classId] ?? "unknown";
      const text  = `${label} ${(b.score * 100).toFixed(1)}%`;

      ctx.strokeStyle = color;
      ctx.lineWidth   = 2.5;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      const clen = 12;
      ctx.lineWidth   = 4;
      ctx.strokeStyle = color;
      [
        [x1, y1, x1+clen, y1, x1, y1+clen],
        [x2, y1, x2-clen, y1, x2, y1+clen],
        [x1, y2, x1+clen, y2, x1, y2-clen],
        [x2, y2, x2-clen, y2, x2, y2-clen],
      ].forEach(([mx, my, lx1, ly1, lx2, ly2]) => {
        ctx.beginPath();
        ctx.moveTo(mx, my); ctx.lineTo(lx1, ly1);
        ctx.moveTo(mx, my); ctx.lineTo(lx2, ly2);
        ctx.stroke();
      });

      ctx.font = "bold 13px 'Courier New', monospace";
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - 22, tw + 12, 22);
      ctx.fillStyle = "#000";
      ctx.fillText(text, x1 + 6, y1 - 6);
    });
  }

  // ─── Draw HUD directly on canvas (no React setState) ─────────
  function drawHUD(ctx: CanvasRenderingContext2D) {
    const text = `FPS ${fpsRef.current}  |  ${lastBoxesRef.current.length} objects`;
    ctx.font = "bold 14px 'Courier New', monospace";
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(10, 10, tw + 16, 28);
    ctx.fillStyle = "#00FF88";
    ctx.fillText(text, 18, 29);
  }

  // ─── rAF Loop — NO React setState inside ─────────────────────
  const loop = useCallback(() => {
    if (!isRunningRef.current) return;

    const video   = videoRef.current;
    const canvas  = canvasRef.current;
    const session = sessionRef.current;

    if (!video || !canvas || !session || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(loop);
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const scaleX = canvas.width / 640;
    const scaleY = canvas.height / 640;
    const ctx    = canvas.getContext("2d")!;

    // 1) Draw video frame
    ctx.drawImage(video, 0, 0);

    // 2) Overlay last known boxes
    drawBoxes(ctx, lastBoxesRef.current);

    // 3) Overlay HUD (no setState)
    drawHUD(ctx);

    // 4) Update FPS counter in ref (not state)
    frameCount.current++;
    const now = performance.now();
    if (now - fpsTimer.current >= 500) {
      fpsRef.current   = Math.round(frameCount.current / ((now - fpsTimer.current) / 1000));
      frameCount.current = 0;
      fpsTimer.current   = now;
    }

    // 5) Fire-and-forget inference (reads directly from video element — fastest)
    if (!inferenceRunningRef.current) {
      inferenceRunningRef.current = true;
      runInference(video, session, scaleX, scaleY)
        .then((boxes) => {
          if (!isRunningRef.current) return;
          lastBoxesRef.current        = boxes;
          inferenceRunningRef.current = false;
        })
        .catch(() => {
          inferenceRunningRef.current = false;
        });
    }

    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => { loadModel(); }, []);

  const isRunning = status === "running";

  return (
    <main
      style={{ fontFamily: "'Courier New', monospace" }}
      className="min-h-screen bg-black text-white p-6"
    >
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 pb-3">
          <div>
            <h1 className="text-xl font-bold tracking-widest uppercase text-green-400">
              YOLOv8 · Live Detection
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">COCO 80-class · ONNX Runtime WebAssembly</p>
          </div>
          <div className="flex gap-2 items-center text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full inline-block ${
              status === "running" ? "bg-green-400 animate-pulse" :
              status === "ready"   ? "bg-yellow-400" :
              status === "loading" ? "bg-blue-400 animate-pulse" : "bg-gray-600"
            }`} />
            <span className="uppercase tracking-widest">{status}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={startCamera}
            disabled={isRunning || status === "loading"}
            className="px-5 py-2 bg-green-400 text-black font-bold text-sm tracking-widest uppercase rounded disabled:opacity-40 hover:bg-green-300 transition-colors"
          >
            ▶ Start
          </button>
          <button
            onClick={stopCamera}
            disabled={!isRunning}
            className="px-5 py-2 bg-red-500 text-white font-bold text-sm tracking-widest uppercase rounded disabled:opacity-40 hover:bg-red-400 transition-colors"
          >
            ■ Stop
          </button>

          <div className="flex items-center gap-2 ml-4">
            <label className="text-xs text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Confidence: <span className="text-green-400">{(confidenceThreshold * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range" min={10} max={95} step={5}
              value={confidenceThreshold * 100}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value) / 100)}
              className="w-28 accent-green-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Max: <span className="text-green-400">{maxDetections}</span>
            </label>
            <input
              type="range" min={1} max={30} step={1}
              value={maxDetections}
              onChange={(e) => setMaxDetections(Number(e.target.value))}
              className="w-20 accent-green-400"
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="relative border border-gray-800 rounded-lg overflow-hidden bg-gray-950">
          {!isRunning && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className="text-gray-600 text-sm uppercase tracking-widest">
                {status === "loading" ? "Loading model…" : "Camera off"}
              </span>
            </div>
          )}
          <canvas ref={canvasRef} className="w-full block" />
        </div>

        <video ref={videoRef} className="hidden" playsInline muted />

        <p className="text-xs text-gray-700 text-center">
          Model: yolov8n.onnx · Place file at <code className="text-gray-500">public/models/yolov8n.onnx</code>
        </p>
      </div>
    </main>
  );
}