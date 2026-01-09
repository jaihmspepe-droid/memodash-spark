import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Moon, Palette } from "lucide-react";
import { useTheme, colorPresets } from "@/hooks/useTheme";

export const SettingsDialog = () => {
  const { isDarkMode, primaryColor, toggleDarkMode, setPrimaryColor } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Mode sombre */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Moon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="text-base font-medium">Mode sombre</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le thème sombre
                </p>
              </div>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>

          {/* Couleur principale */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Palette className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="text-base font-medium">Couleur principale</Label>
                <p className="text-sm text-muted-foreground">
                  Personnalisez l'apparence
                </p>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 pl-13">
              {colorPresets.map((preset) => (
                <button
                  key={preset.hsl}
                  onClick={() => setPrimaryColor(preset.hsl)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    primaryColor === preset.hsl
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: `hsl(${preset.hsl})` }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
