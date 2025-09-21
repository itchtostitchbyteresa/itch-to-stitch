from typing import Tuple

try:
    import numpy as np
    HAS_NUMPY = True
except Exception:
    HAS_NUMPY = False
    np = None  # type: ignore

_Xn, _Yn, _Zn = 95.047, 100.0, 108.883
_delta = 6 / 29
_thr = _delta ** 3

def _srgb_to_linear_py(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def rgb_to_lab_tuple(rgb: Tuple[int, int, int]) -> Tuple[float, float, float]:
    r, g, b = (x / 255.0 for x in rgb)
    r, g, b = map(_srgb_to_linear_py, (r, g, b))
    X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) * 100.0
    Y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) * 100.0
    Z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) * 100.0

    x, y, z = X / _Xn, Y / _Yn, Z / _Zn
    def f(t: float) -> float:
        return t ** (1/3) if t > _thr else (t / (3 * _delta**2) + 4 / 29)
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))

def rgb_to_lab_np(rgb_u8: "np.ndarray") -> "np.ndarray":
    if not HAS_NUMPY:
        raise RuntimeError("NumPy not available")
    rgb = rgb_u8.astype(np.float32) / 255.0
    a = 0.055
    rgb_lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + a) / (1 + a)) ** 2.4)
    M = np.array([[0.4124564, 0.3575761, 0.1804375],
                  [0.2126729, 0.7151522, 0.0721750],
                  [0.0193339, 0.1191920, 0.9503041]], dtype=np.float32)
    xyz = np.tensordot(rgb_lin, M.T, axes=1) * 100.0
    x, y, z = xyz[..., 0] / _Xn, xyz[..., 1] / _Yn, xyz[..., 2] / _Zn
    def f(t):
        return np.where(t > _thr, np.cbrt(t), t / (3 * _delta**2) + 4 / 29)
    fx, fy, fz = f(x), f(y), f(z)
    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b = 200 * (fy - fz)
    return np.stack([L, a, b], axis=-1).astype(np.float32)
