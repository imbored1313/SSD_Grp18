<?php
session_start();

// ✅ Admin-only access
if (!isset($_SESSION['user']) || strtolower($_SESSION['user']['role']) !== 'admin') {
    header('Location: error.html?code=403');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add New Product</title>
    <link rel="stylesheet" href="website.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="admin-dashboard">
        <aside class="admin-sidebar">
            <ul class="admin-nav">
                <li><a href="admin_dashboard.php">Dashboard</a></li>
                <li><a href="admin_products.php">Products</a></li>
                <li><a href="admin_users.php">Users</a></li>
            </ul>
        </aside>

        <main class="admin-content">
            <div class="admin-header">
                <h1>Add New Product</h1>
                <a href="admin_products.php" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Products
                </a>
            </div>

            <div class="product-form-container">
                <form id="productForm">
                    <div class="mb-3">
                        <label for="name" class="form-label">Product Name*</label>
                        <input type="text" class="form-control" id="name" name="name" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="price" class="form-label">Price*</label>
                            <input type="number" class="form-control" id="price" name="price" step="0.01" min="0" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="stock" class="form-label">Stock Quantity*</label>
                            <input type="number" class="form-control" id="stock" name="stock" min="0" required>
                        </div>
                    </div>
<div class="mb-3">
    <label for="productImage" class="form-label">Product Image</label>
    <input type="file" class="form-control" id="productImage" name="productImage" accept="image/*">
    <div class="image-preview mt-2" id="imagePreview" style="display: none;">
        <img id="previewImage" src="#" alt="Preview" class="img-thumbnail" style="max-height: 200px;">
    </div>
    <small class="text-muted">Max file size: 2MB (JPEG, PNG, GIF)</small>
</div>
                    
                    <button type="submit" class="btn btn-primary">Save Product</button>
                </form>
            </div>
        </main>
    </div>

    <script src="js/add_product.js"></script>
</body>
</html>