import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function RunExercise() {
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <Link href="/exercise">
          <button className="w-[42px] h-[42px] rounded-full bg-gray-50 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <div className="ml-3 flex items-center gap-2">
          <span className="text-2xl">🏃‍♂️</span>
          <span className="text-[17px]">Run</span>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-8">
        {/* Intensity Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">✨</span>
            <span className="text-lg font-bold">Set intensity</span>
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
                        ? "text-black"
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
                      Sprinting - 14 mph (4 minute miles)
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
                        ? "text-black"
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
                      Jogging - 6 mph (10 minute miles)
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
                        ? "text-black"
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
                      Chill walk - 3 mph (20 minute miles)
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
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">⏱️</span>
            <span className="text-[15px] font-medium">Duration</span>
          </div>

          <div className="flex gap-2">
            {["15", "30", "60", "90"].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`h-[34px] px-4 rounded-full text-[13px] font-medium
                  ${duration === mins ? "bg-black text-white" : "bg-gray-100"}`}
              >
                {mins} mins
              </button>
            ))}
          </div>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full h-[46px] px-4 border rounded-[14px] text-[15px]"
          />
        </div>
      </div>

      {/* Add Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <button className="w-full bg-black text-white rounded-[14px] h-[52px] text-[15px] font-medium">
          Add
        </button>
      </div>
    </div>
  );
}
