<template>
    <div class="landing-page">

        <!-- Header and Search Section -->
        <header class="text-center py-4">
            <h1 class="display-4 font-weight-bold text-primary">FoodShare</h1>
            <p class="lead mt-2">Partilha alimentos. Encontra o que precisas</p>

            <!-- Search Bar -->
            <div class="container mt-4">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Procurar alimentos..."
                                v-model="searchTerm" @input="filterItems">
                            <button class="btn btn-primary" type="button">
                                Procurar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mt-4">
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                <div v-for="(item, index) in filteredFoodItems" :key="index" class="col">
                    <div class="food-item card h-100">
                        <div class="card-img-container">
                            <img :src="item.image" class="card-img-top food-image" :alt="item.name">
                        </div>
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start">
                                <h3 class="h5 card-title font-weight-bold mb-2">{{ item.name }}</h3>
                                <span class="price-badge badge text-white">
                                    {{ item.price }}
                                </span>
                            </div>
                            <p class="card-text mb-1 text-muted">
                                <i class="bi bi-geo-alt-fill me-1"></i>
                                {{ item.location }}
                            </p>
                            <p class="card-text text-muted mt-auto">
                                <i class="bi bi-calendar me-1"></i>
                                Recolha - {{ item.date }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
export default {
    name: 'LandingPage',
    data() {
        return {
            searchTerm: '',
            foodItems: [
                {
                    name: 'Tomates Frescos',
                    location: 'Porto, Portugal',
                    date: '27 abril',
                    price: '0,75€',
                    image: 'https://images.unsplash.com/photo-1546470427-f5c9464d39c4?w=500&q=80'
                },
                {
                    name: 'Pepino Biológico',
                    location: 'Porto, Portugal',
                    date: '27 abril',
                    price: '0,25€',
                    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&q=80'
                },
                {
                    name: 'Curgetes Frescas',
                    location: 'Porto, Portugal',
                    date: '27 abril',
                    price: '1€',
                    image: 'https://images.unsplash.com/photo-1599725826499-f2a65a321758?w=500&q=80'
                },
                {
                    name: 'Carne Picada',
                    location: 'Porto, Portugal',
                    date: '27 abril',
                    price: '2€',
                    image: 'https://images.unsplash.com/photo-1609162759379-eae1b49e04e7?w=500&q=80'
                },
                {
                    name: 'Cenouras',
                    location: 'Porto, Portugal',
                    date: '27 abril',
                    price: '0,50€',
                    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80'
                },
                {
                    name: 'Batatas',
                    location: 'Porto, Portugal',
                    date: '27 abril',
                    price: '1,25€',
                    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80'
                },
                {
                    name: 'Alface',
                    location: 'Porto, Portugal',
                    date: '27 abril',
                    price: '0,80€',
                    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&q=80'
                },
                {
                    name: 'Cebolas',
                    location: 'Porto, Portugal',
                    date: '27 abril',
                    price: '0,60€',
                    image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=500&q=80'
                }
            ]
        }
    },
    computed: {
        filteredFoodItems() {
            return this.foodItems.filter(item =>
                item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(this.searchTerm.toLowerCase())
            )
        }
    }
}
</script>

<style scoped>
.landing-page {
    padding-top: 120px;
    padding-bottom: 120px;
    min-height: 100vh;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
}

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

.nav-link {
    font-weight: 500;
    transition: color 0.2s ease;
}

.nav-link:hover {
    color: #007bff !important;
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