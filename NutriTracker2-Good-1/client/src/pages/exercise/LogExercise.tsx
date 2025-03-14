import { Link } from "wouter";
import { ChevronLeft, Dumbbell, PenLine } from "lucide-react";

export default function LogExercise() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with back arrow, title, and subtitle */}
      <div className="flex items-start px-4 pt-4">
        <Link href="/home">
          <button className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mt-1">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        </Link>
        <div className="ml-2">
          <span className="text-xl font-medium">Exercise</span>
          <h1 className="text-4xl font-bold mt-0.5">Log Exercise</h1>
        </div>
      </div>

      {/* Centered exercise options, adjusted positioning */}
      <div className="flex flex-col items-center px-6 pl-4 mt-12">
        <Link href="/exercise/run">
          <div className="w-full bg-white rounded-[14px] border-2 border-gray-300 px-3 py-2 flex items-center h-[60px] mb-7 shadow-[0_0_8px_rgba(0,0,0,0.2)]">
            <span className="text-2xl">🏃‍♂️</span>
            <div className="ml-3 text-left">
              <div className="text-[15px] font-medium">Run</div>
              <div className="text-gray-500 text-[12px]">
                Running, jogging, sprinting, etc.
              </div>
            </div>
          </div>
        </Link>

        <Link href="/exercise/weight-lifting">
          <div className="w-full bg-white rounded-[14px] border-2 border-gray-300 px-3 py-2 flex items-center h-[60px] mb-7 shadow-[0_0_8px_rgba(0,0,0,0.2)]">
            <Dumbbell className="w-6 h-6" />
            <div className="ml-3 text-left">
              <div className="text-[15px] font-medium">Weight lifting</div>
              <div className="text-gray-500 text-[12px]">
                Machines, free weights, etc.
              </div>
            </div>
          </div>
        </Link>

        <Link href="/exercise/describe">
          <div className="w-full bg-white rounded-[14px] border-2 border-gray-300 px-3 py-2 flex items-center h-[60px] shadow-[0_0_8px_rgba(0,0,0,0.2)]">
            <PenLine className="w-6 h-6" />
            <div className="ml-3 text-left">
              <div className="text-[15px] font-medium">Describe</div>
              <div className="text-gray-500 text-[12px]">
                Write your workout in text
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
