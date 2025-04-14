
import React, { useState } from "react";
import BusinessInfoForm, { BusinessInfo } from "@/components/BusinessInfoForm";
import ApiKeyInput from "@/components/ApiKeyInput";
import CarouselCreator from "@/components/CarouselCreator";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"info" | "api" | "creator">("info");
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const [unsplashKey, setUnsplashKey] = useState<string>("");

  const handleBusinessInfoComplete = (info: BusinessInfo) => {
    setBusinessInfo(info);
    setCurrentStep("api");
  };

  const handleApiKeysSubmitted = (openAiKey: string, unsplashKey: string) => {
    setOpenAiKey(openAiKey);
    setUnsplashKey(unsplashKey);
    setCurrentStep("creator");
  };

  const handleBack = () => {
    if (currentStep === "creator") {
      setCurrentStep("api");
    } else if (currentStep === "api") {
      setCurrentStep("info");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-light to-white p-4">
      <div className="w-full max-w-6xl">
        {currentStep === "info" && (
          <BusinessInfoForm onComplete={handleBusinessInfoComplete} />
        )}
        
        {currentStep === "api" && (
          <ApiKeyInput onKeysSubmitted={handleApiKeysSubmitted} />
        )}
        
        {currentStep === "creator" && businessInfo && (
          <CarouselCreator
            businessInfo={businessInfo}
            openAiKey={openAiKey}
            unsplashKey={unsplashKey}
            onBack={handleBack}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
