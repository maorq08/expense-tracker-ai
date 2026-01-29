import { Expense } from "@/types";

// Compress and encode expenses for URL sharing
export async function encodeExpenses(expenses: Expense[]): Promise<string> {
  const json = JSON.stringify(expenses);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);

  // Use CompressionStream if available (modern browsers)
  if (typeof CompressionStream !== "undefined") {
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();

    const compressedChunks: Uint8Array[] = [];
    const reader = cs.readable.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      compressedChunks.push(value);
    }

    const compressed = new Uint8Array(
      compressedChunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of compressedChunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }

    return btoa(String.fromCharCode(...compressed));
  }

  // Fallback: just base64 encode without compression
  return btoa(json);
}

// Decode expenses from URL hash
export async function decodeExpenses(encoded: string): Promise<Expense[]> {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Try to decompress if CompressionStream is available
    if (typeof DecompressionStream !== "undefined") {
      try {
        const ds = new DecompressionStream("gzip");
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();

        const chunks: Uint8Array[] = [];
        const reader = ds.readable.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const decompressed = new Uint8Array(
          chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        );
        let offset = 0;
        for (const chunk of chunks) {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        }

        const decoder = new TextDecoder();
        const json = decoder.decode(decompressed);
        return JSON.parse(json);
      } catch {
        // If decompression fails, try parsing as plain base64 JSON
        const json = new TextDecoder().decode(bytes);
        return JSON.parse(json);
      }
    }

    // Fallback: assume it's plain base64 JSON
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to decode expenses:", error);
    return [];
  }
}

// Generate a shareable URL
export async function generateShareUrl(expenses: Expense[]): Promise<string> {
  const encoded = await encodeExpenses(expenses);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/shared#${encoded}`;
}
