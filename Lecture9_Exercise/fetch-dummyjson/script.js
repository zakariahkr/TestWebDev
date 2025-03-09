let currentPage = 1;
const limit = 10;
const outputDiv = document.getElementById("output");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

async function fetchProducts() {
    const skip = (currentPage - 1) * limit;
    const response = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`);
    const data = await response.json();
    displayProducts(data.products);
    updateButtons(data.total);
}

function displayProducts(products) {
    outputDiv.innerHTML = "";
    products.forEach(product => {
        const productElement = document.createElement("div");
        productElement.classList.add("product");
        productElement.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>Price: $${product.price}</p>
            <p>${product.description}</p>
        `;
        outputDiv.appendChild(productElement);
    });
}

function updateButtons(total) {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage * limit >= total;
}

prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        fetchProducts();
    }
});

nextButton.addEventListener("click", () => {
    currentPage++;
    fetchProducts();
});

fetchProducts();