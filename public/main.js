document.addEventListener("DOMContentLoaded", function() {
    const spans = document.querySelectorAll('.marquee-track span');
    let currentIndex = 0;
  
    // Function to show the next span
    function showNextSpan() {
      // Hide all spans
      spans.forEach(span => span.style.display = 'none');
  
      // Show the current span
      spans[currentIndex].style.display = 'block';
  
      // Move to the next span
      currentIndex = (currentIndex + 1) % spans.length; // Reset to 0 after the last span
  
      // Show the next span after 3 seconds
      setTimeout(showNextSpan, 4000); // 3000ms = 3s
    }
  
    // Start the cycle
    showNextSpan();
  });

  document.querySelectorAll('.product-section').forEach(section => {
    const productContainer = section.querySelector('.product-container');
    const nextBtn = section.querySelector('.next-btn');
    const prevBtn = section.querySelector('.prev-btn');

    // Set the width of one product item dynamically (based on the first product item)
    const productItem = productContainer.querySelector('.product-item');
    let productWidth = productItem.clientWidth + parseInt(window.getComputedStyle(productItem).marginRight);

    nextBtn.addEventListener('click', () => {
        productContainer.scrollBy({ left: productWidth, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        productContainer.scrollBy({ left: -productWidth, behavior: 'smooth' });
    });
});


// Remove address function would be customized to work with manually added addresses in the future

document.getElementById('searchForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const query = document.getElementById('searchInput').value.toLowerCase();
  const products = document.querySelectorAll('.product-item');

  products.forEach(function(product) {
    const productName = product.getAttribute('data-product-name').toLowerCase();
    if (productName.includes(query)) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
 
});

const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('signup')) {
        alert('Signup successful!');
    }
    if (urlParams.has('login')) {
        alert('Login successful!');
    }