import { useNavigate } from "react-router";
import { Button } from "./ui/button";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className="p-4 mr-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition-all duration-200"
    >
      ← Back
    </Button>
  );
};
