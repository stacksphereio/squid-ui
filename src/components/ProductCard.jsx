// src/components/ProductCard.jsx
import React from "react";

export default function ProductCard({ product, onClick }) {
  const {
    name,
    price,
    primary_image_url,
    category,
    stock_count,
    rating,
    review_count
  } = product;

  const isOutOfStock = stock_count <= 0;

  return (
    <div
      onClick={() => onClick?.(product)}
      className="product-card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(product)}
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: "#fff",
        position: "relative"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {isOutOfStock && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#e53e3e",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: "bold",
            zIndex: 1
          }}
        >
          OUT OF STOCK
        </div>
      )}

      <div className="product-image-wrap" style={{
        position: "relative",
        paddingTop: "100%",
        background: "#f5f5f5",
        overflow: "hidden"
      }}>
        <img
          src={primary_image_url}
          alt={name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' fill='%23999' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      <div className="product-info" style={{ padding: 12 }}>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 4, textTransform: "uppercase" }}>
          {category}
        </div>

        <h3 style={{
          margin: "0 0 8px 0",
          fontSize: 16,
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>
          {name}
        </h3>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8
        }}>
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#2d3748" }}>
            £{price.toFixed(2)}
          </div>

          {rating != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
              <span style={{ color: "#f59e0b" }}>★</span>
              <span style={{ fontWeight: 600 }}>{rating.toFixed(1)}</span>
              <span style={{ color: "#666" }}>({review_count})</span>
            </div>
          )}
        </div>

        {stock_count > 0 && stock_count <= 10 && (
          <div style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>
            Only {stock_count} left in stock
          </div>
        )}
      </div>
    </div>
  );
}
