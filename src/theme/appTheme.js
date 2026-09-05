import { createTheme } from "@mui/material/styles";

const paletteByMode = {
  light: {
    primary: "#0068ff",
    canvas: "#f3f6fb",
    surface: "#ffffff",
    text: "#172033",
    muted: "#667085",
    border: "#e4e8ef",
    tooltipBackground: "#172033",
    tooltipText: "#ffffff",
  },
  dark: {
    primary: "#5b9dff",
    canvas: "#16191d",
    surface: "#22262b",
    text: "#e7eaf0",
    muted: "#929baa",
    border: "#3a414a",
    tooltipBackground: "#e7eaf0",
    tooltipText: "#172033",
  },
};

export const createAppTheme = (mode) => {
  const normalizedMode = mode === "dark" ? "dark" : "light";
  const colors = paletteByMode[normalizedMode];

  return createTheme({
    palette: {
      mode: normalizedMode,
      primary: { main: colors.primary },
      background: {
        default: colors.canvas,
        paper: colors.surface,
      },
      text: {
        primary: colors.text,
        secondary: colors.muted,
      },
      divider: colors.border,
    },
    components: {
      MuiDialog: {
        styleOverrides: {
          paper: { backgroundImage: "none" },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { backgroundImage: "none" },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            "&:hover": { backgroundColor: "var(--surface-hover)" },
            "&.Mui-selected": {
              color: "var(--primary)",
              backgroundColor: "var(--surface-selected)",
            },
            "&.Mui-selected:hover": {
              backgroundColor: "var(--surface-active)",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            color: colors.tooltipText,
            backgroundColor: colors.tooltipBackground,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: "var(--input-background)",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--border-strong)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--primary)",
            },
            "&.Mui-disabled": {
              color: "var(--disabled)",
              backgroundColor: "var(--disabled-surface)",
            },
          },
          input: {
            "&::placeholder": {
              color: "var(--muted)",
              opacity: 1,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            "&:hover": { backgroundColor: "var(--surface-hover)" },
            "&:focus-visible": {
              outline: "2px solid var(--focus-ring)",
              outlineOffset: 2,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            "&:focus-visible": {
              outline: "2px solid var(--focus-ring)",
              outlineOffset: 2,
            },
          },
        },
      },
    },
  });
};
