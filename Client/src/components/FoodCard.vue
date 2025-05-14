<template>
    <div class="food-item card h-100">
        <div class="card-img-container">
            <img :src="food.image" class="card-img-top food-image" :alt="food.name">
        </div>
        <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start">
                <h3 class="h5 card-title font-weight-bold mb-2">{{ food.name }}</h3>
                <span class="price-badge badge text-white">
                    {{ food.price }}
                </span>
            </div>
            <p class="card-text mb-1 text-muted">
                <i class="bi bi-geo-alt-fill me-1"></i>
                {{ food.location }}
            </p>
            <p class="card-text text-muted mt-auto">
                <i class="bi bi-calendar me-1"></i>
                Recolha - {{ food.date }}
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FoodCard',
    props: {
        food: {
            type: Object,
            required: true
        }
    }
}
</script>

<style scoped>
.food-item {
    border-radius: 12px;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    overflow: hidden;
}

.card-img-container {
    height: 200px;
    overflow: hidden;
}

.food-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.food-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.food-item:hover .food-image {
    transform: scale(1.05);
}

.card-body {
    padding: 1.25rem;
    background-color: white;
}

.price-badge {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    background-color: #007bff;
    white-space: nowrap;
}

.card-title {
    color: #2c3e50;
    margin-right: 0.5rem;
}

.text-muted {
    color: #6c757d !important;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .card-img-container {
        height: 180px;
    }
}
</style>