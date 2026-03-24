import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    custom: {
      blue: string;
      pink: string;
    };
  }

  interface PaletteOptions {
    custom?: {
      blue?: string;
      pink?: string;
    };
  }
}
