import { Link } from "wouter";
import { ChevronLeft, Dumbbell, Pencil } from "lucide-react";

export default function ExercisePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center px-4 py-3">
        <Link href="/home">
          <button className="w-[42px] h-[42px] rounded-full bg-gray-50 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="ml-3 text-[17px] font-normal">Log Exercise</h1>
      </div>

      <div className="px-4 mt-4 space-y-[15px]">
        <Link href="/exercise/run">
          <button className="w-full h-[60px] bg-white rounded-[14px] border border-gray-100 px-4 flex items-center">
            <span className="text-2xl flex items-center">🏃‍♂️</span>
            <div className="ml-3 text-left">
              <div className="text-[15px] font-normal">Run</div>
              <div className="text-gray-500 text-[13px]">Running, jogging, sprinting, etc.</div>
            </div>
          </button>
        </Link>

        <Link href="/exercise/weight-lifting">
          <button className="w-full h-[60px] bg-white rounded-[14px] border border-gray-100 px-4 flex items-center">
            <Dumbbell className="w-6 h-6 text-gray-900" />
            <div className="ml-3 text-left">
              <div className="text-[15px] font-normal">Weight lifting</div>
              <div className="text-gray-500 text-[13px]">Machines, free weights, etc.</div>
            </div>
          </button>
        </Link>

        <Link href="/exercise/Describe">
          <button className="w-full h-[60px] bg-white rounded-[14px] border border-gray-100 px-4 flex items-center">
            <Pencil className="w-6 h-6 text-gray-900" />
            <div className="ml-3 text-left">
              <div className="text-[15px] font-normal">Describe</div>
              <div className="text-gray-500 text-[13px]">Write your workout in text</div>
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}