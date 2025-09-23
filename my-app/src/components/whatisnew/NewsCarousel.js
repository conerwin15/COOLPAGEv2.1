import React, { useEffect, useState} from "react";
import Slider from "react-slick";
import "./NewsCarousel.css";
import { useNavigate } from "react-router-dom";
import DeleteButtons from '../icon/deleteicon'; 
  const API_URL= process.env.REACT_APP_API_URL;

// Custom Arrow Components
const NextArrow = ({ onClick }) => (
  <div className="arrow next" onClick={onClick}>
    &#10095; {/* right chevron */}
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div className="arrow prev" onClick={onClick}>
    &#10094; {/* left chevron */}
  </div>
);




const NewsCarousel = (user) => {
  const [news, setNews] = useState([]);
  const navigate = useNavigate();

  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    fetchNews();
  }, []);
const fetchNews = async () => {
    try {
      const res = await fetch(`${API_URL}/get_news.php`);
      const data = await res.json();
      if (data.success) setNews(data.news);
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  };


   const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this post?")) return;

  try {
    const res = await fetch(`${API_URL}/delete_newspost.php?id=${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Post deleted successfully!");
      fetchNews(); // refresh carousel
    } else {
      alert(data.message || "Failed to delete post");
    }
  } catch (err) {
    console.error("Error deleting post:", err);
    alert("An error occurred while deleting post.");
  }
};


  // Fetch news posts from backend
  useEffect(() => {
    fetch(`${API_URL}/get_news.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.news)) {
          setNews(data.news);
        } else {
          console.error("Unexpected response:", data);
        }
      })
      .catch((err) => console.error("Error fetching news:", err));
  }, []);


   useEffect(() => {
    const updateSlides = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1); // mobile
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2); // tablet
      } else {
        setSlidesToShow(4); // desktop
      }
    };

    updateSlides(); // run on mount
    window.addEventListener("resize", updateSlides);

    return () => window.removeEventListener("resize", updateSlides);
  }, []);

    
    
    const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
          <div className="news-wrapper"><h3 style={{ marginBottom: "15px" }}>News and Highlights:</h3>

    <div className="news-carousel">
      <Slider {...settings}>
        {news.map((item) => {
          const firstMedia =
            item.media && item.media.length > 0 ? item.media[0].url : null;

          return (
  <div key={item.id} className="news-card">

  {firstMedia ? (
  firstMedia.endsWith(".mp4") || firstMedia.endsWith(".webm") ? (
    <video
      className="news-media"
      src={firstMedia}
      controls
      poster="	https://fms.techtreeglobal.com/assets/uploads/1758604320_logo.jpg" // fallback thumbnail
    />
  ) : (
    <img
      src={firstMedia}
      alt="news"
      className="news-media"
    />
  )
) : (
  <img
    src="	https://fms.techtreeglobal.com/assets/uploads/1758604320_logo.jpg"
    alt="news"
    className="news-media"
  />
)}



  <div className="news-content">
    <p className="news-text">
      {item.content.length > 100
        ? item.content.substring(0, 100) + "..."
        : item.content}
    </p>
 
  <button
    className="details-btn"
    onClick={() => navigate(`/news/${item.id}`)}
  >Click for more details</button>

{user?.role === "admin" && (
  <button className="delete-btn" onClick={() => handleDelete(item.id)}>
    <DeleteButtons />
  </button>
)}

    <p className="news-author">
      Posted by: {item.username || "Unknown Author"} :   {new Date(item.created_at).toLocaleDateString()}
    </p>
  </div>
</div>
          );
        })}
      </Slider>
    </div></div> 
  );
};

export default NewsCarousel;
