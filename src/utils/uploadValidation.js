export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";
export const CHAT_FILE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.pdf,.txt,.csv,.json,.docx,.xlsx,.pptx";

const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const CHAT_FILE_MAX_BYTES = 10 * 1024 * 1024;
const CHAT_FILE_MAX_COUNT = 5;

const imageTypes = new Map([
  ["image/jpeg", new Set(["jpg", "jpeg"])],
  ["image/png", new Set(["png"])],
  ["image/webp", new Set(["webp"])],
]);
const chatTypes = new Map([
  ...imageTypes,
  ["application/pdf", new Set(["pdf"])],
  ["text/plain", new Set(["txt"])],
  ["text/csv", new Set(["csv"])],
  ["application/json", new Set(["json"])],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", new Set(["docx"])],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new Set(["xlsx"])],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", new Set(["pptx"])],
]);

const extensionOf = (name) => name.split(".").pop()?.toLowerCase() || "";

const matchesAllowedType = (file, types) =>
  types.get(file.type)?.has(extensionOf(file.name)) === true;

export const validateImageForUpload = (file) => {
  if (!file || !matchesAllowedType(file, imageTypes)) {
    return "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP";
  }
  if (file.size > IMAGE_MAX_BYTES) return "Ảnh không được vượt quá 8 MB";
  return null;
};

export const validateChatFilesForUpload = (files) => {
  if (files.length > CHAT_FILE_MAX_COUNT) {
    return "Chỉ được gửi tối đa 5 file mỗi lần";
  }
  for (const file of files) {
    if (!matchesAllowedType(file, chatTypes)) {
      return `Định dạng file không được hỗ trợ: ${file.name}`;
    }
    if (file.size > CHAT_FILE_MAX_BYTES) {
      return `File không được vượt quá 10 MB: ${file.name}`;
    }
  }
  return null;
};
