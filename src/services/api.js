// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = "https://xdpmw-thuongmaidientu-nhom4-be.onrender.com";


export const getProducts = async () => {
  const response = await fetch(`${API_BASE}/products`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const jsonResult = await response.json();
  return jsonResult.data;
};

export const getProduct = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/products/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const jsonResult = await response.json();
      return jsonResult.data; // Bóc tách dữ liệu gốc
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  };
export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error updating product with id ${id}:`, error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error deleting product with id ${id}:`, error);
        throw error;
    }
};
