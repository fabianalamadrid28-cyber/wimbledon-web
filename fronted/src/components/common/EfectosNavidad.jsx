import { useEffect, useRef } from 'react';
import '../../styles/efectos.css';

/* Copos de nieve de fondo (canvas 2D, el viento sigue al mouse) y bastones de caramelo que cruzan la pantalla. */
export default function EfectosNavidad() {
  const lienzoRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    /* ---------- Nieve ---------- */
    const lienzo = lienzoRef.current;
    const ctx = lienzo.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const tactil = window.matchMedia('(pointer: coarse)').matches;
    const N = tactil ? 70 : 160;
    const ajustar = () => {
      lienzo.width = innerWidth * dpr;
      lienzo.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    ajustar();
    const copos = Array.from({ length: N }, () => {
      const z = Math.random();
      return { x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 1 + z * 3.2, v: 0.35 + z * 1.4, fase: Math.random() * 6.28, bal: 0.3 + Math.random() * 0.9 };
    });
    let viento = 0, vientoMeta = 0, activo = true, raf = 0;
    const alMover = (e) => { vientoMeta = (e.clientX / innerWidth - 0.5) * 2.2; };
    const bucle = (t) => {
      if (!activo) return;
      viento += (vientoMeta - viento) * 0.03;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const c of copos) {
        c.y += c.v;
        c.x += Math.sin(t / 900 + c.fase) * c.bal * 0.6 + viento * c.r * 0.35;
        if (c.y > innerHeight + 8) { c.y = -8; c.x = Math.random() * innerWidth; }
        if (c.x > innerWidth + 8) c.x = -8; else if (c.x < -8) c.x = innerWidth + 8;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        g.addColorStop(0, 'rgba(255,255,255,0.95)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, 6.2832);
        ctx.fill();
      }
      raf = requestAnimationFrame(bucle);
    };
    const alCambiarVisibilidad = () => {
      activo = !document.hidden;
      if (activo) raf = requestAnimationFrame(bucle);
    };
    window.addEventListener('resize', ajustar, { passive: true });
    window.addEventListener('pointermove', alMover, { passive: true });
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    raf = requestAnimationFrame(bucle);

    /* ---------- Bastones de caramelo ---------- */
    let temporizador;
    const baston = () => {
      if (document.hidden) { temporizador = setTimeout(baston, 8000); return; }
      const b = document.createElement('span');
      b.className = 'fx-baston';
      b.setAttribute('aria-hidden', 'true');
      const ltr = Math.random() > 0.5;
      b.style.top = 8 + Math.random() * 45 + 'vh';
      document.body.appendChild(b);
      const dur = (7 + Math.random() * 4) * 1000;
      const cruce = b.animate(
        [{ transform: `translateX(${ltr ? '-12vw' : '112vw'}) rotate(-20deg)` },
         { transform: `translateX(${ltr ? '112vw' : '-12vw'}) rotate(${ltr ? 340 : -380}deg)` }],
        { duration: dur, easing: 'linear' });
      cruce.onfinish = () => b.remove();
      temporizador = setTimeout(baston, 16000 + Math.random() * 20000);
    };
    temporizador = setTimeout(baston, 5000);

    return () => {
      activo = false;
      cancelAnimationFrame(raf);
      clearTimeout(temporizador);
      window.removeEventListener('resize', ajustar);
      window.removeEventListener('pointermove', alMover);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      document.querySelectorAll('.fx-baston').forEach((n) => n.remove());
    };
  }, []);

  return <canvas ref={lienzoRef} className="fx-nieve" aria-hidden="true" />;
}
