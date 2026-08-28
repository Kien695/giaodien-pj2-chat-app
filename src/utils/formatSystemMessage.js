export const formatSystemMessage = (msg, currentUserId) => {
  const isMe = msg.user_id._id === currentUserId;

  switch (msg.action) {
    case "rename_group":
      return `${isMe ? "Bạn" : msg.user_id.name} đã đổi tên nhóm thành "${
        msg.content
      }"`;

    case "add_member": {
      const names = msg.content_user
        ?.map((u) => (String(u._id) === String(currentUserId) ? "bạn" : u.name))
        .join(", ");

      return `${isMe ? "Bạn" : msg.user_id.name} đã thêm ${names} vào nhóm`;
    }

    case "leave_group":
      return `${msg.user_id.name} đã rời khỏi nhóm`;
    case "remove_member": {
      const names = msg.content_user
        ?.map((u) => (String(u._id) === String(currentUserId) ? "bạn" : u.name))
        .join(", ");
      return `${
        isMe ? "Bạn" : msg.user_id.name
      } đã xóa ${names} ra khỏi nhóm`;
    }
    default:
      return "";
  }
};
