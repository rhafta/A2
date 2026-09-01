"use client";

import { useId, useState, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { startQuarter } from "@/app/dashboard/actions";

interface NewQuarterUploadProps {
  userId: string;
  year: number;
  quarter: number;
}

export function NewQuarterUpload({ userId, year, quarter }: NewQuarterUploadProps) {
  const inputId = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("photo") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${year}-Q${quarter}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("quarter-photos")
      .upload(path, file);

    if (uploadError) {
      setError("업로드에 실패했습니다. 다시 시도해 주세요.");
      setUploading(false);
      return;
    }

    await startQuarter(path);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 text-center">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          {year}년 {quarter}분기 퍼즐 시작하기
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          이번 분기 동안 매일 한 조각씩 공개될 사진을 골라주세요.
        </p>
      </div>

      <label
        htmlFor={inputId}
        className="flex w-full max-w-xs cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-8 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:bg-muted"
      >
        <ImagePlus className="size-6 text-muted-foreground" strokeWidth={1.75} />
        <span className="truncate text-foreground">{fileName ?? "사진 선택"}</span>
        <span className="text-xs text-muted-foreground">클릭해서 파일을 선택하세요</span>
      </label>
      <input
        id={inputId}
        type="file"
        name="photo"
        accept="image/*"
        required
        disabled={uploading}
        className="sr-only"
        onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={uploading || !fileName}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {uploading ? "업로드 중..." : "분기 시작하기"}
      </button>
    </form>
  );
}
