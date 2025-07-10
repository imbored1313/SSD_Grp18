// XSS Prevention: HTML escaping function
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

let allProducts = [];
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    initializeFilters();
});

async function loadProducts() {
    const loadingDiv = document.getElementById('loading-state');
    const catalogDiv = document.getElementById('productCatalog');
    const errorDiv = document.getElementById('error-state');
    const noProductsDiv = document.getElementById('no-products-state');

    loadingDiv.style.display = 'block';
    catalogDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    noProductsDiv.style.display = 'none';

    try {
        // ---- USE THE CORRECT ENDPOINT HERE ----
        // const response = await fetch('php/get_products.php');
        // Use this line for local dev with mock data, or change to your API:
        const response = await fetch('mock_products.json'); // <-- replace with your API if it exists
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // If data is array, use directly. If object with products, extract products
        const products = Array.isArray(data) ? data : data.products;

        if (!products || products.length === 0) {
            showNoProducts();
            return;
        }

        allProducts = products;
        filteredProducts = [...products];
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showError();
    }
}

function displayProducts(products) {
    const loadingDiv = document.getElementById('loading-state');
    const catalogDiv = document.getElementById('productCatalog');
    const errorDiv = document.getElementById('error-state');
    const noProductsDiv = document.getElementById('no-products-state');

    if (!products || products.length === 0) {
        showNoProducts();
        return;
    }

    catalogDiv.innerHTML = '';

    products.forEach(product => {
        const productCard = createSecureProductCard(product);
        catalogDiv.appendChild(productCard);
    });

    loadingDiv.style.display = 'none';
    catalogDiv.style.display = 'grid';
    errorDiv.style.display = 'none';
    noProductsDiv.style.display = 'none';
}

function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('productCatalog').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
    document.getElementById('no-products-state').style.display = 'none';
}

function showNoProducts() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('productCatalog').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('no-products-state').style.display = 'block';
}

function initializeFilters() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    searchInput.addEventListener('input', filterAndDisplayProducts);
    sortSelect.addEventListener('change', filterAndDisplayProducts);
}

function createSecureProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';

    // Image
    const imageDiv = document.createElement('div');
    imageDiv.className = 'product-image';
    const img = document.createElement('img');
    let imageSrc = 'uploads/no-image.jpg';
    if (product.image_path) {
        if (product.image_path.startsWith('http') || product.image_path.startsWith('/uploads/')) {
            imageSrc = product.image_path;
        } else {
            imageSrc = '/uploads/products/' + product.image_path;
        }
    }
    img.src = imageSrc;
    img.alt = 'Product Image';
    img.onerror = function () { this.src = 'uploads/no-image.jpg'; };
    imageDiv.appendChild(img);

    // Info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'product-info';

    const titleH3 = document.createElement('h3');
    titleH3.className = 'product-title';
    titleH3.textContent = product.name || 'Unknown Product';

    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'product-rating';
    const starsSpan = document.createElement('span');
    starsSpan.className = 'stars';
    starsSpan.textContent = '⭐⭐⭐⭐⭐';
    const stockSpan = document.createElement('span');
    const stock = parseInt(product.stock || 0);
    const isInStock = stock > 0;
    stockSpan.textContent = isInStock ? `(${stock} in stock)` : '(Out of stock)';
    ratingDiv.appendChild(starsSpan);
    ratingDiv.appendChild(stockSpan);

    const priceDiv = document.createElement('div');
    priceDiv.className = 'product-price';
    const price = parseFloat(product.price || 0);
    priceDiv.textContent = `$${price.toFixed(2)}`;

    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    if (isInStock) {
        button.textContent = 'Add to Cart';
        button.onclick = function () { addToCart(product.product_id); };
    } else {
        button.textContent = 'Out of Stock';
        button.disabled = true;
        button.style.opacity = '0.6';
    }

    infoDiv.appendChild(titleH3);
    infoDiv.appendChild(ratingDiv);
    infoDiv.appendChild(priceDiv);
    infoDiv.appendChild(button);

    productCard.appendChild(imageDiv);
    productCard.appendChild(infoDiv);

    return productCard;
}

function filterAndDisplayProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortOrder = document.getElementById('sortSelect').value;

    filteredProducts = allProducts.filter(product => {
        const nameMatch = (product.name || '').toLowerCase().includes(searchTerm);
        const descMatch = (product.description || '').toLowerCase().includes(searchTerm);
        return nameMatch || descMatch;
    });

    if (sortOrder) {
        filteredProducts.sort((a, b) => {
            switch (sortOrder) {
                case 'asc':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'desc':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'stock':
                    return parseInt(b.stock) - parseInt(a.stock);
                default:
                    return 0;
            }
        });
    }

    displayProducts(filteredProducts);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = '';
    filteredProducts = [...allProducts];
    displayProducts(filteredProducts);
}

async function addToCart(productId) {
    try {
        // Implement your add to cart logic or leave empty for now
        alert('Product added to cart: ' + productId);
    } catch (error) {
        console.error('Add to cart error:', error);
    }
}

window.addToCart = addToCart;
