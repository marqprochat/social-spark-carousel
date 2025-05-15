
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SettingsButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  variant = "outline",
  size = "icon",
  className = ""
}) => {
  const navigate = useNavigate();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => navigate("/settings")}
      className={className}
      title="Configurações"
    >
      <Settings className="h-4 w-4" />
    </Button>
  );
};

export default SettingsButton;
