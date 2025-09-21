export type LegendItem = {
  idx: number; code: string; name: string;
  r: number; g: number; b: number;
  count: number;
};

export type ApiOk = {
  width: number;
  height: number;
  image_png_base64: string;
  labels: number[][];
  palette_used: LegendItem[];
};

export type ApiErr = { error: string; trace?: string };
export type ApiResult = ApiOk | ApiErr;

export const SYMBOLS = ['X','/','\\','+','-','•','◇','△','#','=','%','@','~','<','>','¶','✚','✕','❖','✱'];

/** Stitch tools in the UI */
export type StitchKind = 'full' | 'halfSlash' | 'halfBackslash';
/** Which half to paint when using a half stitch */
export type HalfSide = 'A' | 'B';

/**
 * Cell model:
 * - full: solid color
 * - diag: diagonal split with two optional halves (A and B) and orientation
 */
export type Cell =
  | { kind: 'full'; idx: number }
  | { kind: 'diag'; diag: 'slash' | 'backslash'; a: number | null; b: number | null };



