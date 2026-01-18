import { CirclePlus, LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface NoDataFoundProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonAction?: () => void;
  disabled?: boolean;
}

export const NoDataFound = ({
  title,
  description,
  buttonText,
  buttonAction,
  disabled = false,
}: NoDataFoundProps) => {
  return (
    <div className="col-span-full text-center py-12 2xl:py-24 bg-muted/40 rounded-lg">
      <LayoutGrid className="size-12 mx-auto text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
      
      {buttonText && buttonAction && (
        <Button 
          onClick={buttonAction} 
          className={cn(
            "mt-4",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
            <CirclePlus className="size-4 mr-2" />
            {buttonText}
        </Button>
      )}
    </div>
  );
};
