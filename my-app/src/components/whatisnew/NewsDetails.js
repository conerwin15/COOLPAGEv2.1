import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Newsheader from '../headers/headerfornews'
const NewsDetails = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost/coolpage/my-app/backend/get_news.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.news.length > 0) {
          setNewsItem(data.news[0]);
        } else {
          console.error("News not found");
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!newsItem) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
<>
    <Newsheader />
    <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
    <div className="news-details-container">
  

     <div className="news-card">
  {/* Title */}
  <h2 className="news-title">{newsItem.title || "News Detail"}</h2>

  {/* Category */}
  {newsItem.category && (
    <span className="news-category">{newsItem.category}</span>
  )}

  {/* Media */}
  <div className="news-media-container">
    {newsItem.media && newsItem.media.length > 0 &&
      newsItem.media.map((m, index) =>
        m.url.endsWith(".mp4") ? (
          <video
            key={index}
            src={m.url}
            controls
            className="news-media"
          />
        ) : (
          <img
            key={index}
            src={m.url}
            alt="news"
            className="news-media"
          />
        )
      )
    }
  </div>

  {/* Content */}
  <p className="news-content">{newsItem.content}</p>

  {/* Meta / Author */}
  <p className="news-meta">
    Posted by: <strong>{newsItem.username || "Unknown"}</strong> |{" "}
    {new Date(newsItem.created_at).toLocaleDateString()}
  </p>
</div>
      <style jsx>{`
        .news-details-container {
          max-width: 800px;
          margin: 30px auto;
          padding: 0 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          
        }

        .back-btn {
          background-color:transparent;
       color: #79b8faff;
  border: 1px solid;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          margin-bottom: 20px;
          transition: all 0.3s ease;
          margin:10px;
        }

        .back-btn:hover {
          background-color: #005f8a;
        
        }

        .news-card {
          background-color: #fff;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 15px;
               width: 100%;
             height:auto;
        }

        .news-title {
          font-size: 28px;
          font-weight: 700;
          color: #0077b6;
          margin-bottom: 10px;
        }
 .news-media {
          width: 100%;
               height: 500px; /* increased height */
          object-fit: cover;
          border-radius: 10px;
        }

        .news-content {
          font-size: 16px;
          color: #333;
          line-height: 1.6;
        }

        .news-meta {
          font-size: 12px;
          color: #777;
          text-align: right;
        }

        @media (max-width: px) {
          .news-title {
            font-size: 22px;
          }
          .news-content {
            font-size: 14px;
          }
        }
      `}</style>
    </div> </>
  );
};

export default NewsDetails;
