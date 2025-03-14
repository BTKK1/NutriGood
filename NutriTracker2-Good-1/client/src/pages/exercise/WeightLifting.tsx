import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronLeft } from "lucide-react";

export default function WeightLifting() {
  const [duration, setDuration] = useState("15");
  const [intensity, setIntensity] = useState(1); // 0 = Low, 1 = Medium, 2 = High
  const [indicatorY, setIndicatorY] = useState(50); // Continuous percentage position
  const barRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Handle drag for timeline scrolling with smooth scroll wheel behavior
  useEffect(() => {
    const bar = barRef.current;
    const indicator = indicatorRef.current;
    if (!bar || !indicator) return;

    let isDragging = false;
    let startY: number;
    let currentY: number = indicatorY;
    const dampingFactor = 0.2; // Adjusted for smoother feel

    const updatePosition = (newY: number) => {
      currentY = currentY + (newY - currentY) * dampingFactor;
      currentY = Math.max(0, Math.min(100, currentY));
      indicator.style.top = `${currentY}%`; // Direct DOM update for smoothness
      if (!isDragging) setIndicatorY(currentY); // Update state only when not dragging
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      startY = e.clientY;
      currentY = indicatorY;
      indicator.style.transition = "none"; // Disable transition during drag
      bar.setPointerCapture(e.pointerId); // Ensure consistent pointer tracking
      e.preventDefault(); // Prevent text selection or other default behaviors
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      const barRect = bar.getBoundingClientRect();
      const dy = e.clientY - startY;
      const barHeight = barRect.height;
      const newY = indicatorY + (dy / barHeight) * 100; // Relative movement
      rafRef.current = requestAnimationFrame(() => updatePosition(newY));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      bar.releasePointerCapture(e.pointerId);
      indicator.style.transition = "transform 300ms ease-in-out"; // Re-enable transition for snap

      // Calculate the closest intensity based on final currentY (inverted mapping)
      const threshold = ((100 - currentY) / 100) * 2; // Invert: 0% → 2, 100% → 0
      const newIntensity = Math.round(threshold); // Snap to nearest 0, 1, or 2
      setIntensity(newIntensity);
      setIndicatorY(newIntensity === 2 ? 0 : newIntensity === 1 ? 50 : 100); // Snap to 0% (High), 50% (Medium), 100% (Low)
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        bar.releasePointerCapture(e.pointerId);
        indicator.style.transition = "transform 300ms ease-in-out";
        const threshold = ((100 - currentY) / 100) * 2;
        const newIntensity = Math.round(threshold);
        setIntensity(newIntensity);
        setIndicatorY(newIntensity === 2 ? 0 : newIntensity === 1 ? 50 : 100);
      }
    };

    const onLostPointerCapture = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        indicator.style.transition = "transform 300ms ease-in-out";
        const threshold = ((100 - currentY) / 100) * 2;
        const newIntensity = Math.round(threshold);
        setIntensity(newIntensity);
        setIndicatorY(newIntensity === 2 ? 0 : newIntensity === 1 ? 50 : 100);
      }
    };

    indicator.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    bar.addEventListener("pointerleave", onPointerLeave);
    bar.addEventListener("lostpointercapture", onLostPointerCapture);

    return () => {
      indicator.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      bar.removeEventListener("pointerleave", onPointerLeave);
      bar.removeEventListener("lostpointercapture", onLostPointerCapture);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [indicatorY]);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/exercise">
          <button className="p-2 rounded-full bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Dumbbell className="w-5 h-5" /> Weight lifting
        </h1>
      </div>

      <div className="space-y-6">
        {/* Intensity Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span>✨</span> Set intensity
            </h2>
          </div>

          <div className="bg-gray-100 rounded-[20px] px-4 py-4">
            <div className="flex justify-between relative pr-8">
              <div className="flex-1 space-y-8">
                <div
                  onClick={() => {
                    setIntensity(2);
                    setIndicatorY(0);
                  }}
                  className="cursor-pointer"
                >
                  <div
                    className={
                      intensity === 2
                        ? "text-black transition-all duration-300"
                        : "text-gray-400 transition-all duration-300"
                    }
                  >
                    <p
                      className={
                        intensity === 2
                          ? "text-lg font-bold"
                          : "text-[15px] font-medium"
                      }
                    >
                      High
                    </p>
                    <p
                      className={
                        intensity === 2 ? "text-[15px]" : "text-[13px]"
                      }
                    >
                      Training to failure, breathing heavily
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setIntensity(1);
                    setIndicatorY(50);
                  }}
                  className="cursor-pointer"
                >
                  <div
                    className={
                      intensity === 1
                        ? "text-black transition-all duration-300"
                        : "text-gray-400 transition-all duration-300"
                    }
                  >
                    <p
                      className={
                        intensity === 1
                          ? "text-lg font-bold"
                          : "text-[15px] font-medium"
                      }
                    >
                      Medium
                    </p>
                    <p
                      className={
                        intensity === 1 ? "text-[15px]" : "text-[13px]"
                      }
                    >
                      Breaking a sweat, many reps
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setIntensity(0);
                    setIndicatorY(100);
                  }}
                  className="cursor-pointer"
                >
                  <div
                    className={
                      intensity === 0
                        ? "text-black transition-all duration-300"
                        : "text-gray-400 transition-all duration-300"
                    }
                  >
                    <p
                      className={
                        intensity === 0
                          ? "text-lg font-bold"
                          : "text-[15px] font-medium"
                      }
                    >
                      Low
                    </p>
                    <p
                      className={
                        intensity === 0 ? "text-[15px]" : "text-[13px]"
                      }
                    >
                      Not breaking a sweat, giving little effort
                    </p>
                  </div>
                </div>
              </div>

              {/* Intensity Bar */}
              <div
                ref={barRef}
                className="absolute right-0 top-0 bottom-0 w-1 bg-black rounded-full"
              >
                <div
                  ref={indicatorRef}
                  className="absolute w-5 h-5 bg-black rounded-full -left-2 transition-transform duration-300 ease-in-out"
                  style={{
                    top: `${indicatorY}%`,
                    transform: "translateY(-50%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Duration Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2">
              <span>⏱️</span> Duration
            </h2>
          </div>

          <div className="flex gap-2">
            {["15", "30", "60", "90"].map((mins) => (
              <Button
                key={mins}
                variant={duration === mins ? "default" : "outline"}
                onClick={() => setDuration(mins)}
                className="flex-1"
              >
                {mins} mins
              </Button>
            ))}
          </div>

          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-4 border rounded-lg text-center text-lg"
          />
        </div>
      </div>

      <Button className="w-full py-6 mt-8">Add</Button>
    </div>
  );
}
