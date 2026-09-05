import { CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { IoChevronBack, IoChevronForward, IoClose, IoSearch } from "react-icons/io5";
import { getData } from "../../utils/api";

const DEBOUNCE_MS = 350;

const highlightKeyword = (content, keyword) => {
  if (!content || !keyword) return content;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return String(content).split(new RegExp(`(${escaped})`, "gi")).map((part, index) =>
    part.localeCompare(keyword, undefined, { sensitivity: "accent" }) === 0 ? (
      <mark className="rounded bg-yellow-200 px-0.5 text-yellow-950 dark:bg-yellow-700 dark:text-yellow-50" key={`${part}-${index}`}>{part}</mark>
    ) : part,
  );
};

export default function MessageSearchPanel({ roomId, onClose, onSelect }) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null });
  const [status, setStatus] = useState("idle");
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    const normalized = keyword.trim();
    const sequence = ++requestSequenceRef.current;
    if (normalized.length < 2) {
      setResults([]);
      setTotal(0);
      setActiveIndex(-1);
      setPagination({ hasMore: false, nextCursor: null });
      setStatus("idle");
      return undefined;
    }

    setStatus("loading");
    const timer = setTimeout(async () => {
      try {
        const response = await getData(
          `/chat/${roomId}/search?q=${encodeURIComponent(normalized)}&limit=20`,
        );
        if (sequence !== requestSequenceRef.current) return;
        setResults(response.data || []);
        setTotal(response.total || 0);
        setPagination(response.pagination || { hasMore: false, nextCursor: null });
        setActiveIndex(response.data?.length ? 0 : -1);
        setStatus(response.data?.length ? "ready" : "empty");
      } catch {
        if (sequence === requestSequenceRef.current) setStatus("error");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword, roomId]);

  const selectResult = (index) => {
    const result = results[index];
    if (!result) return;
    setActiveIndex(index);
    onSelect(result, keyword.trim());
  };

  const goPrevious = () => {
    if (!results.length) return;
    selectResult(activeIndex <= 0 ? results.length - 1 : activeIndex - 1);
  };

  const goNext = async () => {
    if (!results.length) return;
    if (activeIndex < results.length - 1) {
      selectResult(activeIndex + 1);
      return;
    }
    if (!pagination.hasMore || !pagination.nextCursor || status === "loadingMore") {
      selectResult(0);
      return;
    }
    setStatus("loadingMore");
    try {
      const response = await getData(
        `/chat/${roomId}/search?q=${encodeURIComponent(keyword.trim())}&limit=20&cursor=${encodeURIComponent(pagination.nextCursor)}`,
      );
      const nextResults = response.data || [];
      const nextIndex = results.length;
      setResults((current) => current.concat(nextResults));
      setPagination(response.pagination || { hasMore: false, nextCursor: null });
      setStatus("ready");
      if (nextResults.length) {
        setActiveIndex(nextIndex);
        onSelect(nextResults[0], keyword.trim());
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="app-panel app-divider border-b px-3 py-2 shadow-sm" aria-label="Tìm kiếm tin nhắn">
      <div className="flex items-center gap-2">
        <IoSearch className="app-muted shrink-0" />
        <input
          autoFocus
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm tin nhắn"
          className="app-input min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm"
        />
        <button type="button" onClick={goPrevious} disabled={!results.length} aria-label="Kết quả trước" className="settings-interactive rounded p-1 disabled:opacity-60">
          <IoChevronBack />
        </button>
        <button type="button" onClick={goNext} disabled={!results.length} aria-label="Kết quả tiếp theo" className="settings-interactive rounded p-1 disabled:opacity-60">
          <IoChevronForward />
        </button>
        <button type="button" onClick={onClose} aria-label="Đóng tìm kiếm" className="settings-interactive rounded p-1">
          <IoClose />
        </button>
      </div>
      <div className="app-muted mt-2 text-xs">
        {status === "idle" && "Nhập ít nhất 2 ký tự"}
        {(status === "loading" || status === "loadingMore") && <span className="flex items-center gap-2"><CircularProgress size={14} /> Đang tìm...</span>}
        {status === "empty" && "Không có kết quả"}
        {status === "error" && "Không thể tìm kiếm lúc này. Vui lòng thử lại."}
        {status === "ready" && `${activeIndex + 1}/${total} kết quả`}
      </div>
      {results.length > 0 && (
        <div className="app-divider mt-2 max-h-40 overflow-y-auto rounded-md border">
          {results.map((result, index) => (
            <button
              type="button"
              key={result._id}
              onClick={() => selectResult(index)}
              className={`app-divider block w-full border-b px-3 py-2 text-left text-sm last:border-b-0 ${index === activeIndex ? "app-selected" : "app-hover"}`}
            >
              <span className="block truncate">{highlightKeyword(result.content, keyword.trim())}</span>
              <time className="app-muted mt-1 block text-xs">{new Date(result.createdAt).toLocaleString("vi-VN")}</time>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
