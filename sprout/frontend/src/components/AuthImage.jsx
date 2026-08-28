import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import api from "../api/axios";

/**
 * Renders an image served from an authenticated API endpoint (journal photos, habit evidence
 * photos) — a plain <img src> can't carry the JWT, so this fetches the file as a blob via axios
 * and renders it as an object URL instead.
 */
export default function AuthImage({ url, alt, onDelete }) {
    const [src, setSrc] = useState(null);

    useEffect(() => {
        let objectUrl;
        let cancelled = false;
        api.get(url, { responseType: "blob" }).then((res) => {
            if (cancelled) return;
            objectUrl = URL.createObjectURL(res.data);
            setSrc(objectUrl);
        });
        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [url]);

    return (
        <div className="relative group rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", aspectRatio: "1" }}>
            {src ? (
                <img src={src} alt={alt || "Photo"} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                </div>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                    aria-label="Delete photo"
                >
                    <X size={13} color="#fff" />
                </button>
            )}
        </div>
    );
}
