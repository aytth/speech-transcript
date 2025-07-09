import React, { useRef, useEffect } from 'react';

const PIPE_COUNT = 30;
const SEGMENT_LENGTH = 24;
const TURN_ANGLE = Math.PI / 2; // 90 degrees
const BASE_SPEED = 1.2;
const BASE_WIDTH = 3;
const BASE_ALPHA = 0.18;
const COLORS = [
  'rgba(0,255,255,0.7)', // cyan
  'rgba(0,128,255,0.7)', // blue
  'rgba(0,255,128,0.7)', // greenish
  'rgba(0,128,192,0.7)', // teal
];
const BG_COLOR = '#070b08';

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomAngle() {
  return Math.floor(Math.random() * 4) * TURN_ANGLE;
}
function randomColor() {
  return randomFrom(COLORS);
}
function randomSpeed() {
  return BASE_SPEED + Math.random() * 1.2;
}
function randomWidth() {
  return BASE_WIDTH + Math.random() * 2;
}

function createPipe(width, height) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const angle = randomAngle();
  const color = randomColor();
  const speed = randomSpeed();
  const lineWidth = randomWidth();
  return {
    x,
    y,
    prevX: x,
    prevY: y,
    angle,
    color,
    speed,
    lineWidth,
    life: 0,
    maxLife: 80 + Math.random() * 120,
  };
}

const InitialBackground = () => {
  const canvasRef = useRef();
  const pipesRef = useRef([]);
  const animationRef = useRef();

  // Draw a glowing line segment
  function drawSegment(ctx, x1, y1, x2, y2, color, width) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function stepPipe(pipe, width, height) {
    pipe.prevX = pipe.x;
    pipe.prevY = pipe.y;
    pipe.x += Math.cos(pipe.angle) * SEGMENT_LENGTH;
    pipe.y += Math.sin(pipe.angle) * SEGMENT_LENGTH;
    pipe.life++;
    // Randomly turn at right angles
    if (Math.random() < 0.25) {
      pipe.angle += (Math.random() > 0.5 ? 1 : -1) * TURN_ANGLE;
    }
    // Wrap around
    if (pipe.x < 0) pipe.x = width;
    if (pipe.x > width) pipe.x = 0;
    if (pipe.y < 0) pipe.y = height;
    if (pipe.y > height) pipe.y = 0;
    // Reset if life exceeded
    if (pipe.life > pipe.maxLife) {
      Object.assign(pipe, createPipe(width, height));
    }
  }

  function animate() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    // Fade old lines for trailing effect
    ctx.globalAlpha = BASE_ALPHA;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    // Draw and update pipes
    for (let pipe of pipesRef.current) {
      drawSegment(ctx, pipe.prevX, pipe.prevY, pipe.x, pipe.y, pipe.color, pipe.lineWidth);
      stepPipe(pipe, width, height);
    }
    animationRef.current = requestAnimationFrame(animate);
  }

  function handleResize() {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Recreate pipes for new size
    pipesRef.current = Array.from({ length: PIPE_COUNT }, () => createPipe(canvas.width, canvas.height));
  }

  useEffect(() => {
    handleResize();
    animationRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pipeline-bg-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: BG_COLOR,
      }}
    />
  );
};

export default InitialBackground; 