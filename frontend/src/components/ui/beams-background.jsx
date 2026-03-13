import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export function BeamsBackground({ className, children, intensity = "medium" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    // Simple animated gradient
    let hue = 340;
    function animate() {
      ctx.fillStyle = "#4A0011";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw simple gradient beams
      for (let i = 0; i < 3; i++) {
        const gradient = ctx.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height
        );
        gradient.addColorStop(0, `hsla(${hue + i * 20}, 80%, 60%, 0)`);
        gradient.addColorStop(0.5, `hsla(${hue + i * 20}, 80%, 60%, 0.2)`);
        gradient.addColorStop(1, `hsla(${hue + i * 20}, 80%, 60%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      hue += 0.1;
      if (hue > 370) hue = 340;
      
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-crimson-900", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />
      <div className="relative z-10 flex h-screen w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}