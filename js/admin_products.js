document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

let products = [];

async function loadProducts()
{
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

        // 5. Render the transformed data
        renderProducts(products);
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
        renderProducts([testProduct]);
    }
}

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

// NEW: Enhanced URL sanitization function
function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string') {
        return '';
    }
    
    // Remove any potential XSS vectors
    const cleaned = url.replace(/[<>"']/g, '');
    
    // Validate that it's a reasonable URL format
    try {
        new URL(cleaned);
        return cleaned;
    } catch {
        // If it's not a valid URL, treat it as a relative path
        // Remove any dangerous characters that could break out of src attribute
        return cleaned.replace(/[^\w\-_./:]/g, '');
    }
}

function renderProducts(products)
{
    const tbody = document.querySelector('#productsTable tbody');

    // Clear previous content
    tbody.innerHTML = '';

    // Check if products exist
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
        return;
    }

    // Process each product
    products.forEach(product => {
        const row = document.createElement('tr');
        row.dataset.id = product.product_id;

        // FIXED: Sanitize image URL to prevent XSS
        let imageUrl = sanitizeImageUrl(product.image_path);

        // FIXED: Create elements safely instead of using innerHTML with unsanitized data
        const cells = [
            escapeHTML(product.product_id),
            escapeHTML(product.name) || 'No name',
            product.description ?
                escapeHTML(product.description.length > 50 ?
                    product.description.substring(0, 47) + '...' :
                    product.description) :
                'No description',
            '$' + parseFloat(product.price || 0).toFixed(2),
            escapeHTML(product.stock),
            '', // Image cell - will be handled separately
            escapeHTML(product.added_by_username) || 'System',
            '' // Action buttons - will be handled separately
        ];

        // Create cells safely
        cells.forEach((cellContent, index) => {
            const cell = document.createElement('td');
            if (index === 5) { // Image cell
                cell.className = 'text-center';
                if (imageUrl) {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = escapeHTML(product.name) || 'Product image';
                    img.className = 'product-image';
                    img.onerror = function() {
                        this.style.display = 'none';
                        const span = document.createElement('span');
                        span.className = 'text-muted';
                        span.textContent = 'Image missing';
                        this.parentElement.appendChild(span);
                    };
                    cell.appendChild(img);
                } else {
                    const span = document.createElement('span');
                    span.className = 'text-muted';
                    span.textContent = 'No image';
                    cell.appendChild(span);
                }
            } else if (index === 7) { // Action buttons cell
                cell.className = 'action-buttons';
                
                const editBtn = document.createElement('button');
                editBtn.className = 'btn btn-sm btn-warning';
                editBtn.dataset.action = 'edit';
                editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-sm btn-danger';
                deleteBtn.dataset.action = 'delete';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
                
                cell.appendChild(editBtn);
                cell.appendChild(deleteBtn);
            } else {
                cell.innerHTML = cellContent;
            }
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

function setupEventListeners()
{
    // Table actions
    document.querySelector('#productsTable').addEventListener('click', async(e) => {
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
    document.getElementById('addProductBtn').addEventListener('click', () => {
        showEditForm();
    });

    // Form submission
    document.getElementById('productForm').addEventListener('submit', async(e) => {
        e.preventDefault();
        await saveProduct();
    });
}

async function deleteProduct(id)
{
    try {
        const response = await fetch(`php/admin_products.php?action=delete&id=${id}`, {
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

async function showEditForm(id = null)
{
    const form = document.getElementById('productForm');
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const previewContainer = document.getElementById('imagePreview');
    const modalTitle = document.getElementById('modalTitle');

    form.reset();
    form.dataset.id = id || '';

    previewContainer.innerHTML = ''; // clear previous preview

    // Set modal title
    if (id) {
        modalTitle.textContent = 'Edit Product';
        try {
            const response = await fetch(`php/admin_products.php?action=get&id=${id}`, {
                credentials: 'include'
            });

            const product = await response.json();

            // ✅ Apply same transformation for consistent URL:
            product.image_path = product.image_path ? product.image_path : null;

            // Fill form:
            form.elements.name.value = product.name;
            form.elements.description.value = product.description || '';
            form.elements.price.value = product.price;
            form.elements.stock.value = product.stock;

            // FIXED: Show the preview safely
            if (product.image_path) {
                const label = document.createElement('label');
                label.className = 'form-label';
                label.textContent = 'Current Image';
                
                const img = document.createElement('img');
                img.src = sanitizeImageUrl(product.image_path);
                img.alt = 'Current Image';
                img.className = 'img-thumbnail mt-2';
                img.style.maxHeight = '150px';
                img.onerror = function() {
                    this.onerror = null;
                    this.src = 'https://via.placeholder.com/150?text=No+Image';
                };
                
                previewContainer.appendChild(label);
                previewContainer.appendChild(img);
            } else {
                const label = document.createElement('label');
                label.className = 'form-label';
                label.textContent = 'Current Image';
                
                const div = document.createElement('div');
                div.className = 'text-muted';
                div.textContent = 'No image available';
                
                previewContainer.appendChild(label);
                previewContainer.appendChild(div);
            }
        } catch (error) {
            showError('Failed to load product: ' + error.message);
            return;
        }
    } else {
        modalTitle.textContent = 'Add Product';
    }

    modal.show();
}

async function saveProduct()
{
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
        // Fetch CSRF token
        const csrfResponse = await fetch('/php/get_csrf_token.php', {
            // Ensure the session cookie is sent
            credentials: 'include'
        });
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.token;

        // Add CSRF token to the form data
        const formData = new FormData();
        formData.append('csrf_token', csrfToken);

        // Add other form data
        formData.append('productData', JSON.stringify(productData));

        let imagePath = null;

        if (fileInput.files.length > 0) {
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

        const response = await fetch(`php/admin_products.php?action=update&id=${id}`, {
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
            showSuccess(`Product updated successfully`);
            await loadProducts();
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        } else {
            throw new Error(result.message || 'Update failed');
        }
    } catch (error) {
        showError(`Failed to update product: ${error.message}`);
    }
}

document.getElementById('image_file').addEventListener('change', function () {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    const file = this.files[0];
    if (file) {
        const img = document.createElement('img');
        img.classList.add('img-thumbnail', 'mt-2');
        img.style.maxHeight = '150px';

        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
    }
});

// Helper functions
function truncateText(text, maxLength)
{
    return text && text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text || '';
}

function showLoading(selector)
{
    document.querySelector(selector).classList.add('loading');
}

function hideLoading()
{
    document.querySelectorAll('.loading').forEach(el => el.classList.remove('loading'));
}

function showError(message)
{
    // Implement your error display logic
    console.error(message);
    alert(message); // Replace with better UI feedback
}

function showSuccess(message)
{
    // Implement your success display logic
    console.log(message);
    alert(message); // Replace with better UI feedback
}