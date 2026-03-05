// src/views/Products.jsx
import React from "react";
import { listProducts, getProduct } from "../api/catalog";
import ProductCard from "../components/ProductCard";
import { RightSheet } from "./AdminUserDetail";

export default function Products() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  // UI state
  const [q, setQ] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");

  // Detail panel state
  const [selectedId, setSelectedId] = React.useState(null);
  const [detail, setDetail] = React.useState(null);
  const [detailError, setDetailError] = React.useState(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  // Load products list
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listProducts({ limit: 100, offset: 0, category: categoryFilter });
        if (alive) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setTotal(data.total || 0);
        }
      } catch (e) {
        if (alive) setErr(e.message || String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [categoryFilter]);

  // Load product detail when selectedId changes
  React.useEffect(() => {
    let alive = true;
    if (!selectedId) return;
    (async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const p = await getProduct(selectedId);
        if (alive) setDetail(p || null);
      } catch (e) {
        if (alive) setDetailError(e.message || String(e));
      } finally {
        if (alive) setDetailLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedId]);

  if (loading) return <p>Loading products…</p>;
  if (err) return <p className="error">Error: {err}</p>;

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  // Client-side search filtering
  const filtered = products.filter(p => {
    const searchLower = q.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchLower) ||
      (p.description || "").toLowerCase().includes(searchLower) ||
      (p.category || "").toLowerCase().includes(searchLower) ||
      (p.tags || []).some(tag => tag.toLowerCase().includes(searchLower));

    return matchesSearch;
  });

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Product Catalog</h2>
        <div className="tools">
          <input
            className="input"
            placeholder="Search products…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select
            className="input"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <p style={{ marginBottom: 16, color: '#666' }}>
        Showing {filtered.length} of {total} products
      </p>

      {filtered.length === 0 ? (
        <p>No matching products.</p>
      ) : (
        <div className="product-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 32
        }}>
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={(p) => setSelectedId(p.id)}
            />
          ))}
        </div>
      )}

      {/* Right-side detail sheet */}
      {selectedId && (
        <RightSheet
          title={detail?.name ? detail.name : "Product details"}
          onClose={() => { setSelectedId(null); setDetail(null); }}
        >
          {detailLoading && <p>Loading…</p>}
          {detailError && <p className="error">Error: {detailError}</p>}
          {!detailLoading && !detailError && detail && (
            <div className="product-detail">
              {/* Image gallery */}
              {detail.images && detail.images.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <img
                    src={detail.primary_image_url || detail.images[0]}
                    alt={detail.name}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      marginBottom: 12
                    }}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23ddd' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' fill='%23999' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {detail.images.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                      {detail.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${detail.name} ${idx + 1}`}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid #ddd',
                            cursor: 'pointer'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Product info */}
              <dl className="kv">
                <dt>Product ID</dt><dd style={{ fontFamily: 'monospace', fontSize: 12 }}>{detail.id}</dd>
                <dt>Name</dt><dd><strong>{detail.name}</strong></dd>
                <dt>Category</dt><dd>{detail.category || "—"}</dd>
                <dt>SKU</dt><dd>{detail.sku || "—"}</dd>
                <dt>Price</dt><dd style={{ fontSize: 20, fontWeight: 'bold', color: '#2d3748' }}>
                  £{detail.price.toFixed(2)}
                </dd>
                <dt>Stock</dt>
                <dd>
                  {detail.stock_count > 0 ? (
                    <span style={{
                      color: detail.stock_count <= 10 ? '#d97706' : '#059669',
                      fontWeight: 600
                    }}>
                      {detail.stock_count} in stock
                    </span>
                  ) : (
                    <span style={{ color: '#e53e3e', fontWeight: 600 }}>
                      Out of stock
                    </span>
                  )}
                </dd>

                {detail.rating != null && (
                  <>
                    <dt>Rating</dt>
                    <dd>
                      <span style={{ color: '#f59e0b' }}>★</span> {detail.rating.toFixed(1)}
                      <span style={{ color: '#666', marginLeft: 8 }}>
                        ({detail.review_count} {detail.review_count === 1 ? 'review' : 'reviews'})
                      </span>
                    </dd>
                  </>
                )}

                {detail.description && (
                  <>
                    <dt>Description</dt>
                    <dd style={{ lineHeight: 1.6 }}>{detail.description}</dd>
                  </>
                )}

                {detail.tags && detail.tags.length > 0 && (
                  <>
                    <dt>Tags</dt>
                    <dd>
                      <div className="tags-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {detail.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              background: '#e2e8f0',
                              borderRadius: 4,
                              fontSize: 12,
                              color: '#475569'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </>
                )}

                <dt>Created</dt><dd>{new Date(detail.created_at).toLocaleString()}</dd>
                <dt>Updated</dt><dd>{new Date(detail.updated_at).toLocaleString()}</dd>
              </dl>
            </div>
          )}
        </RightSheet>
      )}
    </div>
  );
}
