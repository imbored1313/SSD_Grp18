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
        if (!response.ok) throw new Error('Network response was not ok');
        
        // 3. Parse the JSON data
        let products = await response.json();
        
        // 4. TRANSFORM THE DATA to match your working test format
        products = products.map(product => ({
            ...product,
            // Ensure image_path is a full URL
            image_path: product.image_path 
  ? `http://3.15.42.35/uploads/${product.image_path.replace(/^.*[\\/]/, '')}`
  : null

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
    return str?.replace(/[&<>"']/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[tag])) ?? '';
}

function renderProducts(products) {
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
        
        // Create cells for each column
        row.innerHTML = `
            <td>${product.product_id}</td>
            <td>${escapeHTML(product.name) || 'No name'}</td>
            <td>${product.description ? 
                escapeHTML(product.description.length > 50 ? 
                    product.description.substring(0, 47) + '...' : 
                    product.description) : 
                'No description'}</td>
            <td>$${parseFloat(product.price || 0).toFixed(2)}</td>
            <td>${product.stock || 0}</td>
            <td class="text-center">
                ${product.image_path ? 
                    `<img src="${product.image_path}" 
                          alt="${product.name || 'Product image'}" 
                          class="product-image"
                          onerror="this.style.display='none';this.parentElement.innerHTML='<span class=\'text-muted\'>Image missing</span>'">` : 
                    '<span class="text-muted">No image</span>'}
            </td>
            <td>${product.added_by_username || 'System'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-warning" data-action="edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function setupEventListeners() {
    // Table actions
    document.querySelector('#productsTable').addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        
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
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProduct();
    });
}

async function deleteProduct(id) {
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

async function showEditForm(id = null) {
    const form = document.getElementById('productForm');
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const previewContainer = document.getElementById('imagePreview');

    form.reset();
    form.dataset.id = id || '';

    previewContainer.innerHTML = ''; // clear previous preview

    if (id) {
        try {
            const response = await fetch(`php/admin_products.php?action=get&id=${id}`, {
                credentials: 'include'
            });

            const product = await response.json();

            // ✅ Apply same transformation for consistent URL:
            product.image_path = product.image_path 
                ? `http://3.15.42.35/uploads/${product.image_path.replace(/^.*[\\/]/, '')}`
                : null;

            // Fill form:
            form.elements.name.value = product.name;
            form.elements.description.value = product.description || '';
            form.elements.price.value = product.price;
            form.elements.stock.value = product.stock;

            // ✅ Show the preview:
            if (product.image_path) {
                previewContainer.innerHTML = `
                    <img src="${product.image_path}" alt="Current Image" class="img-thumbnail mt-2" style="max-height: 150px;">
                `;
            }

        } catch (error) {
            showError('Failed to load product: ' + error.message);
            return;
        }
    }

    modal.show();
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

        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('productImage', fileInput.files[0]);

            const uploadResponse = await fetch('php/upload.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const uploadResult = await uploadResponse.json();
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

        const result = await response.json();

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

document.getElementById('image_file').addEventListener('change', function() {
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
function truncateText(text, maxLength) {
    return text && text.length > maxLength 
        ? text.substring(0, maxLength) + '...' 
        : text || '';
}

function showLoading(selector) {
    document.querySelector(selector).classList.add('loading');
}

function hideLoading() {
    document.querySelectorAll('.loading').forEach(el => el.classList.remove('loading'));
}

function showError(message) {
    // Implement your error display logic
    console.error(message);
    alert(message); // Replace with better UI feedback
}

function showSuccess(message) {
    // Implement your success display logic
    console.log(message);
    alert(message); // Replace with better UI feedback
}