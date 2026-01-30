"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SHIP_SIZE = 12;
const BULLET_SPEED = 8;
const BULLET_LIFE = 45;
const ASTEROID_SPEED = 0.8;
const ASTEROID_COUNT = 4;
const ASTEROID_MIN_R = 15;
const ASTEROID_MAX_R = 35;
const TURN_SPEED = 0.08;
const THRUST = 0.12;
const FRICTION = 0.99;

type GameState = "menu" | "playing" | "gameover";

interface Vec2 {
  x: number;
  y: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  verts: Vec2[];
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

function randomPolygon(r: number): Vec2[] {
  const n = 6 + Math.floor(Math.random() * 4);
  const verts: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const d = r * (0.7 + Math.random() * 0.3);
    verts.push({ x: Math.cos(a) * d, y: Math.sin(a) * d });
  }
  return verts;
}

function spawnAsteroid(w: number, h: number, minR?: number, maxR?: number): Asteroid {
  const r = minR ?? ASTEROID_MIN_R;
  const R = maxR ?? ASTEROID_MAX_R;
  const radius = r + Math.random() * (R - r);
  const side = Math.floor(Math.random() * 4);
  let x: number, y: number;
  if (side === 0) {
    x = Math.random() * w;
    y = -radius - 10;
  } else if (side === 1) {
    x = w + radius + 10;
    y = Math.random() * h;
  } else if (side === 2) {
    x = Math.random() * w;
    y = h + radius + 10;
  } else {
    x = -radius - 10;
    y = Math.random() * h;
  }
  const angle = Math.random() * Math.PI * 2;
  const speed = ASTEROID_SPEED * (0.5 + Math.random() * 0.5);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: radius,
    verts: randomPolygon(radius),
  };
}

function pointInPoly(px: number, py: number, verts: Vec2[], cx: number, cy: number): boolean {
  let inside = false;
  const n = verts.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = cx + verts[i].x;
    const yi = cy + verts[i].y;
    const xj = cx + verts[j].x;
    const yj = cy + verts[j].y;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}


const HIGH_SCORE_KEY = "asteroids-high-score";
const SCORE_BAR_HEIGHT = 48;
const CONTROLS_HEIGHT = 160;

export function AsteroidsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameAreaSize, setGameAreaSize] = useState({ width: 0, height: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const touchThrustRef = useRef(false);
  const touchBackRef = useRef(false);
  const touchTurnRef = useRef<number>(0); // -1 left, 0 none, 1 right
  const touchFireRef = useRef(false);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      const height = Math.max(1, window.innerHeight - SCORE_BAR_HEIGHT);
      setGameAreaSize({ width, height });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      if (saved) setHighScore(parseInt(saved, 10));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;
    const prevBodyTouchAction = body.style.touchAction;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.touchAction = "none";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
      body.style.touchAction = prevBodyTouchAction;
    };
  }, [gameState]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
  }, []);

  useEffect(() => {
    if (gameState !== "playing" || !controlsRef.current) return;
    const el = controlsRef.current;
    const raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const vh = typeof window !== "undefined" ? window.innerHeight : 0;
      fetch("http://127.0.0.1:7244/ingest/8b4d747d-1575-489a-bd62-e24d8ced6440", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "AsteroidsGame.tsx:controlsLayout",
          message: "controls top-left",
          data: {
            barTop: rect.top,
            barLeft: rect.left,
            barHeight: rect.height,
            barWidth: rect.width,
            viewportHeight: vh,
            hypothesisId: "H1",
          },
          timestamp: Date.now(),
          sessionId: "debug-session",
          hypothesisId: "H1",
        }),
      }).catch(() => {});
    });
    return () => cancelAnimationFrame(raf);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width;
    let h = canvas.height;
    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

    const resize = () => {
      if (!canvas) return;
      const vw = typeof window !== "undefined" ? window.innerWidth : 300;
      const vh = typeof window !== "undefined" ? window.innerHeight : 400;
      const gameW = vw;
      const gameH = Math.max(1, vh - SCORE_BAR_HEIGHT);
      w = Math.floor(gameW * dpr);
      h = Math.floor(gameH * dpr);
      w = Math.max(1, w);
      h = Math.max(1, h);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${gameW}px`;
      canvas.style.height = `${gameH}px`;
    };
    resize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", resize);
    }

    const ship = {
      x: w / 2,
      y: h / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
    };
    let asteroids: Asteroid[] = [];
    let bullets: Bullet[] = [];
    let bulletCooldown = 0;

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      asteroids.push(spawnAsteroid(w, h));
    }

    const keyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === " ") e.preventDefault();
    };
    const keyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", keyDown);
      window.addEventListener("keyup", keyUp);
    }

    let rafId: number;
    let gameOver = false;

    const loop = () => {
      if (gameOver) return;

      const turn = touchTurnRef.current || (keysRef.current["arrowleft"] ? -1 : 0) || (keysRef.current["a"] ? -1 : 0);
      const turnR = keysRef.current["arrowright"] ? 1 : keysRef.current["d"] ? 1 : 0;
      const thrust = touchThrustRef.current || keysRef.current["arrowup"] || keysRef.current["w"];
      const backward = touchBackRef.current || keysRef.current["arrowdown"] || keysRef.current["s"];
      const fire = touchFireRef.current || keysRef.current[" "];

      ship.angle += (turn - turnR) * TURN_SPEED;
      if (thrust) {
        ship.vx += Math.cos(ship.angle) * THRUST;
        ship.vy += Math.sin(ship.angle) * THRUST;
      }
      if (backward) {
        ship.vx -= Math.cos(ship.angle) * THRUST;
        ship.vy -= Math.sin(ship.angle) * THRUST;
      }
      ship.vx *= FRICTION;
      ship.vy *= FRICTION;
      ship.x += ship.vx;
      ship.y += ship.vy;

      if (ship.x < 0) ship.x = w;
      if (ship.x > w) ship.x = 0;
      if (ship.y < 0) ship.y = h;
      if (ship.y > h) ship.y = 0;

      if (bulletCooldown > 0) bulletCooldown--;
      if (fire && bulletCooldown <= 0) {
        bullets.push({
          x: ship.x,
          y: ship.y,
          vx: Math.cos(ship.angle) * BULLET_SPEED + ship.vx,
          vy: Math.sin(ship.angle) * BULLET_SPEED + ship.vy,
          life: BULLET_LIFE,
        });
        bulletCooldown = 8;
      }

      bullets = bullets
        .map((b) => ({
          ...b,
          x: b.x + b.vx,
          y: b.y + b.vy,
          life: b.life - 1,
        }))
        .filter((b) => b.life > 0 && b.x >= 0 && b.x <= w && b.y >= 0 && b.y <= h);

      asteroids = asteroids.map((a) => ({
        ...a,
        x: a.x + a.vx,
        y: a.y + a.vy,
      }));

      for (const a of asteroids) {
        if (a.x < -a.r - 20) a.x = w + a.r;
        if (a.x > w + a.r + 20) a.x = -a.r;
        if (a.y < -a.r - 20) a.y = h + a.r;
        if (a.y > h + a.r + 20) a.y = -a.r;
      }

      const toRemove: number[] = [];
      bullets.forEach((b, _bi) => {
        asteroids.forEach((a, ai) => {
          if (pointInPoly(b.x, b.y, a.verts, a.x, a.y)) {
            toRemove.push(ai);
            b.life = 0;
            setScore((s) => {
              const next = s + Math.max(10, Math.floor(50 - a.r));
              setHighScore((hs) => {
                const newHs = Math.max(hs, next);
                try {
                  localStorage.setItem(HIGH_SCORE_KEY, String(newHs));
                } catch {
                  // ignore
                }
                return newHs;
              });
              return next;
            });
          }
        });
      });

      const newAsteroids: Asteroid[] = [];
      asteroids.forEach((a, i) => {
        if (toRemove.includes(i)) {
          if (a.r > 12) {
            const angle = Math.random() * Math.PI * 2;
            newAsteroids.push({
              ...spawnAsteroid(w, h, 8, a.r * 0.6),
              x: a.x,
              y: a.y,
              vx: a.vx + Math.cos(angle) * 1.5,
              vy: a.vy + Math.sin(angle) * 1.5,
            });
            newAsteroids.push({
              ...spawnAsteroid(w, h, 8, a.r * 0.6),
              x: a.x,
              y: a.y,
              vx: a.vx + Math.cos(angle + Math.PI) * 1.5,
              vy: a.vy + Math.sin(angle + Math.PI) * 1.5,
            });
          }
        } else {
          newAsteroids.push(a);
        }
      });
      asteroids = newAsteroids.filter((a) => a.r >= 6);
      bullets = bullets.filter((b) => b.life > 0);

      for (const a of asteroids) {
        if (pointInPoly(ship.x, ship.y, a.verts, a.x, a.y)) {
          gameOver = true;
          setGameState("gameover");
          break;
        }
      }
      if (gameOver) return;

      if (asteroids.length === 0) {
        for (let i = 0; i < ASTEROID_COUNT + 1; i++) {
          asteroids.push(spawnAsteroid(w, h));
        }
      }

      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.beginPath();
      ctx.moveTo(SHIP_SIZE, 0);
      ctx.lineTo(-SHIP_SIZE * 0.8, SHIP_SIZE * 0.6);
      ctx.lineTo(-SHIP_SIZE * 0.4, 0);
      ctx.lineTo(-SHIP_SIZE * 0.8, -SHIP_SIZE * 0.6);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#22c55e";
      bullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = "#e4e4e7";
      ctx.lineWidth = 1.5;
      asteroids.forEach((a) => {
        ctx.beginPath();
        a.verts.forEach((v, i) => {
          const x = a.x + v.x;
          const y = a.y + v.y;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [gameState]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-sm text-[var(--muted)]">Loading game…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {gameState === "menu" && (
        <>
          <div className="flex w-full items-center justify-between px-4 py-2">
            <span className="text-sm font-medium">Score: {score}</span>
            <span className="text-sm text-[var(--muted)]">Best: {highScore}</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
            <h1 className="text-2xl font-bold">Asteroids</h1>
            <p className="max-w-xs text-sm text-[var(--muted)]">
              Destroy asteroids and avoid collisions. Use arrows or touch controls.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="min-h-[48px] min-w-[160px] rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold text-black transition opacity hover:opacity-90 active:opacity-80"
            >
              Play
            </button>
          </div>
        </>
      )}

      {gameState === "gameover" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <h2 className="text-xl font-bold">Game Over</h2>
          <p className="text-lg">Score: {score}</p>
          <button
            type="button"
            onClick={startGame}
            className="min-h-[48px] min-w-[160px] rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold text-black transition opacity hover:opacity-90 active:opacity-80"
          >
            Play Again
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div
          className="fixed inset-0 z-10 overflow-hidden bg-[var(--game-bg)]"
          style={{ touchAction: "none", height: "100dvh", width: "100vw", maxHeight: "100vh" }}
        >
          <div className="absolute left-2 right-2 top-2 z-10 flex justify-between rounded-lg bg-[var(--background)]/80 px-3 py-2 backdrop-blur-sm">
            <span className="text-sm font-medium">Score: {score}</span>
            <span className="text-sm text-[var(--muted)]">Best: {highScore}</span>
          </div>
          <div
            className="absolute left-0 right-0"
            style={{
              top: SCORE_BAR_HEIGHT,
              bottom: 0,
              touchAction: "none",
              ...(gameAreaSize.height > 0 && { height: gameAreaSize.height, width: gameAreaSize.width }),
            }}
          >
            <canvas
              ref={canvasRef}
              className="block h-full w-full"
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>
          <div
            ref={controlsRef}
            className="flex shrink-0 items-center gap-3 rounded-xl border-2 border-[var(--foreground)]/30 bg-[var(--background)] p-2 shadow-lg"
            style={{
              position: "absolute",
              top: SCORE_BAR_HEIGHT + 8,
              left: 8,
              zIndex: 30,
              touchAction: "none",
              minWidth: 180,
              minHeight: 140,
              overflow: "visible",
            }}
          >
            {/* D-pad: Up, then row [Left, Down, Right] — flex-nowrap so Down is never wrapped/clipped */}
            <div
              className="flex shrink-0 flex-col items-center gap-1"
              style={{ width: 44 * 3 + 8 }}
            >
              <div className="flex shrink-0 justify-center">
                <button
                  type="button"
                  className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full border-2 border-[var(--foreground)]/30 bg-[var(--background)]/80 text-base font-bold active:bg-[var(--accent)]/20"
                  onTouchStart={() => (touchThrustRef.current = true)}
                  onTouchEnd={() => (touchThrustRef.current = false)}
                  onMouseDown={() => (touchThrustRef.current = true)}
                  onMouseUp={() => (touchThrustRef.current = false)}
                  onMouseLeave={() => (touchThrustRef.current = false)}
                  aria-label="Вперед"
                >
                  ↑
                </button>
              </div>
              <div className="flex shrink-0 items-center justify-center gap-1" style={{ flexWrap: "nowrap" }}>
                <button
                  type="button"
                  className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full border-2 border-[var(--foreground)]/30 bg-[var(--background)]/80 text-lg active:bg-[var(--accent)]/20"
                  onTouchStart={() => (touchTurnRef.current = -1)}
                  onTouchEnd={() => (touchTurnRef.current = 0)}
                  onMouseDown={() => (touchTurnRef.current = -1)}
                  onMouseUp={() => (touchTurnRef.current = 0)}
                  onMouseLeave={() => (touchTurnRef.current = 0)}
                  aria-label="Вліво"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full border-2 border-[var(--foreground)]/30 bg-[var(--background)]/80 text-base font-bold active:bg-[var(--accent)]/20"
                  onTouchStart={() => (touchBackRef.current = true)}
                  onTouchEnd={() => (touchBackRef.current = false)}
                  onMouseDown={() => (touchBackRef.current = true)}
                  onMouseUp={() => (touchBackRef.current = false)}
                  onMouseLeave={() => (touchBackRef.current = false)}
                  aria-label="Назад"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full border-2 border-[var(--foreground)]/30 bg-[var(--background)]/80 text-lg active:bg-[var(--accent)]/20"
                  onTouchStart={() => (touchTurnRef.current = 1)}
                  onTouchEnd={() => (touchTurnRef.current = 0)}
                  onMouseDown={() => (touchTurnRef.current = 1)}
                  onMouseUp={() => (touchTurnRef.current = 0)}
                  onMouseLeave={() => (touchTurnRef.current = 0)}
                  aria-label="Вправо"
                >
                  →
                </button>
              </div>
            </div>
            <button
              type="button"
              className="flex h-12 w-12 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full border-2 border-[var(--accent)]/50 bg-[var(--accent)]/20 text-lg font-bold active:bg-[var(--accent)]/40"
              onTouchStart={() => (touchFireRef.current = true)}
              onTouchEnd={() => (touchFireRef.current = false)}
              onMouseDown={() => (touchFireRef.current = true)}
              onMouseUp={() => (touchFireRef.current = false)}
              onMouseLeave={() => (touchFireRef.current = false)}
              aria-label="Вогонь"
            >
              ●
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
