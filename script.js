let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let sortMode = 'none'; // none | price-asc | price-desc | title-asc | title-desc

const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const tableEl = document.getElementById('productTable');
const tbody = document.getElementById('productBody');
const paginationEl = document.getElementById('pagination');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const searchInput = document.getElementById('searchInput');
const pageSizeSelect = document.getElementById('pageSizeSelect');
const sortSelect = document.getElementById('sortSelect');

async function fetchProducts() {
  try {
    const response = await fetch('https://api.escuelajs.co/api/v1/products');
    if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
    
    allProducts = await response.json();
    filteredProducts = [...allProducts];

    loadingEl.style.display = 'none';
    tableEl.style.display = 'table';
    paginationEl.style.display = 'flex';

    applySortAndRender();

  } catch (err) {
    loadingEl.style.display = 'none';
    errorEl.textContent = 'Không thể tải dữ liệu: ' + err.message;
    errorEl.style.display = 'block';
    console.error(err);
  }
}

function sortProducts(products) {
  const sorted = [...products];

  switch (sortMode) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'title-asc':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      // none → giữ nguyên thứ tự gốc
      break;
  }

  return sorted;
}

function applySortAndRender() {
  const sorted = sortProducts(filteredProducts);
  currentPage = 1; // reset về trang 1 khi thay đổi sort
  renderPage(sorted);
}

function renderPage(pageData = filteredProducts) {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = pageData.slice(start, end);

  tbody.innerHTML = '';

  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Không có sản phẩm nào.</td></tr>';
  } else {
    pageItems.forEach(product => {
      const imgSrc = product.images?.[0] || 'https://via.placeholder.com/120?text=No+Image';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product.id}</td>
        <td><img src="${imgSrc}" alt="${product.title}" class="product-img" onerror="this.src='https://via.placeholder.com/120?text=Error';"></td>
        <td>${product.title}</td>
        <td>${product.price}</td>
        <td>${product.category?.name || '—'}</td>
        <td>${product.description.substring(0, 120)}${product.description.length > 120 ? '...' : ''}</td>
      `;
      tbody.appendChild(row);
    });
  }

  const totalPages = Math.ceil(pageData.length / pageSize) || 1;
  pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function handleSearch() {
  const term = searchInput.value.toLowerCase().trim();
  
  filteredProducts = term 
    ? allProducts.filter(p => p.title.toLowerCase().includes(term))
    : [...allProducts];

  applySortAndRender(); // áp dụng sort lại sau khi filter
}

function changePageSize() {
  pageSize = parseInt(pageSizeSelect.value);
  currentPage = 1;
  renderPage(sortProducts(filteredProducts));
}

function changeSort() {
  sortMode = sortSelect.value;
  applySortAndRender();
}

// Sự kiện
searchInput.addEventListener('input', handleSearch);
pageSizeSelect.addEventListener('change', changePageSize);
sortSelect.addEventListener('change', changeSort);

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage(sortProducts(filteredProducts));
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPage < Math.ceil(filteredProducts.length / pageSize)) {
    currentPage++;
    renderPage(sortProducts(filteredProducts));
  }
});

// Khởi động
window.addEventListener('DOMContentLoaded', fetchProducts);