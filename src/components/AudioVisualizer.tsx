import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

interface VisualizerProps {
  className?: string;
  barCount?: number;
  height?: number;
}

export const AudioVisualizer: React.FC<VisualizerProps> = ({
  className = '',
  barCount = 36,
  height = 56
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { getAudioFrequencyData, isPlaying, themeColor } = usePlayer();
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let smoothedValues = new Array(barCount).fill(4);

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const freqData = getAudioFrequencyData();

      const accentHex =
        themeColor === 'violet' ? '#a855f7' :
        themeColor === 'emerald' ? '#10b981' :
        themeColor === 'amber' ? '#f59e0b' :
        themeColor === 'mono' ? '#94a3b8' :
        '#06b6d4'; // default cyan

      const barWidth = (width / barCount) * 0.72;
      const gap = (width - barWidth * barCount) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        let targetHeight = 4;
        if (isPlaying && freqData && freqData.length > 0) {
          // Sample frequencies non-linearly to favor musical fundamentals
          const sampleIndex = Math.min(
            freqData.length - 1,
            Math.floor(Math.pow(i / barCount, 1.4) * (freqData.length * 0.75))
          );
          const raw = freqData[sampleIndex] || 0;
          targetHeight = Math.max(4, (raw / 255) * (h - 8));
        } else if (isPlaying) {
          // Gentle rhythmic fallback bounce if analyser is warming up
          const t = Date.now() / 300;
          targetHeight = Math.max(4, (Math.sin(t + i * 0.4) * 0.5 + 0.5) * (h * 0.5));
        }

        // Smooth interpolation
        smoothedValues[i] += (targetHeight - smoothedValues[i]) * 0.25;
        const currentBarHeight = smoothedValues[i];

        const x = i * (barWidth + gap);
        const y = h - currentBarHeight;

        // Gradient bar
        const gradient = ctx.createLinearGradient(0, y, 0, h);
        gradient.addColorStop(0, accentHex);
        gradient.addColorStop(1, `${accentHex}33`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 3);
        ctx.roundRect(x, y, barWidth, currentBarHeight, [radius, radius, 0, 0]);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [barCount, getAudioFrequencyData, isPlaying, themeColor]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={360}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
