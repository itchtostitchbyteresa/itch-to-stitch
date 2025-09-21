"use client";
import NextImage from "next/image";
import type { ApiOk } from "../types";

export function PatternCard({ data }: { data: ApiOk | null }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-rose-900">Pattern</h2>
        {data && (
          <a
            href={data.image_png_base64}
            download="cross-stitch.png"
            className="px-3 py-1.5 rounded-xl bg-rose-900 text-white hover:bg-rose-950 text-sm"
          >
            Download Server PNG
          </a>
        )}
      </div>

      {!data ? (
        <p className="mt-3 text-sm text-gray-600">Generate to see your pattern.</p>
      ) : (
        <div className="mt-3">
          <div className="relative w-full">
            <NextImage
              src={data.image_png_base64}
              alt="Cross-stitch pattern (server)"
              width={data.width}
              height={data.height}
              className="rounded-lg border w-full h-auto"
              unoptimized
              priority
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">Size: {data.width}×{data.height}px</p>
        </div>
      )}
    </div>
  );
}
