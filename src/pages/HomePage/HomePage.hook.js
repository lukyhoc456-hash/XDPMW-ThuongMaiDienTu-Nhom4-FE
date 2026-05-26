import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../services/api"; 

const BANNERS = [
  "/banner/banner1.jpg",
  "/banner/banner2.jpg",
  "/banner/banner3.jpg",
];

export function useHomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);



  const openDetail = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedProduct(null);
  };


  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const data = await getProducts();
        let list = Array.isArray(data) ? data : data?.results ?? [];
        list=list.filter(product=>product?.is_active===true)

        if (!cancelled) setProducts(list);
      } catch (err) {
        if (!cancelled) setErrorMsg(err?.message || "Không tải được sản phẩm");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const c =
        p.category?.name || p.category || p.category_name || p.loai || "Khác";
      set.add(String(c));
    });
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    const getCategory = (p) =>
      String(
        p.category?.name || p.category || p.category_name || p.loai || "Khác"
      );

    // filter category
    if (category !== "all") {
      list = list.filter((p) => getCategory(p) === category);
    }

    // search name
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        String(p.name || p.title || p.ten || "")
          .toLowerCase()
          .includes(q)
      );
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (!Number.isNaN(min)) {
      list = list.filter((p) => Number(p.price ?? p.unit_price ?? p.gia ?? p.cost ?? 0) >= min);
    }
    if (!Number.isNaN(max)) {
      list = list.filter((p) => Number(p.price ?? p.unit_price ?? p.gia ?? p.cost ?? 0) <= max);
    }

    // sort price
    const getPrice = (p) =>
      Number(p.price ?? p.unit_price ?? p.gia ?? p.cost ?? 0);

    if (sort === "price_asc") list.sort((a, b) => getPrice(a) - getPrice(b));
    if (sort === "price_desc") list.sort((a, b) => getPrice(b) - getPrice(a));

    return list;
  }, [products, query, category, sort]);

  const helpers = useMemo(() => {
    const formatVND = (n) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(n || 0));
  
    const getName = (p) => p.name || "Sản phẩm";
    const getPrice = (p) => Number(p.price ?? 0);
  
    const getImage = (p) => {
      let raw = p.image_url || p.image || p.thumbnail || p.thumbnail_url;
  
      if (!raw) return "/img/noimage.jpg"; // bạn có thể tạo ảnh mặc định trong public/img
  
      raw = String(raw).replaceAll("\\", "/").trim();
  
      // url tuyệt đối
      if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  
      // nếu db lưu "img/xxx.jpg" => "/img/xxx.jpg"
      if (raw.startsWith("img/")) return `/${raw}`;
  
      // nếu db lưu "/img/xxx.jpg" => giữ nguyên
      if (raw.startsWith("/img/")) return raw;
  
      // nếu db chỉ lưu "xxx.jpg" => "/img/xxx.jpg"
      return `/img/${raw}`;
    };
  
    const getCategory = (p) => p.category || "Khác";
  
    return { formatVND, getName, getPrice, getImage, getCategory };
  }, []);
  
  return {
    // banners
    BANNERS,

    // data
    products,
    filtered,
    categories,

    // states
    loading,
    errorMsg,

    // filters
    query,
    setQuery,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    category,
    setCategory,
    sort,
    setSort,

    // detail dialog
    selectedProduct,
    isDetailOpen,
    openDetail,
    closeDetail,

    // helpers
    ...helpers,
  };
}