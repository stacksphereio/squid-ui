import React, { useState, useEffect, useCallback } from 'react';
import { getFeed } from '../api/feeds';
import '../styles/FeedPanel.css';

const FeedPanel = () => {
  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFeed();
      setFeedData(data);
      setCurrentNewsIndex(0); // Reset news index when new data arrives
    } catch (err) {
      console.error('Failed to fetch feeds:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and polling every 60 seconds
  useEffect(() => {
    fetchFeeds();
    const pollInterval = setInterval(fetchFeeds, 60000);
    return () => clearInterval(pollInterval);
  }, [fetchFeeds]);

  // Rotate news every 5 seconds
  useEffect(() => {
    if (!feedData?.feeds?.news?.items || feedData.feeds.news.items.length === 0) {
      return;
    }

    const rotateInterval = setInterval(() => {
      setCurrentNewsIndex(prevIndex =>
        (prevIndex + 1) % feedData.feeds.news.items.length
      );
    }, 5000);

    return () => clearInterval(rotateInterval);
  }, [feedData]);

  if (loading && !feedData) {
    return (
      <div className="panel">
        <div className="feed-loading">Loading feeds...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div className="feed-error">Failed to load feeds: {error}</div>
      </div>
    );
  }

  if (!feedData || !feedData.feeds) {
    return null;
  }

  const { weather, news } = feedData.feeds;
  const hasWeather = weather && weather.enabled && weather.data;
  const hasNews = news && news.enabled && news.items && news.items.length > 0;

  if (!hasWeather && !hasNews) {
    return null; // Don't render if no feeds are available
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Personalized Feeds</h2>
        <div className="feed-location">
          {feedData.user.country} • {feedData.user.region}
        </div>
      </div>

      <div className="feed-content">
        {hasWeather && (
          <div className="feed-weather-card">
            <div className="weather-header">
              <h3>Weather</h3>
            </div>
            <div className="weather-content">
              <div className="weather-summary">{weather.data.summary}</div>
              <div className="weather-temp">
                <span className="temp-value">{Math.round(weather.data.temperatureC)}</span>
                <span className="temp-unit">°C</span>
              </div>
              {weather.data.feelsLikeC && (
                <div className="weather-feels-like">
                  Feels like {Math.round(weather.data.feelsLikeC)}°C
                </div>
              )}
            </div>
          </div>
        )}

        {hasNews && (
          <div className="feed-news-ticker">
            <div className="news-header">
              <h3>News</h3>
              <div className="news-indicators">
                {news.items.map((_, index) => (
                  <span
                    key={index}
                    className={`news-dot ${index === currentNewsIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
            <div className="news-content">
              {news.items.length > 0 && (
                <div className="news-item" key={news.items[currentNewsIndex].id}>
                  <h4 className="news-title">{news.items[currentNewsIndex].title}</h4>
                  <div className="news-meta">
                    <span className="news-source">{news.items[currentNewsIndex].source}</span>
                    <span className="news-time">
                      {new Date(news.items[currentNewsIndex].publishedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <a
                    href={news.items[currentNewsIndex].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-link"
                  >
                    Read more →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPanel;
