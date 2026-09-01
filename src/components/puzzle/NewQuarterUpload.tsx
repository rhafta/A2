"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { startQuarter } from "@/app/dashboard/actions";

interface NewQuarterUploadProps {
  userId: string;
  year: number;
  quarter: number;
}

export function NewQuarterUpload({ userId, year, quarter }: NewQuarterUploadProps) {
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
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
    >
      <p className="text-sm opacity-70">
        {year}년 {quarter}분기 퍼즐에 쓸 사진을 올려주세요.
      </p>
      <input type="file" name="photo" accept="image/*" required disabled={uploading} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={uploading}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {uploading ? "업로드 중..." : "분기 시작하기"}
      </button>
    </form>
  );
}
