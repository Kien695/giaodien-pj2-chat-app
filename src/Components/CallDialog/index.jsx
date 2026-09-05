import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IoCall,
  IoClose,
  IoMic,
  IoMicOff,
  IoRemove,
  IoVideocam,
  IoVideocamOff,
  IoVolumeHigh,
  IoVolumeMute,
} from "react-icons/io5";
import { socket } from "../../socket";
import { useSelector } from "react-redux";
import Peer from "simple-peer";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Howl } from "howler";
const defaultAvatar = "/default-avatar.png";

const CallControl = ({ label, enabled = true, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className="group flex min-w-[68px] flex-col items-center gap-2 text-xs text-white/80"
  >
    <span
      className={`grid h-12 w-12 place-items-center rounded-full border transition sm:h-14 sm:w-14 ${
        enabled
          ? "border-white/10 bg-white/15 text-white group-hover:bg-white/25"
          : "border-white bg-white text-slate-800 group-hover:bg-slate-100"
      }`}
    >
      {children}
    </span>
    <span>{label}</span>
  </button>
);

const CallDialog = ({
  open,
  type,

  dataUser = [],
  roomInfo = {},
  onClose,
}) => {
  const state = useSelector((state) => state.user);
  const { roomChatId } = useParams();
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const connectionRef = useRef(null);
  const peerRef = useRef(null);
  const callIdRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [microphoneOn, setMicrophoneOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [mediaError, setMediaError] = useState("");

  const [reciveCall, setReciveCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callerName, setCallerName] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [incomingCallType, setIncomingCallType] = useState(null);
  const [acceptingCall, setAcceptingCall] = useState(false);
  const [callRejectedPopUp, setCallRejectedPopUp] = useState(false);
  const [rejectorData, setCallrejectorData] = useState(null);
  const [callAttempt, setCallAttempt] = useState(0);

  const friend = dataUser.find(
    (member) => (member?.user_id?._id || member?._id) !== state._id,
  );
  const friendInfo = friend?.user_id || friend || {};

  const isGroup = roomInfo?.typeRoom === "group";
  const displayName = isGroup
    ? roomInfo.title || "Cuộc gọi nhóm"
    : friendInfo.name || "Người dùng Zalo";
  const avatar =
    (isGroup ? roomInfo.avatar : friendInfo.avatar) || defaultAvatar;
  const activeCallType = incomingCallType || type;
  const isVideo = activeCallType === "video";

  const ringtoneRef = useRef(null);

  useEffect(() => {
    ringtoneRef.current = new Howl({
      src: ["/ringtone.mp3"],
      loop: true,
      volume: 1.0,
    });

    return () => {
      ringtoneRef.current?.stop();
      ringtoneRef.current?.unload();
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setMicrophoneOn(true);
      setCameraOn(true);
      setSpeakerOn(true);
      setMediaError("");
    }
  }, [open, type]);
  //send to server
  useEffect(() => {
    if (!open || !isVideo) return undefined;

    let cancelled = false;
    let handleCallAccepted;
    const localVideoElement = localVideoRef.current;
    const remoteVideoElement = remoteVideoRef.current;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError("Trình duyệt không hỗ trợ truy cập camera.");
        return;
      }

      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: true, // Enable video
          audio: {
            echoCancellation: true, //  Reduce echo in audio
            noiseSuppression: true, //  Reduce background noise
          },
        });

        if (cancelled) {
          currentStream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = currentStream;
        setStream(currentStream);
        if (localVideoElement) {
          localVideoElement.srcObject = currentStream;
          localVideoElement.muted = true; //  Mute local audio to prevent feedback
          localVideoElement.volume = 0; //  Set volume to zero to avoid echo
        }
        currentStream
          .getAudioTracks()
          .forEach((track) => (track.enabled = true));
        const peer = new Peer({
          initiator: true, //  This user starts the call
          trickle: false, //  Prevents trickling of ICE candidates, ensuring a single signal exchange
          stream: currentStream, //  Attach the local media stream
        });
        peerRef.current = peer;
        //  Handle the "signal" event (this occurs when the WebRTC handshake is initiated)
        peer.on("signal", (data) => {
          //  Emit a "callToUser" event to the server with necessary call details
          socket.emit(
            "callToUser",
            { callToUserId: friendInfo._id, signalData: data, type },
            (response) => {
              if (response?.success) callIdRef.current = response.callId;
              else if (response?.message) toast.error(response.message);
            },
          );
        });
        peer.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream; //  Assign remote stream to video element
            remoteVideoRef.current.muted = false; //  Ensure audio from the remote user is not muted
            remoteVideoRef.current.volume = 1.0; //  Set volume to normal level
          }
        });
        //  Listen for "callAccepted" event from the server (when the recipient accepts the call)
        handleCallAccepted = (data) => {
          callIdRef.current = data.callId;
          setCallRejectedPopUp(false);
          setCallAccepted(true); //  Mark call as accepted

          setCaller(data.from); //  Store caller's ID
          peer.signal(data.signal); //  Pass the received WebRTC signal to establish the connection
        };
        socket.once("callAccepted", handleCallAccepted);
        connectionRef.current = peer;
      } catch (error) {
        if (cancelled) return;
        if (error?.name === "NotAllowedError") {
          setMediaError("Bạn chưa cho phép truy cập camera và micro.");
        } else if (error?.name === "NotFoundError") {
          setMediaError("Không tìm thấy camera trên thiết bị.");
        } else {
          setMediaError("Không thể mở camera. Vui lòng kiểm tra lại thiết bị.");
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (handleCallAccepted) {
        socket.off("callAccepted", handleCallAccepted);
      }
      peerRef.current?.destroy();
      peerRef.current = null;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      if (localVideoElement) localVideoElement.srcObject = null;
      if (remoteVideoElement) remoteVideoElement.srcObject = null;
    };
  }, [open, isVideo, callAttempt, friendInfo._id, type]);

  useEffect(() => {
    const handleIncomingCall = (data) => {
      callIdRef.current = data.callId;
      setReciveCall(true); // Set state to indicate an incoming call.
      setCaller(data); // Store caller's information in state.
      setCallerName(data.name); // Store caller's name.
      setCallerSignal(data.signal); // Store WebRTC signal data for the call.
      setIncomingCallType(data.type || "video");
      setCallAccepted(false);
      //  Start playing ringtone
      ringtoneRef.current?.play();
    };
    //reject call
    const handleCallRejected = (data) => {
      callIdRef.current = null;
      peerRef.current?.destroy();
      peerRef.current = null;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setCallRejectedPopUp(true);
      setCallrejectorData(data);
      ringtoneRef.current?.stop();
    };
    const handleUserUnavailable = (data) => {
      toast.info(data.message || "Người dùng không online!");
    };

    const handleUserBusy = (data) => {
      toast.info(data.message || "Người dùng đang trong cuộc gọi khác!");
    };
    const handleCallEnded = () => {
      peerRef.current?.destroy();
      peerRef.current = null;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      callIdRef.current = null;
      setStream(null);
      setRemoteStream(null);
      setCallAccepted(false);
      setReciveCall(false);
      setIncomingCallType(null);
      ringtoneRef.current?.stop();
      onClose?.();
    };
    const handleCallAnsweredElsewhere = ({ callId }) => {
      if (!callId || callIdRef.current !== callId) return;
      peerRef.current?.destroy();
      peerRef.current = null;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      callIdRef.current = null;
      setCaller(null);
      setCallerName("");
      setCallerSignal(null);
      setStream(null);
      setRemoteStream(null);
      setCallAccepted(false);
      setReciveCall(false);
      setIncomingCallType(null);
      ringtoneRef.current?.stop();
      onClose?.();
    };
    socket.on("makeUser", handleIncomingCall);
    socket.on("callRejected", handleCallRejected);
    socket.on("userUnavailable", handleUserUnavailable);
    socket.on("userBusy", handleUserBusy);
    socket.on("callEnded", handleCallEnded);
    socket.on("callAnsweredElsewhere", handleCallAnsweredElsewhere);
    return () => {
      socket.off("makeUser", handleIncomingCall);
      socket.off("callRejected", handleCallRejected);
      socket.off("userUnavailable", handleUserUnavailable);
      socket.off("userBusy", handleUserBusy);
      socket.off("callEnded", handleCallEnded);
      socket.off("callAnsweredElsewhere", handleCallAnsweredElsewhere);
    };
  }, [roomChatId, onClose]);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = speakerOn ? 1 : 0;
    }
  }, [callAccepted, reciveCall, remoteStream, speakerOn, stream]);

  //request from server
  const toggleMicrophone = () => {
    setMicrophoneOn((current) => {
      const next = !current;
      localStreamRef.current
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = next));
      return next;
    });
  };

  const toggleCamera = () => {
    setCameraOn((current) => {
      const next = !current;
      localStreamRef.current
        ?.getVideoTracks()
        .forEach((track) => (track.enabled = next));
      return next;
    });
  };

  const handleAcceptCall = async () => {
    if (acceptingCall) return;

    ringtoneRef.current?.stop();
    setAcceptingCall(true);
    setMediaError("");

    try {
      const existingStream = localStreamRef.current;
      const hasLiveTracks = existingStream
        ?.getTracks()
        .some((track) => track.readyState === "live");
      let currentStream = existingStream;

      if (!hasLiveTracks) {
        existingStream?.getTracks().forEach((track) => track.stop());
        if (stream && stream !== existingStream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        localStreamRef.current = null;

        currentStream = await navigator.mediaDevices.getUserMedia({
          video: isVideo,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      }

      //  Store the stream in state so it can be used later
      localStreamRef.current = currentStream;
      setStream(currentStream);

      //  Assign the stream to the local video element for preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = currentStream;
      }

      // Ensure that the audio track is enabled
      currentStream.getAudioTracks().forEach((track) => (track.enabled = true));

      //  Update call state
      setCallAccepted(true); //  Mark call as accepted
      setReciveCall(false);
      //  Create a new Peer connection as the receiver (not the initiator)
      const peer = new Peer({
        initiator: false, //  This user is NOT the call initiator
        trickle: false, //  Prevents trickling of ICE candidates, ensuring a single signal exchange
        stream: currentStream, //  Attach the local media stream
      });

      //  Handle the "signal" event (this occurs when the WebRTC handshake is completed)
      peer.on("signal", (data) => {
        //  Emit an "answeredCall" event to the server with necessary response details
        socket.emit("answeredCall", {
          callId: caller.callId,
          signal: data,
        });
      });

      //  Handle the "stream" event (this is triggered when the remote user's media stream is received)
      peer.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream; //  Assign remote stream to video element
          remoteVideoRef.current.muted = false; //  Ensure audio from the remote user is not muted
          remoteVideoRef.current.volume = 1.0; //  Set volume to normal level
        }
      });

      //  If there's an incoming signal (from the caller), process it
      if (callerSignal) peer.signal(callerSignal);

      //  Store the peer connection reference to manage later (like ending the call)
      connectionRef.current = peer;
      peerRef.current = peer;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setReciveCall(true);
      setCallAccepted(false);

      if (error?.name === "NotReadableError") {
        setMediaError(
          "Camera hoặc micro đang được ứng dụng khác sử dụng. Hãy đóng ứng dụng đó rồi thử lại.",
        );
      } else if (error?.name === "NotAllowedError") {
        setMediaError("Bạn chưa cho phép truy cập camera hoặc micro.");
      } else if (error?.name === "NotFoundError") {
        setMediaError("Không tìm thấy camera hoặc micro trên thiết bị.");
      } else {
        setMediaError("Không thể mở camera hoặc micro. Vui lòng thử lại.");
      }
    } finally {
      setAcceptingCall(false);
    }
  };

  const handleRejectCall = () => {
    ringtoneRef.current?.stop();
    setReciveCall(false);
    setCaller(null);
    setCallerName("");
    setCallerSignal(null);
    setIncomingCallType(null);
    socket.emit("reject-call", {
      callId: caller.callId,
    });
    callIdRef.current = null;
  };

  const handleCallAgain = () => {
    setCallRejectedPopUp(false);
    setCallrejectorData(null);
    setCallAttempt((current) => current + 1);
  };

  const handleBackAfterRejected = () => {
    peerRef.current?.destroy();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setCallRejectedPopUp(false);
    setCallrejectorData(null);
    onClose?.();
  };

  const handleEndCall = () => {
    if (callIdRef.current) {
      socket.emit("end-call", { callId: callIdRef.current });
      callIdRef.current = null;
    }
    peerRef.current?.destroy();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    stream?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setStream(null);
    setRemoteStream(null);
    setCallAccepted(false);
    setReciveCall(false);
    setIncomingCallType(null);
    onClose?.();
  };

  if (!open && !reciveCall && !callRejectedPopUp && !callAccepted) return null;

  return createPortal(
    reciveCall && !callAccepted ? (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm">
        <div
          className="app-card w-full max-w-md rounded-lg border p-6 shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label={`Cuộc gọi đến từ ${callerName}`}
        >
          <div className="flex flex-col items-center">
            <p className="mb-2 text-xl font-black">Cuộc gọi đến...</p>
            <img
              src={caller?.profilepic || defaultAvatar}
              onError={(event) => {
                event.currentTarget.src = defaultAvatar;
              }}
              alt={`Ảnh đại diện ${callerName}`}
              className="h-20 w-20 rounded-full border-4 border-green-500 object-cover"
            />
            <h3 className="mt-3 text-lg font-bold">{callerName}</h3>
            <p className="app-muted text-sm">{caller?.email}</p>
            {mediaError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600 dark:bg-red-950/60 dark:text-red-300">
                {mediaError}
              </p>
            )}
            <div className="mt-5 flex gap-4">
              <button
                type="button"
                onClick={handleAcceptCall}
                disabled={acceptingCall}
                className="flex w-28 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Chấp nhận <IoCall />
              </button>
              <button
                type="button"
                onClick={handleRejectCall}
                className="flex w-28 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Từ chối <IoClose />
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : callRejectedPopUp ? (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm">
        <div
          className="app-card w-full max-w-md rounded-lg border p-6 shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label={`Cuộc gọi bị ${rejectorData?.name || "người nhận"} từ chối`}
        >
          <div className="flex flex-col items-center">
            <p className="mb-2 text-xl font-black">Cuộc gọi bị từ chối</p>
            <img
              src={
                rejectorData?.profilepic ||
                "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
              }
              onError={(event) => {
                event.currentTarget.src = defaultAvatar;
              }}
              alt={`Ảnh đại diện ${rejectorData?.name || "người nhận"}`}
              className="h-20 w-20 rounded-full border-4 border-red-500 object-cover"
            />
            <h3 className="mt-3 text-lg font-bold">
              {rejectorData?.name || displayName}
            </h3>
            <div className="mt-5 flex gap-4">
              <button
                type="button"
                onClick={handleCallAgain}
                className="flex w-28 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Gọi lại <IoCall />
              </button>
              <button
                type="button"
                onClick={handleBackAfterRejected}
                className="flex w-28 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Quay lại <IoClose />
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-label={isVideo ? "Cuộc gọi video" : "Cuộc gọi thoại"}
      >
        <section
          className="relative isolate w-full overflow-hidden rounded-[28px] border border-white/15 bg-[#172235] shadow-[0_25px_90px_rgba(0,0,0,0.55)]"
          style={{
            maxWidth: isVideo ? 760 : 390,
            height: isVideo
              ? "min(570px, calc(100vh - 24px))"
              : "min(570px, calc(100vh - 24px))",
          }}
        >
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-35 blur-2xl"
            style={{ backgroundImage: `url("${avatar}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#172235]/70 via-[#172235]/75 to-[#09101c]/95" />

          {isVideo && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/55 to-transparent px-5 pb-10 pt-4">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-white">
                {displayName}
              </h2>
              <p className="mt-0.5 text-xs text-white/65">
                {isVideo ? "Cuộc gọi video" : "Cuộc gọi thoại"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Thu nhỏ"
                title="Thu nhỏ"
                className="grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white hover:bg-black/40"
              >
                <IoRemove size={22} />
              </button>
              <button
                type="button"
                onClick={handleEndCall}
                aria-label="Đóng"
                title="Đóng"
                className="grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white hover:bg-black/40"
              >
                <IoClose size={22} />
              </button>
            </div>
          </header>

          <main className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-28 pt-20">
            <div className="relative">
              <span className="absolute -inset-3 animate-pulse rounded-full bg-[#0068ff]/25" />
              <img
                src={avatar}
                onError={(event) => {
                  event.currentTarget.src = defaultAvatar;
                }}
                alt={`Ảnh đại diện ${displayName}`}
                className={`relative rounded-full border-4 border-white/25 object-cover shadow-2xl ${
                  isVideo
                    ? "h-28 w-28 sm:h-32 sm:w-32"
                    : "h-32 w-32 sm:h-36 sm:w-36"
                }`}
              />
            </div>
            <h3 className="mt-6 max-w-full truncate text-center text-2xl font-semibold text-white">
              {displayName}
            </h3>
            <p className="mt-2 text-sm text-white/70">
              {callAccepted
                ? "Cuộc gọi đã kết nối"
                : "Đang chờ người nhận trả lời..."}
            </p>

            {isVideo && (
              <div className="absolute bottom-28 right-4 h-36 w-24 overflow-hidden rounded-xl border border-white/25 bg-slate-800 shadow-xl sm:right-6 sm:h-44 sm:w-28">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`h-full w-full scale-x-[-1] object-cover ${
                    cameraOn && !mediaError ? "opacity-100" : "opacity-0"
                  }`}
                />
                {(!cameraOn || mediaError) && (
                  <div className="absolute inset-0 grid place-items-center text-white/50">
                    <IoVideocamOff size={28} />
                  </div>
                )}
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/45 px-1.5 py-0.5 text-[10px] text-white">
                  Bạn
                </span>
              </div>
            )}
            {isVideo && mediaError && (
              <p className="mt-4 max-w-sm rounded-xl bg-red-500/15 px-4 py-2 text-center text-xs text-red-100">
                {mediaError}
              </p>
            )}
          </main>

          <footer className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-center gap-1 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pb-5 pt-12 sm:gap-2">
            <CallControl
              enabled={microphoneOn}
              label={microphoneOn ? "Tắt mic" : "Bật mic"}
              onClick={toggleMicrophone}
            >
              {microphoneOn ? <IoMic size={22} /> : <IoMicOff size={22} />}
            </CallControl>

            {isVideo ? (
              <CallControl
                enabled={cameraOn}
                label={cameraOn ? "Tắt camera" : "Bật camera"}
                onClick={toggleCamera}
              >
                {cameraOn ? (
                  <IoVideocam size={24} />
                ) : (
                  <IoVideocamOff size={24} />
                )}
              </CallControl>
            ) : (
              <CallControl
                enabled={speakerOn}
                label={speakerOn ? "Loa" : "Tắt loa"}
                onClick={() => setSpeakerOn((current) => !current)}
              >
                {speakerOn ? (
                  <IoVolumeHigh size={23} />
                ) : (
                  <IoVolumeMute size={23} />
                )}
              </CallControl>
            )}

            <button
              type="button"
              onClick={handleEndCall}
              aria-label="Kết thúc cuộc gọi"
              className="group flex min-w-[68px] flex-col items-center gap-2 text-xs text-white/80"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e5484d] text-white shadow-lg transition group-hover:bg-[#cf383d] sm:h-14 sm:w-14">
                <IoCall className="rotate-[135deg]" size={25} />
              </span>
              <span>Kết thúc</span>
            </button>
          </footer>
        </section>
      </div>
    ),
    document.body,
  );
};

export default CallDialog;
