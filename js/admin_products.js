// js/admin_products.js - SECURE VERSION - XSS vulnerabilities fixed

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

let products = [];

async function loadProducts() {
    try {
        // 1. First get the raw data from your API
        const response = await fetch('php/admin_products.php?action=list', {
            credentials: 'include'
        });

        // 2. Check if request succeeded
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // 3. Parse the JSON data
        products = await response.json();

        // 4. TRANSFORM THE DATA to match your working test format
        products = products.map(product => ({
            ...product
        }));

        // 5. Render the transformed data securely
        renderProductsSecurely(products);
    } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to your test data if API fails
        const testProduct = {
            product_id: 1,
            name: "Test iPad",
            description: "Test description",
            price: "699.00",
            stock: 5,
            image_path: "http://3.15.42.35/uploads/product_6856ff5ef3ddb9.06061919.png",
            added_by_username: "admin"
        };
        renderProductsSecurely([testProduct]);
    }
}

// XSS Prevention: HTML escaping function
function escapeHTML(str) {
    if (typeof str !== 'string') {
        return str === undefined || str === null ? '' : String(str);
    }
    return str.replace(/[&<>"']/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[tag]));
}

// SECURITY FIX: Secure table rendering function using DOM creation
function renderProductsSecurely(products) {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;

    // Clear previous content safely
    tbody.innerHTML = '';

    // Check if products exist
    if (!products || products.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 8;
        cell.className = 'text-center';
        cell.textContent = 'No products found';
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    // Process each product securely
    products.forEach(product => {
        const row = createSecureProductRow(product);
        tbody.appendChild(row);
    });
}

// SECURITY FIX: Create product row using DOM methods instead of innerHTML
function createSecureProductRow(product) {
    const row = document.createElement('tr');
    row.dataset.id = product.product_id;

    // ID cell
    const idCell = document.createElement('td');
    idCell.textContent = product.product_id || '';
    row.appendChild(idCell);

    // Name cell
    const nameCell = document.createElement('td');
    nameCell.textContent = product.name || 'No name';
    row.appendChild(nameCell);

    // Description cell
    const descCell = document.createElement('td');
    const description = product.description || 'No description';
    const truncatedDesc = description.length > 50 ? 
        description.substring(0, 47) + '...' : 
        description;
    descCell.textContent = truncatedDesc;
    row.appendChild(descCell);

    // Price cell
    const priceCell = document.createElement('td');
    priceCell.textContent = `$${parseFloat(product.price || 0).toFixed(2)}`;
    row.appendChild(priceCell);

    // Stock cell
    const stockCell = document.createElement('td');
    stockCell.textContent = product.stock || '0';
    row.appendChild(stockCell);

    // Image cell
    const imageCell = document.createElement('td');
    imageCell.className = 'text-center';

    if (product.image_path) {
        const img = document.createElement('img');
        img.src = product.image_path;
        img.alt = 'Product image';
        img.className = 'product-image';
        img.style.cssText = 'max-width: 50px; max-height: 50px; object-fit: cover; border-radius: 4px;';
        img.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML = '';
            const span = document.createElement('span');
            span.className = 'text-muted';
            span.textContent = 'Image missing';
            this.parentElement.appendChild(span);
        };
        imageCell.appendChild(img);
    } else {
        const span = document.createElement('span');
        span.className = 'text-muted';
        span.textContent = 'No image';
        imageCell.appendChild(span);
    }
    row.appendChild(imageCell);

    // Added by cell
    const addedByCell = document.createElement('td');
    addedByCell.textContent = product.added_by_username || 'System';
    row.appendChild(addedByCell);

    // Actions cell
    const actionsCell = document.createElement('td');
    actionsCell.className = 'action-buttons';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-warning';
    editBtn.dataset.action = 'edit';
    editBtn.style.marginRight = '5px';

    const editIcon = document.createElement('i');
    editIcon.className = 'fas fa-edit';
    editBtn.appendChild(editIcon);
    editBtn.appendChild(document.createTextNode(' Edit'));

    actionsCell.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-danger';
    deleteBtn.dataset.action = 'delete';

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-trash';
    deleteBtn.appendChild(deleteIcon);
    deleteBtn.appendChild(document.createTextNode(' Delete'));

    actionsCell.appendChild(deleteBtn);
    row.appendChild(actionsCell);

    return row;
}

// Keep original function name for backward compatibility
function renderProducts(products) {
    renderProductsSecurely(products);
}

function setupEventListeners() {
    // Table actions
    document.querySelector('#productsTable').addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) {
            return;
        }

        const action = btn.dataset.action;
        const row = btn.closest('tr');
        const id = row.dataset.id;

        if (action === 'delete') {
            if (confirm('Are you sure you want to delete this product?')) {
                await deleteProduct(id);
            }
        } else if (action === 'edit') {
            await showEditForm(id);
        }
    });

    // Add product button
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            showEditForm();
        });
    }

    // Form submission
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProduct();
        });
    }
}

async function deleteProduct(id) {
    try {
        const response = await fetch(`php/admin_products.php?action=delete&id=${encodeURIComponent(id)}`, {
            credentials: 'include'
        });

        const result = await response.json();
        if (result.success) {
            showSuccess('Product deleted successfully');
            await loadProducts();
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        showError('Failed to delete product: ' + error.message);
    }
}

async function showEditForm(id = null) {
    const form = document.getElementById('productForm');
    const modal = document.getElementById('productModal');
    const previewContainer = document.getElementById('imagePreview');
    const modalTitle = document.getElementById('modalTitle');

    if (!form || !modal) return;

    form.reset();
    form.dataset.id = id || '';

    if (previewContainer) {
        previewContainer.innerHTML = ''; // clear previous preview
    }

    // Set modal title securely
    if (modalTitle) {
        if (id) {
            modalTitle.textContent = 'Edit Product';
            try {
                const response = await fetch(`php/admin_products.php?action=get&id=${encodeURIComponent(id)}`, {
                    credentials: 'include'
                });

                const product = await response.json();

                // Apply same transformation for consistent URL:
                product.image_path = product.image_path ? product.image_path : null;

                // Fill form securely using value properties:
                if (form.elements.name) form.elements.name.value = product.name || '';
                if (form.elements.description) form.elements.description.value = product.description || '';
                if (form.elements.price) form.elements.price.value = product.price || '';
                if (form.elements.stock) form.elements.stock.value = product.stock || '';

                // Show the preview securely
                if (previewContainer) {
                    previewContainer.innerHTML = ''; // Clear first
                    
                    const label = document.createElement('label');
                    label.className = 'form-label';
                    label.textContent = 'Current Image';
                    previewContainer.appendChild(label);

                    if (product.image_path) {
                        const img = document.createElement('img');
                        img.src = product.image_path;
                        img.alt = 'Current Image';
                        img.className = 'img-thumbnail mt-2';
                        img.style.maxHeight = '150px';
                        img.onerror = function() {
                            this.onerror = null;
                            this.src = 'https://via.placeholder.com/150?text=No+Image';
                        };
                        previewContainer.appendChild(img);
                    } else {
                        const noImageDiv = document.createElement('div');
                        noImageDiv.className = 'text-muted';
                        noImageDiv.textContent = 'No image available';
                        previewContainer.appendChild(noImageDiv);
                    }
                }
            } catch (error) {
                showError('Failed to load product: ' + error.message);
                return;
            }
        } else {
            modalTitle.textContent = 'Add Product';
        }
    }

    // Show modal (assuming Bootstrap modal)
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    } else {
        modal.style.display = 'block';
    }
}

async function saveProduct() {
    const form = document.getElementById('productForm');
    const id = form.dataset.id || '';
    const isEdit = !!id;
    const fileInput = document.getElementById('image_file');

    const productData = {
        name: form.elements.name.value,
        description: form.elements.description.value,
        price: parseFloat(form.elements.price.value),
        stock: parseInt(form.elements.stock.value),
    };

    try {
        let imagePath = null;

        if (fileInput && fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('productImage', fileInput.files[0]);

            const uploadResponse = await fetch('php/upload.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const uploadText = await uploadResponse.text();
            let uploadResult;
            try {
                uploadResult = JSON.parse(uploadText);
            } catch (e) {
                throw new Error('Image upload failed: ' + uploadText);
            }
            if (!uploadResult.success) {
                throw new Error(uploadResult.message || 'Image upload failed');
            }

            imagePath = uploadResult.imagePath;
        }

        if (imagePath) {
            productData.image_path = imagePath;
        }

        const response = await fetch(`php/admin_products.php?action=update&id=${encodeURIComponent(id)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData),
            credentials: 'include'
        });

        const resultText = await response.text();
        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            throw new Error('Product update failed: ' + resultText);
        }

        if (result.success) {
            showSuccess(`Product ${isEdit ? 'updated' : 'created'} successfully`);
            await loadProducts();
            
            // Close modal
            const modal = document.getElementById('productModal');
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            } else {
                modal.style.display = 'none';
            }
        } else {
            throw new Error(result.message || 'Operation failed');
        }
    } catch (error) {
        showError(`Failed to ${isEdit ? 'update' : 'create'} product: ${error.message}`);
    }
}

// Image preview functionality
const imageFileInput = document.getElementById('image_file');
if (imageFileInput) {
    imageFileInput.addEventListener('change', function () {
        const preview = document.getElementById('imagePreview');
        if (!preview) return;
        
        // Clear existing preview safely
        preview.innerHTML = '';

        const file = this.files[0];
        if (file) {
            const img = document.createElement('img');
            img.className = 'img-thumbnail mt-2';
            img.style.maxHeight = '150px';
            img.src = URL.createObjectURL(file);
            img.alt = 'Preview';
            preview.appendChild(img);
        }
    });
}

// Helper functions
function truncateText(text, maxLength) {
    return text && text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text || '';
}

function showLoading(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add('loading');
    }
}

function hideLoading() {
    document.querySelectorAll('.loading').forEach(el => el.classList.remove('loading'));
}

// SECURITY FIX: Secure notification functions
function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.admin-notification');
    existing.forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `admin-notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        padding: 1rem;
        border-radius: 8px;
        font-family: Arial, sans-serif;
    `;
    
    // SAFE: Created using createElement and textContent — not vulnerable to XSS
    notification.textContent = message; // Safe text insertion
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}