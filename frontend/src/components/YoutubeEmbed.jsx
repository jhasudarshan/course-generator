import './YoutubeEmbed.css'; // Make sure this CSS file exists

function YoutubeEmbed({ videoInfo }) {
  if (!videoInfo) return null;

  return (
    <div className="youtube-embed">
      <div className="video-container">
        <iframe
          src={videoInfo.embed_url}
          title={videoInfo.title}
          style={{ border: 'none' }} // Inline style to remove border
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="video-info">
        <h4>{videoInfo.title}</h4>
        <p>Channel: {videoInfo.channel}</p>
        <a href={videoInfo.watch_url} target="_blank" rel="noopener noreferrer">
          Watch on YouTube
        </a>
      </div>
    </div>
  );
}

export default YoutubeEmbed;