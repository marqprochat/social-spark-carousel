
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingState: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 animate-fade-in">
      <h2 className="text-2xl font-semibold mb-8">Criando seu Carrossel...</h2>
      <div className="flex flex-col items-center space-y-4 w-full max-w-md">
        <Skeleton className="h-[400px] w-full" />
        <div className="flex justify-center space-x-2 w-full">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
