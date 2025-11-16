import React, { useRef, useState } from "react";

export default function OtpInputs({ length = 6, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  const focusAt = (index) => {
    const el = inputsRef.current[index];
    if (el) el.focus();
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, ""); // chỉ lấy số
    if (!val) {
      updateAt(idx, "");
      return;
    }

    // Nếu paste nhiều ký tự (ví dụ paste cả OTP), phân bổ từ vị trí idx
    if (val.length > 1) {
      const next = [...values];
      let p = idx;
      for (const ch of val) {
        if (p >= length) break;
        next[p] = ch;
        p++;
      }
      setValues(next);
      // focus vào ô tiếp theo sau phần paste
      focusAt(Math.min(p, length - 1));
      if (next.every(Boolean)) onComplete?.(next.join(""));
      return;
    }

    updateAt(idx, val);
    if (val && idx < length - 1) focusAt(idx + 1);
  };

  const updateAt = (idx, val) => {
    const next = [...values];
    next[idx] = val;
    setValues(next);
    if (next.every(Boolean)) onComplete?.(next.join(""));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (values[idx]) {
        // nếu ô có giá trị, xóa ô đó (mặc định)
        updateAt(idx, "");
      } else if (idx > 0) {
        // nếu rỗng thì chuyển về ô trước và xóa
        updateAt(idx - 1, "");
        focusAt(idx - 1);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      focusAt(idx - 1);
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      focusAt(idx + 1);
    }
  };

  const handlePaste = (e, idx) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text");
    const digits = text.replace(/\D/g, "");
    if (!digits) return;
    // delegate to handleChange logic by simulating value
    const next = [...values];
    let p = idx;
    for (const ch of digits) {
      if (p >= length) break;
      next[p] = ch;
      p++;
    }
    setValues(next);
    focusAt(Math.min(p, length - 1));
    if (next.every(Boolean)) onComplete?.(next.join(""));
  };

  return (
    <div className="flex gap-2">
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={v}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={(e) => handlePaste(e, i)}
          className="w-12 h-12 text-center rounded-md border border-gray-300 focus:border-[#ff5252] focus:outline-none text-lg"
          aria-label={`OTP digit ${i + 1}`}
          autoComplete={i === 0 ? "one-time-code" : "off"}
        />
      ))}
    </div>
  );
}
