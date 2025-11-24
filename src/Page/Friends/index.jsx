import { Button } from "@mui/material";
import { SiIconify } from "react-icons/si";
import { GrImage } from "react-icons/gr";
import { FiPaperclip } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import React, { useState } from "react";
import { FaRegSmile } from "react-icons/fa";
import { MdDevicesFold } from "react-icons/md";
import { LuUserRoundCheck } from "react-icons/lu";
import { Link, useParams } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import ListFriend from "../ListFriend";
import ListGroup from "../ListGroup";
import AddFriend from "../ListAddFriend";
import AddGroup from "../ListAddGroup";
import Function from "../../Components/Function";

export default function Friends() {
  const { id } = useParams();
  const param = Number(id);

  return (
    <>
      {param === 1 ? (
        <ListFriend />
      ) : param === 2 ? (
        <ListGroup />
      ) : param === 3 ? (
        <AddFriend />
      ) : (
        <AddGroup />
      )}
    </>
  );
}
