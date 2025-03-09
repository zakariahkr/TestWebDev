// Select necessary elements
const productForm = document.getElementById("productForm");
const productInput = document.getElementById("productInput");
const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("searchInput");
let allProducts = []; // Array to store products
let currentPage = 1;
const itemsPerPage = 5;
// Function to Add Product
function addProduct(event) {
event.preventDefault(); // Prevent form submission refresh
const productName = productInput.value.trim();
if (productName === "") {
alert("Product name cannot be empty!");
return;
}
// Store product in array
allProducts.unshift({ id: Date.now(), name: productName });
// Clear input field
productInput.value = "";
// Render updated product list
renderProducts();
}
// Function to Render Products in Container
function renderProducts() {
productContainer.innerHTML = ""; // Clear container
// Create a document fragment for efficient DOM updates
const fragment = document.createDocumentFragment();
allProducts.forEach(product => {
const productItem = document.createElement("div");
productItem.classList.add("product-item");
productItem.dataset.id = product.id;
productItem.innerHTML = `
<span>${product.name}</span>
<button class="delete-btn">Delete</button>
`;
fragment.appendChild(productItem);
});
productContainer.appendChild(fragment);
}
// Function to Delete Product
function deleteProduct(event) {
if (event.target.classList.contains("delete-btn")) {
const productItem = event.target.closest(".product-item");
const productId = Number(productItem.dataset.id);
// Remove from the allProducts array
allProducts = allProducts.filter(product => product.id !== productId);
// Render updated list
renderProducts();
}
}
// Function to Filter Products
function filterProducts() {
const query = searchInput.value.toLowerCase();
document.querySelectorAll(".product-item").forEach(item => {
const productName = item.querySelector("span").textContent.toLowerCase();
item.style.display = productName.includes(query) ? "flex" : "none";
});
}
// Attach Event Listeners
productForm.addEventListener("submit", addProduct);
productContainer.addEventListener("click", deleteProduct);
searchInput.addEventListener("keyup", filterProducts);
window.addEventListener("scroll", loadMoreProducts);