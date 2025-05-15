<template>
    <router-link :to="{ name: 'anuncio-detail', params: { id: food.id }}" class="text-decoration-none">
        <div class="card h-100 food-item shadow-sm">
            <div class="card-img-top-container">
                <img :src="food.image" class="card-img-top" :alt="food.name">
            </div>
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h3 class="h5 mb-0 text-dark">{{ food.name }}</h3>
                    <span class="badge bg-primary rounded-pill px-3">
                        {{ food.price }}
                    </span>
                </div>
                <p class="card-text text-muted small mb-1">
                    <i class="bi bi-geo-alt-fill me-1"></i>
                    {{ food.location }}
                </p>
                <p class="card-text text-muted small mt-auto">
                    <i class="bi bi-calendar me-1"></i>
                    Recolha - {{ food.date }}
                </p>
            </div>
        </div>
    </router-link>
</template>

<script>
export default {
    name: 'FoodCard',
    props: {
        food: {
            type: Object,
            required: true,
            validator(value) {
                return value.id !== undefined;
            }
        }
    }
}
</script>

<style scoped>
.food-item {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: none;
    border-radius: 0.75rem;
    overflow: hidden;
}

.food-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}

.card-img-top-container {
    height: 200px;
    overflow: hidden;
}

.card-img-top {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.food-item:hover .card-img-top {
    transform: scale(1.05);
}
</style>