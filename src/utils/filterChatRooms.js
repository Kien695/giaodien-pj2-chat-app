export const filterChatRooms = (rooms, tab) =>
  rooms.filter((room) => {
    if (tab === 1) return room.typeRoom === "group";
    if (tab === 2) return room.typeRoom === "friend";
    return true;
  });
