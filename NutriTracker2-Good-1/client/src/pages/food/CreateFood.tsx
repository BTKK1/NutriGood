import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function CreateFood() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    brandName: "",
    description: "",
    servingSize: "",
    servingsPerContainer: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // TODO: Save form data and proceed to next step
    navigate("/food/ingredients-list");
  };

  return (
    <div className="p-4 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/food/database">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Create Food</h1>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Input
          name="brandName"
          placeholder="Brand name"
          value={formData.brandName}
          onChange={handleChange}
          className="py-6"
          hint="ex. Campbell's"
        />
        <Input
          name="description"
          placeholder="Description*"
          value={formData.description}
          onChange={handleChange}
          className="py-6"
          required
        />
        <Input
          name="servingSize"
          placeholder="Serving size*"
          value={formData.servingSize}
          onChange={handleChange}
          className="py-6"
          hint="ex. 1 cup"
          required
        />
        <Input
          name="servingsPerContainer"
          placeholder="Serving per container*"
          value={formData.servingsPerContainer}
          onChange={handleChange}
          className="py-6"
          hint="ex. 1"
          required
        />
      </div>

      {/* Next Button - Fixed at bottom */}
      <div className="fixed bottom-8 left-4 right-4">
        <Button 
          className="w-full py-6 text-lg font-semibold rounded-xl"
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
