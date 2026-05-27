import React, { useMemo } from "react";

export default function ProductDetailDialog({
  open,
  product,
  onClose,
  formatVND,
  getImage,
  getName,
  getCategory,
  onAddToCart,
}) {
  if (!open) return null;

  const specsObj = useMemo(() => {
    const s = product?.specifications;
    if (!s) return null;
  
    if (typeof s === "object") return s;
  
    if (typeof s !== "string") return null;
  
    const result = {};
    // Loại bỏ dấu ngoặc nhọn đầu và cuối nếu có
    const cleanStr = s.replace(/^[{"\s]+|[}";\s]+$/g, "").trim();
    const lines = cleanStr.split(/[\n,]/);
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const colonIndex = line.indexOf(":");
      const tabIndex = line.indexOf("\t");
      const separatorIndex = colonIndex !== -1 ? colonIndex : tabIndex;
      
      if (separatorIndex === -1) continue;
      
      const key = line.substring(0, separatorIndex).trim().toLowerCase().replace(/^["'{}\s]+|["'{}\s]+$/g, "");
      const value = line.substring(separatorIndex + 1).trim().replace(/^["'{}\s]+|["'{}\s]+$/g, "");
      
      if (!key || !value) continue;
      
      const keyMap = {
        "cpu": "cpu",
        "ram": "ram",
        "bộ nhớ": "storage",
        "bộ nhớ trong": "storage",
        "màu sắc": "color",
        "pin": "battery",
        "kết nối": "connectivity",
        "màn hình": "screen",
        "camera": "camera",
      };
      
      const mappedKey = keyMap[key] || key.replace(/\s+/g, "_");
      result[mappedKey] = value;
    }
    
    return Object.keys(result).length > 0 ? result : null;
  }, [product]);

  const specsEntries = useMemo(() => {
    if (!specsObj) return [];
    return Object.entries(specsObj).filter(
      ([k, v]) => v !== null && v !== undefined && String(v).trim() !== ""
    );
  }, [specsObj]);

  function prettifyKey(key) {
    const map = {
      ram: "RAM",
      storage: "Bộ nhớ",
      color: "Màu sắc",
      cpu: "CPU",
      battery: "Pin",
      connectivity: "Kết nối",
      screen: "Màn hình",
      camera: "Camera",
    };
    return map[key] || key.replaceAll("_", " ").replaceAll("-", " ");
  }

  return (
    <>
      <div className="modal-backdrop fade show" />

      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h5 className="modal-title mb-0">{getName(product)}</h5>
                <div className="text-muted small">{getCategory(product)}</div>
              </div>

              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-5">
                  <div className="ratio ratio-1x1 bg-light rounded border">
                    <img
                      src={getImage(product)}
                      alt={getName(product)}
                      className="w-100 h-100"
                      style={{ objectFit: "contain", padding: 12 }}
                      onError={(e) => {
                        e.currentTarget.src = "/img/no-image.jpg";
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-7">
                  <div className="mb-2 text-center">
                    <div className="text-muted small">Giá</div>
                    <div className="fs-3 fw-semibold text-primary">
                      {formatVND(product?.price)}
                    </div>
                  </div>

                  <div className="row text-center g-2 mb-2">
                    <div className="col-6">
                      <div className="text-muted small">Còn lại</div>
                      <div className="fw-semibold">{product?.inventory ?? 0}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted small">Trạng thái</div>
                      <span
                        className={`badge ${
                          product?.is_active
                            ? "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {product?.is_active ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </div>
                  </div>

                  {product?.description && (
                    <div className="mt-3">
                      <div className="text-muted small mb-1">Mô tả</div>
                      <div className="border rounded p-2 bg-light" style={{ whiteSpace: "pre-wrap" }}>
                        {product.description}
                      </div>
                    </div>
                  )}

                  {/* Specifications hiển thị dạng bảng */}
                  {specsEntries.length > 0 && (
                    <div className="mt-3">
                      <div className="text-muted small mb-1">Thông số</div>
                      <div className="table-responsive">
                        <table className="table table-sm table-striped align-middle mb-0">
                          <tbody>
                            {specsEntries.map(([k, v]) => (
                              <tr key={k}>
                                <th style={{ width: "35%" }} className="text-nowrap">
                                  {prettifyKey(k)}
                                </th>
                                <td>{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Fallback: hiển thị text thuần nếu parse lỗi */}
                  {!specsEntries.length && product?.specifications && (
                    <div className="mt-3">
                      <div className="text-muted small mb-1">Thông số</div>
                      <div className="border rounded p-2 bg-light" style={{ whiteSpace: "pre-wrap" }}>
                        {typeof product.specifications === "object"
                          ? JSON.stringify(product.specifications, null, 2)
                          : product.specifications}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (onAddToCart) onAddToCart(product);
                  else alert(`Thêm vào giỏ: ${getName(product)}`);
                }}
              >
                Thêm giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}