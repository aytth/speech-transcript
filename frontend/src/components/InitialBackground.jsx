import React, { useRef, useEffect } from 'react';

const pipeCount = 40;
const pipePropCount = 8;
const pipePropsLength = pipeCount * pipePropCount;
const turnCount = 8;
const turnAmount = (360 / turnCount) * (Math.PI / 180);
const turnChanceRange = 58;
const baseSpeed = 0.2; // slow but visible
const rangeSpeed = 0.1; // slow but visible
const baseTTL = 100;
const rangeTTL = 300;
const baseWidth = 8; // thick lines
const rangeWidth = 8; // thick lines
const baseHue = 180; // vibrant cyan/blue
const rangeHue = 60;
const backgroundColor = 'hsla(150,80%,1%,1)';
const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;

function rand(n) {
  return Math.random() * n;
}
function round(n) {
  return Math.round(n);
}
function fadeInOut(t, m) {
  let hm = 0.5 * m;
  return Math.abs((t + hm) % m - hm) / hm;
}

const InitialBackground = () => {
  const canvasRef = useRef(); // onscreen
  const offscreenRef = useRef(); // offscreen
  const pipeProps = useRef();
  const center = useRef([0, 0]);
  const tick = useRef(0);
  const animationRef = useRef();

  // Helper to initialize a pipe
  function initPipe(i, width, height) {
    let x = rand(width);
    let y = center.current[1];
    let direction = round(rand(1)) ? HALF_PI : TAU - HALF_PI;
    let speed = baseSpeed + rand(rangeSpeed);
    let life = 0;
    let ttl = baseTTL + rand(rangeTTL);
    let w = baseWidth + rand(rangeWidth);
    let hue = baseHue + rand(rangeHue);
    pipeProps.current.set([x, y, direction, speed, life, ttl, w, hue], i);
  }

  // Initialize all pipes
  function initPipes(width, height) {
    pipeProps.current = new Float32Array(pipePropsLength);
    for (let i = 0; i < pipePropsLength; i += pipePropCount) {
      initPipe(i, width, height);
    }
  }

  // Update a single pipe
  function updatePipe(i, width, height, ctxA) {
    let i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i;
    let x = pipeProps.current[i];
    let y = pipeProps.current[i2];
    let direction = pipeProps.current[i3];
    let speed = pipeProps.current[i4];
    let life = pipeProps.current[i5];
    let ttl = pipeProps.current[i6];
    let w = pipeProps.current[i7];
    let hue = pipeProps.current[i8];

    // Store previous position
    let prevX = x;
    let prevY = y;

    life++;
    x += Math.cos(direction) * speed;
    y += Math.sin(direction) * speed;
    let turnChance = !(tick.current % round(rand(turnChanceRange))) && (!(round(x) % 6) || !(round(y) % 6));
    let turnBias = round(rand(1)) ? -1 : 1;
    direction += turnChance ? turnAmount * turnBias : 0;

    // Wrap around
    if (x > width) x = 0;
    if (x < 0) x = width;
    if (y > height) y = 0;
    if (y < 0) y = height;

    // Draw a glowing line from prev to current
    drawPipeLine(ctxA, prevX, prevY, x, y, life, ttl, w, hue);

    pipeProps.current[i] = x;
    pipeProps.current[i2] = y;
    pipeProps.current[i3] = direction;
    pipeProps.current[i5] = life;

    if (life > ttl) initPipe(i, width, height);
  }

  function drawPipeLine(ctx, x1, y1, x2, y2, life, ttl, w, hue) {
    ctx.save();
    ctx.strokeStyle = `hsla(${hue},90%,60%,0.8)`; // much more visible
    ctx.shadowColor = `hsla(${hue},100%,70%,1)`;
    ctx.shadowBlur = 32;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  // Animation loop
  function draw() {
    tick.current++;
    const canvasA = offscreenRef.current;
    const canvasB = canvasRef.current;
    const ctxA = canvasA.getContext('2d');
    const ctxB = canvasB.getContext('2d');
    const width = canvasA.width;
    const height = canvasA.height;
    ctxA.clearRect(0, 0, width, height);
    for (let i = 0; i < pipePropsLength; i += pipePropCount) {
      updatePipe(i, width, height, ctxA);
    }
    // Render to onscreen with blur
    ctxB.save();
    ctxB.fillStyle = backgroundColor;
    ctxB.fillRect(0, 0, width, height);
    ctxB.restore();
    ctxB.save();
    ctxB.filter = 'blur(12px)';
    ctxB.drawImage(canvasA, 0, 0);
    ctxB.restore();
    ctxB.save();
    ctxB.drawImage(canvasA, 0, 0);
    ctxB.restore();
    animationRef.current = requestAnimationFrame(draw);
  }

  // Resize handler
  function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    offscreenRef.current.width = width;
    offscreenRef.current.height = height;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    center.current = [0.5 * width, 0.5 * height];
    initPipes(width, height);
  }

  useEffect(() => {
    handleResize();
    animationRef.current = requestAnimationFrame(draw);
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <canvas
        ref={offscreenRef}
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

export default InitialBackground; 