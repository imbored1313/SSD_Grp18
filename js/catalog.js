// js/catalog.js - COMPLETE SECURE VERSION - XSS vulnerabilities fixed

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

let currentPage = 1;
const itemsPerPage = 9;
let allProducts = [];
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

async function loadProducts() {
    try {
        showLoadingState();
        
        const response = await fetch('php/get_products.php');
        const data = await response.json();
        
        // Log the data to check if it's valid
        console.log(data);
        
        if (data.success && Array.isArray(data.products)) {
            allProducts = data.products;
            filteredProducts = [...allProducts];
            
            displayProducts();
            setupPagination();
            
            console.log(`Loaded ${allProducts.length} products successfully`);
        } else {
            throw new Error(data.message || 'Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showErrorState();
    } finally {
        hideLoadingState();
    }
}

// SECURITY FIX: Secure product display using DOM methods
function displayProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    if (productsToShow.length === 0) {
        displayNoProductsMessage(container);
        return;
    }

    // Create product grid
    const grid = document.createElement('div');
    grid.className = 'products-grid';
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; padding: 2rem 0;';

    productsToShow.forEach(product => {
        const productCard = createSecureProductCard(product);
        grid.appendChild(productCard);
    });

    container.appendChild(grid);
}

// SECURITY FIX: Create product card using DOM methods
function createSecureProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cssText = 'border: 1px solid #ddd; border-radius: 12px; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; background: white; cursor: pointer;';
    
    // Add hover effects
    card.onmouseenter = function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    };
    card.onmouseleave = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    };

    // Product image
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = 'height: 200px; overflow: hidden; position: relative;';

    const img = document.createElement('img');
    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;';
    img.alt = 'Product image';
    
    // Handle image path safely
    let imageSrc = '/assets/images/no-image.jpg';
    if (product.image_path) {
        if (product.image_path.startsWith('http') || product.image_path.startsWith('/uploads/')) {
            imageSrc = product.image_path;
        } else {
            imageSrc = '/uploads/products/' + product.image_path;
        }
    }
    img.src = imageSrc;
    img.onerror = function() { this.src = '/assets/images/no-image.jpg'; };

    imageContainer.appendChild(img);
    card.appendChild(imageContainer);

    // Product info container
    const infoContainer = document.createElement('div');
    infoContainer.style.cssText = 'padding: 1.5rem;';

    // Product name - SECURE: Using textContent
    const name = document.createElement('h3');
    name.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #333; font-weight: 600;';
    name.textContent = product.name || 'Unknown Product';
    infoContainer.appendChild(name);

    // Product description - SECURE: Using textContent
    const description = document.createElement('p');
    description.style.cssText = 'margin: 0 0 1rem 0; color: #666; font-size: 0.9rem; line-height: 1.4; height: 2.8rem; overflow: hidden;';
    const truncatedDesc = (product.description || 'No description available').length > 80 
        ? (product.description || 'No description available').substring(0, 80) + '...'
        : (product.description || 'No description available');
    description.textContent = truncatedDesc;
    infoContainer.appendChild(description);

    // Price and stock container
    const priceStockContainer = document.createElement('div');
    priceStockContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;';

    // Price - SECURE: Using textContent
    const price = document.createElement('div');
    price.style.cssText = 'font-size: 1.4rem; font-weight: bold; color: #2c5aa0;';
    price.textContent = `$${parseFloat(product.price || 0).toFixed(2)}`;
    priceStockContainer.appendChild(price);

    // Stock indicator - SECURE: Using textContent
    const stock = document.createElement('div');
    const stockCount = parseInt(product.stock || 0);
    if (stockCount > 10) {
        stock.style.cssText = 'color: #28a745; font-weight: 500;';
        stock.textContent = 'In Stock';
    } else if (stockCount > 0) {
        stock.style.cssText = 'color: #ffc107; font-weight: 500;';
        stock.textContent = `${stockCount} left`;
    } else {
        stock.style.cssText = 'color: #dc3545; font-weight: 500;';
        stock.textContent = 'Out of Stock';
    }
    priceStockContainer.appendChild(stock);

    infoContainer.appendChild(priceStockContainer);

    // Action buttons container
    const actionsContainer = document.createElement('div');
    actionsContainer.style.cssText = 'display: flex; gap: 0.5rem;';

    // View details button
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-outline';
    viewBtn.style.cssText = 'flex: 1; padding: 0.75rem; border: 2px solid #2c5aa0; background: transparent; color: #2c5aa0; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.3s;';
    viewBtn.textContent = 'View Details';
    viewBtn.onmouseover = function() {
        this.style.background = '#2c5aa0';
        this.style.color = 'white';
    };
    viewBtn.onmouseout = function() {
        this.style.background = 'transparent';
        this.style.color = '#2c5aa0';
    };
    viewBtn.onclick = function(e) {
        e.stopPropagation();
        window.location.href = `product_details.html?id=${product.product_id}`;
    };
    actionsContainer.appendChild(viewBtn);

    // Add to cart button
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'btn btn-primary';
    addToCartBtn.style.cssText = 'flex: 1; padding: 0.75rem; background: #2c5aa0; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background 0.3s;';
    addToCartBtn.textContent = stockCount > 0 ? 'Add to Cart' : 'Unavailable';
    addToCartBtn.disabled = stockCount <= 0;
    
    if (stockCount > 0) {
        addToCartBtn.onmouseover = function() { this.style.background = '#1e3f73'; };
        addToCartBtn.onmouseout = function() { this.style.background = '#2c5aa0'; };
        addToCartBtn.onclick = function(e) {
            e.stopPropagation();
            addToCart(product.product_id);
        };
    } else {
        addToCartBtn.style.opacity = '0.5';
        addToCartBtn.style.cursor = 'not-allowed';
    }
    
    actionsContainer.appendChild(addToCartBtn);
    infoContainer.appendChild(actionsContainer);
    card.appendChild(infoContainer);

    // Make entire card clickable
    card.onclick = function() {
        window.location.href = `product_details.html?id=${product.product_id}`;
    };

    return card;
}

// SECURITY FIX: Display no products message securely
function displayNoProductsMessage(container) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = 'text-align: center; padding: 4rem 2rem; color: #666;';

    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;';
    icon.textContent = '📦';
    messageDiv.appendChild(icon);

    const heading = document.createElement('h3');
    heading.style.cssText = 'margin-bottom: 1rem; font-size: 1.5rem;';
    heading.textContent = 'No products found';
    messageDiv.appendChild(heading);

    const text = document.createElement('p');
    text.textContent = 'Try adjusting your search or filter criteria.';
    messageDiv.appendChild(text);

    container.appendChild(messageDiv);
}

function setupPagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Clear existing pagination
    paginationContainer.innerHTML = '';

    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin: 2rem 0;';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '‹ Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.cssText = `padding: 0.5rem 1rem; border: 1px solid #ddd; background: ${currentPage === 1 ? '#f8f9fa' : 'white'}; color: ${currentPage === 1 ? '#6c757d' : '#2c5aa0'}; border-radius: 4px; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'};`;
    if (currentPage > 1) {
        prevBtn.onclick = () => {
            currentPage--;
            displayProducts();
            setupPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
    pagination.appendChild(prevBtn);

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.style.cssText = `padding: 0.5rem 0.75rem; border: 1px solid #ddd; background: ${i === currentPage ? '#2c5aa0' : 'white'}; color: ${i === currentPage ? 'white' : '#2c5aa0'}; border-radius: 4px; cursor: pointer; font-weight: ${i === currentPage ? 'bold' : 'normal'};`;
        
        if (i !== currentPage) {
            pageBtn.onclick = () => {
                currentPage = i;
                displayProducts();
                setupPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next ›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.style.cssText = `padding: 0.5rem 1rem; border: 1px solid #ddd; background: ${currentPage === totalPages ? '#f8f9fa' : 'white'}; color: ${currentPage === totalPages ? '#6c757d' : '#2c5aa0'}; border-radius: 4px; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'};`;
    if (currentPage < totalPages) {
        nextBtn.onclick = () => {
            currentPage++;
            displayProducts();
            setupPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
    pagination.appendChild(nextBtn);

    paginationContainer.appendChild(pagination);
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Category filter
    const categorySelect = document.getElementById('category-filter');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryFilter);
    }

    // Price filter
    const priceSelect = document.getElementById('price-filter');
    if (priceSelect) {
        priceSelect.addEventListener('change', handlePriceFilter);
    }

    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            (product.name || '').toLowerCase().includes(searchTerm) ||
            (product.description || '').toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    displayProducts();
    setupPagination();
}

function handleCategoryFilter(event) {
    const selectedCategory = event.target.value;
    
    if (selectedCategory === '' || selectedCategory === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            (product.category || '').toLowerCase() === selectedCategory.toLowerCase()
        );
    }
    
    currentPage = 1;
    displayProducts();
    setupPagination();
}

function handlePriceFilter(event) {
    const priceRange = event.target.value;
    
    if (priceRange === '' || priceRange === 'all') {
        filteredProducts = [...allProducts];
    } else {
        const [min, max] = priceRange.split('-').map(Number);
        filteredProducts = allProducts.filter(product => {
            const price = parseFloat(product.price || 0);
            if (max) {
                return price >= min && price <= max;
            } else {
                return price >= min;
            }
        });
    }
    
    currentPage = 1;
    displayProducts();
    setupPagination();
}

function handleSort(event) {
    const sortBy = event.target.value;
    
    switch (sortBy) {
        case 'name-asc':
            filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
        case 'price-asc':
            filteredProducts.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
            break;
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            break;
        default:
            // No sorting
            break;
    }
    
    displayProducts();
    setupPagination();
}

async function addToCart(productId) {
    try {
        // Check if user is logged in
        if (!window.sessionManager || !window.sessionManager.isLoggedIn()) {
            showNotificationSecure('Please log in to add items to cart', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        const response = await fetch('php/add_to_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                product_id: parseInt(productId),
                quantity: 1
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotificationSecure('Product added to cart!', 'success');
            
            // Update cart count in header
            if (window.sessionManager && typeof window.sessionManager.updateCartCount === 'function') {
                window.sessionManager.updateCartCount(data.cartCount || 0);
            }
        } else {
            showNotificationSecure('Failed to add to cart: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        showNotificationSecure('Failed to add product to cart', 'error');
    }
}

function showLoadingState() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';
    
    const loading = document.createElement('div');
    loading.style.cssText = 'text-align: center; padding: 4rem 2rem; color: #666;';
    
    const spinner = document.createElement('div');
    spinner.style.cssText = 'display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2c5aa0; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;';
    loading.appendChild(spinner);
    
    const text = document.createElement('p');
    text.textContent = 'Loading products...';
    loading.appendChild(text);
    
    container.appendChild(loading);

    // Add CSS animation
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
}

function hideLoadingState() {
    // Loading state is replaced when displayProducts() is called
}

function showErrorState() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';
    
    const error = document.createElement('div');
    error.style.cssText = 'text-align: center; padding: 4rem 2rem; color: #dc3545;';
    
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 4rem; margin-bottom: 1rem; opacity: 0.7;';
    icon.textContent = '⚠️';
    error.appendChild(icon);
    
    const heading = document.createElement('h3');
    heading.style.cssText = 'margin-bottom: 1rem;';
    heading.textContent = 'Failed to load products';
    error.appendChild(heading);
    
    const text = document.createElement('p');
    text.textContent = 'Please try refreshing the page.';
    error.appendChild(text);
    
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Retry';
    retryBtn.style.cssText = 'margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2c5aa0; color: white; border: none; border-radius: 6px; cursor: pointer;';
    retryBtn.onclick = loadProducts;
    error.appendChild(retryBtn);
    
    container.appendChild(error);
}

// SECURITY FIX: Secure notification function
function showNotificationSecure(message, type = 'success') {
    const existing = document.getElementById('catalog-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'catalog-notification';

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
        font-size: 14px;
        transition: opacity 0.3s ease;
    `;

    // CRITICAL: Use textContent instead of innerHTML to prevent XSS
    notification.textContent = String(message || ''); // Safe text insertion
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Keep original function name for backward compatibility
function showNotification(message, type = 'success') {
    showNotificationSecure(message, type);
}

// Utility function for debouncing search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.addToCart = addToCart;
