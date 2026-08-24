import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  LuBookmark,
  LuHeart,
  LuLink,
  LuMessageCircle,
  LuMusic2,
  LuPlay,
  LuPlus,
  LuSend,
  LuShare2,
  LuUpload,
  LuVolume2,
  LuVolumeX,
  LuX,
} from "react-icons/lu";
import { BsThreeDots } from "react-icons/bs";
import "./video.css";

const mockVideos = [
  {
    id: 1,
    user: {
      name: "Nguyễn Văn An",
      handle: "nguyenvanan",
      avatar: "https://i.pravatar.cc/120?img=12",
    },
    caption:
      "Một ngày làm việc tại văn phòng cùng team. Những khoảnh khắc rất bình thường nhưng đáng nhớ.",
    hashtags: "#company #worklife #daily",
    audio: "Những ngày đẹp trời · Original audio",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    likes: 125,
    comments: 18,
    shares: 5,
  },
  {
    id: 2,
    user: {
      name: "Minh Anh",
      handle: "minhanh.daily",
      avatar: "https://i.pravatar.cc/120?img=47",
    },
    caption: "Góc nhỏ bình yên sau giờ làm việc.",
    hashtags: "#chill #afterwork",
    audio: "Chạm khẽ tim anh một chút thôi",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    likes: 892,
    comments: 43,
    shares: 21,
  },
  {
    id: 3,
    user: {
      name: "Tuấn Trần",
      handle: "tuantran",
      avatar: "https://i.pravatar.cc/120?img=15",
    },
    caption: "Một chút năng lượng cho ngày mới.",
    hashtags: "#morning #positive #office",
    audio: "Morning coffee · Tuấn Trần",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    likes: 341,
    comments: 27,
    shares: 9,
  },
  {
    id: 4,
    user: {
      name: "Hà My",
      handle: "hamy.22",
      avatar: "https://i.pravatar.cc/120?img=32",
    },
    caption: "Cuối tuần cùng đồng nghiệp khám phá một địa điểm mới.",
    hashtags: "#weekend #travel #friends",
    audio: "Original audio · Hà My",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    likes: 1204,
    comments: 86,
    shares: 34,
  },
  {
    id: 5,
    user: {
      name: "Phương Linh",
      handle: "linhphuong",
      avatar: "https://i.pravatar.cc/120?img=25",
    },
    caption: "Bữa trưa nhanh gọn nhưng vẫn thật ngon.",
    hashtags: "#food #lunch #review",
    audio: "Good day · Original audio",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    likes: 673,
    comments: 39,
    shares: 17,
  },
];

const mockComments = [
  {
    id: 1,
    name: "Hoàng Nam",
    avatar: "https://i.pravatar.cc/60?img=11",
    text: "Video hay quá!",
  },
  {
    id: 2,
    name: "Trần Ngọc",
    avatar: "https://i.pravatar.cc/60?img=44",
    text: "Góc quay đẹp thật đó 👏",
  },
  {
    id: 3,
    name: "Mai Anh",
    avatar: "https://i.pravatar.cc/60?img=20",
    text: "Mình cũng muốn thử.",
  },
];

function VideoCard({
  item,
  liked,
  saved,
  onLike,
  onSave,
  onComment,
  onShare,
  onProfile,
}) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
          video
            .play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: [0.25, 0.65, 0.9] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current.paused) videoRef.current.play();
    else videoRef.current.pause();
    setPlaying(!videoRef.current.paused);
  };

  return (
    <article className="video-feed-item">
      <div className="video-stage">
        <video
          ref={videoRef}
          src={item.videoUrl}
          muted={muted}
          loop
          playsInline
          preload="metadata"
        />
        <button
          className="video-play-layer"
          onClick={togglePlay}
          aria-label={playing ? "Tạm dừng" : "Phát video"}
        >
          {!playing && (
            <span>
              <LuPlay />
            </span>
          )}
        </button>
        <button
          className="video-mute"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {muted ? <LuVolumeX /> : <LuVolume2 />}
        </button>

        <div className="video-overlay-info">
          <button className="video-author" onClick={onProfile}>
            @{item.user.handle}
          </button>
          <p className={expanded ? "" : "line-clamp-2"}>{item.caption}</p>
          {item.caption.length > 58 && (
            <button
              className="video-more"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
          <p className="video-hashtags">{item.hashtags}</p>
          <div className="video-audio">
            <LuMusic2 />
            <span>{item.audio}</span>
          </div>
        </div>
      </div>

      <div className="video-actions">
        <button className="video-avatar-action" onClick={onProfile}>
          <Avatar src={item.user.avatar} sx={{ width: 44, height: 44 }} />
          <span>
            <LuPlus />
          </span>
        </button>
        <Tooltip title={liked ? "Bỏ thích" : "Thích"} placement="right">
          <button
            className={`video-action ${liked ? "is-liked" : ""}`}
            onClick={onLike}
          >
            <LuHeart />
            <small>{item.likes + (liked ? 1 : 0)}</small>
          </button>
        </Tooltip>
        <Tooltip title="Bình luận" placement="right">
          <button className="video-action" onClick={onComment}>
            <LuMessageCircle />
            <small>{item.comments}</small>
          </button>
        </Tooltip>
        <Tooltip title="Lưu video" placement="right">
          <button
            className={`video-action ${saved ? "is-saved" : ""}`}
            onClick={onSave}
          >
            <LuBookmark />
            <small>{saved ? "Đã lưu" : "Lưu"}</small>
          </button>
        </Tooltip>
        <Tooltip title="Chia sẻ" placement="right">
          <button className="video-action" onClick={onShare}>
            <LuShare2 />
            <small>{item.shares}</small>
          </button>
        </Tooltip>
        <button className="video-action">
          <BsThreeDots />
        </button>
      </div>
    </article>
  );
}

function UploadDialog({ open, onClose }) {
  const [preview, setPreview] = useState("");
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  const chooseFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <div className="video-dialog-header">
        <div>
          <h3>Đăng video</h3>
          <p>Chia sẻ khoảnh khắc với mọi người</p>
        </div>
        <IconButton onClick={onClose}>
          <LuX />
        </IconButton>
      </div>
      <DialogContent className="video-upload-content">
        <label className="video-dropzone">
          {preview ? (
            <video src={preview} controls />
          ) : (
            <>
              <span>
                <LuUpload />
              </span>
              <strong>Kéo thả video vào đây</strong>
              <small>MP4, WebM · Tối đa 500 MB</small>
              <Button variant="outlined" component="span">
                Chọn video
              </Button>
            </>
          )}
          <input type="file" accept="video/*" hidden onChange={chooseFile} />
        </label>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Mô tả"
          placeholder="Viết mô tả cho video..."
        />
        <TextField fullWidth select defaultValue="company" label="Quyền xem">
          <MenuItem value="company">Công ty</MenuItem>
          <MenuItem value="friends">Bạn bè</MenuItem>
          <MenuItem value="private">Chỉ mình tôi</MenuItem>
        </TextField>
      </DialogContent>
      <div className="video-dialog-footer">
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" disabled={!preview} onClick={onClose}>
          Đăng video
        </Button>
      </div>
    </Dialog>
  );
}

export default function Video() {
  const [tab, setTab] = useState("for-you");
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [commentsFor, setCommentsFor] = useState(null);
  const [profile, setProfile] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareAnchor, setShareAnchor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="video-page">
      <header className="video-header">
        <div className="video-heading">
          <h1>Video</h1>
          <nav>
            <button
              className={tab === "for-you" ? "active" : ""}
              onClick={() => setTab("for-you")}
            >
              Dành cho bạn
            </button>
            <button
              className={tab === "following" ? "active" : ""}
              onClick={() => setTab("following")}
            >
              Đang theo dõi
            </button>
          </nav>
        </div>
        <Button
          variant="contained"
          startIcon={<LuPlus />}
          onClick={() => setUploadOpen(true)}
        >
          Đăng video
        </Button>
      </header>

      <section className="video-feed">
        {loading ? (
          <div className="video-skeleton">
            <div />
            <span />
            <span />
            <span />
          </div>
        ) : (
          mockVideos.map((item) => (
            <VideoCard
              key={item.id}
              item={item}
              liked={liked[item.id]}
              saved={saved[item.id]}
              onLike={() => setLiked((v) => ({ ...v, [item.id]: !v[item.id] }))}
              onSave={() => setSaved((v) => ({ ...v, [item.id]: !v[item.id] }))}
              onComment={() => setCommentsFor(item)}
              onShare={(e) => setShareAnchor(e.currentTarget)}
              onProfile={() => setProfile(item.user)}
            />
          ))
        )}
      </section>

      <Dialog
        open={Boolean(commentsFor)}
        onClose={() => setCommentsFor(null)}
        fullWidth
        maxWidth="xs"
      >
        <div className="video-dialog-header">
          <div>
            <h3>Bình luận</h3>
            <p>{commentsFor?.comments} bình luận</p>
          </div>
          <IconButton onClick={() => setCommentsFor(null)}>
            <LuX />
          </IconButton>
        </div>
        <div className="video-comment-list">
          {mockComments.map((comment) => (
            <div key={comment.id}>
              <Avatar src={comment.avatar} />
              <p>
                <strong>{comment.name}</strong>
                <span>{comment.text}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="video-comment-input">
          <Avatar sx={{ width: 32, height: 32 }} />
          <TextField fullWidth size="small" placeholder="Viết bình luận..." />
          <IconButton color="primary">
            <LuSend />
          </IconButton>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(profile)}
        onClose={() => setProfile(null)}
        maxWidth="xs"
        fullWidth
      >
        <div className="video-profile-card">
          <IconButton className="close" onClick={() => setProfile(null)}>
            <LuX />
          </IconButton>
          <Avatar src={profile?.avatar} sx={{ width: 76, height: 76 }} />
          <h3>{profile?.name}</h3>
          <p>@{profile?.handle}</p>
          <Button variant="contained" startIcon={<LuPlus />}>
            Theo dõi
          </Button>
        </div>
      </Dialog>

      <Menu
        anchorEl={shareAnchor}
        open={Boolean(shareAnchor)}
        onClose={() => setShareAnchor(null)}
      >
        <MenuItem onClick={() => setShareAnchor(null)}>
          <LuSend className="mr-3" />
          Gửi cho người khác
        </MenuItem>
        <MenuItem onClick={() => setShareAnchor(null)}>
          <LuLink className="mr-3" />
          Sao chép liên kết
        </MenuItem>
        <MenuItem onClick={() => setShareAnchor(null)}>
          <LuShare2 className="mr-3" />
          Chia sẻ
        </MenuItem>
      </Menu>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </main>
  );
}
