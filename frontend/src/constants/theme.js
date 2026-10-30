export const THEME = {
  colors: {
    // Charcoal Foundation
    background: '#121417',          // Deep Matte Charcoal Canvas
    backgroundElevated: '#171A20',  // Elevated Charcoal Layer
    surface: '#1A1E26',             // Premium Charcoal Card Surface
    surfaceGlass: 'rgba(26, 30, 38, 0.88)',
    surfaceSubtle: '#222834',       // Soft Charcoal for inputs/tabs
    surfaceHighlight: '#2D3546',    // Highlight Charcoal

    // Sand Yellow / Warm Desert Gold Accents
    accent: '#E5B869',              // Radiant Sand Yellow
    accentLight: '#F5D38E',         // Warm Desert Sun
    accentDeep: '#C99A46',          // Burnished Gold Sand
    accentSoft: 'rgba(229, 184, 105, 0.14)',
    accentGlow: 'rgba(229, 184, 105, 0.35)',

    // Secondary Warm Accents
    primary: '#242A35',
    primaryLight: '#374151',
    neonViolet: '#D4AF37',          // Metallic Sand Gold
    neonVioletSoft: 'rgba(212, 175, 55, 0.12)',

    // Harmonized Status Colors (Warm Organic Palette)
    available: '#34D399',           // Warm Sage Emerald
    availableLight: 'rgba(52, 211, 153, 0.12)',
    availableBorder: 'rgba(52, 211, 153, 0.35)',
    availableGlow: 'rgba(52, 211, 153, 0.25)',

    occupied: '#F87171',            // Warm Terracotta Crimson
    occupiedLight: 'rgba(248, 113, 113, 0.12)',
    occupiedBorder: 'rgba(248, 113, 113, 0.35)',
    occupiedGlow: 'rgba(248, 113, 113, 0.25)',

    pending: '#FBBF24',             // Amber Sand
    pendingLight: 'rgba(251, 191, 36, 0.12)',
    pendingBorder: 'rgba(251, 191, 36, 0.35)',

    // Text Hierarchy
    textPrimary: '#F8FAFC',         // Crisp White
    textSecondary: '#D4D4D8',       // Warm Sand Muted
    textMuted: '#9CA3AF',           // Charcoal Fog Gray
    textLight: '#121417',           // Dark text for bright sand buttons
    textLightest: '#FFFFFF',

    // Borders & Glass Dividers
    border: 'rgba(229, 184, 105, 0.12)',
    borderStrong: 'rgba(229, 184, 105, 0.25)',
    borderAccent: 'rgba(229, 184, 105, 0.45)',
    shadow: '#000000',
  },

  typography: {
    hero: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    h1: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
    h2: { fontSize: 20, fontWeight: '700' },
    h3: { fontSize: 16, fontWeight: '600' },
    body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    bodyMedium: { fontSize: 14, fontWeight: '500' },
    caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
    badge: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
    mono: { fontFamily: 'monospace', letterSpacing: 1 },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    full: 9999,
  },

  shadows: {
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 4,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.55,
      shadowRadius: 16,
      elevation: 8,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.7,
      shadowRadius: 24,
      elevation: 12,
    },
    glowAccent: {
      shadowColor: '#E5B869',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};
