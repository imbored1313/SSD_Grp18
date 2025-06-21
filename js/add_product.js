document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');
    const fileInput = document.getElementById('productImage');
    const previewContainer = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');

    // Image preview functionality
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.addEventListener('load', function() {
                previewImage.src = this.result;
                previewContainer.style.display = 'block';
            });
            
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const productData = {
            name: form.elements.name.value,
            description: form.elements.description.value,
            price: parseFloat(form.elements.price.value),
            stock: parseInt(form.elements.stock.value),
            // added_by: <?php echo $_SESSION['user']['user_id'] ?? 0; ?>
        };

        // Add JSON data as a field
        formData.append('productData', JSON.stringify(productData));
        
        // Add file if selected
        if (fileInput.files.length > 0) {
            formData.append('productImage', fileInput.files[0]);
        }

        try {
            // First upload image if exists
            let imagePath = '';
            if (fileInput.files.length > 0) {
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

            // Then create product with image path
            productData.image_path = imagePath;
            
            const response = await fetch('php/admin_products.php?action=create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData),
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Product created successfully!');
                window.location.href = 'admin_products.html';
            } else {
                throw new Error(result.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        }
    });
});