"use client";

import { useEffect, useRef } from "react";

const STAR_COLORS = ["#f4f4f5", "#c4b5fd", "#93c5fd", "#f0abfc"];
const MAX_STARS = 220;

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  speed: number;
  phase: number;
  color: string;
  drift: number;
};

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let resizeTimer = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Kepadatan bintang mengikuti luas layar (jadi rasionya konsisten di
      // HP, tablet, maupun laptop), tapi dibatasi MAX_STARS supaya layar
      // lebar/monitor besar tidak menggambar ribuan partikel tiap frame.
      const count = Math.min(
        MAX_STARS,
        Math.round((width * height) / 3800)
      );
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.3,
        speed: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        drift: Math.random() * 0.04 + 0.01,
      }));
    }

    function handleResize() {
      // Debounce: jangan bikin ulang seluruh array bintang di setiap piksel
      // saat window sedang aktif di-drag-resize.
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    }

    resize();
    window.addEventListener("resize", handleResize);

    let raf = 0;
    let running = true;
    let t = 0;

    function draw() {
      t += 0.016;
      ctx!.clearRect(0, 0, width, height);
      for (const s of stars) {
        const twinkle = Math.sin(t * s.speed + s.phase) * 0.5 + 0.5;
        if (!reduceMotion) {
          s.y -= s.drift;
          if (s.y < -2) s.y = height + 2;
        }
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = s.color;
        ctx!.globalAlpha = s.baseAlpha * (0.4 + twinkle * 0.6);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      if (running && !reduceMotion) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    // Hemat CPU/baterai: berhenti gambar total kalau tab sedang tidak
    // dilihat (pindah tab, minimize, dsb), lanjut lagi begitu aktif.
    function handleVisibility() {
      running = document.visibilityState === "visible";
      if (running && !reduceMotion) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050508]"
    >
      <div className="animate-nebula-drift absolute -top-1/4 -left-1/4 size-[60vw] max-w-[40rem] rounded-full bg-violet-700/30 blur-[100px] motion-reduce:animate-none" />
      <div className="animate-nebula-drift-slow absolute top-1/3 -right-1/4 size-[55vw] max-w-[36rem] rounded-full bg-blue-600/25 blur-[100px] motion-reduce:animate-none" />
      <div
        className="animate-nebula-drift absolute -bottom-[10%] left-1/4 size-[50vw] max-w-[32rem] rounded-full bg-fuchsia-600/20 blur-[110px] motion-reduce:animate-none"
        style={{ animationDelay: "-9s" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
